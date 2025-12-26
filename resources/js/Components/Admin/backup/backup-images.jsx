// resources/js/Components/Admin/backup/backup-images.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

/**
 * ✅ STORAGE MANAGER (Mobile Responsive)
 *
 * Backend routes used:
 * - GET    /admin/storage/files?folder=...&search=...&page=...&per_page=...&sort=...&dir=...&type=...&month_from=...&month_to=...
 * - DELETE /admin/storage/files         body: { folder, rel }
 * - DELETE /admin/storage/files/bulk    body: { folder, rels: [] }
 *
 * ✅ Mobile UX:
 * - Desktop: table view (same as before)
 * - Mobile: card view per file (thumb + actions + checkbox)
 * - Sticky action bar on mobile for bulk delete + selection count
 */

export default function BackupImages() {
  const neuShadow = 'shadow-[8px_8px_15px_#bebebe,-8px_-8px_15px_#ffffff]';

  // ✅ display limits
  const MAX_NAME = 38;
  const MAX_REL = 46;

  const folders = useMemo(
    () => [
      { key: 'assets', label: 'Assets', publicPath: '/storage/assets', fsHint: 'public/storage/assets' },
      { key: 'chat-attachments', label: 'Chat Attachments', publicPath: '/storage/chat-attachments', fsHint: 'public/storage/chat-attachments' },
      { key: 'plans', label: 'Plans', publicPath: '/storage/plans', fsHint: 'public/storage/plans' },
      { key: 'slides', label: 'Slides', publicPath: '/storage/slides', fsHint: 'public/storage/slides' },
    ],
    []
  );

  // -----------------------------
  // State: filters + pagination
  // -----------------------------
  const [activeFolder, setActiveFolder] = useState(folders[0]?.key || 'assets');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [monthFrom, setMonthFrom] = useState('');
  const [monthTo, setMonthTo] = useState('');

  const [type, setType] = useState('');

  const [sort, setSort] = useState('last_modified');
  const [dir, setDir] = useState('desc');

  const [perPage, setPerPage] = useState(50);
  const [page, setPage] = useState(1);

  const [showFullNames, setShowFullNames] = useState(false);

  // -----------------------------
  // State: data
  // -----------------------------
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: perPage,
    from: null,
    to: null,
  });

  // -----------------------------
  // State: selection + broken thumbs
  // -----------------------------
  const [selected, setSelected] = useState(() => new Set());
  const [brokenThumbs, setBrokenThumbs] = useState(() => new Set());

  const currentFolder = useMemo(
    () => folders.find((f) => f.key === activeFolder) || folders[0],
    [activeFolder, folders]
  );

  // -----------------------------
  // Helpers
  // -----------------------------
  const shortenKeepExt = (value, maxLen = 38) => {
    const s = String(value || '');
    if (s.length <= maxLen) return s;

    const dot = s.lastIndexOf('.');
    const hasExt = dot > 0 && dot >= s.length - 8;
    const ext = hasExt ? s.slice(dot) : '';
    const base = hasExt ? s.slice(0, dot) : s;

    const target = maxLen - ext.length;
    if (target < 12) return s.slice(0, maxLen - 1) + '…';

    const keep = target - 1;
    const head = Math.ceil(keep * 0.6);
    const tail = Math.floor(keep * 0.4);

    return `${base.slice(0, head)}…${base.slice(-tail)}${ext}`;
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(String(text || ''));
      Swal.fire({
        toast: true,
        position: 'top-end',
        timer: 1200,
        showConfirmButton: false,
        icon: 'success',
        title: 'Copied',
      });
    } catch {
      Swal.fire('Copy failed', 'Clipboard blocked by browser. Copy manually from tooltip.', 'info');
    }
  };

  const svgThumb = (label) => {
    const safe = String(label || 'FILE').slice(0, 8).toUpperCase();
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="90">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect x="10" y="10" width="100" height="70" rx="10" fill="#e5e7eb"/>
        <text x="60" y="52" text-anchor="middle" font-family="Inter,Arial" font-size="12" fill="#6b7280">${safe}</text>
      </svg>
    `.trim();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const badgeClass = (t) => {
    switch (t) {
      case 'image':
        return 'bg-green-50 text-green-700';
      case 'video':
        return 'bg-purple-50 text-purple-700';
      case 'archive':
        return 'bg-amber-50 text-amber-700';
      case 'doc':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const parseMonthStart = (ym) => {
    if (!ym) return null;
    const [y, m] = ym.split('-').map((v) => parseInt(v, 10));
    if (!y || !m) return null;
    return new Date(y, m - 1, 1, 0, 0, 0, 0).getTime() / 1000;
  };

  const parseMonthEnd = (ym) => {
    if (!ym) return null;
    const [y, m] = ym.split('-').map((v) => parseInt(v, 10));
    if (!y || !m) return null;
    const end = new Date(y, m, 0, 23, 59, 59, 999).getTime();
    return Math.floor(end / 1000);
  };

  const monthFromTs = useMemo(() => parseMonthStart(monthFrom), [monthFrom]);
  const monthToTs = useMemo(() => parseMonthEnd(monthTo), [monthTo]);

  const withinMonthRange = (ts) => {
    if (!ts) return true;
    if (monthFromTs && ts < monthFromTs) return false;
    if (monthToTs && ts > monthToTs) return false;
    return true;
  };

  const getErrMsg = (errors) =>
    errors?.file ||
    errors?.folder ||
    errors?.rel ||
    errors?.rels ||
    errors?.message ||
    errors?.backup ||
    'Something went wrong.';

  // -----------------------------
  // Fetching
  // -----------------------------
  const abortRef = useRef(null);

  const buildQuery = () => {
    const qs = new URLSearchParams();
    qs.set('folder', activeFolder);
    qs.set('page', String(page));
    qs.set('per_page', String(perPage));
    qs.set('sort', sort);
    qs.set('dir', dir);

    if (search) qs.set('search', search);
    if (type) qs.set('type', type);

    if (monthFrom) qs.set('month_from', monthFrom);
    if (monthTo) qs.set('month_to', monthTo);

    return qs.toString();
  };

  const fetchFiles = async () => {
    setLoading(true);

    try {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const url = `/admin/storage/files?${buildQuery()}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Fetch failed (${res.status}): ${txt}`);
      }

      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];
      const pg = json?.pagination || {};

      setRows(data);
      setPagination({
        current_page: pg.current_page ?? page,
        last_page: pg.last_page ?? 1,
        total: pg.total ?? data.length,
        per_page: pg.per_page ?? perPage,
        from: pg.from ?? null,
        to: pg.to ?? null,
      });
    } catch (e) {
      if (String(e?.name) === 'AbortError') return;
      Swal.fire('Error', e?.message || 'Failed to fetch files.', 'error');
      setRows([]);
      setPagination((p) => ({ ...p, total: 0, last_page: 1 }));
    } finally {
      setLoading(false);
    }
  };

  // debounce search input -> applied search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // reset selection/broken when folder changes
  useEffect(() => {
    setSelected(new Set());
    setBrokenThumbs(new Set());
    setPage(1);
  }, [activeFolder]);

  // refetch on query changes
  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFolder, search, page, perPage, sort, dir, type, monthFrom, monthTo]);

  // -----------------------------
  // Filtering (month range) - client-side
  // -----------------------------
  const filteredRows = useMemo(() => rows.filter((r) => withinMonthRange(r?.last_modified)), [rows, monthFromTs, monthToTs]);

  const visibleRels = useMemo(() => filteredRows.map((r) => r?.rel).filter(Boolean), [filteredRows]);

  const isAllVisibleSelected = useMemo(() => {
    if (visibleRels.length === 0) return false;
    for (const rel of visibleRels) if (!selected.has(rel)) return false;
    return true;
  }, [visibleRels, selected]);

  const toggleSelect = (rel) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(rel)) next.delete(rel);
      else next.add(rel);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = visibleRels.every((rel) => next.has(rel));
      if (allSelected) visibleRels.forEach((rel) => next.delete(rel));
      else visibleRels.forEach((rel) => next.add(rel));
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const markBroken = (rel) => {
    setBrokenThumbs((prev) => {
      const next = new Set(prev);
      next.add(rel);
      return next;
    });
  };

  // -----------------------------
  // Preview modal
  // -----------------------------
  const openPreview = (row) => {
    const name = row?.name || row?.rel || 'File';
    const url = row?.url || null;

    if (!url) return Swal.fire('Info', 'No URL for this file.', 'info');

    if (row?.type === 'image') {
      return Swal.fire({
        title: name,
        html: `<div style="display:flex;justify-content:center">
                 <img src="${url}" style="max-width:100%;max-height:60vh;border-radius:12px" />
               </div>`,
        showCancelButton: true,
        confirmButtonText: 'Open in new tab',
        cancelButtonText: 'Close',
        preConfirm: () => window.open(url, '_blank', 'noreferrer'),
      });
    }

    if (row?.type === 'video') {
      return Swal.fire({
        title: name,
        html: `<div style="display:flex;justify-content:center">
                 <video src="${url}" controls style="max-width:100%;max-height:60vh;border-radius:12px"></video>
               </div>`,
        showCancelButton: true,
        confirmButtonText: 'Open in new tab',
        cancelButtonText: 'Close',
        preConfirm: () => window.open(url, '_blank', 'noreferrer'),
      });
    }

    return Swal.fire({
      title: name,
      html: `<div style="text-align:left;font-size:14px;color:#374151">
              <div style="margin-bottom:10px"><b>Type:</b> ${row?.type || 'other'}</div>
              <div style="margin-bottom:10px"><b>URL:</b> <span style="font-family:monospace">${url}</span></div>
              <div style="color:#6b7280">Preview available only for images/videos.</div>
            </div>`,
      showCancelButton: true,
      confirmButtonText: 'Open in new tab',
      cancelButtonText: 'Close',
      preConfirm: () => window.open(url, '_blank', 'noreferrer'),
    });
  };

  // -----------------------------
  // Delete actions
  // -----------------------------
  const deleteSingle = async (row) => {
    const rel = row?.rel;
    if (!rel) return;

    const res = await Swal.fire({
      title: 'Delete this file?',
      html: `<div style="text-align:left;font-size:13px;color:#374151">
              <div><b>Folder:</b> ${activeFolder}</div>
              <div><b>File:</b> <span style="font-family:monospace">${rel}</span></div>
            </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (!res.isConfirmed) return;

    router.delete('/admin/storage/files', {
      preserveScroll: true,
      data: { folder: activeFolder, rel },
      onSuccess: () => {
        Swal.fire('Deleted', 'File deleted.', 'success');
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(rel);
          return next;
        });
        fetchFiles();
      },
      onError: (errors) => Swal.fire('Error', getErrMsg(errors), 'error'),
    });
  };

  const bulkDelete = async () => {
    const rels = Array.from(selected);
    if (rels.length === 0) return Swal.fire('No selection', 'Please select at least one file.', 'info');

    const res = await Swal.fire({
      title: `Delete ${rels.length} file(s)?`,
      html: `<div style="text-align:left;font-size:13px;color:#374151">
              <div style="margin-bottom:8px"><b>Folder:</b> ${activeFolder}</div>
              <div style="max-height:170px;overflow:auto;border:1px solid #e5e7eb;border-radius:10px;padding:10px;background:#fff">
                ${rels
                  .slice(0, 200)
                  .map((r) => `<div style="font-family:monospace">${r}</div>`)
                  .join('')}
                ${rels.length > 200 ? `<div style="margin-top:8px;color:#6b7280">…and more</div>` : ''}
              </div>
            </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete selected',
      cancelButtonText: 'Cancel',
    });

    if (!res.isConfirmed) return;

    router.delete('/admin/storage/files/bulk', {
      preserveScroll: true,
      data: { folder: activeFolder, rels },
      onSuccess: () => {
        Swal.fire('Deleted', 'Selected files deleted.', 'success');
        clearSelection();
        fetchFiles();
      },
      onError: (errors) => Swal.fire('Error', getErrMsg(errors), 'error'),
    });
  };

  // -----------------------------
  // Pagination
  // -----------------------------
  const goTo = (p) => {
    const last = pagination?.last_page || 1;
    const next = Math.min(Math.max(1, p), last);
    setPage(next);
  };

  const pageButtons = useMemo(() => {
    const cur = pagination?.current_page || page;
    const last = pagination?.last_page || 1;

    const out = [];
    const start = Math.max(1, cur - 2);
    const end = Math.min(last, cur + 2);
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  }, [pagination, page]);

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setMonthFrom('');
    setMonthTo('');
    setType('');
    setSort('last_modified');
    setDir('desc');
    setPerPage(50);
    setPage(1);
    clearSelection();
  };

  // -----------------------------
  // Small reusable UI helpers
  // -----------------------------
  const FileCell = ({ r }) => {
    const rel = r?.rel || '';
    const fullName = r?.name || '-';
    const fullRel = rel || '';
    const showRel = fullRel && fullRel !== fullName;

    const displayName = showFullNames ? fullName : shortenKeepExt(fullName, MAX_NAME);
    const displayRel = showFullNames ? fullRel : shortenKeepExt(fullRel, MAX_REL);

    return (
      <div className="min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="font-mono text-xs text-gray-900 truncate" title={fullName}>
            {displayName}
          </div>
          <button
            type="button"
            onClick={() => copyText(fullName)}
            className="shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
            title="Copy filename"
          >
            Copy
          </button>
        </div>

        {showRel ? (
          <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500 min-w-0">
            <span className="font-semibold shrink-0">rel:</span>
            <span className="font-mono truncate" title={fullRel}>
              {displayRel}
            </span>
            <button
              type="button"
              onClick={() => copyText(fullRel)}
              className="shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
              title="Copy rel"
            >
              Copy
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  const PreviewThumb = ({ r }) => {
    const rel = r?.rel || '';
    const hasRel = Boolean(rel);
    const isImg = r?.type === 'image';
    const thumb = isImg ? r?.thumb_url : null;

    const previewSrc = isImg && thumb && hasRel && !brokenThumbs.has(rel) ? thumb : svgThumb(isImg ? 'NO IMG' : r?.ext || 'FILE');

    return (
      <div className="w-20 h-14 rounded-lg overflow-hidden border bg-gray-50 flex items-center justify-center shrink-0">
        {isImg ? (
          <img
            src={previewSrc}
            alt={r?.name || 'image'}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => openPreview(r)}
            onError={() => hasRel && markBroken(rel)}
            loading="lazy"
          />
        ) : (
          <img src={previewSrc} alt="file" className="w-full h-full object-cover" loading="lazy" />
        )}
      </div>
    );
  };

  const Actions = ({ r }) => {
    const hasRel = Boolean(r?.rel);
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => openPreview(r)}
          className="px-3 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200"
        >
          Preview
        </button>

        {r?.url ? (
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Open
          </a>
        ) : null}

        <button
          onClick={() => deleteSingle(r)}
          disabled={!hasRel}
          className="px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-40"
        >
          Delete
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto bg-gray-200 rounded-xl p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 uppercase tracking-wider">Storage Manager</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage images, videos, zip, docs, etc. Thumbnails show instantly for images.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700 select-none">
            <input type="checkbox" checked={showFullNames} onChange={(e) => setShowFullNames(e.target.checked)} />
            Show full names
          </label>

          <button
            onClick={fetchFiles}
            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gray-300 text-gray-800 hover:bg-gray-100"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>

          <button
            onClick={resetFilters}
            className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gray-100 text-gray-800 hover:bg-white border"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Folder Tabs (scrollable on mobile) */}
      <div className={`p-3 rounded-xl bg-gray-200 ${neuShadow}`}>
        <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {folders.map((f) => {
            const isActive = f.key === activeFolder;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFolder(f.key)}
                className={[
                  'shrink-0 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition',
                  isActive ? 'bg-white text-gray-900 shadow' : 'bg-gray-200 text-gray-600 hover:bg-gray-100',
                ].join(' ')}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 text-[11px] sm:text-xs text-gray-600 space-y-1">
          <div className="break-words">
            <b>Public URL:</b> <span className="font-mono">{currentFolder?.publicPath}</span>
          </div>
          <div className="break-words">
            <b>Folder path:</b> <span className="font-mono">{currentFolder?.fsHint}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 sm:p-6 rounded-xl bg-gray-200 ${neuShadow} space-y-4`}>
        <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Files</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Showing {filteredRows.length} in list (server total: {pagination?.total ?? 0}).
            </p>
          </div>

          {/* Desktop bulk actions */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
            <div className="text-xs font-semibold text-gray-700 bg-gray-300 px-3 py-2 rounded">{selected.size} selected</div>

            <button
              onClick={bulkDelete}
              disabled={selected.size === 0}
              className={[
                'px-4 py-2 rounded-lg text-sm font-semibold',
                selected.size === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-200',
              ].join(' ')}
            >
              Delete selected
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Search</label>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search filename / path…"
              className="w-full px-3 sm:px-4 py-2 border rounded"
            />
          </div>

          {/* Month from */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Month from</label>
            <input
              type="month"
              value={monthFrom}
              onChange={(e) => {
                setPage(1);
                setMonthFrom(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Month to */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Month to</label>
            <input
              type="month"
              value={monthTo}
              onChange={(e) => {
                setPage(1);
                setMonthTo(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {/* Type */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded bg-white"
            >
              <option value="">All</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="archive">Archives (zip/rar)</option>
              <option value="doc">Docs (pdf/doc/xls)</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Per page */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Per page</label>
            <select
              value={perPage}
              onChange={(e) => {
                setPage(1);
                setPerPage(parseInt(e.target.value, 10));
              }}
              className="w-full px-3 py-2 border rounded bg-white"
            >
              {[20, 50, 100, 200, 500, 1000, 2000, 5000].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-start sm:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-700">Sort</span>
            <select
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value);
              }}
              className="px-3 py-2 border rounded bg-white text-sm"
            >
              <option value="last_modified">Last modified</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>

            <select
              value={dir}
              onChange={(e) => {
                setPage(1);
                setDir(e.target.value);
              }}
              className="px-3 py-2 border rounded bg-white text-sm"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>

          <div className="text-[11px] sm:text-xs text-gray-600">
            Tip: Month filter is based on <b>last_modified</b>.
          </div>

          {/* Mobile select all */}
          <div className="sm:hidden w-full pt-1">
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              className="w-full px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 border"
            >
              {isAllVisibleSelected ? 'Unselect all visible' : 'Select all visible'}
            </button>
          </div>
        </div>

        {/* ✅ DESKTOP TABLE */}
        <div className="hidden sm:block overflow-auto rounded-lg border border-gray-300 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input type="checkbox" checked={isAllVisibleSelected} onChange={toggleSelectAllVisible} aria-label="Select all visible" />
                </th>
                <th className="text-left px-4 py-3 w-28">Preview</th>
                <th className="text-left px-4 py-3">File</th>
                <th className="text-left px-4 py-3 w-40">Type</th>
                <th className="text-left px-4 py-3 w-36">Size</th>
                <th className="text-left px-4 py-3 w-52">Modified</th>
                <th className="text-right px-4 py-3 w-44">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-5 text-gray-500" colSpan={7}>
                    Loading…
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-5 text-gray-500" colSpan={7}>
                    No files found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, idx) => {
                  const rel = r?.rel || '';
                  const hasRel = Boolean(rel);
                  const checked = hasRel ? selected.has(rel) : false;

                  return (
                    <tr key={`${activeFolder}:${rel || r?.name || 'row'}:${idx}`} className="border-t align-top">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          disabled={!hasRel}
                          checked={checked}
                          onChange={() => hasRel && toggleSelect(rel)}
                          aria-label={`Select ${rel || r?.name || 'file'}`}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <PreviewThumb r={r} />
                      </td>

                      <td className="px-4 py-3">
                        <FileCell r={r} />
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${badgeClass(r?.type)}`}>
                          {(r?.type || 'other').toUpperCase()}
                        </span>
                        <div className="text-[11px] text-gray-500 mt-1">.{r?.ext || '-'}</div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">{r?.size_human || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{r?.date || '-'}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <Actions r={r} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ MOBILE CARDS */}
        <div className="sm:hidden space-y-3">
          {loading ? (
            <div className="px-3 py-4 rounded-lg border bg-white text-sm text-gray-600">Loading…</div>
          ) : filteredRows.length === 0 ? (
            <div className="px-3 py-4 rounded-lg border bg-white text-sm text-gray-600">No files found.</div>
          ) : (
            filteredRows.map((r, idx) => {
              const rel = r?.rel || '';
              const hasRel = Boolean(rel);
              const checked = hasRel ? selected.has(rel) : false;

              return (
                <div key={`${activeFolder}:${rel || r?.name || 'card'}:${idx}`} className="rounded-xl border border-gray-300 bg-white p-3">
                  <div className="flex items-start gap-3">
                    <PreviewThumb r={r} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <FileCell r={r} />
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${badgeClass(r?.type)}`}>
                              {(r?.type || 'other').toUpperCase()}
                            </span>
                            <span className="text-[11px] text-gray-500">.{r?.ext || '-'}</span>
                          </div>
                        </div>

                        <div className="shrink-0 pt-1">
                          <input
                            type="checkbox"
                            disabled={!hasRel}
                            checked={checked}
                            onChange={() => hasRel && toggleSelect(rel)}
                            aria-label={`Select ${rel || r?.name || 'file'}`}
                            className="h-5 w-5"
                          />
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                        <div className="bg-gray-50 rounded-lg px-2 py-2">
                          <div className="font-semibold text-gray-700">Size</div>
                          <div className="mt-0.5">{r?.size_human || '-'}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-2 py-2">
                          <div className="font-semibold text-gray-700">Modified</div>
                          <div className="mt-0.5">{r?.date || '-'}</div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Actions r={r} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
          <div className="text-[11px] sm:text-xs text-gray-600">
            {pagination?.total ? (
              <>
                Showing <b>{pagination.from ?? '-'}</b> to <b>{pagination.to ?? '-'}</b> of <b>{pagination.total}</b>
              </>
            ) : (
              '—'
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => goTo(1)}
              disabled={(pagination?.current_page || 1) <= 1}
              className="px-3 py-2 sm:py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800 disabled:opacity-40"
            >
              First
            </button>
            <button
              onClick={() => goTo((pagination?.current_page || 1) - 1)}
              disabled={(pagination?.current_page || 1) <= 1}
              className="px-3 py-2 sm:py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800 disabled:opacity-40"
            >
              Prev
            </button>

            {/* hide number buttons on extra small screens */}
            <div className="hidden sm:flex items-center gap-2">
              {pageButtons.map((p) => (
                <button
                  key={p}
                  onClick={() => goTo(p)}
                  className={[
                    'px-3 py-1 rounded text-xs font-semibold',
                    (pagination?.current_page || 1) === p ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => goTo((pagination?.current_page || 1) + 1)}
              disabled={(pagination?.current_page || 1) >= (pagination?.last_page || 1)}
              className="px-3 py-2 sm:py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800 disabled:opacity-40"
            >
              Next
            </button>
            <button
              onClick={() => goTo(pagination?.last_page || 1)}
              disabled={(pagination?.current_page || 1) >= (pagination?.last_page || 1)}
              className="px-3 py-2 sm:py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800 disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>

        <div className="text-[11px] sm:text-xs text-gray-600">
          Note: If you set per-page to <b>5000</b>, you’re intentionally loading a lot of rows. Use filters for smoother UX.
        </div>
      </div>

      {/* ✅ Mobile Sticky Bulk Bar */}
      <div className="sm:hidden fixed left-0 right-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur px-3 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <div className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
            {selected.size} selected
          </div>

          <button
            onClick={bulkDelete}
            disabled={selected.size === 0}
            className={[
              'flex-1 px-4 py-2 rounded-lg text-sm font-semibold',
              selected.size === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-100 text-red-700 hover:bg-red-200',
            ].join(' ')}
          >
            Delete selected
          </button>

          <button
            onClick={clearSelection}
            disabled={selected.size === 0}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-800 disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      {/* spacer so mobile sticky bar won't cover content */}
      <div className="sm:hidden h-16" />
    </div>
  );
}
