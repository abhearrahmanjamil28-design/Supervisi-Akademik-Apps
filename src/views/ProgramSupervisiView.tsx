import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Scale,
  Target,
  CheckCircle2,
  Layers,
  Printer,
  X,
  ExternalLink,
  FileText,
  Eye,
  Info
} from 'lucide-react';
import {
  SchoolProfile,
  User,
  ProgramDocument,
  ProgramDocCategory
} from '../types/supervisi';
import { INITIAL_PROGRAM_SUPERVISI } from '../data/mockData';

interface ProgramSupervisiViewProps {
  school: SchoolProfile;
  currentUser: User;
  programDocs: ProgramDocument[];
  onAddProgramDoc: (doc: ProgramDocument) => void;
  onUpdateProgramDoc: (doc: ProgramDocument) => void;
  onDeleteProgramDoc: (id: string) => void;
}

const CATEGORY_STYLES: Record<ProgramDocCategory, string> = {
  'PROGRAM TAHUNAN': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'PANDUAN OPERASIONAL': 'bg-blue-50 text-blue-700 border border-blue-200',
  'SK TIM SUPERVISI': 'bg-orange-50 text-orange-700 border border-orange-200',
  'KALENDER AKADEMIK': 'bg-slate-100 text-slate-700 border border-slate-200',
};

const formatTruncatedDriveLink = (url: string) => {
  if (!url) return '...';
  if (url.startsWith('...')) return url;
  const cleaned = url.replace(/^https?:\/\/(drive|docs)\.google\.com/, '');
  if (cleaned.length > 36) {
    return `...${cleaned.slice(-36)}`;
  }
  return `...${cleaned}`;
};

const getGoogleDriveEmbedUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();

  // Google Drive file: /file/d/FILE_ID/...
  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch?.[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  // Google Drive open?id=FILE_ID or uc?id=FILE_ID
  const driveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch?.[1]) {
    return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
  }

  // Google Drive folder: /drive/folders/FOLDER_ID
  const folderMatch = trimmed.match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch?.[1]) {
    return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#list`;
  }

  // Google Docs / Sheets / Slides
  const docsMatch = trimmed.match(
    /docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/
  );
  if (docsMatch?.[1] && docsMatch?.[2]) {
    return `https://docs.google.com/${docsMatch[1]}/d/${docsMatch[2]}/preview`;
  }

  return trimmed;
};

