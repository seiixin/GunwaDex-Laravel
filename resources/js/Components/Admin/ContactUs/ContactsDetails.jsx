import { useEffect, useRef, useState } from "react";
import axios from "axios";

/**
 * ContactsDetails.jsx
 * Admin component for CRUD of basic contact details:
 * email, facebook, discord, phone, address, website
 *
 * Fixes: input focus/typing "stopping" due to re-renders / state overwrites.
 */
export default function ContactsDetails({ onSaved }) {
  const [formData, setFormData] = useState({
    email: "",
    facebook: "",
    discord: "",
    phone: "",
    address: "",
    website: "",
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Prevent re-loading twice (StrictMode/dev) and prevent overwriting while typing
  const didLoadRef = useRef(false);
  const dirtyRef = useRef(false);

  // Load current settings (ONCE)
  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;

    const controller = new AbortController();

    (async () => {
      try {
        const res = await axios.get("/admin/contact-setting", {
          signal: controller.signal,
        });

        const d = res?.data || {};

        // ✅ Only set initial values if user hasn't typed anything yet
        if (!dirtyRef.current) {
          setFormData({
            email: d.email || "",
            facebook: d.facebook || "",
            discord: d.discord || "",
            phone: d.phone || "",
            address: d.address || "",
            website: d.website || "",
          });
        }
      } catch (e) {
        // axios abort error safe ignore
        if (e?.name !== "CanceledError" && e?.code !== "ERR_CANCELED") {
          console.error("Failed to load contact settings:", e);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const handleChange = (field, value) => {
    // ✅ mark dirty so we don't overwrite what user typed
    dirtyRef.current = true;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEdit = () => {
    // when leaving edit mode, you can reset dirty if you want
    setIsEditing((v) => !v);
  };

  const save = async () => {
    setSaving(true);
    try {
      await axios.put("/admin/contact-setting", {
        email: formData.email || "",
        facebook: formData.facebook || null,
        discord: formData.discord || null,
        phone: formData.phone || null,
        address: formData.address || null,
        website: formData.website || null,
      });

      alert("✅ Contact settings updated.");
      dirtyRef.current = false;
      setIsEditing(false);

      if (typeof onSaved === "function") onSaved();
    } catch (e) {
      console.error(e);
      alert("❌ Failed to update contact settings.");
      // keep editing
    } finally {
      setSaving(false);
    }
  };

  const Input = ({ label, name, type = "text", placeholder }) => (
    <div className="space-y-1">
      <label className="block text-sm font-semibold text-white">{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        value={formData[name] || ""}
        onChange={(e) => handleChange(name, e.target.value)}
        disabled={!isEditing || loading || saving}
        autoComplete="off"
        className={[
          "w-full rounded-xl border px-4 py-2 text-sm outline-none transition",
          "border-white/10 bg-[#1f1f1f] text-white placeholder:text-white/35",
          "focus:border-sky-400/30 focus:ring-2 focus:ring-sky-400/40",
          "disabled:cursor-not-allowed disabled:bg-[#181818] disabled:text-white/70",
        ].join(" ")}
      />
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[#2b2b2b] p-6 shadow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white">Contact Details</h2>
          <p className="mt-1 text-xs text-white/70">
            Update the contact information shown in your Contact Us area.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={toggleEdit}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white px-4 py-2 text-xs font-extrabold text-black hover:opacity-90 disabled:opacity-60"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleEdit}
                disabled={saving}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-white hover:bg-white/10 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-xl border border-white/10 bg-white px-4 py-2 text-xs font-extrabold text-black hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {loading ? (
          <div className="text-sm text-white/70">Loading…</div>
        ) : (
          <>
            <Input
              label="Email (reply-to)"
              name="email"
              type="email"
              placeholder="you@example.com"
            />

            <Input
              label="Facebook URL Link"
              name="facebook"
              type="url"
              placeholder="https://facebook.com/yourpage"
            />

            <Input
              label="Discord URL Link"
              name="discord"
              type="url"
              placeholder="https://discord.gg/yourinvite"
            />

            <Input
              label="Phone Number"
              name="phone"
              type="text"
              placeholder="+63 900 000 0000"
            />

            <Input
              label="Physical Address"
              name="address"
              type="text"
              placeholder="Street, City, Province, Country"
            />

            <Input
              label="Website"
              name="website"
              type="url"
              placeholder="https://yourdomain.com"
            />
          </>
        )}
      </div>

      <div className="mt-5 text-[11px] text-white/55">
        Click <span className="font-bold text-white">Edit</span> to enable typing,
        then <span className="font-bold text-white">Save</span> to apply changes.
      </div>
    </div>
  );
}
