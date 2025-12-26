<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class EpisodeUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // put your admin gate here if you have one
    }

    public function rules(): array
    {
        return [
            'story_id' => ['required', 'integer', 'exists:stories,id'],
            'episode_no' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255'],
            'status' => ['nullable', 'in:draft,scheduled,published'],
            'visibility' => ['nullable', 'in:public,unlisted,private'],
            'scheduled_at' => ['nullable', 'date'],
            'creator_note' => ['nullable', 'string', 'max:2000'],
            'comments_enabled' => ['nullable', 'boolean'],
        ];
    }
}
