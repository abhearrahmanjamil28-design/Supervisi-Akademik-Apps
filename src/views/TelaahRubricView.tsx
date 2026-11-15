import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  CheckCircle2,
  Printer,
  Sparkles,
  Save,
  Plus,
  Upload,
  Download,
  FileSpreadsheet,
  ChevronDown,
  Eye,
  ExternalLink,
  Trash2,
  Pencil,
  X,
  FileText,
  Info,
  Search,
  RotateCcw,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import {
  Teacher,
  SchoolProfile,
  GuruUploadedDoc,
  GuruAdminComponent,
  User,
} from '../types/supervisi';

interface TelaahRubricViewProps {
  type: 'telaah_adm' | 'telaah_atp' | 'telaah_modul' | 'supervisi_asesmen';
  teachers: Teacher[];
  school: SchoolProfile;
  currentUser?: User;
  uploadedGuruDocs?: GuruUploadedDoc[];
  onOpenAiAssistant?: () => void;
}

interface RubricTemplateItem {
  id: string;
  aspek: string;
  indikator: string;
}

interface StoredEvaluation {
  scores: Record<string, number>;
  notes: Record<string, string>;
  generalFeedback: string;
  updatedAt?: string;
}

const DEFAULT_FEEDBACK =
  'Secara umum dokumen tersusun dengan sangat baik, memenuhi kaidah Kurikulum Merdeka dan berpusat pada murid.';

const RUBRIC_CONFIG: Record<
  TelaahRubricViewProps['type'],
  { title: string; printTitle: string; subtitle: string; items: RubricTemplateItem[] }
> = {
  telaah_adm: {
    title: 'Instrumen Telaah Administrasi Pembelajaran',
    printTitle: 'HASIL PENILAIAN TELAAH ADMINISTRASI PEMBELAJARAN',
    subtitle: 'Evaluasi kelengkapan berkas program tahunan, semester, dan perencanaan KBM',
    items: [
      { id: '1', aspek: 'Kalender Pendidikan', indikator: 'Kesesuaian alokasi waktu dengan kalender pendidikan dinas dan yayasan' },
      { id: '2', aspek: 'Program Tahunan (Prota)', indikator: 'Kelengkapan alokasi waktu per Capaian Pembelajaran secara proporsional' },
      { id: '3', aspek: 'Program Semester (Promes)', indikator: 'Distribusi materi pokok, jadwal asesmen, dan cadangan waktu per pekan' },
      { id: '4', aspek: 'Capaian Pembelajaran (CP)', indikator: 'Pemetaan elemen, capaian fase, dan kompetensi prasyarat' },
      { id: '5', aspek: 'Tujuan Pembelajaran (TP)', indikator: 'Penggunaan kata kerja operasional (KKO) yang terukur dan aplikatif' },
      { id: '6', aspek: 'Alur Tujuan Pembelajaran (ATP)', indikator: 'Keruntutan alur logis dari konsep konkret menuju pemecahan masalah' },
      { id: '7', aspek: 'Modul Ajar / RPP Plus', indikator: 'Keberadaan modul ajar lengkap dengan pemantik, LKPD, dan asesmen' },
      { id: '8', aspek: 'KKTP / Kriteria Ketercapaian', indikator: 'Deskripsi kriteria ketuntasan berbasis rubrik interval yang jelas' },
      { id: '9', aspek: 'Jurnal Agenda Mengajar', indikator: 'Tertib administrasi catatan kegiatan harian KBM dan absensi siswa' },
      { id: '10', aspek: 'Remedial & Pengayaan', indikator: 'Rencana terstruktur bimbingan belajar tuntas dan pengayaan materi' },
    ],
  },
  telaah_atp: {
    title: 'Instrumen Telaah Alur Tujuan Pembelajaran (ATP)',
    printTitle: 'HASIL PENILAIAN TELAAH ALUR TUJUAN PEMBELAJARAN (ATP)',
    subtitle: 'Telaah struktur dan kedalaman alur tujuan pembelajaran Kurikulum Merdeka',
    items: [
      { id: '1', aspek: 'Kesesuaian CP', indikator: 'Menjabarkan seluruh elemen Capaian Pembelajaran sesuai Fase' },
      { id: '2', aspek: 'Kejelasan Kompetensi', indikator: 'Kompetensi dirumuskan spesifik, jelas, dan dapat dievaluasi secara autentik' },
      { id: '3', aspek: 'Lingkup Materi', indikator: 'Cakupan materi esensial relevan dengan perkembangan kognitif murid' },
      { id: '4', aspek: 'Alur Progresi', indikator: 'Alur pembelajaran tersusun kronologis, hierarkis, dan bertahap' },
      { id: '5', aspek: 'Profil Pelajar Pancasila', indikator: 'Integrasi dimensi karakter bernalar kritis, mandiri, dan berakhlak mulia' },
      { id: '6', aspek: 'Alokasi Waktu', indikator: 'Penetapan JP realistis sesuai tingkat kesulitan materi' },
      { id: '7', aspek: 'Fleksibilitas', indikator: 'Memberikan ruang adaptasi sesuai konteks dan karakteristik satuan pendidikan' },
      { id: '8', aspek: 'Panduan Asesmen', indikator: 'Memuat rekomendasi bentuk asesmen untuk setiap tujuan pembelajaran' },
    ],
  },
  telaah_modul: {
    title: 'Instrumen Telaah Modul Ajar Berdiferensiasi',
    printTitle: 'HASIL PENILAIAN TELAAH MODUL AJAR BERDIFERENSIASI',
    subtitle: 'Evaluasi komponen inti, strategi pembelajaran berdiferensiasi, dan LKPD',
    items: [
      { id: '1', aspek: 'Identitas Modul', indikator: 'Kelengkapan informasi umum, fase, kelas, alokasi waktu, dan moda' },
      { id: '2', aspek: 'Kompetensi Awal', indikator: 'Identifikasi pengetahuan prasyarat atau asesmen awal diagnostik murid' },
      { id: '3', aspek: 'Profil Pelajar Pancasila', indikator: 'Dimensi karakter tercermin dalam skenario aktivitas peserta didik' },
      { id: '4', aspek: 'Sarana & Prasarana', indikator: 'Ketersediaan media pembelajaran, TIK, simulasi, dan bahan bacaan' },
      { id: '5', aspek: 'Target Peserta Didik', indikator: 'Kesesuaian modul untuk murid reguler, kesulitan belajar, atau pencapaian tinggi' },
      { id: '6', aspek: 'Model Pembelajaran', indikator: 'Penerapan model inovatif (PBL, PJBL, Inquiry, Problem Solving)' },
      { id: '7', aspek: 'Tujuan Pembelajaran', indikator: 'Tujuan terukur dan selaras dengan indikator keberhasilan' },
      { id: '8', aspek: 'Pertanyaan Pemantik', indikator: 'Pertanyaan menstimulasi nalar kritis dan rasa ingin tahu murid' },
      { id: '9', aspek: 'Diferensiasi Proses & Konten', indikator: 'Aktivitas terbagi berjenjang sesuai gaya belajar dan kesiapan murid' },
      { id: '10', aspek: 'LKPD Siswa', indikator: 'Lembar kerja terstruktur, instruksi lugas, dan menantang kreasi murid' },
      { id: '11', aspek: 'Asesmen Formatif & Rubrik', indikator: 'Instrumen asesmen proses dilengkapi rubrik pedoman penskoran' },
      { id: '12', aspek: 'Refleksi Guru & Murid', indikator: 'Tersedia panduan refleksi diri di akhir pertemuan' },
    ],
  },
  supervisi_asesmen: {
    title: 'Instrumen Supervisi Asesmen Pembelajaran',
    printTitle: 'HASIL PENILAIAN SUPERVISI ASESMEN PEMBELAJARAN',
    subtitle: 'Penilaian mutu asesmen diagnostik, formatif, sumatif, dan tindak lanjut',
    items: [
      { id: '1', aspek: 'Asesmen Diagnostik Awal', indikator: 'Melakukan pemetaan awal non-kognitif maupun kognitif prasyarat' },
      { id: '2', aspek: 'Kisi-kisi Instrumen', indikator: 'Kisi-kisi memuat CP, TP, materi pokok, level kognitif (C1-C6), dan bentuk soal' },
      { id: '3', aspek: 'Variasi Bentuk Asesmen', indikator: 'Memadukan tes tertulis, unjuk kerja praktik, produk, atau portofolio' },
      { id: '4', aspek: 'Kualitas Soal HOTS', indikator: 'Menyajikan stimulus kontekstual yang menguji nalar kritis murid' },
      { id: '5', aspek: 'Rubrik Penskoran', indikator: 'Pedoman penilaian memiliki deskriptor performa yang jelas dan terukur' },
      { id: '6', aspek: 'Umpan Balik Kualitatif', indikator: 'Catatan feedback diberikan secara personal untuk kemajuan murid' },
      { id: '7', aspek: 'Analisis Butir & Ketuntasan', indikator: 'Tersedia rekapitulasi analisis hasil belajar dan pemetaan remedial' },
      { id: '8', aspek: 'Tindak Lanjut Remedial/Pengayaan', indikator: 'Pelaksanaan bimbingan bagi murid belum tuntas dan pengayaan materi' },
    ],
  },
};

