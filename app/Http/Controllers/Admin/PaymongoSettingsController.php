<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class PaymongoSettingsController extends Controller
{
    /**
     * GET /admin/store-points/keys
     * Returns PayMongo keys (public + secret).
     */
    public function getKeys()
    {
        return response()->json([
            'public' => Setting::where('name', 'paymongo_public')->value('value'),
            'secret' => Setting::where('name', 'paymongo_secret')->value('value'),
        ]);
    }

    /**
     * POST /admin/store-points/keys
     * Saves PayMongo public/secret key.
     *
     * Body:
     * - key_type: public|secret
     * - value: string
     */
    public function saveKeys(Request $request)
    {
        $data = $request->validate([
            'key_type' => 'required|in:public,secret',
            'value'    => 'required|string',
        ]);

        $settingName = $data['key_type'] === 'public'
            ? 'paymongo_public'
            : 'paymongo_secret';

        Setting::updateOrCreate(
            ['name' => $settingName],
            ['value' => trim($data['value'])]
        );

        return response()->json(['message' => 'Saved!']);
    }
}
