import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  CheckCircle2,
  Sparkles,
  Save,
  Printer,
  ChevronDown,
  Layers,
  Plus,
  Upload,
  Download,
  FileSpreadsheet,
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
  BookOpen,
} from 'lucide-react';
import {
  Teacher,
  SupervisiPembelajaranRecord,
  SchoolProfile,
  RubricItem,
  GuruUploadedDoc,
} from '../types/supervisi';

interface SupervisiPembelajaranViewProps {
  teachers: Teacher[];
  supervisiRecords: SupervisiPembelajaranRecord[];
  onSaveRecord: (rec: SupervisiPembelajaranRecord) => void;
  school: SchoolProfile;
  uploadedGuruDocs?: GuruUploadedDoc[];
  onOpenAiAssistant?: () => void;
}

type KbmSectionKey = 'awal' | 'inti' | 'penutup' | 'manajemen';

interface KbmTemplateMap {
  awal: RubricItem[];
  inti: RubricItem[];
  penutup: RubricItem[];
  manajemen: RubricItem[];
}

const STORAGE_TEMPLATE_KEY = 'super_guru_supervisi_kbm_template';

const SECTION_META: Array<{
  key: KbmSectionKey;
  code: string;
  label: string;
  fullTitle: string;
}> = [
  {
    key: 'awal',
    code: 'A',
    label: 'A. Kegiatan Pendahuluan',
    fullTitle: 'A. Kegiatan Pendahuluan (Apersepsi & Orientasi)',
  },
  {
    key: 'inti',
    code: 'B',
    label: 'B. Kegiatan Inti',
    fullTitle: 'B. Kegiatan Inti (Eksplorasi, Elaborasi & Diferensiasi)',
  },
  {
    key: 'penutup',
    code: 'C',
    label: 'C. Kegiatan Penutup',
    fullTitle: 'C. Kegiatan Penutup (Penyimpulan & Asesmen Formatif)',
  },
  {
    key: 'manajemen',
    code: 'D',
    label: 'D. Manajemen Kelas',
    fullTitle: 'D. Manajemen Kelas & Disiplin Positif',
  },
];

const DEFAULT_KEGIATAN_AWAL: RubricItem[] = [
  {
    id: 'a1',
    aspek: 'Apersepsi & Doa',
    indikator: 'Menyiapkan fisik dan psikis murid, tadarus/doa, memeriksa kehadiran secara ramah dan tertib',
    skor: 4,
    catatan: '',
  },
  {
    id: 'a2',
    aspek: 'Pertanyaan Pemantik',
    indikator: 'Mengajukan pertanyaan kontekstual yang mengaitkan materi sebelumnya dengan topik hari ini',
    skor: 4,
    catatan: '',
  },
  {
    id: 'a3',
    aspek: 'Tujuan & Manfaat',
    indikator: 'Menjelaskan tujuan pembelajaran, lingkup materi, dan kriteria ketercapaian (KKTP)',
    skor: 4,
    catatan: '',
  },
];

const DEFAULT_KEGIATAN_INTI: RubricItem[] = [
  {
    id: 'i1',
    aspek: 'Penguasaan Materi',
    indikator: 'Menunjukkan penguasaan materi esensial secara akurat, kontekstual, dan bebas miskonsepsi',
    skor: 4,
    catatan: '',
  },
  {
    id: 'i2',
    aspek: 'Model Pembelajaran Inovatif',
    indikator: 'Melaksanakan sintaks model pembelajaran (PBL, PJBL, Inquiry, Problem Solving) secara konsisten',
    skor: 4,
    catatan: '',
  },
  {
    id: 'i3',
    aspek: 'Diferensiasi Pembelajaran',
    indikator: 'Menyediakan variasi konten/proses/produk dan memberikan scaffolding sesuai kesiapan belajar murid',
    skor: 3,
    catatan: '',
  },
  {
    id: 'i4',
    aspek: 'Pemanfaatan Media & TIK',
    indikator: 'Mengoptimalkan sarana TIK, simulasi digital, alat peraga, atau LKPD interaktif',
    skor: 4,
    catatan: '',
  },
  {
    id: 'i5',
    aspek: 'Keterlibatan Aktif Murid',
    indikator: 'Mendorong murid bertanya, mengemukakan ide, berdiskusi kelompok, dan mempresentasikan hasil karya',
    skor: 4,
    catatan: '',
  },
];

const DEFAULT_KEGIATAN_PENUTUP: RubricItem[] = [
  {
    id: 'p1',
    aspek: 'Penyimpulan Bersama',
    indikator: 'Memfasilitasi murid merumuskan kesimpulan intisari pembelajaran yang diperoleh',
    skor: 4,
    catatan: '',
  },
  {
    id: 'p2',
    aspek: 'Asesmen Formatif Akhir',
    indikator: 'Melakukan penilaian formatif cepat (kuis, lembar refleksi, atau exit-ticket)',
    skor: 4,
    catatan: '',
  },
  {
    id: 'p3',
    aspek: 'Refleksi & Rencana Lanjut',
    indikator: 'Melakukan refleksi pengalaman belajar bersama murid dan menyampaikan topik pertemuan selanjutnya',
    skor: 3,
    catatan: '',
  },
];

const DEFAULT_MANAJEMEN_KELAS: RubricItem[] = [
  {
    id: 'm1',
    aspek: 'Iklim Kelas Positif',
    indikator: 'Menciptakan suasana kelas yang aman, saling menghormati, dan menegakkan disiplin positif',
    skor: 4,
    catatan: '',
  },
  {
    id: 'm2',
    aspek: 'Pengelolaan Waktu Efektif',
    indikator: 'Mengelola alokasi waktu secara proporsional sesuai rancangan modul ajar',
    skor: 4,
    catatan: '',
  },
];

const DEFAULT_TEMPLATE_MAP: KbmTemplateMap = {
  awal: DEFAULT_KEGIATAN_AWAL,
  inti: DEFAULT_KEGIATAN_INTI,
  penutup: DEFAULT_KEGIATAN_PENUTUP,
  manajemen: DEFAULT_MANAJEMEN_KELAS,
};

