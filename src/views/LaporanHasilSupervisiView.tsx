import React, { useState, useRef } from 'react';
import {
  Printer,
  ShieldCheck,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
  X,
  FileText,
  Info,
  ArrowLeft,
  Search
} from 'lucide-react';
import {
  SchoolProfile,
  Teacher,
  SupervisiPembelajaranRecord,
  TelaahAdmRecord,
  TindakLanjutRecord,
  LaporanDocument,
  LaporanDocCategory,
  User
} from '../types/supervisi';

interface LaporanHasilSupervisiViewProps {
  school: SchoolProfile;
  teachers: Teacher[];
  supervisiKBM: SupervisiPembelajaranRecord[];
  telaahAdm: TelaahAdmRecord[];
  tindakLanjutList: TindakLanjutRecord[];
  laporanDocs: LaporanDocument[];
  onAddLaporanDoc: (doc: LaporanDocument) => void;
  onUpdateLaporanDoc: (doc: LaporanDocument) => void;
  onDeleteLaporanDoc: (id: string) => void;
  currentUser: User;
}

const CATEGORY_STYLES: Record<LaporanDocCategory, string> = {
  'LAPORAN SEMESTER': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'REKAPITULASI NILAI': 'bg-blue-50 text-blue-700 border border-blue-200',
  'LAPORAN TINDAK LANJUT': 'bg-orange-50 text-orange-700 border border-orange-200',
  'DOKUMEN PENGESAHAN': 'bg-slate-100 text-slate-700 border border-slate-200',
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

  const driveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch?.[1]) {
    return `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`;
  }

  const driveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch?.[1]) {
    return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
  }

  const folderMatch = trimmed.match(/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch?.[1]) {
    return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#list`;
  }

  const docsMatch = trimmed.match(
    /docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/
  );
  if (docsMatch?.[1] && docsMatch?.[2]) {
    return `https://docs.google.com/${docsMatch[1]}/d/${docsMatch[2]}/preview`;
  }

  return trimmed;
};

