import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Plus,
  ExternalLink,
  Trash2,
  X,
  FileText,
  Info,
  Eye,
  Pencil
} from 'lucide-react';
import {
  Teacher,
  TeacherDocumentCheck,
  GuruUploadedDoc,
  GuruAdminComponent,
  SchoolProfile,
  User
} from '../types/supervisi';

interface AdministrasiGuruViewProps {
  teachers: Teacher[];
  documents: TeacherDocumentCheck[];
  onUpdateDocument: (doc: TeacherDocumentCheck) => void;
  onAddDocument: (doc: TeacherDocumentCheck) => void;
  uploadedGuruDocs: GuruUploadedDoc[];
  onAddGuruDoc: (doc: GuruUploadedDoc) => void;
  onUpdateGuruDoc: (doc: GuruUploadedDoc) => void;
  onDeleteGuruDoc: (id: string) => void;
  school: SchoolProfile;
  currentUser: User;
}

const DEFAULT_DOC_LIST = [
  { nama: 'Kalender Pendidikan Sekolah', kategori: 'Perencanaan' as const },
  { nama: 'Program Tahunan (Prota)', kategori: 'Perencanaan' as const },
  { nama: 'Program Semester (Promes)', kategori: 'Perencanaan' as const },
  { nama: 'Analisis Capaian Pembelajaran (CP)', kategori: 'Perencanaan' as const },
  { nama: 'Alur Tujuan Pembelajaran (ATP)', kategori: 'Perencanaan' as const },
  { nama: 'Modul Ajar / RPP Berdiferensiasi', kategori: 'Perencanaan' as const },
  { nama: 'Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)', kategori: 'Penilaian' as const },
  { nama: 'Buku Jurnal Agenda Guru & Presensi', kategori: 'Pelaksanaan' as const },
  { nama: 'Kisi-kisi & Lembar Asesmen Formatif/Sumatif', kategori: 'Penilaian' as const },
  { nama: 'Buku Nilai & Analisis Hasil Evaluasi', kategori: 'Penilaian' as const },
  { nama: 'Program dan Pelaksanaan Remedial & Pengayaan', kategori: 'Penilaian' as const }
];

const KOMPONEN_LIST: Array<{ key: GuruAdminComponent; badgeLabel: string }> = [
  { key: 'Kalender Akademik', badgeLabel: 'Kalender Akademik' },
  { key: 'Program Tahunan', badgeLabel: 'Program Tahunan (Prota)' },
  { key: 'Program Semester', badgeLabel: 'Program Semester (Promes)' },
  { key: 'Capaian Pembelajaran', badgeLabel: 'Capaian Pembelajaran (CP)' },
  { key: 'Alur Tujuan Pembelajaran', badgeLabel: 'Alur Tujuan Pembelajaran (ATP)' },
  {
    key: 'Kriteria Ketuntasan Tujuan Pembelajaran',
    badgeLabel: 'Kriteria Ketuntasan Tujuan Pembelajaran (KKTP)',
  },
  { key: 'Asesmen Diagnostik', badgeLabel: 'Asesmen Diagnostik' },
  { key: 'Modul Ajar / RPP', badgeLabel: 'Modul Ajar / RPP' },
  { key: 'Bahan Ajar', badgeLabel: 'Bahan Ajar' },
  { key: 'Lembar Kerja Peserta Didik', badgeLabel: 'Lembar Kerja Peserta Didik (LKPD)' },
  { key: 'Jadwal Pelajaran', badgeLabel: 'Jadwal Pelajaran' },
  { key: 'Jurnal Mengajar', badgeLabel: 'Jurnal Mengajar' },
  { key: 'Perencanaan Asesmen', badgeLabel: 'Perencanaan Asesmen' },
  { key: 'Daftar Nilai/Hasil Asesmen', badgeLabel: 'Daftar Nilai/Hasil Asesmen' },
  { key: 'Absensi Murid', badgeLabel: 'Absensi Murid' },
];

const normalizeKomponen = (komponen: string): GuruAdminComponent => {
  if (komponen === 'Kriteria Ketuntasan') {
    return 'Kriteria Ketuntasan Tujuan Pembelajaran';
  }
  if (komponen === 'Jurnal Mengajar Guru') {
    return 'Jurnal Mengajar';
  }
  if (komponen === 'Daftar Hadir & Asesmen') {
    return 'Absensi Murid';
  }
  return komponen as GuruAdminComponent;
};