const TAB_STORAGE_CONFIG: Partial<
  Record<
    TelaahRubricViewProps['type'],
    {
      componentsKey: string;
      evaluationsKey: string;
      noun: string;
      templateFilename: string;
      exportPrefix: string;
      componentsFilename: string;
      sheetHeader: string;
      sheetTabName: string;
      sampleRows: Array<{
        No: number;
        'Komponen / Aspek': string;
        'Deskriptor Indikator Mutu': string;
        'Skor (1-4)': number;
        'Catatan Khusus': string;
      }>;
    }
  >
> = {
  telaah_adm: {
    componentsKey: 'super_guru_telaah_adm_components',
    evaluationsKey: 'super_guru_telaah_adm_evaluations',
    noun: 'Komponen',
    templateFilename: 'Template_Komponen_Telaah_Adm_Pembelajaran.xlsx',
    exportPrefix: 'Telaah_Adm_Pembelajaran',
    componentsFilename: 'Daftar_Komponen_Telaah_Adm_Pembelajaran.xlsx',
    sheetHeader: 'INSTRUMEN TELAAH ADMINISTRASI PEMBELAJARAN',
    sheetTabName: 'Hasil Telaah Adm',
    sampleRows: [
      {
        No: 1,
        'Komponen / Aspek': 'Kalender Akademik & Pekan Efektif',
        'Deskriptor Indikator Mutu':
          'Kesesuaian alokasi waktu KBM dengan kalender akademik sekolah dan hari efektif belajar',
        'Skor (1-4)': 4,
        'Catatan Khusus': 'Sudah sesuai kalender satuan pendidikan',
      },
      {
        No: 2,
        'Komponen / Aspek': 'Asesmen Diagnostik Awal',
        'Deskriptor Indikator Mutu':
          'Ketersediaan instrumen pemetaan kesiapan belajar kognitif maupun non-kognitif peserta didik',
        'Skor (1-4)': 3,
        'Catatan Khusus': 'Perlu dilengkapi tindak lanjut pemetaan',
      },
      {
        No: 3,
        'Komponen / Aspek': 'Bahan Ajar & Media Pembelajaran',
        'Deskriptor Indikator Mutu':
          'Ketersediaan bahan bacaan, slide, atau media ajar kontekstual yang mendukung diferensiasi',
        'Skor (1-4)': 4,
        'Catatan Khusus': '',
      },
    ],
  },
  telaah_atp: {
    componentsKey: 'super_guru_telaah_atp_components',
    evaluationsKey: 'super_guru_telaah_atp_evaluations',
    noun: 'Komponen / Aspek',
    templateFilename: 'Template_Komponen_Aspek_Telaah_ATP.xlsx',
    exportPrefix: 'Telaah_ATP',
    componentsFilename: 'Daftar_Komponen_Aspek_Telaah_ATP.xlsx',
    sheetHeader: 'INSTRUMEN TELAAH ALUR TUJUAN PEMBELAJARAN (ATP)',
    sheetTabName: 'Hasil Telaah ATP',
    sampleRows: [
      {
        No: 1,
        'Komponen / Aspek': 'Kesesuaian Elemen CP & Fase',
        'Deskriptor Indikator Mutu':
          'Rumusan ATP menurunkan seluruh elemen Capaian Pembelajaran sesuai fase belajar secara utuh',
        'Skor (1-4)': 4,
        'Catatan Khusus': 'Pemetaan CP ke TP sudah runtut',
      },
      {
        No: 2,
        'Komponen / Aspek': 'Kompetensi & Konten Esensial',
        'Deskriptor Indikator Mutu':
          'Tujuan pembelajaran memuat kata kerja operasional terukur dan lingkup materi esensial',
        'Skor (1-4)': 3,
        'Catatan Khusus': 'Perjelas KKO pada TP semester genap',
      },
      {
        No: 3,
        'Komponen / Aspek': 'Alur Progresi & Alokasi JP',
        'Deskriptor Indikator Mutu':
          'Urutan materi berjenjang dari konkret ke abstrak dengan alokasi JP yang realistis',
        'Skor (1-4)': 4,
        'Catatan Khusus': '',
      },
    ],
  },
  telaah_modul: {
    componentsKey: 'super_guru_telaah_modul_components',
    evaluationsKey: 'super_guru_telaah_modul_evaluations',
    noun: 'Komponen / Aspek',
    templateFilename: 'Template_Komponen_Aspek_Telaah_Modul_Ajar.xlsx',
    exportPrefix: 'Telaah_Modul_Ajar',
    componentsFilename: 'Daftar_Komponen_Aspek_Telaah_Modul_Ajar.xlsx',
    sheetHeader: 'INSTRUMEN TELAAH MODUL AJAR BERDIFERENSIASI',
    sheetTabName: 'Hasil Telaah Modul',
    sampleRows: [
      {
        No: 1,
        'Komponen / Aspek': 'Identitas & Kompetensi Awal Modul',
        'Deskriptor Indikator Mutu':
          'Kelengkapan informasi umum modul ajar, fase/kelas, alokasi waktu, dan pemetaan kompetensi awal murid',
        'Skor (1-4)': 4,
        'Catatan Khusus': 'Identitas dan prasyarat modul lengkap',
      },
      {
        No: 2,
        'Komponen / Aspek': 'Skenario Pembelajaran Berdiferensiasi',
        'Deskriptor Indikator Mutu':
          'Rangkaian aktivitas KBM mengakomodasi diferensiasi konten, proses, maupun produk sesuai kesiapan murid',
        'Skor (1-4)': 3,
        'Catatan Khusus': 'Tambahkan variasi aktivitas untuk kelompok butuh bimbingan',
      },
      {
        No: 3,
        'Komponen / Aspek': 'LKPD, Asesmen Formatif & Refleksi',
        'Deskriptor Indikator Mutu':
          'Ketersediaan LKPD terstruktur, rubrik asesmen formatif, dan panduan refleksi guru serta murid',
        'Skor (1-4)': 4,
        'Catatan Khusus': '',
      },
    ],
  },
  supervisi_asesmen: {
    componentsKey: 'super_guru_supervisi_asesmen_components',
    evaluationsKey: 'super_guru_supervisi_asesmen_evaluations',
    noun: 'Komponen / Aspek',
    templateFilename: 'Template_Komponen_Aspek_Supervisi_Asesmen.xlsx',
    exportPrefix: 'Supervisi_Asesmen',
    componentsFilename: 'Daftar_Komponen_Aspek_Supervisi_Asesmen.xlsx',
    sheetHeader: 'INSTRUMEN SUPERVISI ASESMEN PEMBELAJARAN',
    sheetTabName: 'Hasil Supervisi Asesmen',
    sampleRows: [
      {
        No: 1,
        'Komponen / Aspek': 'Perencanaan & Kisi-Kisi Asesmen',
        'Deskriptor Indikator Mutu':
          'Menyusun perencanaan asesmen dan kisi-kisi lengkap memuat CP, TP, materi pokok, level kognitif, dan bentuk soal',
        'Skor (1-4)': 4,
        'Catatan Khusus': 'Kisi-kisi lengkap dan selaras dengan TP',
      },
      {
        No: 2,
        'Komponen / Aspek': 'Instrumen HOTS & Variasi Asesmen',
        'Deskriptor Indikator Mutu':
          'Menyajikan stimulus kontekstual bernalar kritis dengan variasi tes tertulis, praktik, produk, atau portofolio',
        'Skor (1-4)': 3,
        'Catatan Khusus': 'Tambahkan variasi rubrik proyek',
      },
      {
        No: 3,
        'Komponen / Aspek': 'Rubrik Penskoran & Tindak Lanjut',
        'Deskriptor Indikator Mutu':
          'Tersedia pedoman penskoran deskriptor jelas serta rencana tindak lanjut remedial dan pengayaan',
        'Skor (1-4)': 4,
        'Catatan Khusus': '',
      },
    ],
  },
};

