<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Backup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\Process\Process;

class BackupController extends Controller
{
    protected string $backupDir = 'databasebackup';

    // If your DB columns are NOT NULL, keep defaults safe:
    protected int $quickFrequencyDefault = 1;
    protected string $defaultUrlValue = ''; // change to null if you migrated url nullable

    public function index(Request $request)
    {
        $disk = Storage::disk('public');
        $disk->makeDirectory($this->backupDir);

        $files = collect($disk->files($this->backupDir))
            ->filter(fn ($path) => Str::endsWith(Str::lower($path), '.sql'))
            ->map(function ($path) use ($disk) {
                $size = $disk->size($path);
                $ts   = $disk->lastModified($path);

                return [
                    'name'          => basename($path),
                    'path'          => $path,
                    'url'           => $disk->url($path),
                    'size_bytes'    => $size,
                    'size_human'    => $this->humanBytes($size),
                    'last_modified' => $ts,
                    'date'          => date('Y-m-d H:i:s', $ts),
                ];
            })
            ->sortByDesc('last_modified')
            ->values();

        $schedules = Backup::query()
            ->select('id', 'type', 'frequency_days', 'created_at')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Admin/BackupDatabase', [
            'files'     => $files,
            'schedules' => $schedules,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type'           => ['required', 'in:quick,scheduled'],
            'frequency_days' => ['nullable', 'integer', 'min:1', 'required_if:type,scheduled'],
        ]);

        try {
            $frequency = ($data['type'] === 'scheduled')
                ? (int) $data['frequency_days']
                : $this->quickFrequencyDefault;

            Backup::create([
                'type'           => $data['type'],
                'frequency_days' => $frequency,
                'url'            => $this->defaultUrlValue,
            ]);

            if ($data['type'] === 'quick') {
                $relativePath = $this->runBackup();

                return back()
                    ->with('success', 'Backup completed! Saved to Storage.')
                    ->with('backup_url', Storage::disk('public')->url($relativePath));
            }

            return back()->with('success', 'Backup schedule saved successfully!');
        } catch (\Throwable $e) {
            report($e);

            throw ValidationException::withMessages([
                'backup' => $e->getMessage(),
            ]);
        }
    }

    public function destroy(Backup $backup)
    {
        $backup->delete();
        return back()->with('success', 'Backup schedule deleted');
    }

    /**
     * ✅ BULK delete schedule records
     * DELETE /admin/backups/schedules/bulk
     * body: { ids: [1,2,3] }
     */
    public function destroySchedulesBulk(Request $request)
    {
        $data = $request->validate([
            'ids'   => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct'],
        ]);

        try {
            $ids = array_values(array_unique($data['ids']));
            $count = Backup::query()->whereIn('id', $ids)->delete();

            return back()->with('success', "Deleted {$count} schedule(s).");
        } catch (\Throwable $e) {
            report($e);

            throw ValidationException::withMessages([
                'backup' => 'Bulk delete schedules failed: ' . $e->getMessage(),
            ]);
        }
    }

    public function download(string $file)
    {
        $this->assertSafeFileName($file);

        $disk = Storage::disk('public');
        $path = $this->backupDir . '/' . $file;

        if (!$disk->exists($path)) abort(404, 'Backup file not found.');

        return $disk->download($path, $file, [
            'Content-Type' => 'application/sql',
        ]);
    }

    public function destroyFile(string $file)
    {
        $this->assertSafeFileName($file);

        $disk = Storage::disk('public');
        $path = $this->backupDir . '/' . $file;

        if (!$disk->exists($path)) {
            throw ValidationException::withMessages([
                'backup' => 'Backup file not found.',
            ]);
        }

        $disk->delete($path);
        return back()->with('success', 'Backup file deleted.');
    }

    /**
     * ✅ BULK delete backup files
     * DELETE /admin/backups/files/bulk
     * body: { files: ["a.sql","b.sql"] }
     */
    public function destroyFilesBulk(Request $request)
    {
        $data = $request->validate([
            'files'   => ['required', 'array', 'min:1'],
            'files.*' => ['string', 'distinct'],
        ]);

        $disk = Storage::disk('public');

        try {
            $files = array_values(array_unique($data['files']));
            $deleted = 0;
            $missing = [];

            foreach ($files as $name) {
                $this->assertSafeFileName($name);

                $path = $this->backupDir . '/' . $name;
                if (!$disk->exists($path)) {
                    $missing[] = $name;
                    continue;
                }

                $disk->delete($path);
                $deleted++;
            }

            $msg = "Deleted {$deleted} file(s).";
            if (!empty($missing)) {
                $msg .= " Missing: " . implode(', ', $missing);
            }

            return back()->with('success', $msg);
        } catch (\Throwable $e) {
            report($e);

            throw ValidationException::withMessages([
                'backup' => 'Bulk delete files failed: ' . $e->getMessage(),
            ]);
        }
    }

    // -------------------------------------------------------------------------
    // BACKUP RUNNER (MySQL) - prefer IPv6 loopback ::1 first
    // -------------------------------------------------------------------------

    protected function runBackup(): string
    {
        $disk = Storage::disk('public');
        $disk->makeDirectory($this->backupDir);

        $fileName = 'backup-' . date('Y-m-d_His') . '.sql';
        $relative = $this->backupDir . '/' . $fileName;
        $absPath  = $disk->path($relative);

        $conn = config('database.default');
        $cfg  = config("database.connections.$conn");

        $driver = $cfg['driver'] ?? null;
        if ($driver !== 'mysql') {
            throw new \Exception("Only MySQL backup implemented. Current driver: " . ($driver ?? 'null'));
        }

        $host = (string) ($cfg['host'] ?? '127.0.0.1');
        $port = (string) ($cfg['port'] ?? 3306);
        $db   = (string) ($cfg['database'] ?? '');
        $user = (string) ($cfg['username'] ?? 'root');
        $pass = (string) ($cfg['password'] ?? '');

        if ($db === '') throw new \Exception("Database not specified in config.");

        $mysqldump = env('MYSQLDUMP_PATH') ?: $this->resolveMySqlDumpBinary();

        $env = array_merge($_SERVER, $_ENV);
        if ($pass !== '') $env['MYSQL_PWD'] = $pass;

        // ✅ Prefer IPv6 loopback because MySQL listens on [::]:3306
        $hostsToTry = array_values(array_unique(array_filter([
            '::1',
            ($host !== 'localhost') ? $host : null,
            '127.0.0.1',
        ])));

        $errors = [];

        foreach ($hostsToTry as $h) {
            try {
                if ($disk->exists($relative) && (int) $disk->size($relative) === 0) {
                    $disk->delete($relative);
                }

                $this->runDumpProcess([
                    $mysqldump,
                    "--protocol=tcp",
                    "--host={$h}",
                    "--port={$port}",
                    "--user={$user}",
                    "--single-transaction",
                    "--routines",
                    "--triggers",
                    "--default-character-set=utf8mb4",
                    $db,
                    "--result-file={$absPath}",
                ], $env);

                $this->assertDumpFileCreated($disk, $relative);
                return $relative;
            } catch (\Throwable $e) {
                $errors[] = "TCP host={$h} failed: " . $e->getMessage();
            }
        }

        // Optional Windows fallback: Named Pipe (if TCP stack is broken)
        $isWindows = (PHP_OS_FAMILY === 'Windows');
        $combined  = implode("\n\n---\n\n", $errors);

        $looksLikeSocketIssue =
            str_contains($combined, '10106') ||
            str_contains($combined, 'Got error: 2004') ||
            str_contains($combined, "Can't create TCP/IP socket");

        if ($isWindows && $looksLikeSocketIssue) {
            $pipeName = env('MYSQL_NAMED_PIPE', 'MySQL');

            if ($disk->exists($relative) && (int) $disk->size($relative) === 0) {
                $disk->delete($relative);
            }

            $this->runDumpProcess([
                $mysqldump,
                "--protocol=pipe",
                "--socket={$pipeName}",
                "--user={$user}",
                "--single-transaction",
                "--routines",
                "--triggers",
                "--default-character-set=utf8mb4",
                $db,
                "--result-file={$absPath}",
            ], $env);

            $this->assertDumpFileCreated($disk, $relative);
            return $relative;
        }

        throw new \Exception("All TCP attempts failed.\n\nDETAILS:\n{$combined}");
    }

    protected function runDumpProcess(array $args, array $env): void
    {
        $process = new Process($args, base_path(), $env, null, 180);
        $process->run();

        if (!$process->isSuccessful()) {
            $out = trim($process->getOutput());
            $err = trim($process->getErrorOutput());
            throw new \Exception("mysqldump failed.\n\nOUTPUT:\n{$out}\n\nERROR:\n{$err}");
        }
    }

    protected function assertDumpFileCreated($disk, string $relative): void
    {
        if (!$disk->exists($relative) || (int) $disk->size($relative) === 0) {
            throw new \Exception("Backup file was not created or is empty: {$relative}");
        }
    }

    protected function resolveMySqlDumpBinary(): string
    {
        $candidates = [
            'C:\\xampp\\mysql\\bin\\mysqldump.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
            'mysqldump',
        ];

        foreach ($candidates as $bin) {
            if ($bin === 'mysqldump') {
                $test = [];
                $code = 0;
                @exec('where mysqldump 2>&1', $test, $code);
                if ($code === 0) return 'mysqldump';
                continue;
            }

            if (file_exists($bin)) return $bin;
        }

        throw new \Exception("mysqldump not found. Set MYSQLDUMP_PATH in .env or install MySQL client tools.");
    }

    protected function assertSafeFileName(string $file): void
    {
        if (!preg_match('/^[A-Za-z0-9._-]+\.sql$/', $file)) {
            abort(400, 'Invalid file name.');
        }
    }

    protected function humanBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        $v = (float) $bytes;

        while ($v >= 1024 && $i < count($units) - 1) {
            $v /= 1024;
            $i++;
        }

        return rtrim(rtrim(number_format($v, 2, '.', ''), '0'), '.') . ' ' . $units[$i];
    }
}
