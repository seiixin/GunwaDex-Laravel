// resources/js/Pages/Admin/PaymongoSettings.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "@/Layouts/AdminLayout";

export default function PaymongoSettings() {
  const api = useMemo(
    () =>
      axios.create({
        baseURL: "/admin",
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        xsrfCookieName: "XSRF-TOKEN",
        xsrfHeaderName: "X-XSRF-TOKEN",
      }),
    []
  );

  const [paymongoPublic, setPaymongoPublic] = useState("");
  const [paymongoSecret, setPaymongoSecret] = useState("");

  const [editPublic, setEditPublic] = useState(false);
  const [editSecret, setEditSecret] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingPublic, setSavingPublic] = useState(false);
  const [savingSecret, setSavingSecret] = useState(false);
  const [error, setError] = useState("");

  const loadKeys = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/store-points/keys");
      setPaymongoPublic(res?.data?.public || "");
      setPaymongoSecret(res?.data?.secret || "");
    } catch (e) {
      console.error(e);
      setError("Failed to load PayMongo keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savePayMongoKey = async (type) => {
    const value = type === "public" ? paymongoPublic : paymongoSecret;

    if (!String(value || "").trim()) {
      throw new Error("Key is empty.");
    }

    await api.post("/store-points/keys", {
      key_type: type,
      value: String(value).trim(),
    });
  };

  const togglePublic = async () => {
    setError("");
    if (editPublic) {
      try {
        setSavingPublic(true);
        await savePayMongoKey("public");
        setEditPublic(false);
      } catch (e) {
        console.error(e);
        setError(
          e?.message === "Key is empty."
            ? "Public key is required."
            : "Failed to save Public key."
        );
      } finally {
        setSavingPublic(false);
      }
      return;
    }
    setEditPublic(true);
    setEditSecret(false);
  };

  const toggleSecret = async () => {
    setError("");
    if (editSecret) {
      try {
        setSavingSecret(true);
        await savePayMongoKey("secret");
        setEditSecret(false);
      } catch (e) {
        console.error(e);
        setError(
          e?.message === "Key is empty."
            ? "Secret key is required."
            : "Failed to save Secret key."
        );
      } finally {
        setSavingSecret(false);
      }
      return;
    }
    setEditSecret(true);
    setEditPublic(false);
  };

  const mask = (v) => {
    const s = String(v || "");
    if (!s) return "";
    if (s.length <= 10) return "•".repeat(s.length);
    return `${s.slice(0, 6)}••••••••${s.slice(-4)}`;
  };

  const InputRow = ({
    label,
    value,
    onChange,
    isEditing,
    onToggle,
    saving,
    placeholder,
    help,
  }) => (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-extrabold uppercase tracking-wider text-white/70">
            {label}
          </div>
          {help ? (
            <div className="mt-1 text-[11px] sm:text-xs text-white/45">
              {help}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={loading || saving}
          className={[
            "shrink-0 rounded-xl px-3 py-2 text-xs font-extrabold border transition",
            saving || loading
              ? "border-white/10 bg-white/10 text-white/40 cursor-not-allowed"
              : isEditing
              ? "border-white/10 bg-white text-black hover:opacity-90"
              : "border-white/10 bg-white/5 text-white hover:bg-white/10",
          ].join(" ")}
        >
          {saving ? "Saving…" : isEditing ? "Save" : value ? "Edit" : "Add"}
        </button>
      </div>

      <input
        type="text"
        value={isEditing ? value : mask(value)}
        readOnly={!isEditing}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full rounded-xl border px-3 py-2 text-sm outline-none transition",
          "border-white/10 bg-black/30 text-white placeholder:text-white/35",
          "focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400/30",
          !isEditing ? "cursor-not-allowed opacity-90" : "",
        ].join(" ")}
      />
    </div>
  );

  return (
    <AdminLayout active="paymongo" title="PayMongo Settings">
      <div className="space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
          <div className="text-lg sm:text-xl font-extrabold text-white">
            PayMongo Settings
          </div>
          <div className="mt-1 text-xs sm:text-sm text-white/55">
            Manage your PayMongo API keys used for payments.
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Keys */}
        <div className="grid grid-cols-1 gap-3">
          <InputRow
            label="Public Key"
            value={paymongoPublic}
            onChange={setPaymongoPublic}
            isEditing={editPublic}
            onToggle={togglePublic}
            saving={savingPublic}
            placeholder="pk_test_..."
            help="Used on client-side requests. Keep it safe but it's okay to expose publicly."
          />

          <InputRow
            label="Secret Key"
            value={paymongoSecret}
            onChange={setPaymongoSecret}
            isEditing={editSecret}
            onToggle={toggleSecret}
            saving={savingSecret}
            placeholder="sk_test_..."
            help="Used on server-side requests. Never expose this key publicly."
          />
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="text-[11px] sm:text-xs text-white/45">
            Tip: After updating keys, test payment checkout in a sandbox transaction.
          </div>
          <button
            type="button"
            onClick={loadKeys}
            disabled={loading}
            className={[
              "rounded-xl px-3 py-2 text-xs font-extrabold border transition",
              loading
                ? "border-white/10 bg-white/10 text-white/40 cursor-not-allowed"
                : "border-white/10 bg-white/5 text-white hover:bg-white/10",
            ].join(" ")}
          >
            Reload from server
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
