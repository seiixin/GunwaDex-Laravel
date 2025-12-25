<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSetting;
use Illuminate\Http\Request;

class ContactSettingController extends Controller
{
    /**
     * GET /admin/contact-setting
     * Return settings with normalized message_template and top-level subject.
     */
    public function show()
    {
        // Ensure a singleton row exists (no assumptions about id)
        $setting = ContactSetting::query()->first();
        if (! $setting) {
            $setting = ContactSetting::create([
                'email'            => null,
                'facebook'         => null,
                'discord'          => null,
                'phone'            => null,
                'address'          => null,
                'website'          => null,
                'subject'          => 'Premium Item Inquiry',
                'message_template' => [
                    'subject' => 'Premium Item Inquiry',
                    'body'    => null,
                ],
            ]);
        }

        // With the cast in the model, message_template is already an array.
        $mt = is_array($setting->message_template) ? $setting->message_template : [];

        return response()->json([
            'id'               => $setting->id,
            'email'            => $setting->email,
            'facebook'         => $setting->facebook,
            'discord'          => $setting->discord,
            'phone'            => $setting->phone,
            'address'          => $setting->address,
            'website'          => $setting->website,
            'subject'          => $setting->subject,
            'message_template' => [
                'subject' => $mt['subject'] ?? null,
                'body'    => $mt['body'] ?? null,
            ],
        ]);
    }

    /**
     * PUT /admin/contact-setting
     * Accepts:
     * - Base fields (all optional): email, facebook, discord, phone, address, website, subject
     * - message_template: { subject?: string, body?: string }
     *   (legacy: message_subject, message_body also accepted)
     */
    public function update(Request $request)
    {
        // All fields optional; validate only when present.
        // Relax socials to simple strings (URLs OR handles) to avoid false validation errors.
        $data = $request->validate([
            'email'                    => ['nullable','email'],
            'facebook'                 => ['nullable','string','max:255'],
            'discord'                  => ['nullable','string','max:255'],
            'phone'                    => ['nullable','string','max:255'],
            'address'                  => ['nullable','string','max:1000'],
            'website'                  => ['nullable','string','max:255'],
            'subject'                  => ['nullable','string','max:255'],

            'message_template'         => ['nullable','array'],
            'message_template.subject' => ['nullable','string','max:255'],
            'message_template.body'    => ['nullable','string'],

            // Legacy fallbacks (optional)
            'message_subject'          => ['nullable','string','max:255'],
            'message_body'             => ['nullable','string'],
        ]);

        // Ensure singleton row exists (no hard-coded id)
        $setting = ContactSetting::query()->first() ?? new ContactSetting();

        // Build update payload for base fields (preserve when not provided)
        foreach (['email','facebook','discord','phone','address','website','subject'] as $key) {
            if ($request->has($key)) {
                $setting->{$key} = $data[$key] ?? null;
            }
        }

        // Normalize template from structured or legacy fields into an array (or null to clear)
        [$tplSubject, $tplBody] = $this->extractTemplate(
            $data['message_template'] ?? null,
            $data['message_subject']  ?? null,
            $data['message_body']     ?? null
        );

        if ($request->has('message_template') || $request->has('message_subject') || $request->has('message_body')) {
            // If both are empty, store null; else store array (cast handles JSON)
            if ($tplSubject === null && $tplBody === null) {
                $setting->message_template = null;
            } else {
                $mt = is_array($setting->message_template) ? $setting->message_template : [];
                $mt['subject'] = $tplSubject;
                $mt['body']    = $tplBody;
                $setting->message_template = $mt;
            }
        }

        $setting->save();

        $mt = is_array($setting->message_template) ? $setting->message_template : [];

        return response()->json([
            'message' => 'Contact settings updated.',
            'data'    => [
                'id'               => $setting->id,
                'email'            => $setting->email,
                'facebook'         => $setting->facebook,
                'discord'          => $setting->discord,
                'phone'            => $setting->phone,
                'address'          => $setting->address,
                'website'          => $setting->website,
                'subject'          => $setting->subject,
                'message_template' => [
                    'subject' => $mt['subject'] ?? null,
                    'body'    => $mt['body'] ?? null,
                ],
            ],
        ]);
    }

    /**
     * Extract and clean subject/body from structured or legacy inputs.
     */
    private function extractTemplate(?array $structured, ?string $legacySubject, ?string $legacyBody): array
    {
        if (is_array($structured)) {
            $subject = $this->cleanLine($structured['subject'] ?? null);
            $body    = $this->cleanMultiline($structured['body'] ?? null);
        } else {
            $subject = $this->cleanLine($legacySubject);
            $body    = $this->cleanMultiline($legacyBody);
        }

        return [$subject, $body];
    }

    /**
     * Trim + collapse spaces for single-line strings (subject).
     */
    private function cleanLine($value): ?string
    {
        if ($value === null) return null;
        $v = preg_replace('/[ \t]+/', ' ', (string) $value);
        $v = trim($v);
        return $v === '' ? null : $v;
    }

    /**
     * Trim + normalize multi-line strings (preserve newlines).
     */
    private function cleanMultiline($value): ?string
    {
        if ($value === null) return null;
        // Collapse horizontal whitespace but keep newlines
        $v = preg_replace("/[ \t]+/", ' ', (string) $value);
        // Normalize CRLF to LF, then trim
        $v = preg_replace("/\r\n?/", "\n", $v);
        $v = trim($v);
        return $v === '' ? null : $v;
    }
}
