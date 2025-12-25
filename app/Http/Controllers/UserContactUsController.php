<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendContactMessageRequest;
use App\Mail\ContactUsMessageMail;
use App\Mail\ContactUsReceiptMail;
use App\Models\ContactSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class UserContactUsController extends Controller
{
    /**
     * GET /contact-us
     * Inertia page (Breeze React).
     */
    public function page(): Response
    {
        $setting = $this->ensureSingletonSetting();
        [$mtSubject, $mtBody] = $this->normalizeMessageTemplate($setting);

        return Inertia::render('Guest/ContactUs', [
            'contact' => $this->contactPayload($setting, $mtSubject, $mtBody),
        ]);
    }

    /**
     * GET /contact/settings
     * Optional JSON endpoint (keep if you still want to support axios).
     */
    public function show(): JsonResponse
    {
        $setting = $this->ensureSingletonSetting();
        [$mtSubject, $mtBody] = $this->normalizeMessageTemplate($setting);

        return response()->json(
            $this->contactPayload($setting, $mtSubject, $mtBody)
        );
    }

    /**
     * POST /contact/send
     * Inertia-compatible: redirect back with errors/status (NO JSON).
     *
     * Sends:
     * 1) Support email -> ContactSetting->email (forwarder/support inbox)
     * 2) Receipt email -> Sender email (user input)
     */
    public function send(SendContactMessageRequest $request): RedirectResponse
    {
        $attemptId = (string) str()->uuid();
        $data = $request->validated();

        $setting = $this->ensureSingletonSetting();
        [$tplSubject, $tplBody] = $this->normalizeMessageTemplate($setting);

        // ✅ Guard: prevent "fake success" when mailer is log/array
        $mailer = (string) config('mail.default', '');
        if (in_array($mailer, ['log', 'array'], true)) {
            return back()
                ->withErrors([
                    'send' => "MAIL_MAILER is '{$mailer}'. No real email will be delivered. Set MAIL_MAILER=smtp in .env.",
                ])
                ->withInput();
        }

        // ✅ From must exist
        $fromAddress = config('mail.from.address');
        if (! $fromAddress) {
            return back()
                ->withErrors(['send' => 'Email sender is not configured (MAIL_FROM_ADDRESS).'])
                ->withInput();
        }

        // ✅ Support/Forwarder inbox
        $toSupport = $this->cleanLine($setting->email);
        if (! $toSupport || ! filter_var($toSupport, FILTER_VALIDATE_EMAIL)) {
            return back()
                ->withErrors(['send' => 'Support email is not configured (invalid email in Contact Settings).'])
                ->withInput();
        }

        // ✅ Sender email (user input) - required by request validation already, but keep safe
        $senderEmail = $this->cleanLine($data['email'] ?? null);
        if (! $senderEmail || ! filter_var($senderEmail, FILTER_VALIDATE_EMAIL)) {
            return back()
                ->withErrors(['email' => 'Please enter a valid email address.'])
                ->withInput();
        }

        // ✅ Subject priority
        $finalSubject = $this->cleanLine($data['subject'] ?? null)
            ?: $this->cleanLine($tplSubject)
            ?: $this->cleanLine($setting->subject)
            ?: 'Contact Us Message';

        // ✅ Ticket / Reference No. for receipt
        $ticket = 'MI-' . strtoupper(str()->random(8));

        $payload = [
            'attempt_id'    => $attemptId,
            'ticket'        => $ticket,
            'subject'       => $finalSubject,

            'sender_name'   => $this->cleanLine($data['name'] ?? null) ?: 'Guest',
            'sender_email'  => $senderEmail,
            'sender_phone'  => $this->cleanLine($data['phone'] ?? null),

            'user_message'  => $this->cleanMultiline($data['message'] ?? null),
            'template_body' => $this->cleanMultiline($tplBody),

            // receipt subject
            'receipt_subject' => "Receipt: {$finalSubject} ({$ticket})",
        ];

        Log::info('ContactUs send attempt', [
            'attempt_id' => $attemptId,
            'ticket'     => $ticket,
            'mailer'     => $mailer,
            'from'       => $fromAddress,
            'to_support' => $toSupport,
            'to_sender'  => $senderEmail,
            'subject'    => $finalSubject,
        ]);

        try {
            // 1) Send to support/forwarder inbox
            Mail::to($toSupport)->send(new ContactUsMessageMail($payload));

            // 2) Send receipt to sender
            Mail::to($senderEmail)->send(new ContactUsReceiptMail($payload));

            return back()->with('status', 'Message sent! A receipt was emailed to you.');
        } catch (\Throwable $e) {
            Log::error('ContactUs send failed', [
                'attempt_id'   => $attemptId,
                'ticket'       => $ticket,
                'to_support'   => $toSupport,
                'to_sender'    => $senderEmail,
                'mailer'       => config('mail.default'),
                'mail_host'    => config('mail.mailers.smtp.host'),
                'mail_port'    => config('mail.mailers.smtp.port'),
                'encryption'   => config('mail.mailers.smtp.encryption'),
                'from_address' => config('mail.from.address'),
                'error'        => $e->getMessage(),
                'exception'    => get_class($e),
                'file'         => $e->getFile(),
                'line'         => $e->getLine(),
            ]);

            $msg = config('app.debug')
                ? $e->getMessage()
                : 'Failed to send message right now. Please try again later.';

            return back()
                ->withErrors(['send' => $msg])
                ->withInput();
        }
    }

    /**
     * Ensure singleton row exists (no hard-coded id).
     */
    private function ensureSingletonSetting(): ContactSetting
    {
        $setting = ContactSetting::query()->first();

        if (! $setting) {
            $setting = ContactSetting::create([
                'email'            => null,
                'facebook'         => null,
                'discord'          => null,
                'phone'            => null,
                'address'          => null,
                'website'          => null,
                'subject'          => null,
                'message_template' => ['subject' => null, 'body' => null],
            ]);
        }

        return $setting;
    }

    /**
     * Payload shape used by both Inertia page and JSON endpoint.
     */
    private function contactPayload(ContactSetting $setting, ?string $mtSubject, ?string $mtBody): array
    {
        return [
            'id'       => $setting->id,
            'email'    => $setting->email,
            'facebook' => $setting->facebook,
            'discord'  => $setting->discord,
            'phone'    => $setting->phone,
            'address'  => $setting->address,
            'website'  => $setting->website,
            'subject'  => $setting->subject,
            'message_template' => [
                'subject' => $mtSubject,
                'body'    => $mtBody,
            ],
        ];
    }

    /**
     * Normalize message_template even if legacy/plain-text/JSON-string exists,
     * and fallback to legacy columns if present.
     *
     * @return array{0:?string,1:?string} [subject, body]
     */
    private function normalizeMessageTemplate(ContactSetting $setting): array
    {
        $mt = null;

        if (is_array($setting->message_template)) {
            $mt = $setting->message_template;
        } else {
            $raw = $setting->getRawOriginal('message_template');

            if (is_string($raw) && $raw !== '') {
                $trim = ltrim($raw);

                if ($trim !== '' && ($trim[0] === '{' || $trim[0] === '[')) {
                    try {
                        $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
                        if (is_array($decoded)) {
                            $mt = $decoded;
                        }
                    } catch (\Throwable $e) {
                        // ignore
                    }
                }

                if (!is_array($mt)) {
                    $mt = ['subject' => null, 'body' => (string) $raw];
                }
            }
        }

        $hasMsgSubjectCol = Schema::hasColumn($setting->getTable(), 'message_subject');
        $hasMsgBodyCol    = Schema::hasColumn($setting->getTable(), 'message_body');

        $mt = is_array($mt) ? $mt : ['subject' => null, 'body' => null];

        if (($mt['subject'] ?? null) === null && $hasMsgSubjectCol) {
            // @phpstan-ignore-next-line
            $mt['subject'] = $setting->message_subject ?? null;
        }
        if (($mt['body'] ?? null) === null && $hasMsgBodyCol) {
            // @phpstan-ignore-next-line
            $mt['body'] = $setting->message_body ?? null;
        }

        return [
            $this->cleanLine($mt['subject'] ?? null),
            $this->cleanMultiline($mt['body'] ?? null),
        ];
    }

    private function cleanLine($value): ?string
    {
        if ($value === null) return null;
        $v = preg_replace('/[ \t]+/', ' ', (string) $value);
        $v = trim($v);
        return $v === '' ? null : $v;
    }

    private function cleanMultiline($value): ?string
    {
        if ($value === null) return null;
        $v = preg_replace("/[ \t]+/", ' ', (string) $value);
        $v = preg_replace("/\r\n?/", "\n", $v);
        $v = trim($v);
        return $v === '' ? null : $v;
    }
}
