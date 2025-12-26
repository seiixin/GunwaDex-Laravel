<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\Process\Process;

class BackupRestoreController extends Controller
{
    protected string $backupDir = 'databasebackup';

    /**
     * POST /admin/backups/files/{file}/restore
     */
    public function restore(Request $request, string $file)
    {
        $this->assertSafeFileName($file);

        $disk = Storage::disk('public');
        $relative = $this->backupDir . '/' . $file;

        if (!$disk->exists($relative) || (int) $disk->size($relative) === 0) {
            throw ValidationException::withMessages([
                'backup' => 'Backup file not found or empty.',
            ]);
        }

        try {
            $absPath = $disk->path($relative);

            $conn = config('database.default');
            $cfg  = config("database.connections.$conn");

            $driver = $cfg['driver'] ?? null;
            if ($driver !== 'mysql') {
                throw new \Exception("Only MySQL restore implemented. Current driver: " . ($driver ?? 'null'));
            }

            $host = (string) ($cfg['host'] ?? '127.0.0.1');
            $port = (string) ($cfg['port'] ?? 3306);
            $db   = (string) ($cfg['database'] ?? '');
            $user = (string) ($cfg['username'] ?? 'root');
            $pass = (string) ($cfg['password'] ?? '');

            if ($db === '') {
                throw new \Exception("Database not specified in config.");
            }

            $mysql = env('MYSQL_PATH') ?: $this->resolveMySqlBinary();

            // env for mysql client password
            $env = array_merge($_SERVER, $_ENV);
            if ($pass !== '') $env['MYSQL_PWD'] = $pass;

            // Prefer IPv6 loopback, then configured host, then 127.0.0.1
            $hostsToTry = array_values(array_unique(array_filter([
                '::1',
                ($host !== 'localhost') ? $host : null,
                '127.0.0.1',
            ])));

            $errors = [];

            // -------- Try TCP hosts --------
            foreach ($hostsToTry as $h) {
                try {
                    $this->restoreUsingTcpHost(
                        mysql: $mysql,
                        host: $h,
                        port: $port,
                        user: $user,
                        db: $db,
                        absSqlPath: $absPath,
                        env: $env
                    );

                    return back()->with('success', "Reverted database to: {$file}");
                } catch (\Throwable $e) {
                    $errors[] = "TCP host={$h} failed: " . $e->getMessage();
                }
            }

            // Optional Windows fallback: Named Pipe (if TCP stack issue)
            $isWindows = (PHP_OS_FAMILY === 'Windows');
            $combined  = implode("\n\n---\n\n", $errors);

            $looksLikeSocketIssue =
                str_contains($combined, '10106') ||
                str_contains($combined, 'Got error: 2004') ||
                str_contains($combined, "Can't create TCP/IP socket");

            if ($isWindows && $looksLikeSocketIssue) {
                $pipeName = env('MYSQL_NAMED_PIPE', 'MySQL');

                $this->restoreUsingNamedPipe(
                    mysql: $mysql,
                    pipeName: $pipeName,
                    user: $user,
                    db: $db,
                    absSqlPath: $absPath,
                    env: $env
                );

                return back()->with('success', "Reverted database to: {$file}");
            }

            throw new \Exception("All restore attempts failed.\n\nDETAILS:\n{$combined}");
        } catch (\Throwable $e) {
            report($e);

            throw ValidationException::withMessages([
                'backup' => 'Restore failed: ' . $e->getMessage(),
            ]);
        }
    }

    // -------------------------------------------------------------------------
    // Restore strategies
    // -------------------------------------------------------------------------