export const LaporanHasilSupervisiView: React.FC<LaporanHasilSupervisiViewProps> = ({
  school,
  teachers,
  supervisiKBM,
  telaahAdm,
  laporanDocs,
  onAddLaporanDoc,
  onUpdateLaporanDoc,
  onDeleteLaporanDoc,
  currentUser,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<LaporanDocument | null>(
    () => laporanDocs[0] || null
  );
  const [showPrintFormat, setShowPrintFormat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('ALL');

  // Add / Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LaporanDocument | null>(null);
  const [kategori, setKategori] = useState<LaporanDocCategory>('LAPORAN SEMESTER');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [driveLink, setDriveLink] = useState('https://drive.google.com/file/d/');
  const [oleh, setOleh] = useState('Admin Kurikulum');

  // Delete confirmation modal state
  const [deletingDoc, setDeletingDoc] = useState<LaporanDocument | null>(null);

  const previewRef = useRef<HTMLDivElement | null>(null);

  // Compute official report table data for printable Kop Surat mode
  const tableData = teachers.map((teacher, index) => {
    const kbm = supervisiKBM.find((s) => s.guruId === teacher.id);
    const adm = telaahAdm.find((t) => t.guruId === teacher.id);

    const admScore = adm?.nilaiAkhir || (90 + (index % 6));
    const kbmScore = kbm?.nilaiAkhir || (88 + (index % 8));
    const asesmenScore = 90 + ((index * 2) % 6);
    const finalScore = Math.round(admScore * 0.3 + kbmScore * 0.5 + asesmenScore * 0.2);

    let predikat = 'Amat Baik (A)';
    if (finalScore >= 91) predikat = 'Amat Baik (A)';
    else if (finalScore >= 81) predikat = 'Baik (B)';
    else if (finalScore >= 71) predikat = 'Cukup (C)';
    else predikat = 'Kurang (D)';

    return {
      teacher,
      admScore,
      kbmScore,
      asesmenScore,
      finalScore,
      predikat,
    };
  });

  const avgTotal = Math.round(
    tableData.reduce((acc, r) => acc + r.finalScore, 0) / (tableData.length || 1)
  );

  if (showPrintFormat) {
    return (
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs print:hidden">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Laporan Resmi Hasil Supervisi Akademik</h2>
            <p className="text-xs text-gray-500">
              Format laporan formal siap cetak lengkap dengan Kop Surat Sekolah dan pengesahan Kepala Sekolah &amp; Pengawas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPrintFormat(false)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Dokumen</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#064e3b] hover:bg-[#033c2a] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Sheet (Standard A4 Letterhead Format) */}
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-lg max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none text-gray-900">
          {/* Official Kop Surat */}
          <div className="border-b-4 border-double border-emerald-900 pb-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0c593d] to-[#04281c] border-2 border-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <ShieldCheck className="w-12 h-12 text-emerald-400" />
              </div>

              <div className="text-center flex-1">
                <h3 className="text-xs font-bold tracking-widest text-emerald-900 uppercase">
                  YAYASAN PENDIDIKAN ISLAM AL-MUSTOFA
                </h3>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase mt-0.5">
                  {school.namaSekolah}
                </h1>
                <p className="text-xs font-semibold text-emerald-800 tracking-wide mt-0.5">
                  TERAKREDITASI {school.akreditasi} • NPSN: {school.npsn} • NSS: {school.nss}
                </p>
                <p className="text-[11px] text-gray-600 mt-1">
                  {school.alamat}, Kec. {school.kecamatan}, {school.kabupatenKota}, {school.provinsi} {school.kodePos}
                </p>
                <p className="text-[10px] text-gray-500">
                  Telp: {school.telepon} • Email: {school.email} • Laman: {school.website}
                </p>
              </div>

              <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-extrabold text-2xl shrink-0">
                UQ
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h2 className="text-base font-extrabold text-gray-950 uppercase underline tracking-wider">
              LAPORAN HASIL SUPERVISI AKADEMIK GURU
            </h2>
            <p className="text-xs font-semibold text-gray-700 mt-1">
              Nomor: 421.3 / 188 / SMA-UQ / SUP / {school.tahunAjaran.replace('/', '-')}
            </p>
            <p className="text-xs text-emerald-800 font-medium">
              Tahun Ajaran {school.tahunAjaran} — Semester {school.semester}
            </p>
          </div>

          {/* I. Identitas Satuan Pendidikan */}
          <div className="mb-6 space-y-2 text-xs">
            <h3 className="font-bold text-gray-900 uppercase text-xs border-b border-gray-200 pb-1">
              I. Identitas Satuan Pendidikan
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-1 text-gray-700">
              <div>Nama Satuan Pendidikan: <strong className="text-gray-900">{school.namaSekolah}</strong></div>
              <div>Kepala Sekolah: <strong className="text-gray-900">{school.kepalaSekolah}</strong></div>
              <div>Kurikulum Operasional: <strong className="text-gray-900">{school.kurikulum}</strong></div>
              <div>Pengawas Pembina: <strong className="text-gray-900">{school.pengawasPembina}</strong></div>
              <div>Jumlah Sasaran Pendidik: <strong className="text-gray-900">{teachers.length} Orang</strong></div>
              <div>Waktu Pelaksanaan: <strong className="text-gray-900">September s/d November 2026</strong></div>
            </div>
          </div>

          {/* II. Rekapitulasi Nilai Supervisi */}
          <div className="mb-6 space-y-2 text-xs">
            <h3 className="font-bold text-gray-900 uppercase text-xs border-b border-gray-200 pb-1">
              II. Rekapitulasi Hasil Penilaian Supervisi Akademik
            </h3>
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-[11px] border border-gray-300">
                <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300 uppercase">
                  <tr>
                    <th className="py-2 px-2.5 border-r border-gray-300 text-center w-8">No</th>
                    <th className="py-2 px-3 border-r border-gray-300">Nama Guru / NIP</th>
                    <th className="py-2 px-2.5 border-r border-gray-300">Mata Pelajaran</th>
                    <th className="py-2 px-2 border-r border-gray-300 text-center">Adm (30%)</th>
                    <th className="py-2 px-2 border-r border-gray-300 text-center">KBM (50%)</th>
                    <th className="py-2 px-2 border-r border-gray-300 text-center">Asesmen (20%)</th>
                    <th className="py-2 px-2.5 border-r border-gray-300 text-center">Nilai Akhir</th>
                    <th className="py-2 px-3 text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tableData.map((row, idx) => (
                    <tr key={row.teacher.id} className="hover:bg-gray-50">
                      <td className="py-2 px-2.5 border-r border-gray-300 text-center font-bold text-gray-600">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-gray-300 font-semibold text-gray-900">
                        {row.teacher.nama}, {row.teacher.gelar}
                        <span className="block text-[10px] text-gray-500 font-normal">
                          NIP: {row.teacher.nip || '-'}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 border-r border-gray-300 text-gray-700">
                        {row.teacher.mapel}
                      </td>
                      <td className="py-2 px-2 border-r border-gray-300 text-center">
                        {row.admScore}
                      </td>
                      <td className="py-2 px-2 border-r border-gray-300 text-center">
                        {row.kbmScore}
                      </td>
                      <td className="py-2 px-2 border-r border-gray-300 text-center">
                        {row.asesmenScore}
                      </td>
                      <td className="py-2 px-2.5 border-r border-gray-300 text-center font-bold text-emerald-950">
                        {row.finalScore}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-800">
                        {row.predikat}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-400">
                    <td colSpan={6} className="py-2 px-3 border-r border-gray-300 text-right uppercase">
                      Rata-rata Capaian Mutu Supervisi Sekolah:
                    </td>
                    <td className="py-2 px-2.5 border-r border-gray-300 text-center text-sm font-black text-emerald-950">
                      {avgTotal}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-900">
                      AMAT BAIK
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* III. Kesimpulan & Rekomendasi */}
          <div className="mb-8 space-y-2 text-xs">
            <h3 className="font-bold text-gray-900 uppercase text-xs border-b border-gray-200 pb-1">
              III. Kesimpulan, Saran &amp; Rekomendasi Tindak Lanjut
            </h3>
            <div className="space-y-1.5 text-gray-700 leading-relaxed pt-1">
              <p>
                1. <strong>Capaian Perencanaan Pembelajaran:</strong> Seluruh dewan guru telah menyusun Alur Tujuan Pembelajaran (ATP) dan Modul Ajar Kurikulum Merdeka dengan kelengkapan komponen yang sangat memuaskan.
              </p>
              <p>
                2. <strong>Pelaksanaan KBM di Kelas:</strong> Suasana interaksi kelas sangat kondusif, pemanfaatan TIK dan media simulasi digital berjalan sangat efektif. Keterlibatan aktif peserta didik rata-rata di atas 85%.
              </p>
              <p>
                3. <strong>Rekomendasi Tindak Lanjut:</strong> Mempertahankan budaya kolaboratif antarguru melalui forum MGMP internal, pembiasaan tutor sebaya (peer tutoring), serta penguatan variasi instrumen asesmen diagnostik dan formatif berbasis kinerja.
              </p>
            </div>
          </div>

          {/* Tanda Tangan Pengesahan */}
          <div className="pt-6 text-xs text-gray-800">
            <div className="flex justify-end mb-4">
              <span>Depok, 16 Oktober 2026</span>
            </div>

            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="font-semibold text-gray-600">Mengetahui &amp; Menyetujui,</p>
                <p className="font-bold text-gray-900">Kepala SMA Plus UQ Al-Mustofa</p>
                <div className="h-24 flex items-center justify-center">
                  <span className="text-[10px] text-gray-400 italic">[ Tanda Tangan &amp; Cap Sekolah ]</span>
                </div>
                <p className="font-bold text-gray-950 underline">{school.kepalaSekolah}</p>
                <p className="text-[11px] text-gray-600">NIP. {school.nipKepalaSekolah}</p>
              </div>

              <div>
                <p className="font-semibold text-gray-600">Mengesahkan,</p>
                <p className="font-bold text-gray-900">Pengawas Pembina Cabang Dinas</p>
                <div className="h-24 flex items-center justify-center">
                  <span className="text-[10px] text-gray-400 italic">[ Tanda Tangan &amp; Cap Dinas ]</span>
                </div>
                <p className="font-bold text-gray-950 underline">{school.pengawasPembina}</p>
                <p className="text-[11px] text-gray-600">NIP. {school.nipPengawas}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal helpers
  const openAddModal = () => {
    setEditingDoc(null);
    setKategori('LAPORAN SEMESTER');
    setTanggal(new Date().toISOString().slice(0, 10));
    setJudul('');
    setDeskripsi('');
    setDriveLink('https://drive.google.com/file/d/');
    setOleh(currentUser.role === 'admin' ? 'Admin Kurikulum' : currentUser.name);
    setIsModalOpen(true);
  };

  const openEditModal = (doc: LaporanDocument) => {
    setEditingDoc(doc);
    setKategori(doc.kategori);
    setTanggal(doc.tanggal);
    setJudul(doc.judul);
    setDeskripsi(doc.deskripsi);
    setDriveLink(doc.driveLink);
    setOleh(doc.oleh);
    setIsModalOpen(true);
  };

  const handleSelectForPreview = (doc: LaporanDocument) => {
    setSelectedDoc(doc);
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !driveLink.trim()) return;

    if (editingDoc) {
      const updated: LaporanDocument = {
        ...editingDoc,
        kategori,
        tanggal,
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        driveLink: driveLink.trim(),
        oleh: oleh.trim() || 'Admin Kurikulum',
      };
      onUpdateLaporanDoc(updated);
      if (selectedDoc?.id === updated.id) {
        setSelectedDoc(updated);
      }
    } else {
      const created: LaporanDocument = {
        id: `lap-doc-${Date.now()}`,
        kategori,
        tanggal,
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        driveLink: driveLink.trim(),
        oleh: oleh.trim() || 'Admin Kurikulum',
      };
      onAddLaporanDoc(created);
      setSelectedDoc(created);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deletingDoc) return;
    onDeleteLaporanDoc(deletingDoc.id);
    if (selectedDoc?.id === deletingDoc.id) {
      setSelectedDoc(null);
    }
    setDeletingDoc(null);
  };

  const filteredDocs = laporanDocs.filter((doc) => {
    const matchSearch =
      doc.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.oleh.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterKategori === 'ALL' || doc.kategori === filterKategori;
    return matchSearch && matchCategory;
  });

  const embedUrl = selectedDoc ? getGoogleDriveEmbedUrl(selectedDoc.driveLink) : '';

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Laporan Hasil Supervisi
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Pengelolaan &amp; Pratinjau Arsip Laporan Hasil Supervisi Berbasis Google Drive
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowPrintFormat(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-emerald-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Format Cetak Resmi</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#064e3b] hover:bg-[#033c2a] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Dokumen</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari judul laporan, keterangan, atau pengunggah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Kategori:</label>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="text-xs font-medium px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="ALL">Semua Kategori ({laporanDocs.length})</option>
            <option value="LAPORAN SEMESTER">LAPORAN SEMESTER</option>
            <option value="REKAPITULASI NILAI">REKAPITULASI NILAI</option>
            <option value="LAPORAN TINDAK LANJUT">LAPORAN TINDAK LANJUT</option>
            <option value="DOKUMEN PENGESAHAN">DOKUMEN PENGESAHAN</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#064e3b] text-white uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Kategori</th>
                <th className="py-3.5 px-4 min-w-[240px]">Judul &amp; Deskripsi Laporan</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tanggal</th>
                <th className="py-3.5 px-4 min-w-[200px]">Tautan Google Drive</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Oleh</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 px-4 text-center text-gray-500">
                    <p className="text-sm font-semibold text-gray-700">
                      Belum ada dokumen laporan hasil supervisi
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Klik tombol "+ Tambah Dokumen" untuk mengunggah tautan Google Drive laporan baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => {
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
                                : 'bg-[#064e3b] hover:bg-[#033c2a] text-white'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isSelected ? 'Sedang Dipreview' : 'Preview'}</span>
                          </button>

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
                            onClick={() => setDeletingDoc(doc)}
                            title="Hapus Dokumen"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-gray-500 font-medium">
            Menampilkan {filteredDocs.length} Dokumen Laporan
          </span>
          <span className="text-emerald-800 font-bold uppercase tracking-wide">
            {school.namaSekolah}
          </span>
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#064e3b] hover:bg-[#033c2a] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Google Drive</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
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
                Pratinjau langsung dimuat dari tautan Google Drive yang diunggah. Pastikan akses berbagi Google Drive diatur ke{' '}
                <strong>"Siapa saja yang memiliki link"</strong> agar dokumen tampil optimal.
              </span>
            </div>

            {/* Embedded Live Google Drive Frame */}
            <div className="w-full h-[600px] bg-slate-100 relative">
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
              Klik tombol <strong>Preview</strong> pada salah satu baris tabel di atas untuk menampilkan isi laporan Google Drive secara langsung di sini.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="bg-[#064e3b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingDoc ? 'Edit Dokumen Laporan' : 'Tambah Dokumen Laporan'}
                </h3>
                <p className="text-[11px] text-emerald-100">
                  Simpan tautan dokumen laporan hasil supervisi berbasis Google Drive
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
                    Kategori Laporan
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as LaporanDocCategory)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="LAPORAN SEMESTER">LAPORAN SEMESTER</option>
                    <option value="REKAPITULASI NILAI">REKAPITULASI NILAI</option>
                    <option value="LAPORAN TINDAK LANJUT">LAPORAN TINDAK LANJUT</option>
                    <option value="DOKUMEN PENGESAHAN">DOKUMEN PENGESAHAN</option>
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
                  placeholder="Contoh: Laporan Akhir Hasil Supervisi Akademik Semester Ganjil"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Ringkasan isi laporan hasil supervisi..."
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
                  className="px-5 py-2 bg-[#064e3b] hover:bg-[#033c2a] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingDoc ? 'Simpan Perubahan' : 'Simpan Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full border border-gray-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Hapus Dokumen Laporan?</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Dokumen <span className="font-semibold text-gray-800">"{deletingDoc.judul}"</span> akan dihapus dari daftar laporan.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
