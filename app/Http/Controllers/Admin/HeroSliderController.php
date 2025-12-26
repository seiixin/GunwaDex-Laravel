<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HeroSliderController extends Controller
{
    public function index(Request $request)
    {
        $search = trim((string) $request->get('search', ''));

        $slides = HeroSlide::query()
            ->when($search !== '', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                ->orWhere('details', 'like', "%{$search}%")
                ->orWhere('link_url', 'like', "%{$search}%");
            })
            ->orderBy('sort_order')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'title' => $s->title,
                    'details' => $s->details,
                    'image_url' => $s->image_path ? asset('storage/'.$s->image_path) : null,
                    'link_url' => $s->link_url,
                    'sort_order' => (int) ($s->sort_order ?? 0),
                    'is_active' => (bool) ($s->is_active ?? true),
                ];
            });

        return Inertia::render('Admin/HeroSlider', [
            'slides' => $slides,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'details' => ['nullable', 'string', 'max:5000'],
            'link_url' => ['nullable', 'string', 'max:500'], // keep flexible (some use relative URLs)
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['nullable', 'boolean'],
            'image' => ['required', 'image', 'max:5120'], // 5MB
        ]);

        $path = $request->file('image')->store('hero_slides', 'public');

        HeroSlide::create([
            'title' => $data['title'] ?? null,
            'details' => $data['details'] ?? null,
            'link_url' => $data['link_url'] ?? null,
            'sort_order' => (int) ($data['sort_order'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? true),
            'image_path' => $path,
        ]);

        return back()->with('success', 'Hero slide created.');
    }

    public function update(Request $request, HeroSlide $slide): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'details' => ['nullable', 'string', 'max:5000'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            $newPath = $request->file('image')->store('hero_slides', 'public');

            if ($slide->image_path && Storage::disk('public')->exists($slide->image_path)) {
                Storage::disk('public')->delete($slide->image_path);
            }

            $slide->image_path = $newPath;
        }

        $slide->title = $data['title'] ?? null;
        $slide->details = $data['details'] ?? null;
        $slide->link_url = $data['link_url'] ?? null;
        $slide->sort_order = (int) ($data['sort_order'] ?? 0);
        $slide->is_active = (bool) ($data['is_active'] ?? false);
        $slide->save();

        return back()->with('success', 'Hero slide updated.');
    }

    public function destroy(HeroSlide $slide): RedirectResponse
    {
        if ($slide->image_path && Storage::disk('public')->exists($slide->image_path)) {
            Storage::disk('public')->delete($slide->image_path);
        }

        $slide->delete();

        return back()->with('success', 'Hero slide deleted.');
    }

    public function toggle(HeroSlide $slide): RedirectResponse
    {
        $slide->is_active = !$slide->is_active;
        $slide->save();

        return back()->with('success', 'Hero slide status updated.');
    }
}