    protected function restoreUsingTcpHost(
        string $mysql,
        string $host,
        string $port,
        string $user,
        string $db,
        string $absSqlPath,
        array $env
    ): void {
        // 1) FK checks OFF
        $this->runMysqlExec([
            $mysql,
            "--protocol=tcp",
            "--host={$host}",
            "--port={$port}",
            "--user={$user}",
            "--default-character-set=utf8mb4",
            $db,
            "--execute=SET FOREIGN_KEY_CHECKS=0;",
        ], $env);

        // 2) Import SQL via STDIN (NO SOURCE path quoting issues)
        $this->runMysqlImportViaStdin([
            $mysql,
            "--protocol=tcp",
            "--host={$host}",
            "--port={$port}",
            "--user={$user}",
            "--default-character-set=utf8mb4",
            $db,
        ], $absSqlPath, $env);

        // 3) FK checks ON
        $this->runMysqlExec([
            $mysql,
            "--protocol=tcp",
            "--host={$host}",
            "--port={$port}",
            "--user={$user}",
            "--default-character-set=utf8mb4",
            $db,
            "--execute=SET FOREIGN_KEY_CHECKS=1;",
        ], $env);
    }

    protected function restoreUsingNamedPipe(
        string $mysql,
        string $pipeName,
        string $user,
        string $db,
        string $absSqlPath,
        array $env
    ): void {
        // 1) FK checks OFF
        $this->runMysqlExec([
            $mysql,
            "--protocol=pipe",
            "--socket={$pipeName}",
            "--user={$user}",
            "--default-character-set=utf8mb4",
            $db,
            "--execute=SET FOREIGN_KEY_CHECKS=0;",
        ], $env);

        // 2) Import SQL via STDIN
        $this->runMysqlImportViaStdin([
            $mysql,
            "--protocol=pipe",
            "--socket={$pipeName}",
            "--user={$user}",
            "--default-character-set=utf8mb4",
            $db,
        ], $absSqlPath, $env);

        // 3) FK checks ON
        $this->runMysqlExec([
            $mysql,
            "--protocol=pipe",
            "--socket={$pipeName}",
            "--user={$user}",
            "--default-character-set=utf8mb4",
            $db,
            "--execute=SET FOREIGN_KEY_CHECKS=1;",
        ], $env);
    }

    // -------------------------------------------------------------------------
    // Process helpers
    // -------------------------------------------------------------------------

    /**
     * Execute a mysql command that doesn't need stdin (like SET FOREIGN_KEY_CHECKS).
     */
    protected function runMysqlExec(array $args, array $env): void
    {
        $process = new Process($args, base_path(), $env, null, 120);
        $process->run();

        if (!$process->isSuccessful()) {
            $out = trim($process->getOutput());
            $err = trim($process->getErrorOutput());
            throw new \Exception("mysql command failed.\n\nOUTPUT:\n{$out}\n\nERROR:\n{$err}");
        }
    }

    /**
     * Import SQL by feeding the file contents to mysql stdin.
     * This avoids `SOURCE "path"` quoting issues on Windows (your error 13 case).
     */
    protected function runMysqlImportViaStdin(array $args, string $absSqlPath, array $env): void
    {
        // stream read (safer for large files than file_get_contents)
        $handle = @fopen($absSqlPath, 'rb');
        if (!$handle) {
            throw new \Exception("Cannot open SQL file for reading: {$absSqlPath}");
        }

        try {
            $process = new Process($args, base_path(), $env, null, 600);

            // Symfony Process accepts a resource for input (streams)
            $process->setInput($handle);
            $process->run();

            if (!$process->isSuccessful()) {
                $out = trim($process->getOutput());
                $err = trim($process->getErrorOutput());
                throw new \Exception("mysql restore failed.\n\nOUTPUT:\n{$out}\n\nERROR:\n{$err}");
            }
        } finally {
            @fclose($handle);
        }
    }

    protected function resolveMySqlBinary(): string
    {
        $candidates = [
            'C:\\xampp\\mysql\\bin\\mysql.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
            'mysql',
        ];

        foreach ($candidates as $bin) {
            if ($bin === 'mysql') {
                $test = [];
                $code = 0;
                @exec('where mysql 2>&1', $test, $code);
                if ($code === 0) return 'mysql';
                continue;
            }

            if (file_exists($bin)) return $bin;
        }

        throw new \Exception("mysql client not found. Set MYSQL_PATH in .env or install MySQL client tools.");
    }

    protected function assertSafeFileName(string $file): void
    {
        if (!preg_match('/^[A-Za-z0-9._-]+\.sql$/', $file)) {
            abort(400, 'Invalid file name.');
        }
    }
}