export const ProgramSupervisiView: React.FC<ProgramSupervisiViewProps> = ({
  school,
  currentUser,
  programDocs,
  onAddProgramDoc,
  onUpdateProgramDoc,
  onDeleteProgramDoc,
}) => {
  const canManage = currentUser.role === 'admin';
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    () => programDocs[0]?.id || null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<ProgramDocument | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Form states for Add / Edit modal
  const [kategori, setKategori] = useState<ProgramDocCategory>('PROGRAM TAHUNAN');
  const [tanggal, setTanggal] = useState('2024-08-15');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [oleh, setOleh] = useState('Admin Kurikulum');

  useEffect(() => {
    if (!canManage && isModalOpen) {
      setIsModalOpen(false);
      setEditingDoc(null);
    }
  }, [canManage, isModalOpen]);

  const selectedDoc = programDocs.find((doc) => doc.id === selectedDocId) || null;

  // Preserve original policy view for Guru role if accessed
  if (currentUser.role === 'guru') {
    const program = INITIAL_PROGRAM_SUPERVISI;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{program.judul}</h2>
            <p className="text-xs text-gray-500">
              Dokumen Kebijakan & Kerangka Kerja Penjaminan Mutu Akademik {school.namaSekolah}
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Program</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shrink-0">
              UQ
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-emerald-950 uppercase">
                Program Supervisi Akademik Kurikulum Merdeka
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Tahun Ajaran: {school.tahunAjaran} • Penanggung Jawab: {school.kepalaSekolah}
              </p>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                {program.latarBelakang}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <Scale className="w-4 h-4 text-emerald-700" />
              Landasan Hukum & Regulasi
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
              {program.dasarHukum.map((item, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <Target className="w-4 h-4 text-emerald-700" />
              Tujuan & Sasaran Supervisi Akademik
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
              {program.tujuan.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/20 flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <Layers className="w-4 h-4 text-emerald-700" />
              Siklus & Tahapan Operasional
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-200">Tahapan Supervisi</th>
                    <th className="py-3 px-4 border-b border-gray-200">Alokasi Waktu</th>
                    <th className="py-3 px-4 border-b border-gray-200">Rincian Kegiatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {program.tahapan.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-emerald-950">{item.tahap}</td>
                      <td className="py-3 px-4 text-emerald-700 font-medium whitespace-nowrap">
                        {item.waktu}
                      </td>
                      <td className="py-3 px-4 text-gray-600 leading-relaxed">{item.kegiatan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal helpers for Admin
  const openAddModal = () => {
    if (!canManage) return;
    setEditingDoc(null);
    setKategori('PROGRAM TAHUNAN');
    setTanggal(new Date().toISOString().slice(0, 10));
    setJudul('');
    setDeskripsi('');
    setDriveLink('https://drive.google.com/file/d/');
    setOleh('Admin Kurikulum');
    setIsModalOpen(true);
  };

  const openEditModal = (doc: ProgramDocument) => {
    if (!canManage) return;
    setEditingDoc(doc);
    setKategori(doc.kategori);
    setTanggal(doc.tanggal);
    setJudul(doc.judul);
    setDeskripsi(doc.deskripsi);
    setDriveLink(doc.driveLink);
    setOleh(doc.oleh);
    setIsModalOpen(true);
  };

  const handleSelectForPreview = (doc: ProgramDocument) => {
    setSelectedDocId(doc.id);
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !judul.trim() || !driveLink.trim()) return;

    if (editingDoc) {
      const updated: ProgramDocument = {
        ...editingDoc,
        kategori,
        tanggal,
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        driveLink: driveLink.trim(),
        oleh: oleh.trim() || 'Admin Kurikulum',
      };
      onUpdateProgramDoc(updated);
      if (selectedDocId === updated.id) {
        setSelectedDocId(updated.id);
      }
    } else {
      const created: ProgramDocument = {
        id: `prog-doc-${Date.now()}`,
        kategori,
        tanggal,
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        driveLink: driveLink.trim(),
        oleh: oleh.trim() || 'Admin Kurikulum',
      };
      onAddProgramDoc(created);
      setSelectedDocId(created.id);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (doc: ProgramDocument) => {
    if (!canManage) return;
    if (confirm(`Hapus dokumen "${doc.judul}"?`)) {
      onDeleteProgramDoc(doc.id);
      if (selectedDocId === doc.id) {
        setSelectedDocId(null);
      }
    }
  };

  const embedUrl = selectedDoc ? getGoogleDriveEmbedUrl(selectedDoc.driveLink) : '';

  // Admin Program Supervisi View (Table Layout + Direct Google Drive Live Preview)
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Program Supervisi</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {canManage
              ? 'Pengelolaan Berkas Supervisi Berbasis Google Drive'
              : 'Daftar Berkas Program Supervisi Berbasis Google Drive (Hanya Lihat)'}
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#065f46] hover:bg-[#044e3a] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Dokumen Program</span>
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/90 border-b border-gray-200 text-gray-600 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Kategori</th>
                <th className="py-3.5 px-4 min-w-[240px]">Judul & Deskripsi Dokumen</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                <th className="py-3.5 px-4 min-w-[200px]">Tautan Google Drive</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Oleh</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {programDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 px-4 text-center text-gray-500">
                    <p className="text-sm font-semibold text-gray-700">Belum ada dokumen program</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {canManage
                        ? 'Klik tombol "Tambah Dokumen Program" untuk menambahkan berkas Google Drive.'
                        : 'Dokumen program supervisi yang diinput oleh Admin akan tampil di sini.'}
                    </p>
                  </td>
                </tr>
              ) : (
                programDocs.map((doc, idx) => {
                  const badgeStyle =
                    CATEGORY_STYLES[doc.kategori] ||
                    'bg-slate-100 text-slate-700 border border-slate-200';
                  const isSelected = selectedDoc?.id === doc.id;

                  return (
                    <tr
                      key={doc.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-emerald-50/50' : 'hover:bg-gray-50/70'
                      }`}
                    >
                      <td className="py-4 px-4 text-center font-bold text-gray-400">{idx + 1}</td>
                      <td className="py-4 px-4 whitespace-nowrap align-top">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${badgeStyle}`}
                        >
                          {doc.kategori}
                        </span>
                      </td>
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-gray-900 text-xs sm:text-[13px] leading-snug">
                          {doc.judul}
                        </div>
                        {doc.deskripsi && (
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {doc.deskripsi}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-500 font-medium whitespace-nowrap align-top">
                        {doc.tanggal}
                      </td>
                      <td className="py-4 px-4 align-top">
                        <input
                          type="text"
                          readOnly
                          value={formatTruncatedDriveLink(doc.driveLink)}
                          title={doc.driveLink}
                          aria-label="Tautan Google Drive"
                          className="w-full max-w-[230px] bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-500 font-mono focus:outline-none cursor-default"
                        />
                      </td>
                      <td className="py-4 px-4 text-gray-700 font-medium whitespace-nowrap align-top">
                        {doc.oleh}
                      </td>
                      <td className="py-4 px-4 text-center align-top whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSelectForPreview(doc)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-800 text-white ring-2 ring-emerald-500/30'
                                : 'bg-[#065f46] hover:bg-[#044e3a] text-white'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isSelected ? 'Sedang Dipreview' : 'Preview'}</span>
                          </button>

                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(doc)}
                                title="Edit Dokumen"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(doc)}
                                title="Hapus Dokumen"
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Google Drive Preview Section */}
      <div
        ref={previewRef}
        className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden"
      >
        {selectedDoc ? (
          <div className="flex flex-col">
            {/* Preview Toolbar */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                      CATEGORY_STYLES[selectedDoc.kategori]
                    }`}
                  >
                    {selectedDoc.kategori}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {selectedDoc.tanggal} • Oleh: {selectedDoc.oleh}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-1 truncate">
                  Pratinjau Langsung: {selectedDoc.judul}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedDoc.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#065f46] hover:bg-[#044e3a] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Google Drive</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedDocId(null)}
                  title="Tutup pratinjau"
                  className="p-2 border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-white rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Share permission info tip */}
            <div className="px-6 py-2.5 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-900">
              <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                Pratinjau langsung dimuat dari tautan Google Drive yang tersimpan. Pastikan izin berbagi file di Google Drive diatur ke{' '}
                <strong>"Siapa saja yang memiliki link"</strong> agar dokumen dapat tampil langsung di halaman ini.
              </span>
            </div>

            {/* Embedded Live Google Drive Frame */}
            <div className="w-full h-[620px] bg-slate-100 relative">
              <iframe
                key={`${selectedDoc.id}-${embedUrl}`}
                src={embedUrl}
                title={`Preview ${selectedDoc.judul}`}
                className="w-full h-full border-0"
                allow="autoplay"
              />
            </div>
          </div>
        ) : (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Pratinjau Dokumen Google Drive</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Klik tombol <strong>Preview</strong> pada salah satu baris tabel di atas untuk menampilkan isi dokumen Google Drive secara langsung di sini.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Document Modal */}
      {canManage && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="bg-[#065f46] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingDoc ? 'Edit Dokumen Program' : 'Tambah Dokumen Program'}
                </h3>
                <p className="text-[11px] text-emerald-100">
                  Kelola tautan berkas program supervisi berbasis Google Drive
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Kategori Dokumen
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as ProgramDocCategory)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="PROGRAM TAHUNAN">PROGRAM TAHUNAN</option>
                    <option value="PANDUAN OPERASIONAL">PANDUAN OPERASIONAL</option>
                    <option value="SK TIM SUPERVISI">SK TIM SUPERVISI</option>
                    <option value="KALENDER AKADEMIK">KALENDER AKADEMIK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Judul Dokumen *</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Program Tahunan Supervisi Akademik TP 2024/2025"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Pedoman umum pelaksanaan supervisi akademik..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tautan Google Drive *
                </label>
                <input
                  type="text"
                  required
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full p-2.5 border border-gray-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Mendukung link Google Drive File, Folder, Google Docs, Sheets, dan Slides.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Oleh (Pembuat)</label>
                <input
                  type="text"
                  value={oleh}
                  onChange={(e) => setOleh(e.target.value)}
                  placeholder="Contoh: Admin Kurikulum"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#065f46] hover:bg-[#044e3a] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingDoc ? 'Simpan Perubahan' : 'Simpan Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