const KOMPONEN_BADGE_MAP: Record<string, string> = {
  'Kalender Akademik': 'Kalender Akademik',
  'Program Tahunan': 'Program Tahunan (Prota)',
  'Program Semester': 'Program Semester (Promes)',
  'Capaian Pembelajaran': 'Capaian Pembelajaran (CP)',
  'Alur Tujuan Pembelajaran': 'Alur Tujuan Pembelajaran (ATP)',
  'Kriteria Ketuntasan': 'Kriteria Ketuntasan Tujuan Pembelajaran (KKTP)',
  'Kriteria Ketuntasan Tujuan Pembelajaran': 'Kriteria Ketuntasan Tujuan Pembelajaran (KKTP)',
  'Asesmen Diagnostik': 'Asesmen Diagnostik',
  'Modul Ajar / RPP': 'Modul Ajar / RPP',
  'Bahan Ajar': 'Bahan Ajar',
  'Lembar Kerja Peserta Didik': 'Lembar Kerja Peserta Didik (LKPD)',
  'Jadwal Pelajaran': 'Jadwal Pelajaran',
  'Jurnal Mengajar': 'Jurnal Mengajar',
  'Jurnal Mengajar Guru': 'Jurnal Mengajar',
  'Perencanaan Asesmen': 'Perencanaan Asesmen',
  'Daftar Nilai/Hasil Asesmen': 'Daftar Nilai/Hasil Asesmen',
  'Daftar Hadir & Asesmen': 'Absensi Murid',
  'Absensi Murid': 'Absensi Murid',
};