const SAMPLE_EXCEL_ROWS = [
  {
    No: 1,
    'Bagian / Tahap': 'A. Kegiatan Pendahuluan',
    'Komponen / Aspek': 'Asesmen Kesiapan Awal Murid',
    'Deskriptor Indikator Mutu':
      'Melakukan pengecekan kesiapan belajar kognitif maupun emosional sebelum masuk materi inti',
    'Skor (1-4)': 4,
    'Catatan Khusus': 'Dilaksanakan melalui pertanyaan pemantik lisan',
  },
  {
    No: 2,
    'Bagian / Tahap': 'B. Kegiatan Inti',
    'Komponen / Aspek': 'Integrasi Literasi & Numerasi',
    'Deskriptor Indikator Mutu':
      'Menyajikan stimulus bacaan, grafik, atau data kontekstual dalam aktivitas eksplorasi murid',
    'Skor (1-4)': 4,
    'Catatan Khusus': 'LKPD memuat studi kasus kontekstual',
  },
  {
    No: 3,
    'Bagian / Tahap': 'C. Kegiatan Penutup',
    'Komponen / Aspek': 'Umpan Balik & Tindak Lanjut',
    'Deskriptor Indikator Mutu':
      'Memberikan penguatan konsep, umpan balik konstruktif, dan tugas/pengayaan terarah',
    'Skor (1-4)': 3,
    'Catatan Khusus': 'Sudah ada exit ticket di akhir sesi',
  },
  {
    No: 4,
    'Bagian / Tahap': 'D. Manajemen Kelas',
    'Komponen / Aspek': 'Kesesuaian dengan Modul Ajar',
    'Deskriptor Indikator Mutu':
      'Alur pelaksanaan pembelajaran di kelas selaras dengan rancangan skenario pada Modul Ajar',
    'Skor (1-4)': 4,
    'Catatan Khusus': 'Langkah KBM konsisten dengan Modul Ajar',
  },
];

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

const parseSectionKey = (rawValue: string): KbmSectionKey => {
  const val = rawValue.trim().toLowerCase();
  if (
    val.startsWith('a') ||
    val.includes('awal') ||
    val.includes('pendahuluan') ||
    val.includes('apersepsi')
  ) {
    return 'awal';
  }
  if (val.startsWith('c') || val.includes('penutup') || val.includes('refleksi')) {
    return 'penutup';
  }
  if (val.startsWith('d') || val.includes('manajemen') || val.includes('disiplin')) {
    return 'manajemen';
  }
  return 'inti';
};

const mergeWithTemplate = (
  templateItems: RubricItem[],
  recordItems?: RubricItem[]
): RubricItem[] => {
  return templateItems.map((tpl) => {
    const existing = recordItems?.find((r) => r.id === tpl.id);
    if (existing) {
      return {
        ...tpl,
        skor: existing.skor,
        catatan: existing.catatan ?? tpl.catatan ?? '',
      };
    }
    return { ...tpl, catatan: tpl.catatan ?? '' };
  });
};

const isModulAjarDoc = (doc: GuruUploadedDoc): boolean => {
  const comp = (doc.komponen || '').toLowerCase();
  const label = (doc.komponenLabel || '').toLowerCase();
  return (
    doc.komponen === 'Modul Ajar / RPP' ||
    comp.includes('modul ajar') ||
    label.includes('modul ajar') ||
    /\brpp\b/i.test(comp) ||
    /\brpp\b/i.test(label)
  );
};