const getKomponenBadgeLabel = (doc: GuruUploadedDoc): string => {
  const normalized = normalizeKomponen(doc.komponen as string);
  const found = KOMPONEN_LIST.find((k) => k.key === normalized);
  return found?.badgeLabel || doc.komponenLabel;
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

export const AdministrasiGuruView: React.FC<AdministrasiGuruViewProps> = ({
  teachers,
  documents,
  onUpdateDocument,
  uploadedGuruDocs,
  onAddGuruDoc,
  onUpdateGuruDoc,
  onDeleteGuruDoc,
  school,
  currentUser,
}) => {
  // Kepala Sekolah checklist state (preserved)
  const [selectedGuruId, setSelectedGuruId] = useState<string>(teachers[0]?.id || '');

  const isGuru = currentUser.role === 'guru';
  const matchedTeacher = isGuru
    ? teachers.find(
        (t) =>
          t.id === currentUser.id ||
          (currentUser.nip && t.nip === currentUser.nip) ||
          (currentUser.email && t.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (t.username &&
            currentUser.email &&
            t.username.toLowerCase() === currentUser.email.toLowerCase())
      )
    : undefined;
  const activeGuruId = matchedTeacher?.id || currentUser.id;

  // Admin & Guru Google Drive view states
  const [filterGuruId, setFilterGuruId] = useState<string>(() =>
    isGuru ? activeGuruId : 'ALL'
  );
  const [filterKomponen, setFilterKomponen] = useState<string>('ALL');

  // Upload / Edit modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingGuruDoc, setEditingGuruDoc] = useState<GuruUploadedDoc | null>(null);
  const [uploadGuruId, setUploadGuruId] = useState<string>(
    currentUser.role === 'guru' ? currentUser.id : teachers[0]?.id || ''
  );
  const [uploadKomponen, setUploadKomponen] = useState<GuruAdminComponent>('Kalender Akademik');
  const [uploadJudul, setUploadJudul] = useState('');
  const [uploadDriveLink, setUploadDriveLink] = useState('https://drive.google.com/file/d/');
  const [uploadTahunAjaran, setUploadTahunAjaran] = useState(`TA ${school.tahunAjaran}`);

  // Verify / Feedback modal state
  const [verifyingDoc, setVerifyingDoc] = useState<GuruUploadedDoc | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<GuruUploadedDoc['statusVerifikasi']>(
    'Terverifikasi Sesuai'
  );
  const [verifyCatatan, setVerifyCatatan] = useState('');

  // Preview Drive modal state
  const [previewDoc, setPreviewDoc] = useState<GuruUploadedDoc | null>(null);

  // Delete confirmation modal state
  const [deletingDoc, setDeletingDoc] = useState<GuruUploadedDoc | null>(null);

  // Sync teacher filter when switching between Guru and Admin roles
  useEffect(() => {
    setFilterGuruId(isGuru ? activeGuruId : 'ALL');
    setFilterKomponen('ALL');
  }, [activeGuruId, isGuru]);

  // Sync default uploadTahunAjaran when active school academic year changes
  useEffect(() => {
    setUploadTahunAjaran(`TA ${school.tahunAjaran}`);
  }, [school.tahunAjaran]);

  // Preserve original checklist view for Kepala Sekolah
  if (currentUser.role === 'kepala_sekolah') {
    const currentTeacher = teachers.find((t) => t.id === selectedGuruId) || teachers[0];

    const teacherDocs = DEFAULT_DOC_LIST.map((item, idx) => {
      const existing = documents.find(
        (d) => d.guruId === selectedGuruId && d.namaDokumen === item.nama
      );
      if (existing) return existing;
      return {
        id: `doc-${selectedGuruId}-${idx}`,
        guruId: selectedGuruId,
        namaDokumen: item.nama,
        kategori: item.kategori,
        ada: true,
        kualitas: 4 as 1 | 2 | 3 | 4,
        catatan: 'Dokumen lengkap dan tersusun rapi.',
        tanggalPeriksa: '2026-09-25',
        pemeriksa: 'Drs. H. Ahmad Mustofa, M.Pd.'
      };
    });

    const handleToggleAda = (doc: TeacherDocumentCheck) => {
      onUpdateDocument({ ...doc, ada: !doc.ada });
    };

    const handleQualityChange = (doc: TeacherDocumentCheck, score: 1 | 2 | 3 | 4) => {
      onUpdateDocument({ ...doc, kualitas: score });
    };

    const handleNoteChange = (doc: TeacherDocumentCheck, catatan: string) => {
      onUpdateDocument({ ...doc, catatan });
    };

    const totalScore = teacherDocs.filter((d) => d.ada).reduce((acc, d) => acc + d.kualitas, 0);
    const maxScore = teacherDocs.length * 4;
    const percentage = Math.round((totalScore / maxScore) * 100);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pemeriksaan Administrasi Guru</h2>
            <p className="text-xs text-gray-500">
              Verifikasi fisik & digital berkas kelengkapan administrasi pembelajaran
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-700 whitespace-nowrap">Pilih Guru:</label>
            <select
              value={selectedGuruId}
              onChange={(e) => setSelectedGuruId(e.target.value)}
              className="text-xs font-semibold p-2 border border-emerald-300 bg-emerald-50/50 rounded-xl text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama}, {t.gelar} ({t.mapel})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                Lembar Verifikasi Administrasi
              </span>
              <span className="text-xs text-emerald-200">
                {currentTeacher?.mapel} • {currentTeacher?.statusKepegawaian}
              </span>
            </div>
            <h3 className="text-xl font-extrabold mt-1 text-white">
              {currentTeacher?.nama}, {currentTeacher?.gelar}
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              NIP: {currentTeacher?.nip || '-'} • NUPTK: {currentTeacher?.nuptk || '-'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-3.5 rounded-xl border border-white/10">
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-300">{percentage}%</div>
              <div className="text-[10px] text-emerald-100 uppercase tracking-wider">Ketercapaian</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-sm font-bold text-white">
                {percentage >= 91
                  ? 'Amat Baik'
                  : percentage >= 81
                  ? 'Baik'
                  : percentage >= 71
                  ? 'Cukup'
                  : 'Kurang'}
              </div>
              <div className="text-[10px] text-emerald-200">
                {totalScore} / {maxScore} Poin
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-700 uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Dokumen Pembelajaran</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-center">Status Ada</th>
                  <th className="py-3 px-4 text-center">Kualitas Skor (1-4)</th>
                  <th className="py-3 px-4">Catatan Verifikator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teacherDocs.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{doc.namaDokumen}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {doc.kategori}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleAda(doc)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          doc.ada
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {doc.ada ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Ada</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Belum Ada</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {doc.ada ? (
                        <div className="inline-flex items-center gap-1">
                          {([1, 2, 3, 4] as const).map((score) => (
                            <button
                              key={score}
                              onClick={() => handleQualityChange(doc, score)}
                              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                doc.kualitas === score
                                  ? 'bg-emerald-700 text-white shadow-xs'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={doc.catatan}
                        onChange={(e) => handleNoteChange(doc, e.target.value)}
                        placeholder="Tambahkan catatan verifikasi..."
                        className="w-full text-xs p-1.5 border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Admin & Guru Google Drive Administrasi Guru View (matches 0.8_3989c117.jpg)
  const docsFilteredByTeacher = isGuru
    ? uploadedGuruDocs.filter(
        (d) => d.guruId === activeGuruId || d.guruId === currentUser.id
      )
    : uploadedGuruDocs.filter((d) =>
        filterGuruId === 'ALL' ? true : d.guruId === filterGuruId
      );

  const filteredDocs = docsFilteredByTeacher.filter((d) =>
    filterKomponen === 'ALL'
      ? true
      : normalizeKomponen(d.komponen as string) === filterKomponen
  );

  const openUploadModal = () => {
    setEditingGuruDoc(null);
    setUploadGuruId(
      isGuru ? activeGuruId : filterGuruId !== 'ALL' ? filterGuruId : teachers[0]?.id || ''
    );
    setUploadKomponen(
      filterKomponen !== 'ALL' ? (filterKomponen as GuruAdminComponent) : 'Kalender Akademik'
    );
    setUploadJudul('');
    setUploadDriveLink('https://drive.google.com/file/d/');
    setUploadTahunAjaran(`TA ${school.tahunAjaran}`);
    setIsUploadModalOpen(true);
  };

  const openEditModal = (doc: GuruUploadedDoc) => {
    setEditingGuruDoc(doc);
    setUploadGuruId(doc.guruId);
    setUploadTahunAjaran(doc.tahunAjaran || `TA ${school.tahunAjaran}`);
    setUploadKomponen(normalizeKomponen(doc.komponen as string));
    setUploadJudul(doc.judulBerkas);
    setUploadDriveLink(doc.driveLink);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadJudul.trim() || !uploadDriveLink.trim()) return;

    const matchedTeacher = teachers.find((t) => t.id === uploadGuruId);
    const guruNama = matchedTeacher
      ? `${matchedTeacher.nama}, ${matchedTeacher.gelar}`
      : currentUser.name;
    const komponenInfo = KOMPONEN_LIST.find((k) => k.key === uploadKomponen);

    if (editingGuruDoc) {
      const updatedDoc: GuruUploadedDoc = {
        ...editingGuruDoc,
        guruId: uploadGuruId || editingGuruDoc.guruId,
        guruNama,
        tahunAjaran: uploadTahunAjaran.trim() || `TA ${school.tahunAjaran}`,
        komponen: uploadKomponen,
        komponenLabel: komponenInfo?.badgeLabel || uploadKomponen,
        judulBerkas: uploadJudul.trim(),
        driveLink: uploadDriveLink.trim(),
      };
      onUpdateGuruDoc(updatedDoc);
    } else {
      const newDoc: GuruUploadedDoc = {
        id: `gdoc-${Date.now()}`,
        guruId: uploadGuruId || currentUser.id,
        guruNama,
        tahunAjaran: uploadTahunAjaran.trim() || `TA ${school.tahunAjaran}`,
        komponen: uploadKomponen,
        komponenLabel: komponenInfo?.badgeLabel || uploadKomponen,
        judulBerkas: uploadJudul.trim(),
        tanggalUnggah: new Date().toISOString().slice(0, 10),
        driveLink: uploadDriveLink.trim(),
        statusVerifikasi: 'Menunggu Verifikasi',
        catatanUmpanBalik: 'Menunggu pemeriksaan admin / supervisor.',
      };

      onAddGuruDoc(newDoc);
    }

    setEditingGuruDoc(null);
    setIsUploadModalOpen(false);
  };

  const openVerifyModal = (doc: GuruUploadedDoc) => {
    setVerifyingDoc(doc);
    setVerifyStatus(
      doc.statusVerifikasi === 'Menunggu Verifikasi'
        ? 'Terverifikasi Sesuai'
        : doc.statusVerifikasi
    );
    setVerifyCatatan(
      doc.statusVerifikasi === 'Menunggu Verifikasi'
        ? 'Berkas administrasi lengkap dan sesuai standar Kurikulum Merdeka.'
        : doc.catatanUmpanBalik
    );
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingDoc) return;

    onUpdateGuruDoc({
      ...verifyingDoc,
      statusVerifikasi: verifyStatus,
      catatanUmpanBalik: verifyCatatan.trim() || 'Telah diverifikasi.',
      verifikator:
        currentUser.role === 'admin' ? school.kepalaSekolah : currentUser.name,
      tanggalVerifikasi: new Date().toISOString().slice(0, 10),
    });

    setVerifyingDoc(null);
  };

  const handleDelete = (doc: GuruUploadedDoc) => {
    setDeletingDoc(doc);
  };

  const confirmDelete = () => {
    if (deletingDoc) {
      onDeleteGuruDoc(deletingDoc.id);
      setDeletingDoc(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Administrasi Guru
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Pengelolaan Kalender Akademik, Prota, Promes, CP, ATP, KKTP, Asesmen Diagnostik, Modul Ajar, Bahan Ajar, LKPD, Jadwal Pelajaran, Jurnal Mengajar, Perencanaan &amp; Daftar Nilai Asesmen, serta Absensi Murid terintegrasi Google Drive.
          </p>
        </div>

        <button
          type="button"
          onClick={openUploadModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#064e3b] hover:bg-[#033c2a] active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Unggah Dokumen Guru</span>
        </button>
      </div>

      {/* Filter Bar Card */}
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
          isGuru ? 'justify-start' : 'justify-between'
        }`}
      >
        {!isGuru && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
              Filter Guru:
            </label>
            <select
              value={filterGuruId}
              onChange={(e) => setFilterGuruId(e.target.value)}
              className="text-xs font-medium px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 min-w-[200px]"
            >
              <option value="ALL">Semua Guru ({teachers.length})</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama}, {t.gelar}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
            Komponen:
          </label>
          <select
            value={filterKomponen}
            onChange={(e) => setFilterKomponen(e.target.value)}
            className="text-xs font-medium px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 min-w-[220px]"
          >
            <option value="ALL">
              Semua Komponen ({docsFilteredByTeacher.length} Dokumen)
            </option>
            {KOMPONEN_LIST.map((k) => (
              <option key={k.key} value={k.key}>
                {k.key}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 15 Component Summary Grid (3 rows x 5 columns on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {KOMPONEN_LIST.map((item) => {
          const count = docsFilteredByTeacher.filter(
            (d) => normalizeKomponen(d.komponen as string) === item.key
          ).length;
          const isSelected = filterKomponen === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                setFilterKomponen(isSelected ? 'ALL' : item.key)
              }
              className={`text-left bg-white rounded-xl border p-3.5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                  : 'border-gray-100 hover:border-emerald-300'
              }`}
            >
              <span className="text-xs font-bold text-gray-800 leading-tight line-clamp-1">
                {item.key}
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-400">Tersedia:</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    count > 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count} file
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Documents Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#064e3b] text-white uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">NO</th>
                <th className="py-3.5 px-4 min-w-[160px]">GURU PENDIDIK</th>
                <th className="py-3.5 px-4 min-w-[170px]">KOMPONEN ADMINISTRASI</th>
                <th className="py-3.5 px-4 min-w-[210px]">JUDUL BERKAS & TANGGAL UNGGAH</th>
                <th className="py-3.5 px-4 whitespace-nowrap">TAUTAN GOOGLE DRIVE</th>
                <th className="py-3.5 px-4 whitespace-nowrap">STATUS VERIFIKASI</th>
                <th className="py-3.5 px-4 min-w-[200px]">CATATAN / UMPAN BALIK</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 px-4 text-center text-gray-500">
                    <p className="text-sm font-semibold text-gray-700">
                      Belum ada dokumen yang diunggah
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Klik tombol "+ Unggah Dokumen Guru" untuk menambahkan tautan Google Drive baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-4 text-center font-semibold text-gray-500 align-middle">
                      {idx + 1}
                    </td>

                    <td className="py-4 px-4 align-middle">
                      <div className="font-bold text-gray-900 leading-snug">{doc.guruNama}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{doc.tahunAjaran}</div>
                    </td>

                    <td className="py-4 px-4 align-middle">
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-semibold leading-tight">
                        {getKomponenBadgeLabel(doc)}
                      </span>
                    </td>

                    <td className="py-4 px-4 align-middle">
                      <div className="font-bold text-gray-900 leading-snug">{doc.judulBerkas}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Diunggah: {doc.tanggalUnggah}
                      </div>
                    </td>

                    <td className="py-4 px-4 align-middle whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Buka Drive</span>
                      </button>
                    </td>

                    <td className="py-4 px-4 align-middle">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold leading-tight ${
                          doc.statusVerifikasi === 'Terverifikasi Sesuai'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : doc.statusVerifikasi === 'Perlu Revisi'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {doc.statusVerifikasi}
                      </span>
                    </td>

                    <td className="py-4 px-4 align-middle">
                      <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                        {doc.catatanUmpanBalik}
                      </p>
                      {doc.verifikator && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          Oleh: {doc.verifikator} ({doc.tanggalVerifikasi})
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4 align-middle text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        {isGuru && (
                          <>
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              title="Preview Dokumen"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(doc)}
                              title="Edit Dokumen"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {currentUser.role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => openVerifyModal(doc)}
                            title="Verifikasi & Beri Umpan Balik"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
                          title="Hapus Dokumen"
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-gray-500 font-medium">
            Menampilkan {filteredDocs.length} Dokumen
          </span>
          <span className="text-emerald-800 font-bold uppercase tracking-wide">
            {school.namaSekolah}
          </span>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="bg-[#064e3b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingGuruDoc
                    ? 'Edit Dokumen Administrasi Guru'
                    : 'Unggah Dokumen Administrasi Guru'}
                </h3>
                <p className="text-[11px] text-emerald-100">
                  Simpan tautan berkas Google Drive agar dapat ditinjau oleh Admin & Supervisor
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingGuruDoc(null);
                  setIsUploadModalOpen(false);
                }}
                className="p-1 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Guru Pendidik</label>
                  <select
                    value={uploadGuruId}
                    disabled={currentUser.role === 'guru'}
                    onChange={(e) => setUploadGuruId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-white disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nama}, {t.gelar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={uploadTahunAjaran}
                    onChange={(e) => setUploadTahunAjaran(e.target.value)}
                    placeholder="TA 2026/2027"
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Komponen Administrasi
                </label>
                <select
                  value={uploadKomponen}
                  onChange={(e) => setUploadKomponen(e.target.value as GuruAdminComponent)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {KOMPONEN_LIST.map((k) => (
                    <option key={k.key} value={k.key}>
                      {k.badgeLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Judul Berkas *</label>
                <input
                  type="text"
                  required
                  value={uploadJudul}
                  onChange={(e) => setUploadJudul(e.target.value)}
                  placeholder="Contoh: Program Tahunan Fisika Fase F"
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
                  value={uploadDriveLink}
                  onChange={(e) => setUploadDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full p-2.5 border border-gray-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGuruDoc(null);
                    setIsUploadModalOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064e3b] hover:bg-[#033c2a] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingGuruDoc ? 'Simpan Perubahan' : 'Simpan & Unggah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify & Feedback Modal */}
      {verifyingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 overflow-hidden">
            <div className="bg-[#064e3b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Verifikasi Dokumen Guru</h3>
                <p className="text-[11px] text-emerald-100 truncate max-w-[300px]">
                  {verifyingDoc.judulBerkas}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVerifyingDoc(null)}
                className="p-1 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status Verifikasi</label>
                <select
                  value={verifyStatus}
                  onChange={(e) =>
                    setVerifyStatus(e.target.value as GuruUploadedDoc['statusVerifikasi'])
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Terverifikasi Sesuai">Terverifikasi Sesuai</option>
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Perlu Revisi">Perlu Revisi</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Catatan / Umpan Balik Verifikator
                </label>
                <textarea
                  rows={3}
                  value={verifyCatatan}
                  onChange={(e) => setVerifyCatatan(e.target.value)}
                  placeholder="Tuliskan catatan pemeriksaan atau saran perbaikan..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setVerifyingDoc(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064e3b] hover:bg-[#033c2a] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Google Drive Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#064e3b] text-white flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-emerald-200">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{previewDoc.komponenLabel}</span>
                  <span>•</span>
                  <span>{previewDoc.guruNama}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold truncate mt-0.5">
                  {previewDoc.judulBerkas}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewDoc.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-900 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Drive</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-[11px] text-emerald-900">
              <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                Pratinjau langsung berkas Google Drive guru. Pastikan akses file diatur ke{' '}
                <strong>"Siapa saja yang memiliki link"</strong> atau klik tombol <strong>Buka di Drive</strong>.
              </span>
            </div>

            <div className="flex-1 bg-slate-100">
              <iframe
                key={`${previewDoc.id}-${previewDoc.driveLink}`}
                src={getGoogleDriveEmbedUrl(previewDoc.driveLink)}
                title={`Preview ${previewDoc.judulBerkas}`}
                className="w-full h-full border-0"
                allow="autoplay"
              />
            </div>
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
                <h3 className="text-sm font-bold text-gray-900">Hapus Dokumen Guru?</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Berkas <span className="font-semibold text-gray-800">"{deletingDoc.judulBerkas}"</span> milik{' '}
                  <span className="font-semibold text-gray-800">{deletingDoc.guruNama}</span> akan dihapus dari daftar.
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