const normalizeKomponenKey = (komponen: string): GuruAdminComponent => {
  if (komponen === 'Kriteria Ketuntasan') return 'Kriteria Ketuntasan Tujuan Pembelajaran';
  if (komponen === 'Jurnal Mengajar Guru') return 'Jurnal Mengajar';
  if (komponen === 'Daftar Hadir & Asesmen') return 'Absensi Murid';
  return komponen as GuruAdminComponent;
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

export const TelaahRubricView: React.FC<TelaahRubricViewProps> = ({
  type,
  teachers,
  school,
  uploadedGuruDocs = [],
  onOpenAiAssistant,
}) => {
  const config = RUBRIC_CONFIG[type];
  const storageCfg = TAB_STORAGE_CONFIG[type];
  const supportsCustomTools = Boolean(storageCfg);
  const isTelaahAdm = type === 'telaah_adm';
  const isTelaahAtp = type === 'telaah_atp';
  const isTelaahModul = type === 'telaah_modul';
  const isSupervisiAsesmen = type === 'supervisi_asesmen';

  const [selectedGuruId, setSelectedGuruId] = useState<string>(teachers[0]?.id || '');
  const currentTeacher = teachers.find((t) => t.id === selectedGuruId) || teachers[0];

  // Dynamic rubric components (persisted for telaah_adm & telaah_atp)
  const [rubricItems, setRubricItems] = useState<RubricTemplateItem[]>(() => {
    if (!storageCfg) return config.items;
    try {
      const raw = localStorage.getItem(storageCfg.componentsKey);
      if (raw) {
        const parsed = JSON.parse(raw) as RubricTemplateItem[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return config.items;
  });

  // Stored per-teacher evaluations
  const [storedEvaluations, setStoredEvaluations] = useState<Record<string, StoredEvaluation>>(() => {
    if (!storageCfg) return {};
    try {
      const raw = localStorage.getItem(storageCfg.evaluationsKey);
      if (raw) return JSON.parse(raw) as Record<string, StoredEvaluation>;
    } catch {
      // ignore storage errors
    }
    return {};
  });

  const buildDefaultScores = (items: RubricTemplateItem[]): Record<string, number> => {
    const init: Record<string, number> = {};
    items.forEach((it) => {
      init[it.id] = 4;
    });
    return init;
  };

  const [scores, setScores] = useState<Record<string, number>>(() => {
    if (storageCfg && selectedGuruId && storedEvaluations[selectedGuruId]?.scores) {
      return {
        ...buildDefaultScores(rubricItems),
        ...storedEvaluations[selectedGuruId].scores,
      };
    }
    return buildDefaultScores(rubricItems);
  });

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    if (storageCfg && selectedGuruId && storedEvaluations[selectedGuruId]?.notes) {
      return storedEvaluations[selectedGuruId].notes;
    }
    return {};
  });

  const [generalFeedback, setGeneralFeedback] = useState<string>(() => {
    if (storageCfg && selectedGuruId && storedEvaluations[selectedGuruId]?.generalFeedback) {
      return storedEvaluations[selectedGuruId].generalFeedback;
    }
    return DEFAULT_FEEDBACK;
  });

  const [isSaved, setIsSaved] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Component Add / Edit Modal state
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<RubricTemplateItem | null>(null);
  const [compAspek, setCompAspek] = useState('');
  const [compIndikator, setCompIndikator] = useState('');
  const [compDefaultScore, setCompDefaultScore] = useState<number>(4);

  // Excel Import Modal & Unduh Dropdown state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isUnduhMenuOpen, setIsUnduhMenuOpen] = useState(false);
  const unduhDropdownRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Uploaded Guru Docs Table filters & Preview state
  const [docFilterGuruId, setDocFilterGuruId] = useState<string>('ALL');
  const [docFilterKomponen, setDocFilterKomponen] = useState<string>('ALL');
  const [docSearchQuery, setDocSearchQuery] = useState<string>('');
  const [previewDoc, setPreviewDoc] = useState<GuruUploadedDoc | null>(null);

  // Persist rubricItems when storageCfg is active
  useEffect(() => {
    if (!storageCfg) return;
    try {
      localStorage.setItem(storageCfg.componentsKey, JSON.stringify(rubricItems));
    } catch {
      // ignore storage errors
    }
  }, [storageCfg, rubricItems]);

  // Close Unduh dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        unduhDropdownRef.current &&
        !unduhDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUnduhMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Load saved scores/notes when changing selected teacher
  const handleSelectTeacher = (guruId: string) => {
    setSelectedGuruId(guruId);
    setIsSaved(false);
    if (storageCfg) {
      const saved = storedEvaluations[guruId];
      if (saved) {
        setScores({ ...buildDefaultScores(rubricItems), ...saved.scores });
        setNotes(saved.notes || {});
        setGeneralFeedback(saved.generalFeedback || DEFAULT_FEEDBACK);
      } else {
        setScores(buildDefaultScores(rubricItems));
        setNotes({});
        setGeneralFeedback(DEFAULT_FEEDBACK);
      }
    }
  };

  const showBanner = (bannerType: 'success' | 'error', message: string) => {
    setStatusBanner({ type: bannerType, message });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const handleScoreChange = (id: string, val: number) => {
    setScores((prev) => ({ ...prev, [id]: val }));
    setIsSaved(false);
  };

  const totalScore = rubricItems.reduce((acc, item) => acc + (scores[item.id] ?? 4), 0);
  const maxScore = rubricItems.length * 4;
  const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const getPredicate = (val: number) => {
    if (val >= 91) return { text: 'Amat Baik (A)', color: 'bg-emerald-100 text-emerald-800' };
    if (val >= 81) return { text: 'Baik (B)', color: 'bg-blue-100 text-blue-800' };
    if (val >= 71) return { text: 'Cukup (C)', color: 'bg-amber-100 text-amber-800' };
    return { text: 'Kurang (D)', color: 'bg-red-100 text-red-800' };
  };

  const pred = getPredicate(finalScore);

  const handleSave = () => {
    if (storageCfg && selectedGuruId) {
      const nextEvaluations: Record<string, StoredEvaluation> = {
        ...storedEvaluations,
        [selectedGuruId]: {
          scores,
          notes,
          generalFeedback,
          updatedAt: new Date().toISOString().split('T')[0],
        },
      };
      setStoredEvaluations(nextEvaluations);
      try {
        localStorage.setItem(storageCfg.evaluationsKey, JSON.stringify(nextEvaluations));
      } catch {
        // ignore storage errors
      }
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Add / Edit / Delete Component handlers
  const openAddComponentModal = () => {
    setEditingComponent(null);
    setCompAspek('');
    setCompIndikator('');
    setCompDefaultScore(4);
    setIsComponentModalOpen(true);
  };

  const openEditComponentModal = (item: RubricTemplateItem) => {
    setEditingComponent(item);
    setCompAspek(item.aspek);
    setCompIndikator(item.indikator);
    setCompDefaultScore(scores[item.id] ?? 4);
    setIsComponentModalOpen(true);
  };

  const handleSaveComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compAspek.trim() || !compIndikator.trim()) return;
    const nounLabel = storageCfg?.noun || 'Komponen';

    if (editingComponent) {
      setRubricItems((prev) =>
        prev.map((it) =>
          it.id === editingComponent.id
            ? { ...it, aspek: compAspek.trim(), indikator: compIndikator.trim() }
            : it
        )
      );
      setScores((prev) => ({ ...prev, [editingComponent.id]: compDefaultScore }));
      showBanner('success', `${nounLabel} "${compAspek.trim()}" berhasil diperbarui.`);
    } else {
      const newId = `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setRubricItems((prev) => [
        ...prev,
        { id: newId, aspek: compAspek.trim(), indikator: compIndikator.trim() },
      ]);
      setScores((prev) => ({ ...prev, [newId]: compDefaultScore }));
      showBanner('success', `${nounLabel} "${compAspek.trim()}" berhasil ditambahkan.`);
    }
    setIsComponentModalOpen(false);
    setEditingComponent(null);
  };

  const handleDeleteComponent = (item: RubricTemplateItem) => {
    const nounLabel = storageCfg?.noun || 'Komponen';
    if (rubricItems.length <= 1) {
      showBanner('error', `Minimal harus terdapat 1 ${nounLabel.toLowerCase()} penilaian.`);
      return;
    }
    setRubricItems((prev) => prev.filter((it) => it.id !== item.id));
    setScores((prev) => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });
    setNotes((prev) => {
      const copy = { ...prev };
      delete copy[item.id];
      return copy;
    });
    showBanner('success', `${nounLabel} "${item.aspek}" dihapus.`);
  };

  const handleResetDefaultComponents = () => {
    setRubricItems(config.items);
    setScores(buildDefaultScores(config.items));
    setNotes({});
    showBanner(
      'success',
      `${storageCfg?.noun || 'Komponen'} penilaian dikembalikan ke standar awal (${config.items.length} item).`
    );
  };

  // Excel Download Template
  const handleDownloadTemplate = () => {
    if (!storageCfg) return;
    const wb = XLSX.utils.book_new();
    const wsTemplate = XLSX.utils.json_to_sheet(storageCfg.sampleRows);
    wsTemplate['!cols'] = [
      { wch: 6 },
      { wch: 34 },
      { wch: 64 },
      { wch: 12 },
      { wch: 36 },
    ];
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template Komponen');

    const guideRows = [
      { Kolom: 'No', Keterangan: 'Nomor urut komponen/aspek (opsional saat impor).' },
      {
        Kolom: 'Komponen / Aspek',
        Keterangan: 'Wajib diisi. Nama komponen atau aspek penilaian yang ditelaah.',
      },
      {
        Kolom: 'Deskriptor Indikator Mutu',
        Keterangan: 'Wajib diisi. Kriteria atau indikator ketercapaian komponen/aspek tersebut.',
      },
      {
        Kolom: 'Skor (1-4)',
        Keterangan: 'Opsional (angka 1 sampai 4). Jika kosong otomatis bernilai 4.',
      },
      {
        Kolom: 'Catatan Khusus',
        Keterangan: 'Opsional. Catatan atau rekomendasi khusus supervisor.',
      },
    ];
    const wsGuide = XLSX.utils.json_to_sheet(guideRows);
    wsGuide['!cols'] = [{ wch: 28 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk Pengisian');

    XLSX.writeFile(wb, storageCfg.templateFilename);
    setIsUnduhMenuOpen(false);
    showBanner('success', 'Template Excel berhasil diunduh.');
  };

  // Excel Export (Full Evaluation Report)
  const handleExportExcel = () => {
    if (!storageCfg) return;
    const wb = XLSX.utils.book_new();
    const guruName = currentTeacher
      ? `${currentTeacher.nama}, ${currentTeacher.gelar}`
      : 'Guru';

    const summaryRows: Array<Array<string | number>> = [
      [storageCfg.sheetHeader],
      ['Satuan Pendidikan', school.namaSekolah],
      ['Tahun Ajaran / Semester', `${school.tahunAjaran} (${school.semester})`],
      ['Guru Pendidik', guruName],
      ['NIP', currentTeacher?.nip || '-'],
      ['Mata Pelajaran', currentTeacher?.mapel || '-'],
      ['Supervisor / Pengamat', school.kepalaSekolah],
      ['Nilai Akhir', `${finalScore} (${pred.text})`],
      ['Skor Total', `${totalScore} / ${maxScore}`],
      ['Kesimpulan & Rekomendasi', generalFeedback],
      [],
      ['No', 'Komponen / Aspek', 'Deskriptor Indikator Mutu', 'Skor (1-4)', 'Catatan Khusus'],
      ...rubricItems.map((item, idx) => [
        idx + 1,
        item.aspek,
        item.indikator,
        scores[item.id] ?? 4,
        notes[item.id] || '',
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryRows);
    ws['!cols'] = [
      { wch: 24 },
      { wch: 36 },
      { wch: 62 },
      { wch: 14 },
      { wch: 36 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, storageCfg.sheetTabName);

    const componentSheetRows = rubricItems.map((item, idx) => ({
      No: idx + 1,
      'Komponen / Aspek': item.aspek,
      'Deskriptor Indikator Mutu': item.indikator,
      'Skor (1-4)': scores[item.id] ?? 4,
      'Catatan Khusus': notes[item.id] || '',
    }));
    const wsComp = XLSX.utils.json_to_sheet(componentSheetRows);
    wsComp['!cols'] = [
      { wch: 6 },
      { wch: 34 },
      { wch: 64 },
      { wch: 12 },
      { wch: 36 },
    ];
    XLSX.utils.book_append_sheet(wb, wsComp, 'Komponen Penilaian');

    const safeGuru = (currentTeacher?.nama || 'Guru').replace(/[^a-zA-Z0-9]+/g, '_');
    XLSX.writeFile(wb, `${storageCfg.exportPrefix}_${safeGuru}.xlsx`);
    setIsUnduhMenuOpen(false);
    showBanner('success', `Data telaah "${guruName}" berhasil diekspor ke Excel.`);
  };

  // Excel Export Components Only (Clean format directly compatible with Template)
  const handleDownloadComponentsOnly = () => {
    if (!storageCfg) return;
    const wb = XLSX.utils.book_new();
    const rows = rubricItems.map((item, idx) => ({
      No: idx + 1,
      'Komponen / Aspek': item.aspek,
      'Deskriptor Indikator Mutu': item.indikator,
      'Skor (1-4)': scores[item.id] ?? 4,
      'Catatan Khusus': notes[item.id] || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 34 },
      { wch: 64 },
      { wch: 12 },
      { wch: 36 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Template Komponen');
    XLSX.writeFile(wb, storageCfg.componentsFilename);
    setIsUnduhMenuOpen(false);
    showBanner('success', `Daftar ${storageCfg.noun.toLowerCase()} (.xlsx) berhasil diunduh.`);
  };

  // Excel Import Handler
  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      const preferredSheetName =
        workbook.SheetNames.find((name) =>
          /komponen|template|aspek/i.test(name)
        ) || workbook.SheetNames[0];
      const sheet = workbook.Sheets[preferredSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: '',
      });

      const parsedItems: Array<{
        item: RubricTemplateItem;
        score: number;
        note: string;
      }> = [];

      const findField = (row: Record<string, unknown>, patterns: RegExp[]): string => {
        const keys = Object.keys(row);
        for (const pattern of patterns) {
          const matchedKey = keys.find((k) => pattern.test(k.trim()));
          if (matchedKey !== undefined) {
            const val = String(row[matchedKey] ?? '').trim();
            if (val) return val;
          }
        }
        return '';
      };

      rawRows.forEach((row, index) => {
        let aspek = findField(row, [
          /^komponen\s*\/?\s*aspek$/i,
          /komponen/i,
          /aspek/i,
          /nama/i,
        ]);
        let indikator = findField(row, [
          /deskriptor/i,
          /indikator/i,
          /uraian/i,
          /kriteria/i,
        ]);
        const rawScore = findField(row, [/^skor/i, /nilai/i]);
        const note = findField(row, [/catatan/i, /keterangan/i, /rekomendasi/i]);

        if (!aspek && !indikator) {
          const vals = Object.values(row).map((v) => String(v ?? '').trim());
          if (vals.length >= 3 && /^\d+$/.test(vals[0])) {
            aspek = vals[1];
            indikator = vals[2];
          } else if (vals.length >= 2) {
            aspek = vals[0];
            indikator = vals[1];
          }
        }

        if (!aspek) return;
        const numericScore = Number(rawScore);
        const clampedScore =
          !Number.isNaN(numericScore) && numericScore >= 1 && numericScore <= 4
            ? Math.round(numericScore)
            : 4;

        parsedItems.push({
          item: {
            id: `imp-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 5)}`,
            aspek,
            indikator: indikator || `Kelengkapan dan kesesuaian ${aspek}`,
          },
          score: clampedScore,
          note,
        });
      });

      if (parsedItems.length === 0) {
        showBanner(
          'error',
          'Tidak ditemukan baris komponen/aspek valid di file Excel. Gunakan Template Excel agar format kolom sesuai.'
        );
        return;
      }

      const nextScoresUpdate: Record<string, number> = {};
      const nextNotesUpdate: Record<string, string> = {};
      parsedItems.forEach(({ item, score, note }) => {
        nextScoresUpdate[item.id] = score;
        if (note) nextNotesUpdate[item.id] = note;
      });

      if (importMode === 'replace') {
        setRubricItems(parsedItems.map((p) => p.item));
        setScores(nextScoresUpdate);
        setNotes(nextNotesUpdate);
      } else {
        setRubricItems((prev) => [...prev, ...parsedItems.map((p) => p.item)]);
        setScores((prev) => ({ ...prev, ...nextScoresUpdate }));
        setNotes((prev) => ({ ...prev, ...nextNotesUpdate }));
      }

      setIsImportModalOpen(false);
      showBanner(
        'success',
        `Berhasil mengimpor ${parsedItems.length} ${
          storageCfg?.noun.toLowerCase() || 'komponen'
        } penilaian dari "${file.name}".`
      );
    } catch {
      showBanner(
        'error',
        'Gagal membaca file Excel. Pastikan file berformat .xlsx, .xls, atau .csv yang valid.'
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Base uploaded docs list: all docs for telaah_adm, ATP-only for telaah_atp, Modul Ajar-only for telaah_modul, Perencanaan Asesmen-only for supervisi_asesmen
  const baseUploadedDocs = isTelaahAtp
    ? uploadedGuruDocs.filter((doc) => {
        const normalized = normalizeKomponenKey(doc.komponen as string);
        return (
          normalized === 'Alur Tujuan Pembelajaran' ||
          doc.komponenLabel.toLowerCase().includes('alur tujuan pembelajaran') ||
          /\batp\b/i.test(doc.komponenLabel)
        );
      })
    : isTelaahModul
    ? uploadedGuruDocs.filter((doc) => {
        const normalized = normalizeKomponenKey(doc.komponen as string);
        return (
          normalized === 'Modul Ajar / RPP' ||
          doc.komponenLabel.toLowerCase().includes('modul ajar') ||
          /\brpp\b/i.test(doc.komponenLabel)
        );
      })
    : isSupervisiAsesmen
    ? uploadedGuruDocs.filter((doc) => {
        const normalized = normalizeKomponenKey(doc.komponen as string);
        return (
          normalized === 'Perencanaan Asesmen' ||
          doc.komponenLabel.toLowerCase().includes('perencanaan asesmen')
        );
      })
    : uploadedGuruDocs;

  const guruTeacherLookup = new Map(teachers.map((t) => [t.id, t]));
  const uniqueUploadKomponen = Array.from(
    new Set(baseUploadedDocs.map((d) => normalizeKomponenKey(d.komponen as string)))
  );

  const filteredUploadedDocs = baseUploadedDocs.filter((doc) => {
    const matchesGuru = docFilterGuruId === 'ALL' || doc.guruId === docFilterGuruId;
    const normalizedKomp = normalizeKomponenKey(doc.komponen as string);
    const matchesKomp =
      !isTelaahAdm || docFilterKomponen === 'ALL' || normalizedKomp === docFilterKomponen;
    const q = docSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      doc.judulBerkas.toLowerCase().includes(q) ||
      doc.guruNama.toLowerCase().includes(q) ||
      doc.komponenLabel.toLowerCase().includes(q) ||
      normalizedKomp.toLowerCase().includes(q);
    return matchesGuru && matchesKomp && matchesSearch;
  });

  const uniqueTeachersUploadedCount = new Set(baseUploadedDocs.map((d) => d.guruId)).size;
  const formattedToday = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Dedicated Printable Assessment View ("Cetak Hasil Penilaian")
  if (showPrintPreview) {
    return (
      <div className="space-y-6">
        {/* Top Action Bar (hidden during print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs print:hidden">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Cetak Hasil Penilaian — {config.title}
            </h2>
            <p className="text-xs text-gray-500">
              Pratinjau dokumen hasil penilaian siap cetak lengkap dengan Kop Surat Sekolah dan kolom pengesahan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-semibold text-gray-700">Guru:</span>
              <select
                value={selectedGuruId}
                onChange={(e) => handleSelectTeacher(e.target.value)}
                className="text-xs font-semibold p-2 border border-emerald-300 bg-emerald-50/50 rounded-xl text-emerald-950 focus:outline-none"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama}, {t.gelar} ({t.mapel})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowPrintPreview(false)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Form Penilaian</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#064e3b] hover:bg-[#033c2a] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Printable A4 Sheet */}
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-lg max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none text-gray-900">
          {/* Official Kop Surat */}
          <div className="border-b-4 border-double border-emerald-900 pb-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c593d] to-[#04281c] border-2 border-emerald-500 flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>

              <div className="text-center flex-1">
                <h3 className="text-[11px] font-bold tracking-widest text-emerald-900 uppercase">
                  YAYASAN PENDIDIKAN ISLAM AL-MUSTOFA
                </h3>
                <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase mt-0.5">
                  {school.namaSekolah}
                </h1>
                <p className="text-[11px] font-semibold text-emerald-800 tracking-wide mt-0.5">
                  TERAKREDITASI {school.akreditasi} • NPSN: {school.npsn} • NSS: {school.nss}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {school.alamat}, Kec. {school.kecamatan}, {school.kabupatenKota}, {school.provinsi} {school.kodePos}
                </p>
                <p className="text-[10px] text-gray-500">
                  Telp: {school.telepon} • Email: {school.email}
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-extrabold text-xl shrink-0">
                UQ
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center my-5">
            <h2 className="text-base font-extrabold text-gray-950 uppercase underline tracking-wider">
              {config.printTitle}
            </h2>
            <p className="text-xs text-emerald-900 font-semibold mt-1">
              Tahun Ajaran {school.tahunAjaran} — Semester {school.semester}
            </p>
          </div>

          {/* Identity & Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs">
            <div className="md:col-span-2 p-4 rounded-xl border border-gray-300 bg-gray-50/50 space-y-1.5">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Nama Guru</span>
                <span className="col-span-2 font-bold text-gray-900">
                  : {currentTeacher ? `${currentTeacher.nama}, ${currentTeacher.gelar}` : '-'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">NIP</span>
                <span className="col-span-2 font-semibold text-gray-800">
                  : {currentTeacher?.nip || '-'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Mata Pelajaran</span>
                <span className="col-span-2 font-semibold text-gray-800">
                  : {currentTeacher?.mapel || '-'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Supervisor / Pengamat</span>
                <span className="col-span-2 font-semibold text-gray-800">
                  : {school.kepalaSekolah}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Tanggal Penilaian</span>
                <span className="col-span-2 font-semibold text-gray-800">
                  : {formattedToday}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border-2 border-emerald-800 bg-emerald-50/40 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                Nilai Akhir Penilaian
              </span>
              <span className="text-4xl font-black text-emerald-900 my-1">{finalScore}</span>
              <span className="px-3 py-0.5 rounded-full bg-emerald-800 text-white text-[11px] font-bold">
                {pred.text}
              </span>
              <span className="text-[10px] text-gray-600 mt-1.5">
                Skor Total: {totalScore} / {maxScore}
              </span>
            </div>
          </div>

          {/* Assessment Table */}
          <div className="mb-5">
            <table className="w-full text-left text-[11px] border border-gray-400">
              <thead className="bg-gray-100 text-gray-900 font-bold uppercase border-b border-gray-400">
                <tr>
                  <th className="py-2 px-2.5 border-r border-gray-400 text-center w-10">No</th>
                  <th className="py-2 px-3 border-r border-gray-400 w-44">Komponen / Aspek</th>
                  <th className="py-2 px-3 border-r border-gray-400">Deskriptor Indikator Mutu</th>
                  <th className="py-2 px-2.5 border-r border-gray-400 text-center w-16">Skor</th>
                  <th className="py-2 px-3 w-44">Catatan Khusus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {rubricItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="py-2 px-2.5 border-r border-gray-300 text-center font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-300 font-bold text-gray-900">
                      {item.aspek}
                    </td>
                    <td className="py-2 px-3 border-r border-gray-300 text-gray-700 leading-snug">
                      {item.indikator}
                    </td>
                    <td className="py-2 px-2.5 border-r border-gray-300 text-center font-bold text-gray-900">
                      {scores[item.id] ?? 4}
                    </td>
                    <td className="py-2 px-3 text-gray-700">
                      {notes[item.id] || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-400">
                <tr>
                  <td colSpan={3} className="py-2 px-3 border-r border-gray-400 text-right uppercase">
                    Jumlah Skor / Nilai Akhir / Predikat
                  </td>
                  <td className="py-2 px-2.5 border-r border-gray-400 text-center">
                    {totalScore}/{maxScore}
                  </td>
                  <td className="py-2 px-3 text-emerald-900">
                    {finalScore} — {pred.text}
                  </td>
                </tr>
              </tfoot>
            </table>
            <p className="text-[10px] text-gray-500 mt-1.5">
              Keterangan Skala: 1 = Kurang, 2 = Cukup, 3 = Baik, 4 = Amat Baik. Nilai Akhir = (Total Skor / Skor Maksimal) × 100.
            </p>
          </div>

          {/* General Feedback */}
          <div className="mb-8 p-4 rounded-xl border border-gray-300 bg-gray-50/40 text-xs">
            <h4 className="font-bold text-gray-900 mb-1">
              Kesimpulan &amp; Catatan Rekomendasi Supervisor:
            </h4>
            <p className="text-gray-700 leading-relaxed">{generalFeedback || '-'}</p>
          </div>

          {/* Signature Block */}
          <div className="grid grid-cols-2 gap-8 pt-2 text-xs text-center">
            <div className="space-y-16">
              <div>
                <p className="text-gray-700">Mengetahui,</p>
                <p className="font-bold text-gray-900">Guru yang Dinilai</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 underline">
                  {currentTeacher ? `${currentTeacher.nama}, ${currentTeacher.gelar}` : '....................'}
                </p>
                <p className="text-[11px] text-gray-600">NIP. {currentTeacher?.nip || '-'}</p>
              </div>
            </div>

            <div className="space-y-16">
              <div>
                <p className="text-gray-700">
                  {school.kabupatenKota}, {formattedToday}
                </p>
                <p className="font-bold text-gray-900">Supervisor / Kepala Sekolah</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 underline">{school.kepalaSekolah}</p>
                <p className="text-[11px] text-gray-600">NIP. {school.nipKepalaSekolah}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
          <p className="text-xs text-gray-500">{config.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">Guru:</span>
            <select
              value={selectedGuruId}
              onChange={(e) => handleSelectTeacher(e.target.value)}
              className="text-xs font-semibold p-2 border border-emerald-300 bg-emerald-50/50 rounded-xl text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama}, {t.gelar} ({t.mapel})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowPrintPreview(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            title="Buka Format Cetak Hasil Penilaian"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Cetak Hasil Penilaian</span>
          </button>
        </div>
      </div>

      {/* Action Toolbar for Komponen/Aspek, Impor/Export Excel, Template, Unduh & Cetak */}
      {supportsCustomTools && storageCfg && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900">
                Kelola {storageCfg.noun} Penilaian &amp; Integrasi Excel
              </h3>
              <p className="text-[11px] text-gray-500">
                Tambah {storageCfg.noun.toLowerCase()} manual, impor dari template Excel, ekspor hasil telaah, unduh berkas, atau cetak hasil penilaian.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openAddComponentModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#064e3b] hover:bg-[#033c2a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah {storageCfg.noun}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>Impor Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
              <span>Export Excel</span>
            </button>

            {/* Menu Unduh Dropdown */}
            <div className="relative" ref={unduhDropdownRef}>
              <button
                type="button"
                onClick={() => setIsUnduhMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isUnduhMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isUnduhMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-30 text-xs">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Menu Unduh Dokumen
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50 flex items-start gap-2.5 cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900">Unduh Template Excel (.xlsx)</div>
                      <div className="text-[10px] text-gray-500">
                        Format siap isi untuk impor {storageCfg.noun.toLowerCase()}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-blue-50 flex items-start gap-2.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900">Unduh Hasil Telaah (.xlsx)</div>
                      <div className="text-[10px] text-gray-500">
                        Rekap nilai &amp; catatan guru terpilih
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadComponentsOnly}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-amber-50 flex items-start gap-2.5 cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900">
                        Unduh Daftar {storageCfg.noun} (.xlsx)
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Salinan {storageCfg.noun.toLowerCase()} penilaian aktif
                      </div>
                    </div>
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnduhMenuOpen(false);
                      setShowPrintPreview(true);
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-gray-50 flex items-start gap-2.5 cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900">Cetak Hasil Penilaian (PDF)</div>
                      <div className="text-[10px] text-gray-500">
                        Format resmi siap cetak / simpan PDF
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetDefaultComponents}
              title={`Kembalikan ${storageCfg.noun.toLowerCase()} ke standar awal`}
              className="inline-flex items-center gap-1 px-2.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Notification Banner */}
      {statusBanner && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-semibold print:hidden ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="p-0.5 hover:opacity-70 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Target Teacher and Live Scorecard Banner */}
      {currentTeacher && (
        <div className="bg-gradient-to-r from-[#033c2a] via-[#064e3b] to-[#043b2c] p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                Lembar Evaluasi Mandiri &amp; Pengawas
              </span>
              <span className="text-xs text-emerald-200 font-medium">{currentTeacher.mapel}</span>
            </div>
            <h3 className="text-xl font-black mt-1 text-white">
              {currentTeacher.nama}, {currentTeacher.gelar}
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              NIP: {currentTeacher.nip} • Pengamat: {school.kepalaSekolah}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-300">{finalScore}</div>
              <div className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">
                Nilai Akhir
              </div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${pred.color}`}>
                {pred.text}
              </span>
              <div className="text-[10px] text-emerald-200 mt-1">
                {totalScore} / {maxScore} Skor Total ({rubricItems.length} {storageCfg?.noun || 'Komponen'})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rubric Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-700 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-48">Komponen / Aspek</th>
                <th className="py-3 px-4">Deskriptor Indikator Mutu</th>
                <th className="py-3 px-4 text-center w-52">Skor Penilaian (1 - 4)</th>
                <th className="py-3 px-4 w-60">Catatan Khusus</th>
                {supportsCustomTools && (
                  <th className="py-3 px-3 text-center w-24 print:hidden">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rubricItems.map((item, idx) => {
                const currentScore = scores[item.id] ?? 4;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{item.aspek}</td>
                    <td className="py-3 px-4 text-gray-700 leading-relaxed">{item.indikator}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200">
                        {[1, 2, 3, 4].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleScoreChange(item.id, s)}
                            className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              currentScore === s
                                ? 'bg-emerald-700 text-white shadow-sm scale-105'
                                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Catatan perbaikan..."
                        value={notes[item.id] || ''}
                        onChange={(e) => {
                          setNotes({ ...notes, [item.id]: e.target.value });
                          setIsSaved(false);
                        }}
                        className="w-full text-xs p-1.5 border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    {supportsCustomTools && (
                      <td className="py-3 px-3 text-center print:hidden">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditComponentModal(item)}
                            title={`Edit ${storageCfg?.noun || 'Komponen'}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComponent(item)}
                            title={`Hapus ${storageCfg?.noun || 'Komponen'}`}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer with Rubric Guide & General Recommendations */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-4">
          <div className="text-[11px] text-gray-500 flex flex-wrap gap-4 pb-2 border-b border-gray-200">
            <span className="font-semibold text-gray-700">Keterangan Skala Penskoran:</span>
            <span>1 = Kurang (Belum terlihat)</span>
            <span>2 = Cukup (Mulai terlihat/belum konsisten)</span>
            <span>3 = Baik (Sudah terlihat &amp; konsisten)</span>
            <span>4 = Amat Baik (Sangat memuaskan &amp; inovatif)</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-800">
                Kesimpulan &amp; Catatan Rekomendasi Supervisor:
              </label>
              {onOpenAiAssistant && (
                <button
                  type="button"
                  onClick={onOpenAiAssistant}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer print:hidden"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Minta AI Buat Rekomendasi</span>
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={generalFeedback}
              onChange={(e) => {
                setGeneralFeedback(e.target.value);
                setIsSaved(false);
              }}
              className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 print:hidden">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Instrumen berhasil disimpan ke sistem!
              </span>
            )}
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPrintPreview(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4 text-emerald-700" />
                <span>Cetak Hasil Penilaian</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Hasil Telaah</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Guru Documents Table + Preview (for Telaah Adm. Pembelajaran, Telaah ATP, Telaah Modul Ajar & Supervisi Asesmen) */}
      {(isTelaahAdm || isTelaahAtp || isTelaahModul || isSupervisiAsesmen) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden print:hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">
                  {isTelaahAtp
                    ? 'Daftar Alur Tujuan Pembelajaran (ATP) yang Telah Diunggah Guru'
                    : isTelaahModul
                    ? 'Daftar Modul Ajar yang Telah Diunggah Guru'
                    : isSupervisiAsesmen
                    ? 'Daftar Perencanaan Asesmen yang Telah Diunggah Guru'
                    : 'Daftar Administrasi Guru yang Telah Diunggah'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {baseUploadedDocs.length} Berkas • {uniqueTeachersUploadedCount} Guru
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {isTelaahAtp
                  ? 'Menampilkan seluruh dokumen Alur Tujuan Pembelajaran (ATP) yang sudah diunggah pada laman Guru oleh masing-masing user lengkap dengan fungsi preview.'
                  : isTelaahModul
                  ? 'Menampilkan seluruh dokumen Modul Ajar / RPP yang sudah diunggah pada laman Guru oleh masing-masing user lengkap dengan fungsi preview.'
                  : isSupervisiAsesmen
                  ? 'Menampilkan seluruh dokumen Perencanaan Asesmen yang sudah diunggah pada laman Guru oleh masing-masing user lengkap dengan fungsi preview.'
                  : 'Menampilkan seluruh berkas administrasi pembelajaran yang diunggah oleh masing-masing guru pada laman Guru lengkap dengan pratinjau dokumen.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  placeholder="Cari judul berkas / guru..."
                  className="pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
                />
              </div>

              {/* Filter by Guru */}
              <select
                aria-label="Filter Guru Pengunggah"
                value={docFilterGuruId}
                onChange={(e) => setDocFilterGuruId(e.target.value)}
                className="text-xs font-semibold px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">Semua Guru ({baseUploadedDocs.length})</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama}, {t.gelar}
                  </option>
                ))}
              </select>

              {/* Filter by Komponen (only for Telaah Adm. Pembelajaran) */}
              {isTelaahAdm && (
                <select
                  aria-label="Filter Komponen Administrasi"
                  value={docFilterKomponen}
                  onChange={(e) => setDocFilterKomponen(e.target.value)}
                  className="text-xs font-semibold px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="ALL">Semua Komponen</option>
                  {uniqueUploadKomponen.map((k) => (
                    <option key={k} value={k}>
                      {KOMPONEN_BADGE_MAP[k] || k}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#064e3b] text-white uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">NO</th>
                  <th className="py-3.5 px-4 min-w-[180px]">NAMA GURU &amp; MAPEL</th>
                  <th className="py-3.5 px-4 min-w-[180px]">KOMPONEN ADMINISTRASI</th>
                  <th className="py-3.5 px-4 min-w-[220px]">JUDUL BERKAS &amp; TANGGAL UNGGAH</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">STATUS VERIFIKASI</th>
                  <th className="py-3.5 px-4 min-w-[190px]">CATATAN / UMPAN BALIK</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">AKSI PREVIEW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUploadedDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 px-4 text-center text-gray-500">
                      <p className="text-sm font-semibold text-gray-700">
                        {isTelaahAtp
                          ? 'Belum ada dokumen Alur Tujuan Pembelajaran (ATP) yang sesuai filter'
                          : isTelaahModul
                          ? 'Belum ada dokumen Modul Ajar / RPP yang sesuai filter'
                          : isSupervisiAsesmen
                          ? 'Belum ada dokumen Perencanaan Asesmen yang sesuai filter'
                          : 'Belum ada berkas administrasi guru yang sesuai filter'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {isTelaahAtp
                          ? 'Dokumen ATP yang diunggah oleh masing-masing user guru pada menu Administrasi Guru akan tampil otomatis di sini.'
                          : isTelaahModul
                          ? 'Dokumen Modul Ajar / RPP yang diunggah oleh masing-masing user guru pada menu Administrasi Guru akan tampil otomatis di sini.'
                          : isSupervisiAsesmen
                          ? 'Dokumen Perencanaan Asesmen yang diunggah oleh masing-masing user guru pada menu Administrasi Guru akan tampil otomatis di sini.'
                          : 'Dokumen yang diunggah oleh masing-masing user guru pada menu Administrasi Guru akan tampil otomatis di sini.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUploadedDocs.map((doc, idx) => {
                    const matchedGuru = guruTeacherLookup.get(doc.guruId);
                    const normalizedKey = normalizeKomponenKey(doc.komponen as string);
                    const komponenLabel = KOMPONEN_BADGE_MAP[normalizedKey] || doc.komponenLabel;

                    return (
                      <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-gray-500 align-middle">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <div className="font-bold text-gray-900 leading-snug">
                            {doc.guruNama}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {matchedGuru ? `${matchedGuru.mapel} • ` : ''}
                            {doc.tahunAjaran}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-semibold leading-tight">
                            {komponenLabel}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-middle">
                          <div className="font-bold text-gray-900 leading-snug">
                            {doc.judulBerkas}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Diunggah: {doc.tanggalUnggah}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-middle whitespace-nowrap">
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

                        <td className="py-3.5 px-4 align-middle">
                          <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                            {doc.catatanUmpanBalik}
                          </p>
                          {doc.verifikator && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              Oleh: {doc.verifikator} ({doc.tanggalVerifikasi})
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                              title="Preview Dokumen Guru"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>

                            <a
                              href={doc.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Buka Tautan Google Drive di Tab Baru"
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-gray-500 font-medium">
              Menampilkan {filteredUploadedDocs.length} dari {baseUploadedDocs.length} berkas{' '}
              {isTelaahAtp
                ? 'ATP guru'
                : isTelaahModul
                ? 'Modul Ajar guru'
                : isSupervisiAsesmen
                ? 'Perencanaan Asesmen guru'
                : 'guru'}
            </span>
            <span className="text-emerald-800 font-bold uppercase tracking-wide">
              {school.namaSekolah}
            </span>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Komponen / Aspek Penilaian */}
      {isComponentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="bg-[#064e3b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingComponent
                    ? `Edit ${storageCfg?.noun || 'Komponen'} Penilaian`
                    : `Tambah ${storageCfg?.noun || 'Komponen'} Penilaian`}
                </h3>
                <p className="text-[11px] text-emerald-100">
                  Tambahkan aspek dan indikator mutu pada {config.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsComponentModalOpen(false)}
                className="p-1 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveComponent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nama Komponen / Aspek *
                </label>
                <input
                  type="text"
                  required
                  value={compAspek}
                  onChange={(e) => setCompAspek(e.target.value)}
                  placeholder={
                    isTelaahAtp
                      ? 'Contoh: Kesesuaian Elemen CP & Progresi ATP'
                      : isTelaahModul
                      ? 'Contoh: Skenario Diferensiasi Konten & Proses'
                      : isSupervisiAsesmen
                      ? 'Contoh: Instrumen Asesmen Formatif & Rubrik'
                      : 'Contoh: Asesmen Diagnostik & Pemetaan Awal'
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Deskriptor Indikator Mutu *
                </label>
                <textarea
                  rows={3}
                  required
                  value={compIndikator}
                  onChange={(e) => setCompIndikator(e.target.value)}
                  placeholder="Tuliskan kriteria penilaian atau deskriptor indikator ketercapaian..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Skor Awal Penilaian (1 - 4)
                </label>
                <div className="inline-flex items-center gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200">
                  {[1, 2, 3, 4].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCompDefaultScore(s)}
                      className={`w-9 h-8 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                        compDefaultScore === s
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsComponentModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064e3b] hover:bg-[#033c2a] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingComponent ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Excel Komponen/Aspek Penilaian */}
      {isImportModalOpen && storageCfg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="bg-[#064e3b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  Impor {storageCfg.noun} Penilaian dari Excel
                </h3>
                <p className="text-[11px] text-emerald-100">
                  Unggah file .xlsx / .xls / .csv sesuai format template komponen/aspek penilaian
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-emerald-950">Belum memiliki format template?</p>
                  <p className="text-[11px] text-emerald-800">
                    Unduh template Excel (.xlsx) lengkap dengan contoh pengisian kolom.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shrink-0 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Mode Impor Data
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      importMode === 'append'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold">Tambahkan {storageCfg.noun}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Menambah baris Excel ke bawah daftar yang ada
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-bold">Ganti Seluruh {storageCfg.noun}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Mengganti daftar aktif dengan isi Excel
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Pilih File Excel (.xlsx, .xls, .csv)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 px-4 border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-6 h-6 text-emerald-700" />
                  <span className="font-bold text-gray-900">
                    Klik untuk memilih file Excel dari perangkat
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Kolom: No, Komponen / Aspek, Deskriptor Indikator Mutu, Skor (1-4), Catatan Khusus
                  </span>
                </button>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Preview Dokumen Guru */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#064e3b] text-white flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-emerald-200">
                  <FileText className="w-3.5 h-3.5" />
                  <span>
                    {KOMPONEN_BADGE_MAP[normalizeKomponenKey(previewDoc.komponen as string)] ||
                      previewDoc.komponenLabel}
                  </span>
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
                Pratinjau langsung berkas Google Drive milik{' '}
                <strong>{previewDoc.guruNama}</strong>. Pastikan akses file diatur ke{' '}
                <strong>"Siapa saja yang memiliki link"</strong> atau klik tombol{' '}
                <strong>Buka di Drive</strong>.
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
    </div>
  );
};