export const SupervisiPembelajaranView: React.FC<SupervisiPembelajaranViewProps> = ({
  teachers,
  supervisiRecords,
  onSaveRecord,
  school,
  uploadedGuruDocs = [],
  onOpenAiAssistant,
}) => {
  const [selectedGuruId, setSelectedGuruId] = useState<string>(teachers[0]?.id || '');
  const currentTeacher = teachers.find((t) => t.id === selectedGuruId) || teachers[0];

  // Persistent rubric template across all 4 KBM sections
  const [templateMap, setTemplateMap] = useState<KbmTemplateMap>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_TEMPLATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<KbmTemplateMap>;
        if (parsed && Array.isArray(parsed.awal) && Array.isArray(parsed.inti)) {
          return {
            awal: parsed.awal,
            inti: parsed.inti,
            penutup: Array.isArray(parsed.penutup) ? parsed.penutup : DEFAULT_KEGIATAN_PENUTUP,
            manajemen: Array.isArray(parsed.manajemen) ? parsed.manajemen : DEFAULT_MANAJEMEN_KELAS,
          };
        }
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_TEMPLATE_MAP;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TEMPLATE_KEY, JSON.stringify(templateMap));
    } catch {
      // ignore storage errors
    }
  }, [templateMap]);

  const existingRec = supervisiRecords.find((r) => r.guruId === selectedGuruId);

  const [tanggal, setTanggal] = useState(existingRec?.tanggal || '2026-10-20');
  const [kelas, setKelas] = useState(existingRec?.kelas || 'XI MIPA 1');
  const [materiPokok, setMateriPokok] = useState(
    existingRec?.materiPokok || 'Hukum Termodinamika & Efisiensi Mesin'
  );
  const [catatanKelebihan, setCatatanKelebihan] = useState(
    existingRec?.catatanKelebihan ||
      'Penguasaan materi sangat prima. Penggunaan media simulasi PhET membangkitkan antusiasme siswa secara nyata. Respon murid sangat aktif dalam diskusi.'
  );
  const [catatanPeningkatan, setCatatanPeningkatan] = useState(
    existingRec?.catatanPeningkatan ||
      'Dapat lebih diperkuat pada pemberian waktu henti (wait-time) bagi murid yang membutuhkan waktu lebih untuk memproses pertanyaan penalaran tinggi.'
  );

  const [awalScores, setAwalScores] = useState<RubricItem[]>(() =>
    mergeWithTemplate(templateMap.awal, existingRec?.kegiatanAwal)
  );
  const [intiScores, setIntiScores] = useState<RubricItem[]>(() =>
    mergeWithTemplate(templateMap.inti, existingRec?.kegiatanInti)
  );
  const [penutupScores, setPenutupScores] = useState<RubricItem[]>(() =>
    mergeWithTemplate(templateMap.penutup, existingRec?.kegiatanPenutup)
  );
  const [manajemenScores, setManajemenScores] = useState<RubricItem[]>(() =>
    mergeWithTemplate(templateMap.manajemen, existingRec?.manajemenKelas)
  );

  const [isSaved, setIsSaved] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Status banner
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showBanner = (type: 'success' | 'error', message: string) => {
    setStatusBanner({ type, message });
    setTimeout(() => setStatusBanner(null), 4500);
  };

  // Unduh dropdown
  const [isUnduhMenuOpen, setIsUnduhMenuOpen] = useState(false);
  const unduhDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        unduhDropdownRef.current &&
        !unduhDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUnduhMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Component/Aspect CRUD modal state
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    section: KbmSectionKey;
    item: RubricItem;
  } | null>(null);
  const [compSection, setCompSection] = useState<KbmSectionKey>('inti');
  const [compAspek, setCompAspek] = useState('');
  const [compIndikator, setCompIndikator] = useState('');
  const [compDefaultScore, setCompDefaultScore] = useState<number>(4);

  // Excel import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modul Ajar Guru table & Preview modal state
  const [modulSearchQuery, setModulSearchQuery] = useState('');
  const [modulFilterGuruId, setModulFilterGuruId] = useState<string>('ALL');
  const [previewDoc, setPreviewDoc] = useState<GuruUploadedDoc | null>(null);

  const handleTeacherChange = (id: string) => {
    setSelectedGuruId(id);
    setIsSaved(false);
    const rec = supervisiRecords.find((r) => r.guruId === id);
    if (rec) {
      setTanggal(rec.tanggal);
      setKelas(rec.kelas);
      setMateriPokok(rec.materiPokok);
      setCatatanKelebihan(rec.catatanKelebihan);
      setCatatanPeningkatan(rec.catatanPeningkatan);
      setAwalScores(mergeWithTemplate(templateMap.awal, rec.kegiatanAwal));
      setIntiScores(mergeWithTemplate(templateMap.inti, rec.kegiatanInti));
      setPenutupScores(mergeWithTemplate(templateMap.penutup, rec.kegiatanPenutup));
      setManajemenScores(mergeWithTemplate(templateMap.manajemen, rec.manajemenKelas));
    } else {
      setTanggal('2026-10-25');
      setKelas('X-1');
      setMateriPokok('Pembelajaran Konsep Kurikulum Merdeka');
      setCatatanKelebihan('Guru memiliki pembawaan yang komunikatif dan terstruktur.');
      setCatatanPeningkatan('Tingkatkan diferensiasi konten untuk kelompok peserta didik heterogen.');
      setAwalScores(mergeWithTemplate(templateMap.awal));
      setIntiScores(mergeWithTemplate(templateMap.inti));
      setPenutupScores(mergeWithTemplate(templateMap.penutup));
      setManajemenScores(mergeWithTemplate(templateMap.manajemen));
    }
  };

  const getSectionStateAndSetter = (section: KbmSectionKey) => {
    switch (section) {
      case 'awal':
        return { items: awalScores, setItems: setAwalScores };
      case 'inti':
        return { items: intiScores, setItems: setIntiScores };
      case 'penutup':
        return { items: penutupScores, setItems: setPenutupScores };
      case 'manajemen':
        return { items: manajemenScores, setItems: setManajemenScores };
    }
  };

  const updateItemScore = (
    setList: React.Dispatch<React.SetStateAction<RubricItem[]>>,
    id: string,
    val: number
  ) => {
    setList((prev) => prev.map((item) => (item.id === id ? { ...item, skor: val } : item)));
    setIsSaved(false);
  };

  const updateItemNote = (
    setList: React.Dispatch<React.SetStateAction<RubricItem[]>>,
    id: string,
    note: string
  ) => {
    setList((prev) => prev.map((item) => (item.id === id ? { ...item, catatan: note } : item)));
    setIsSaved(false);
  };

  const totalAwal = awalScores.reduce((acc, it) => acc + it.skor, 0);
  const totalInti = intiScores.reduce((acc, it) => acc + it.skor, 0);
  const totalPenutup = penutupScores.reduce((acc, it) => acc + it.skor, 0);
  const totalManajemen = manajemenScores.reduce((acc, it) => acc + it.skor, 0);

  const grandTotal = totalAwal + totalInti + totalPenutup + totalManajemen;
  const totalComponentCount =
    awalScores.length + intiScores.length + penutupScores.length + manajemenScores.length;
  const maxPossible = totalComponentCount * 4;
  const finalPercentage = maxPossible > 0 ? Math.round((grandTotal / maxPossible) * 100) : 0;

  const getPredicate = (val: number) => {
    if (val >= 91) return { label: 'Amat Baik', color: 'bg-emerald-100 text-emerald-800' };
    if (val >= 81) return { label: 'Baik', color: 'bg-blue-100 text-blue-800' };
    if (val >= 71) return { label: 'Cukup', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Kurang', color: 'bg-red-100 text-red-800' };
  };

  const pred = getPredicate(finalPercentage);

  const handleSave = () => {
    if (!currentTeacher) return;
    const record: SupervisiPembelajaranRecord = {
      id: existingRec?.id || `sup-kbm-${selectedGuruId}`,
      guruId: selectedGuruId,
      tanggal,
      kelas,
      mapel: currentTeacher.mapel,
      materiPokok,
      penilai: school.kepalaSekolah,
      kegiatanAwal: awalScores,
      kegiatanInti: intiScores,
      kegiatanPenutup: penutupScores,
      manajemenKelas: manajemenScores,
      totalSkor: grandTotal,
      nilaiAkhir: finalPercentage,
      predikat: pred.label as SupervisiPembelajaranRecord['predikat'],
      catatanKelebihan,
      catatanPeningkatan,
    };

    onSaveRecord(record);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // CRUD handlers for Komponen / Aspek
  const openAddComponentModal = (defaultSection: KbmSectionKey = 'inti') => {
    setEditingItem(null);
    setCompSection(defaultSection);
    setCompAspek('');
    setCompIndikator('');
    setCompDefaultScore(4);
    setIsComponentModalOpen(true);
  };

  const openEditComponentModal = (section: KbmSectionKey, item: RubricItem) => {
    setEditingItem({ section, item });
    setCompSection(section);
    setCompAspek(item.aspek);
    setCompIndikator(item.indikator);
    setCompDefaultScore(item.skor);
    setIsComponentModalOpen(true);
  };

  const handleSaveComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compAspek.trim() || !compIndikator.trim()) return;

    if (editingItem) {
      const oldSec = editingItem.section;
      const newSec = compSection;
      const updatedItem: RubricItem = {
        ...editingItem.item,
        aspek: compAspek.trim(),
        indikator: compIndikator.trim(),
        skor: compDefaultScore,
      };

      if (oldSec === newSec) {
        setTemplateMap((prev) => ({
          ...prev,
          [oldSec]: prev[oldSec].map((it) => (it.id === updatedItem.id ? updatedItem : it)),
        }));
        const { setItems } = getSectionStateAndSetter(oldSec);
        setItems((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));
      } else {
        setTemplateMap((prev) => ({
          ...prev,
          [oldSec]: prev[oldSec].filter((it) => it.id !== updatedItem.id),
          [newSec]: [...prev[newSec], updatedItem],
        }));
        const { setItems: removeSetter } = getSectionStateAndSetter(oldSec);
        const { setItems: addSetter } = getSectionStateAndSetter(newSec);
        removeSetter((prev) => prev.filter((it) => it.id !== updatedItem.id));
        addSetter((prev) => [...prev, updatedItem]);
      }

      showBanner('success', `Komponen / Aspek "${compAspek.trim()}" berhasil diperbarui.`);
    } else {
      const newItem: RubricItem = {
        id: `kbm-${compSection}-${Date.now()}`,
        aspek: compAspek.trim(),
        indikator: compIndikator.trim(),
        skor: compDefaultScore,
        catatan: '',
      };
      setTemplateMap((prev) => ({
        ...prev,
        [compSection]: [...prev[compSection], newItem],
      }));
      const { setItems } = getSectionStateAndSetter(compSection);
      setItems((prev) => [...prev, newItem]);
      const secLabel = SECTION_META.find((s) => s.key === compSection)?.label || compSection;
      showBanner('success', `Komponen / Aspek "${newItem.aspek}" berhasil ditambahkan ke ${secLabel}.`);
    }

    setIsSaved(false);
    setIsComponentModalOpen(false);
  };

  const handleDeleteComponent = (section: KbmSectionKey, item: RubricItem) => {
    const remainingTotal = totalComponentCount - 1;
    if (remainingTotal < 1) {
      showBanner('error', 'Minimal harus ada 1 komponen / aspek dalam instrumen supervisi.');
      return;
    }

    setTemplateMap((prev) => ({
      ...prev,
      [section]: prev[section].filter((it) => it.id !== item.id),
    }));
    const { setItems } = getSectionStateAndSetter(section);
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    setIsSaved(false);
    showBanner('success', `Komponen / Aspek "${item.aspek}" dihapus.`);
  };

  const handleResetDefaultComponents = () => {
    setTemplateMap(DEFAULT_TEMPLATE_MAP);
    setAwalScores(DEFAULT_KEGIATAN_AWAL.map((it) => ({ ...it })));
    setIntiScores(DEFAULT_KEGIATAN_INTI.map((it) => ({ ...it })));
    setPenutupScores(DEFAULT_KEGIATAN_PENUTUP.map((it) => ({ ...it })));
    setManajemenScores(DEFAULT_MANAJEMEN_KELAS.map((it) => ({ ...it })));
    try {
      localStorage.removeItem(STORAGE_TEMPLATE_KEY);
    } catch {
      // ignore
    }
    setIsSaved(false);
    showBanner('success', 'Komponen / Aspek observasi KBM dikembalikan ke standar awal.');
  };

  // Excel helpers
  const buildAllSectionRows = () => {
    const rows: Array<{
      No: number;
      'Bagian / Tahap': string;
      'Komponen / Aspek': string;
      'Deskriptor Indikator Mutu': string;
      'Skor (1-4)': number;
      'Catatan Khusus': string;
    }> = [];
    let counter = 1;
    SECTION_META.forEach((sec) => {
      const { items } = getSectionStateAndSetter(sec.key);
      items.forEach((item) => {
        rows.push({
          No: counter++,
          'Bagian / Tahap': sec.label,
          'Komponen / Aspek': item.aspek,
          'Deskriptor Indikator Mutu': item.indikator,
          'Skor (1-4)': item.skor,
          'Catatan Khusus': item.catatan || '',
        });
      });
    });
    return rows;
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const wsTemplate = XLSX.utils.json_to_sheet(SAMPLE_EXCEL_ROWS);
    wsTemplate['!cols'] = [
      { wch: 6 },
      { wch: 26 },
      { wch: 34 },
      { wch: 56 },
      { wch: 12 },
      { wch: 32 },
    ];
    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template Komponen');

    const guideRows = [
      { Kolom: 'No', Keterangan: 'Nomor urut komponen/aspek (angka 1, 2, 3, dst.)' },
      {
        Kolom: 'Bagian / Tahap',
        Keterangan:
          'Pilih salah satu: "A. Kegiatan Pendahuluan", "B. Kegiatan Inti", "C. Kegiatan Penutup", atau "D. Manajemen Kelas"',
      },
      {
        Kolom: 'Komponen / Aspek',
        Keterangan: 'Wajib diisi. Nama aspek observasi pelaksanaan pembelajaran.',
      },
      {
        Kolom: 'Deskriptor Indikator Mutu',
        Keterangan: 'Wajib diisi. Uraian indikator perilaku atau mutu pembelajaran yang diamati.',
      },
      {
        Kolom: 'Skor (1-4)',
        Keterangan: 'Opsional (angka 1 sampai 4, default 4 jika dikosongkan).',
      },
      {
        Kolom: 'Catatan Khusus',
        Keterangan: 'Opsional. Catatan temuan observasi lapangan untuk komponen tersebut.',
      },
    ];
    const wsGuide = XLSX.utils.json_to_sheet(guideRows);
    wsGuide['!cols'] = [{ wch: 28 }, { wch: 76 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, 'Panduan Pengisian');

    XLSX.writeFile(wb, 'Template_Komponen_Aspek_Supervisi_Pembelajaran.xlsx');
    setIsUnduhMenuOpen(false);
    showBanner('success', 'Template Excel Komponen / Aspek Supervisi Pembelajaran berhasil diunduh.');
  };

  const handleExportExcel = () => {
    const teacherName = currentTeacher ? `${currentTeacher.nama}, ${currentTeacher.gelar}` : 'Guru';
    const wb = XLSX.utils.book_new();

    const headerRows: (string | number)[][] = [
      ['HASIL SUPERVISI PELAKSANAAN PEMBELAJARAN (KBM KELAS)'],
      [school.namaSekolah, `Tahun Ajaran ${school.tahunAjaran} (${school.semester})`],
      [],
      ['Nama Guru', teacherName, 'Tanggal Kunjungan', tanggal],
      ['NIP', currentTeacher?.nip || '-', 'Ruang Kelas / Jam', kelas],
      ['Mata Pelajaran', currentTeacher?.mapel || '-', 'Topik / Materi Pokok', materiPokok],
      ['Supervisor / Penilai', school.kepalaSekolah, 'Nilai Akhir', `${finalPercentage} (${pred.label})`],
      ['Total Skor', `${grandTotal} / ${maxPossible}`],
      [],
      [
        'No',
        'Bagian / Tahap',
        'Komponen / Aspek',
        'Deskriptor Indikator Mutu',
        'Skor (1-4)',
        'Catatan Observasi',
      ],
    ];

    const detailRows = buildAllSectionRows();
    detailRows.forEach((r) => {
      headerRows.push([
        r.No,
        r['Bagian / Tahap'],
        r['Komponen / Aspek'],
        r['Deskriptor Indikator Mutu'],
        r['Skor (1-4)'],
        r['Catatan Khusus'] || '-',
      ]);
    });

    headerRows.push(
      [],
      ['TOTAL SKOR', '', '', '', `${grandTotal} / ${maxPossible}`, `Nilai: ${finalPercentage} (${pred.label})`],
      [],
      ['Kelebihan / Praktik Baik Guru:', catatanKelebihan || '-'],
      ['Area yang Perlu Ditingkatkan:', catatanPeningkatan || '-']
    );

    const wsSummary = XLSX.utils.aoa_to_sheet(headerRows);
    wsSummary['!cols'] = [
      { wch: 6 },
      { wch: 26 },
      { wch: 32 },
      { wch: 52 },
      { wch: 14 },
      { wch: 34 },
    ];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Hasil Supervisi KBM');

    // Sheet 2: Clean re-importable Komponen Aspek sheet
    const wsClean = XLSX.utils.json_to_sheet(detailRows);
    wsClean['!cols'] = [
      { wch: 6 },
      { wch: 26 },
      { wch: 32 },
      { wch: 52 },
      { wch: 12 },
      { wch: 34 },
    ];
    XLSX.utils.book_append_sheet(wb, wsClean, 'Komponen Aspek');

    const safeName = (currentTeacher?.nama || 'Guru').replace(/[^a-zA-Z0-9]+/g, '_');
    XLSX.writeFile(wb, `Supervisi_Pembelajaran_${safeName}.xlsx`);
    setIsUnduhMenuOpen(false);
    showBanner('success', `Hasil Supervisi Pembelajaran untuk ${teacherName} berhasil diekspor ke Excel.`);
  };

  const handleDownloadComponentsOnly = () => {
    const wb = XLSX.utils.book_new();
    const rows = buildAllSectionRows();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 26 },
      { wch: 32 },
      { wch: 52 },
      { wch: 12 },
      { wch: 34 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Komponen Aspek');
    XLSX.writeFile(wb, 'Daftar_Komponen_Aspek_Supervisi_Pembelajaran.xlsx');
    setIsUnduhMenuOpen(false);
    showBanner('success', 'Daftar Komponen / Aspek Supervisi Pembelajaran berhasil diunduh.');
  };

  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const preferredSheet =
        workbook.SheetNames.find((n) => n.toLowerCase().includes('komponen')) ||
        workbook.SheetNames.find((n) => n.toLowerCase().includes('template')) ||
        workbook.SheetNames[0];
      const sheet = workbook.Sheets[preferredSheet];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

      if (!rawRows || rawRows.length === 0) {
        showBanner('error', 'File Excel kosong atau tidak memiliki baris data yang valid.');
        e.target.value = '';
        return;
      }

      const importedBuckets: KbmTemplateMap = {
        awal: [],
        inti: [],
        penutup: [],
        manajemen: [],
      };
      const baseTs = Date.now();
      let importedCount = 0;

      rawRows.forEach((row, index) => {
        const normalizedMap = new Map<string, string>();
        Object.entries(row).forEach(([k, v]) => {
          normalizedMap.set(k.trim().toLowerCase(), String(v ?? '').trim());
        });

        const rawSection =
          normalizedMap.get('bagian / tahap') ||
          normalizedMap.get('bagian') ||
          normalizedMap.get('tahap') ||
          normalizedMap.get('kelompok') ||
          '';

        const aspek =
          normalizedMap.get('komponen / aspek') ||
          normalizedMap.get('komponen') ||
          normalizedMap.get('aspek') ||
          normalizedMap.get('nama komponen') ||
          '';

        const indikator =
          normalizedMap.get('deskriptor indikator mutu') ||
          normalizedMap.get('indikator') ||
          normalizedMap.get('deskriptor') ||
          normalizedMap.get('indikator mutu') ||
          '';

        const rawSkor =
          normalizedMap.get('skor (1-4)') ||
          normalizedMap.get('skor') ||
          normalizedMap.get('nilai') ||
          '4';
        const parsedScoreNum = Number(rawSkor);
        const validScore =
          !Number.isNaN(parsedScoreNum) && parsedScoreNum >= 1 && parsedScoreNum <= 4
            ? Math.round(parsedScoreNum)
            : 4;

        const catatan =
          normalizedMap.get('catatan khusus') ||
          normalizedMap.get('catatan observasi') ||
          normalizedMap.get('catatan') ||
          '';

        if (!aspek && !indikator) return;

        const sectionKey = parseSectionKey(rawSection || 'B. Kegiatan Inti');
        const newItem: RubricItem = {
          id: `imp-${sectionKey}-${baseTs}-${index}`,
          aspek: aspek || `Aspek Observasi ${index + 1}`,
          indikator: indikator || aspek,
          skor: validScore,
          catatan,
        };
        importedBuckets[sectionKey].push(newItem);
        importedCount++;
      });

      if (importedCount === 0) {
        showBanner(
          'error',
          'Tidak ditemukan kolom "Komponen / Aspek" atau "Deskriptor Indikator Mutu". Silakan gunakan template Excel yang tersedia.'
        );
        e.target.value = '';
        return;
      }

      if (importMode === 'replace') {
        const nextMap: KbmTemplateMap = {
          awal: importedBuckets.awal,
          inti: importedBuckets.inti,
          penutup: importedBuckets.penutup,
          manajemen: importedBuckets.manajemen,
        };
        setTemplateMap(nextMap);
        setAwalScores(nextMap.awal);
        setIntiScores(nextMap.inti);
        setPenutupScores(nextMap.penutup);
        setManajemenScores(nextMap.manajemen);
      } else {
        setTemplateMap((prev) => ({
          awal: [...prev.awal, ...importedBuckets.awal],
          inti: [...prev.inti, ...importedBuckets.inti],
          penutup: [...prev.penutup, ...importedBuckets.penutup],
          manajemen: [...prev.manajemen, ...importedBuckets.manajemen],
        }));
        setAwalScores((prev) => [...prev, ...importedBuckets.awal]);
        setIntiScores((prev) => [...prev, ...importedBuckets.inti]);
        setPenutupScores((prev) => [...prev, ...importedBuckets.penutup]);
        setManajemenScores((prev) => [...prev, ...importedBuckets.manajemen]);
      }

      setIsSaved(false);
      setIsImportModalOpen(false);
      showBanner(
        'success',
        `Berhasil mengimpor ${importedCount} komponen / aspek dari "${file.name}".`
      );
    } catch {
      showBanner('error', 'Gagal membaca file Excel. Pastikan format .xlsx, .xls, atau .csv valid.');
    } finally {
      e.target.value = '';
    }
  };

  // Filtered Modul Ajar documents uploaded by Guru
  const teacherLookup = useMemo(() => {
    const map = new Map<string, Teacher>();
    teachers.forEach((t) => map.set(t.id, t));
    return map;
  }, [teachers]);

  const baseModulDocs = useMemo(
    () => uploadedGuruDocs.filter(isModulAjarDoc),
    [uploadedGuruDocs]
  );

  const uniqueModulTeachersCount = useMemo(
    () => new Set(baseModulDocs.map((d) => d.guruId)).size,
    [baseModulDocs]
  );

  const filteredModulDocs = useMemo(() => {
    const q = modulSearchQuery.trim().toLowerCase();
    return baseModulDocs.filter((doc) => {
      if (modulFilterGuruId !== 'ALL' && doc.guruId !== modulFilterGuruId) return false;
      if (q) {
        const guru = teacherLookup.get(doc.guruId);
        const hay = `${doc.guruNama} ${doc.judulBerkas} ${doc.komponenLabel} ${
          guru?.mapel || ''
        } ${doc.catatanUmpanBalik}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [baseModulDocs, modulFilterGuruId, modulSearchQuery, teacherLookup]);

  const formattedTanggal = (() => {
    try {
      if (!tanggal) return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const dt = new Date(tanggal);
      if (Number.isNaN(dt.getTime())) return tanggal;
      return dt.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return tanggal;
    }
  })();

  // Print Preview Mode
  if (showPrintPreview) {
    return (
      <div className="space-y-6">
        {/* Top Action Bar (Hidden during print) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Pratinjau Cetak Hasil Penilaian Supervisi Pembelajaran
            </h2>
            <p className="text-xs text-gray-500">
              Format dokumen resmi hasil observasi KBM kelas lengkap dengan kop surat sekolah siap cetak / PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <span className="text-xs font-semibold text-gray-700">Guru:</span>
              <select
                value={selectedGuruId}
                onChange={(e) => handleTeacherChange(e.target.value)}
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
              <span>Kembali ke Form Supervisi</span>
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
                  {school.alamat}, Kec. {school.kecamatan}, {school.kabupatenKota}, {school.provinsi}{' '}
                  {school.kodePos}
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
              HASIL PENILAIAN SUPERVISI PELAKSANAAN PEMBELAJARAN (KBM)
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
                <span className="text-gray-600 font-medium">Ruang Kelas / Jam</span>
                <span className="col-span-2 font-semibold text-gray-800">: {kelas || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Topik / Materi Pokok</span>
                <span className="col-span-2 font-semibold text-gray-800">: {materiPokok || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Tanggal Kunjungan</span>
                <span className="col-span-2 font-semibold text-gray-800">: {formattedTanggal}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">Supervisor / Penilai</span>
                <span className="col-span-2 font-semibold text-gray-800">
                  : {school.kepalaSekolah}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border-2 border-emerald-800 bg-emerald-50/40 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                Nilai Akhir KBM
              </span>
              <span className="text-4xl font-black text-emerald-900 my-1">{finalPercentage}</span>
              <span className="px-3 py-0.5 rounded-full bg-emerald-800 text-white text-[11px] font-bold">
                {pred.label}
              </span>
              <span className="text-[10px] text-gray-600 mt-1.5">
                Skor Total: {grandTotal} / {maxPossible} ({totalComponentCount} Aspek)
              </span>
            </div>
          </div>

          {/* Grouped Rubric Table */}
          <div className="mb-5">
            <table className="w-full text-left text-[11px] border border-gray-400">
              <thead className="bg-gray-100 text-gray-900 font-bold uppercase border-b border-gray-400">
                <tr>
                  <th className="py-2 px-2.5 border-r border-gray-400 text-center w-10">No</th>
                  <th className="py-2 px-3 border-r border-gray-400 w-44">Komponen / Aspek</th>
                  <th className="py-2 px-3 border-r border-gray-400">Deskriptor Indikator Mutu</th>
                  <th className="py-2 px-2.5 border-r border-gray-400 text-center w-16">Skor</th>
                  <th className="py-2 px-3 w-44">Catatan Observasi</th>
                </tr>
              </thead>
              <tbody>
                {SECTION_META.map((sec) => {
                  const { items } = getSectionStateAndSetter(sec.key);
                  const subTotal = items.reduce((acc, it) => acc + it.skor, 0);
                  const subMax = items.length * 4;

                  return (
                    <React.Fragment key={sec.key}>
                      <tr className="bg-emerald-50 border-y border-gray-400 font-bold text-emerald-950">
                        <td colSpan={3} className="py-1.5 px-3 border-r border-gray-400 uppercase">
                          {sec.fullTitle}
                        </td>
                        <td className="py-1.5 px-2.5 border-r border-gray-400 text-center">
                          {subTotal}/{subMax}
                        </td>
                        <td className="py-1.5 px-3 text-[10px] text-emerald-800">
                          {items.length} Aspek
                        </td>
                      </tr>
                      {items.length === 0 ? (
                        <tr className="border-b border-gray-300">
                          <td colSpan={5} className="py-2 px-3 text-center text-gray-400 italic">
                            Belum ada komponen pada bagian ini.
                          </td>
                        </tr>
                      ) : (
                        items.map((item, idx) => (
                          <tr key={item.id} className="border-b border-gray-300">
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
                              {item.skor}
                            </td>
                            <td className="py-2 px-3 text-gray-700">{item.catatan || '-'}</td>
                          </tr>
                        ))
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-400">
                <tr>
                  <td colSpan={3} className="py-2 px-3 border-r border-gray-400 text-right uppercase">
                    Jumlah Skor / Nilai Akhir / Predikat
                  </td>
                  <td className="py-2 px-2.5 border-r border-gray-400 text-center">
                    {grandTotal}/{maxPossible}
                  </td>
                  <td className="py-2 px-3 text-emerald-900">
                    {finalPercentage} — {pred.label}
                  </td>
                </tr>
              </tfoot>
            </table>
            <p className="text-[10px] text-gray-500 mt-1.5">
              Keterangan Skala: 1 = Kurang, 2 = Cukup, 3 = Baik, 4 = Amat Baik. Nilai Akhir = (Total
              Skor / Skor Maksimal) × 100.
            </p>
          </div>

          {/* Qualitative Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-xs">
            <div className="p-4 rounded-xl border border-gray-300 bg-gray-50/40">
              <h4 className="font-bold text-gray-900 mb-1">Kelebihan / Praktik Baik Guru:</h4>
              <p className="text-gray-700 leading-relaxed">{catatanKelebihan || '-'}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-300 bg-gray-50/40">
              <h4 className="font-bold text-gray-900 mb-1">
                Area yang Perlu Ditingkatkan / Disempurnakan:
              </h4>
              <p className="text-gray-700 leading-relaxed">{catatanPeningkatan || '-'}</p>
            </div>
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
                  {school.kabupatenKota}, {formattedTanggal}
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

  const renderSection = (sectionKey: KbmSectionKey, title: string) => {
    const { items, setItems } = getSectionStateAndSetter(sectionKey);
    const subTotal = items.reduce((a, b) => a + b.skor, 0);

    return (
      <div
        key={sectionKey}
        className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden"
      >
        <div className="bg-emerald-900/10 px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>{title}</span>
          </h4>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-800">
              Subtotal: {subTotal} / {items.length * 4}
            </span>
            <button
              type="button"
              onClick={() => openAddComponentModal(sectionKey)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
              title="Tambah Komponen / Aspek pada Bagian Ini"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah Aspek</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              Belum ada komponen / aspek pada bagian ini. Klik <strong>Tambah Aspek</strong> untuk
              menambahkan.
            </div>
          ) : (
            items.map((it, idx) => (
              <div
                key={it.id}
                className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-gray-50/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-gray-900">{it.aspek}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 pl-7 leading-relaxed">{it.indikator}</p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 pl-7 lg:pl-0">
                  <input
                    type="text"
                    placeholder="Catatan observasi..."
                    value={it.catatan || ''}
                    onChange={(e) => updateItemNote(setItems, it.id, e.target.value)}
                    className="w-full sm:w-48 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none bg-white"
                  />

                  <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200 shrink-0">
                    {[1, 2, 3, 4].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => updateItemScore(setItems, it.id, score)}
                        className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          it.skor === score
                            ? 'bg-emerald-700 text-white shadow-xs scale-105'
                            : 'text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>

                  <div className="inline-flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditComponentModal(sectionKey, it)}
                      title="Edit Komponen / Aspek"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteComponent(sectionKey, it)}
                      title="Hapus Komponen / Aspek"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Supervisi Pelaksanaan Pembelajaran (KBM Kelas)
          </h2>
          <p className="text-xs text-gray-500">
            Observasi langsung proses belajar mengajar tatap muka berbasis indikator Kurikulum Merdeka
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">Pilih Guru:</span>
            <select
              value={selectedGuruId}
              onChange={(e) => handleTeacherChange(e.target.value)}
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

      {/* Action Toolbar: Tambah Komponen/Aspek, Impor/Export Excel, Template, Unduh & Reset */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900">
              Kelola Komponen / Aspek Observasi &amp; Integrasi Excel
            </h3>
            <p className="text-[11px] text-gray-500">
              Tambah komponen/aspek manual, impor dari template Excel, ekspor hasil supervisi, unduh berkas, atau cetak hasil penilaian.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openAddComponentModal('inti')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#064e3b] hover:bg-[#033c2a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Komponen / Aspek</span>
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
              <div className="absolute right-0 mt-2 w-68 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-30 text-xs">
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
                      Format siap isi untuk impor komponen / aspek KBM
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
                    <div className="font-bold text-gray-900">Unduh Hasil Supervisi (.xlsx)</div>
                    <div className="text-[10px] text-gray-500">
                      Rekap nilai &amp; catatan observasi guru terpilih
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
                      Unduh Daftar Komponen / Aspek (.xlsx)
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Salinan seluruh komponen observasi KBM aktif
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
                      Format resmi dengan kop surat siap cetak / simpan PDF
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleResetDefaultComponents}
            title="Kembalikan komponen / aspek ke standar awal"
            className="inline-flex items-center gap-1 px-2.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

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

      {/* Observation Summary Banner */}
      {currentTeacher && (
        <div className="bg-gradient-to-r from-[#033c2a] via-[#064e3b] to-[#043b2c] p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                Instrumen Observasi Kinerja Guru
              </span>
              <span className="text-xs text-emerald-200">{currentTeacher.mapel}</span>
            </div>
            <h3 className="text-xl font-black mt-1 text-white">
              {currentTeacher.nama}, {currentTeacher.gelar}
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Materi: <span className="font-semibold text-white">{materiPokok}</span> • Kelas:{' '}
              {kelas}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-300">{finalPercentage}</div>
              <div className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">
                Skor KBM
              </div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${pred.color}`}>
                {pred.label}
              </span>
              <div className="text-[10px] text-emerald-200 mt-1">
                {grandTotal} / {maxPossible} Poin ({totalComponentCount} Aspek)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class and Session Metadata */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Tanggal Kunjungan</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => {
              setTanggal(e.target.value);
              setIsSaved(false);
            }}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Ruang Kelas / Jam</label>
          <input
            type="text"
            value={kelas}
            onChange={(e) => {
              setKelas(e.target.value);
              setIsSaved(false);
            }}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block font-semibold text-gray-700 mb-1">Topik / Materi Pokok KBM</label>
          <input
            type="text"
            value={materiPokok}
            onChange={(e) => {
              setMateriPokok(e.target.value);
              setIsSaved(false);
            }}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Rubric Sections */}
      <div className="space-y-5">
        {SECTION_META.map((sec) => renderSection(sec.key, sec.fullTitle))}
      </div>

      {/* Observation Qualitative Notes */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-2 border-b border-gray-100">
          Catatan Lapangan &amp; Rekomendasi Supervisor
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">
                Kelebihan / Praktik Baik Guru:
              </label>
              {onOpenAiAssistant && (
                <button
                  type="button"
                  onClick={onOpenAiAssistant}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer print:hidden"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                  <span>AI Saran</span>
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={catatanKelebihan}
              onChange={(e) => {
                setCatatanKelebihan(e.target.value);
                setIsSaved(false);
              }}
              className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Area yang Perlu Ditingkatkan / Disempurnakan:
            </label>
            <textarea
              rows={3}
              value={catatanPeningkatan}
              onChange={(e) => {
                setCatatanPeningkatan(e.target.value);
                setIsSaved(false);
              }}
              className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 print:hidden">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Hasil observasi KBM berhasil disimpan!
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
              <span>Simpan Hasil Observasi KBM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daftar Modul Ajar yang Telah Diunggah pada Laman Guru + Preview */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden print:hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <h3 className="text-base font-bold text-gray-900">
                Daftar Modul Ajar yang Telah Diunggah Guru
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                {baseModulDocs.length} Modul Ajar • {uniqueModulTeachersCount} Guru
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Menampilkan seluruh Modul Ajar / RPP yang sudah diunggah pada laman Guru oleh masing-masing user lengkap dengan preview untuk melihat modul ajar yang digunakan dalam pembelajaran.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={modulSearchQuery}
                onChange={(e) => setModulSearchQuery(e.target.value)}
                placeholder="Cari modul ajar / guru..."
                className="pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
              />
            </div>

            <select
              aria-label="Filter Guru Pengunggah Modul Ajar"
              value={modulFilterGuruId}
              onChange={(e) => setModulFilterGuruId(e.target.value)}
              className="text-xs font-semibold px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">Semua Guru ({baseModulDocs.length})</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama}, {t.gelar}
                </option>
              ))}
            </select>

            {currentTeacher && modulFilterGuruId !== currentTeacher.id && (
              <button
                type="button"
                onClick={() => setModulFilterGuruId(currentTeacher.id)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
              >
                Fokus: {currentTeacher.nama.split(' ')[0]}
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#064e3b] text-white uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">NO</th>
                <th className="py-3.5 px-4 min-w-[180px]">NAMA GURU &amp; MAPEL</th>
                <th className="py-3.5 px-4 min-w-[150px]">KOMPONEN</th>
                <th className="py-3.5 px-4 min-w-[230px]">JUDUL MODUL AJAR &amp; TANGGAL UNGGAH</th>
                <th className="py-3.5 px-4 whitespace-nowrap">STATUS VERIFIKASI</th>
                <th className="py-3.5 px-4 min-w-[190px]">CATATAN / UMPAN BALIK</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">AKSI PREVIEW</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredModulDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 px-4 text-center text-gray-500">
                    <p className="text-sm font-semibold text-gray-700">
                      Belum ada dokumen Modul Ajar / RPP yang sesuai filter
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Dokumen Modul Ajar yang diunggah oleh masing-masing user guru pada laman Guru akan tampil otomatis di sini.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredModulDocs.map((doc, idx) => {
                  const matchedGuru = teacherLookup.get(doc.guruId);
                  const isActiveTeacher = doc.guruId === selectedGuruId;

                  return (
                    <tr
                      key={doc.id}
                      className={`transition-colors ${
                        isActiveTeacher
                          ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                          : 'hover:bg-gray-50/70'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-gray-500 align-middle">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-gray-900 leading-snug">
                            {doc.guruNama}
                          </span>
                          {isActiveTeacher && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
                              Sedang Dinilai
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {matchedGuru ? `${matchedGuru.mapel} • ` : ''}
                          {doc.tahunAjaran}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-semibold leading-tight">
                          {doc.komponenLabel || doc.komponen}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-bold text-gray-900 leading-snug">{doc.judulBerkas}</div>
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
                          {doc.catatanUmpanBalik || '-'}
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
                            title="Preview Modul Ajar Guru"
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
            Menampilkan {filteredModulDocs.length} dari {baseModulDocs.length} berkas Modul Ajar guru
          </span>
          <span className="text-emerald-800 font-bold uppercase tracking-wide">
            {school.namaSekolah}
          </span>
        </div>
      </div>

      {/* Modal: Tambah / Edit Komponen / Aspek Observasi KBM */}
      {isComponentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="bg-[#064e3b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingItem
                    ? 'Edit Komponen / Aspek Supervisi Pembelajaran'
                    : 'Tambah Komponen / Aspek Supervisi Pembelajaran'}
                </h3>
                <p className="text-[11px] text-emerald-100">
                  Pilih bagian tahap pembelajaran, nama aspek, dan deskriptor indikator KBM
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
                  Bagian / Tahap Pembelajaran *
                </label>
                <select
                  value={compSection}
                  onChange={(e) => setCompSection(e.target.value as KbmSectionKey)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-semibold text-gray-800"
                >
                  {SECTION_META.map((sec) => (
                    <option key={sec.key} value={sec.key}>
                      {sec.fullTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nama Komponen / Aspek *
                </label>
                <input
                  type="text"
                  required
                  value={compAspek}
                  onChange={(e) => setCompAspek(e.target.value)}
                  placeholder="Contoh: Kesesuaian Langkah KBM dengan Modul Ajar"
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
                  placeholder="Tuliskan kriteria observasi atau indikator perilaku guru dan murid di kelas..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Skor Awal Observasi (1 - 4)
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
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Excel Komponen / Aspek Supervisi Pembelajaran */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="bg-[#064e3b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  Impor Komponen / Aspek Supervisi dari Excel
                </h3>
                <p className="text-[11px] text-emerald-100">
                  Unggah file .xlsx / .xls / .csv sesuai format template komponen/aspek KBM
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
                    Unduh template Excel (.xlsx) lengkap dengan kolom Bagian, Aspek, Indikator &amp; contoh pengisian.
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
                    <div className="font-bold">Tambahkan Komponen</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Menambah baris Excel ke bagian KBM terkait
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
                    <div className="font-bold">Ganti Seluruh Komponen</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Mengganti daftar komponen KBM aktif dengan isi Excel
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
                    Kolom: No, Bagian / Tahap, Komponen / Aspek, Deskriptor Indikator Mutu, Skor (1-4), Catatan Khusus
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

      {/* Modal: Preview Modul Ajar Guru */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#064e3b] text-white flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-emerald-200">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{previewDoc.komponenLabel || previewDoc.komponen}</span>
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
                Pratinjau Modul Ajar Google Drive milik <strong>{previewDoc.guruNama}</strong> untuk
                mencocokkan skenario modul ajar dengan pelaksanaan pembelajaran di kelas.
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
