import {
  SchoolProfile,
  Teacher,
  VisitationSchedule,
  TeacherDocumentCheck,
  TelaahAdmRecord,
  TelaahATPRecord,
  TelaahModulRecord,
  PraObservasiRecord,
  SupervisiPembelajaranRecord,
  PascaObservasiRecord,
  SupervisiAsesmenRecord,
  TindakLanjutRecord,
  User,
  AcademicPeriod,
  TeacherPersonalProfile,
} from '../types/supervisi';

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  namaSekolah: 'SMA PLUS UQ AL-MUSTOFA',
  npsn: '69982415',
  nss: '302026012345',
  status: 'Swasta',
  akreditasi: 'A (Unggul)',
  alamat: 'Jl. Pesantren Luhur No. 28, Kompleks Pendidikan Al-Mustofa',
  kelurahan: 'Sukajadi',
  kecamatan: 'Cilodong',
  kabupatenKota: 'Kota Depok',
  provinsi: 'Jawa Barat',
  kodePos: '16413',
  telepon: '(021) 7788-9922',
  email: 'info@smaplusuq-almustofa.sch.id',
  website: 'https://smaplusuq-almustofa.sch.id',
  kepalaSekolah: 'Drs. H. Ahmad Mustofa, M.Pd.',
  nipKepalaSekolah: '197405122000031002',
  pengawasPembina: 'Dra. Hj. Ratna Juwita, M.Si.',
  nipPengawas: '196803151994122001',
  kurikulum: 'Kurikulum Merdeka Mandiri Berbagi',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  periodeStatus: 'Aktif',
  visi: 'Terwujudnya Generasi Qurani yang Unggul dalam Akademik, Berkarakter Luhur, Menguasai Teknologi, dan Berwawasan Global.',
  misi: [
    'Menyelenggarakan pendidikan holistik berbasis nilai Al-Qur\'an dan akhlak mulia.',
    'Menerapkan pembelajaran berdiferensiasi dan inovatif dengan pemanfaatan teknologi digital.',
    'Melaksanakan supervisi akademik berkala untuk penjaminan mutu proses pembelajaran.',
    'Mengembangkan potensi sains, bahasa asing, dan kepemimpinan peserta didik.',
    'Membangun budaya kolaborasi profesional antar pendidik melalui komunitas belajar.'
  ],
  tujuan: [
    'Mencapai tingkat kelulusan 100% dengan rata-rata nilai SNBT dan kedinasan di atas rata-rata nasional.',
    'Semua guru menguasai perencanaan pembelajaran berdiferensiasi dan asesmen Kurikulum Merdeka.',
    'Terlaksananya siklus supervisi akademik klinik yang memberdayakan guru secara berkelanjutan.'
  ]
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Admin',
    nip: '199208152020121004',
    role: 'admin',
    email: 'admin.supervisi@smaplusuq.sch.id',
    title: 'Administrator'
  },
  {
    id: 'user-kepsek',
    name: 'Drs. H. Ahmad Mustofa, M.Pd.',
    nip: '197405122000031002',
    role: 'kepala_sekolah',
    email: 'kepsek@smaplusuq-almustofa.sch.id',
    title: 'Supervisor'
  },
  {
    id: 'guru-1',
    name: 'Siti Nurhaliza, S.Pd.',
    nip: '198904222015032001',
    role: 'guru',
    email: 'siti.nurhaliza@smaplusuq.sch.id',
    subject: 'Fisika',
    title: 'Guru Fisika Fase F'
  },
  {
    id: 'guru-2',
    name: 'Budi Santoso, M.Pd.',
    nip: '198207102008011005',
    role: 'guru',
    email: 'budi.santoso@smaplusuq.sch.id',
    subject: 'Matematika',
    title: 'Guru Matematika Tingkat Lanjut'
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'guru-1',
    nip: '198904222015032001',
    nuptk: '4538767669210082',
    nama: 'Siti Nurhaliza',
    gelar: 'S.Pd.',
    jenisKelamin: 'P',
    mapel: 'Fisika',
    kelas: ['X-1', 'XI MIPA 1', 'XI MIPA 2'],
    statusKepegawaian: 'GTY',
    pendidikanTerakhir: 'S1 Pendidikan Fisika (UPI)',
    telepon: '0812-3456-7890',
    email: 'siti.nurhaliza@smaplusuq.sch.id',
    username: 'siti.nurhaliza',
    password: 'guru1234',
    totalJamMengajar: 24
  },
  {
    id: 'guru-2',
    nip: '198207102008011005',
    nuptk: '1249760662200033',
    nama: 'Budi Santoso',
    gelar: 'M.Pd.',
    jenisKelamin: 'L',
    mapel: 'Matematika',
    kelas: ['X-2', 'XII MIPA 1', 'XII MIPA 2'],
    statusKepegawaian: 'GTY',
    pendidikanTerakhir: 'S2 Pendidikan Matematika (UNJ)',
    telepon: '0813-8899-0011',
    email: 'budi.santoso@smaplusuq.sch.id',
    username: 'budi.santoso',
    password: 'guru1234',
    totalJamMengajar: 26
  },
  {
    id: 'guru-3',
    nip: '199101182019022003',
    nuptk: '7823769671230045',
    nama: 'Farida Kusumastuti',
    gelar: 'S.Pd., M.Hum.',
    jenisKelamin: 'P',
    mapel: 'Bahasa Indonesia',
    kelas: ['X-1', 'X-2', 'XI IPS 1'],
    statusKepegawaian: 'GTY',
    pendidikanTerakhir: 'S2 Linguistik Terapan (UI)',
    telepon: '0857-1122-3344',
    email: 'farida.k@smaplusuq.sch.id',
    username: 'farida.k',
    password: 'guru1234',
    totalJamMengajar: 24
  },
  {
    id: 'guru-4',
    nip: '198506142010011008',
    nuptk: '3341763665200042',
    nama: 'Ustadz Muhammad Faisal',
    gelar: 'Lc., M.Ag.',
    jenisKelamin: 'L',
    mapel: 'PAI & Tahfidz Al-Qur\'an',
    kelas: ['X (Semua)', 'XI (Semua)'],
    statusKepegawaian: 'GTY',
    pendidikanTerakhir: 'S2 Studi Islam (UIN Syarif Hidayatullah)',
    telepon: '0811-9988-7766',
    email: 'faisal.lc@smaplusuq.sch.id',
    username: 'faisal.lc',
    password: 'guru1234',
    totalJamMengajar: 28
  },
  {
    id: 'guru-5',
    nip: '199305202021031002',
    nuptk: '8910771673130099',
    nama: 'Denny Hendrawan',
    gelar: 'S.Kom., Gr.',
    jenisKelamin: 'L',
    mapel: 'Informatika & Koding',
    kelas: ['X-1', 'X-2', 'XI MIPA 1'],
    statusKepegawaian: 'GTY',
    pendidikanTerakhir: 'S1 Teknik Informatika (ITB)',
    telepon: '0878-5544-3322',
    email: 'denny.h@smaplusuq.sch.id',
    username: 'denny.h',
    password: 'guru1234',
    totalJamMengajar: 22
  },
  {
    id: 'guru-6',
    nip: '199012052016082004',
    nuptk: '5642768670220011',
    nama: 'Aisyah Rahmadini',
    gelar: 'S.Pd.',
    jenisKelamin: 'P',
    mapel: 'Bahasa Inggris',
    kelas: ['XI MIPA 1', 'XI IPS 1', 'XII IPS 1'],
    statusKepegawaian: 'GTY',
    pendidikanTerakhir: 'S1 Pendidikan Bahasa Inggris (UNNES)',
    telepon: '0819-2233-4455',
    email: 'aisyah.r@smaplusuq.sch.id',
    username: 'aisyah.r',
    password: 'guru1234',
    totalJamMengajar: 24
  },
  {
    id: 'guru-7',
    nip: '198711122014022005',
    nuptk: '6735765667230088',
    nama: 'Nurul Hidayati',
    gelar: 'S.Si., M.Pd.',
    jenisKelamin: 'P',
    mapel: 'Biologi',
    kelas: ['X-1', 'XI MIPA 2', 'XII MIPA 1'],
    statusKepegawaian: 'GTY',
    pendidikanTerakhir: 'S2 Biologi Terapan (IPB)',
    telepon: '0821-6677-8899',
    email: 'nurul.h@smaplusuq.sch.id',
    username: 'nurul.h',
    password: 'guru1234',
    totalJamMengajar: 24
  },
  {
    id: 'guru-8',
    nip: '198402192009011006',
    nuptk: '2139762664200055',
    nama: 'Hendra Setiawan',
    gelar: 'S.Pd.',
    jenisKelamin: 'L',
    mapel: 'Sejarah & IPS Terpadu',
    kelas: ['X-2', 'XI IPS 1', 'XII IPS 1'],
    statusKepegawaian: 'GTY',
    pendidikanTerakhir: 'S1 Pendidikan Sejarah (UNJ)',
    telepon: '0852-3344-5566',
    email: 'hendra.s@smaplusuq.sch.id',
    username: 'hendra.s',
    password: 'guru1234',
    totalJamMengajar: 24
  }
];

export const INITIAL_VISITATION: VisitationSchedule[] = [
  {
    id: 'vis-1',
    guruId: 'guru-1',
    guruNama: 'Siti Nurhaliza, S.Pd.',
    mapel: 'Fisika',
    kelas: 'XI MIPA 1',
    tanggal: '2026-10-20',
    jamKe: 'Jam ke 3-4 (08.45 - 10.15)',
    supervisor: 'Drs. H. Ahmad Mustofa, M.Pd.',
    fokusObservasi: 'Penerapan model Inquiry Based Learning pada materi Termodinamika & interaksi murid',
    status: 'Selesai',
    catatan: 'Observasi telah selesai dilaksanakan, nilai 92 (Amat Baik).'
  },
  {
    id: 'vis-2',
    guruId: 'guru-2',
    guruNama: 'Budi Santoso, M.Pd.',
    mapel: 'Matematika',
    kelas: 'XII MIPA 2',
    tanggal: '2026-10-22',
    jamKe: 'Jam ke 1-2 (07.00 - 08.30)',
    supervisor: 'Drs. H. Ahmad Mustofa, M.Pd.',
    fokusObservasi: 'Pembelajaran Berdiferensiasi konten & proses pada Integral Tentu',
    status: 'Selesai',
    catatan: 'Dokumentasi kelas lengkap, media interaktif Geogebra berjalan sangat baik.'
  },
  {
    id: 'vis-3',
    guruId: 'guru-3',
    guruNama: 'Farida Kusumastuti, S.Pd., M.Hum.',
    mapel: 'Bahasa Indonesia',
    kelas: 'X-1',
    tanggal: '2026-10-27',
    jamKe: 'Jam ke 5-6 (10.30 - 12.00)',
    supervisor: 'Drs. H. Ahmad Mustofa, M.Pd.',
    fokusObservasi: 'Penguatan Literasi Kritis melalui Teks Argumentasi dan Diskusi Terbimbing',
    status: 'Terjadwal',
    catatan: 'Perangkat ajar telah ditelaah, siap observasi kelas.'
  },
  {
    id: 'vis-4',
    guruId: 'guru-5',
    guruNama: 'Denny Hendrawan, S.Kom., Gr.',
    mapel: 'Informatika & Koding',
    kelas: 'XI MIPA 1',
    tanggal: '2026-10-29',
    jamKe: 'Jam ke 3-4 (08.45 - 10.15)',
    supervisor: 'Drs. H. Ahmad Mustofa, M.Pd.',
    fokusObservasi: 'Praktik Pemrograman Algoritma Python & Pembimbingan Berkelompok di Lab Komputer',
    status: 'Terjadwal',
    catatan: 'Peralatan lab telah dikonfirmasi siap pakai.'
  },
  {
    id: 'vis-5',
    guruId: 'guru-4',
    guruNama: 'Ustadz Muhammad Faisal, Lc., M.Ag.',
    mapel: 'PAI & Tahfidz',
    kelas: 'X-2',
    tanggal: '2026-11-03',
    jamKe: 'Jam ke 2-3 (07.45 - 09.15)',
    supervisor: 'Drs. H. Ahmad Mustofa, M.Pd.',
    fokusObservasi: 'Integrasi Nilai Akhlak Qurani dan Strategi Talaqqi Tartil',
    status: 'Terjadwal'
  }
];

export const INITIAL_PROGRAM_SUPERVISI = {
  judul: 'Program Kerja Supervisi Akademik Tahun Ajaran 2026/2027',
  sekolah: 'SMA Plus UQ Al-Mustofa',
  latarBelakang: 'Supervisi akademik merupakan serangkaian kegiatan membantu guru mengembangkan kemampuannya mengelola proses pembelajaran demi pencapaian tujuan pendidikan di SMA Plus UQ Al-Mustofa secara berkesinambungan.',
  dasarHukum: [
    'UU No. 20 Tahun 2003 tentang Sistem Pendidikan Nasional',
    'UU No. 14 Tahun 2005 tentang Guru dan Dosen',
    'Permendikbudristek No. 16 Tahun 2022 tentang Standar Proses',
    'Permendikbudristek No. 21 Tahun 2022 tentang Standar Penilaian Pendidikan',
    'Kepmendikbudristek No. 262/M/2022 tentang Pedoman Penerapan Kurikulum dalam Rangka Pemulihan Pembelajaran (Kurikulum Merdeka)',
    'Rencana Kerja Jangka Menengah (RKJM) SMA Plus UQ Al-Mustofa 2024-2028'
  ],
  tujuan: [
    'Meningkatkan kompetensi pedagogik dan profesional guru dalam mengimplementasikan Kurikulum Merdeka.',
    'Membantu guru menyusun dokumen perencanaan (ATP, Modul Ajar, Asesmen) yang berpusat pada murid.',
    'Menilai efektivitas proses pembelajaran melalui observasi kelas berbasis indikator observasi kinerja.',
    'Menyediakan layanan coaching dan pembinaan terstruktur bagi guru untuk mengatasi kendala KBM.'
  ],
  tahapan: [
    {
      tahap: '1. Perencanaan & Sosialisasi',
      waktu: 'Bulan Juli - Agustus',
      kegiatan: 'Penyusunan jadwal, pembentukan tim pengembang kurikulum, sosialisasi instrumen supervisi kepada seluruh dewan guru.'
    },
    {
      tahap: '2. Telaah Administrasi & Dokumen',
      waktu: 'Bulan September - Oktober',
      kegiatan: 'Pemeriksaan berkas kalender pendidikan, Prota, Promes, ATP, Modul Ajar, dan instrumen asesmen.'
    },
    {
      tahap: '3. Pra-Observasi & Observasi KBM',
      waktu: 'Bulan Oktober - November',
      kegiatan: 'Wawancara kesepakatan pra-observasi, observasi langsung KBM di kelas, pencatatan fakta pembelajaran.'
    },
    {
      tahap: '4. Pasca-Observasi & Refleksi',
      waktu: 'Bulan November',
      kegiatan: 'Diskusi reflektif, umpan balik konstruktif, penetapan rekomendasi perbaikan.'
    },
    {
      tahap: '5. Pelaporan & Tindak Lanjut',
      waktu: 'Bulan Desember',
      kegiatan: 'Rekapitulasi nilai, rapat evaluasi mutu, penyusunan laporan resmi ke yayasan dan pengawas dinas.'
    }
  ]
};

export const INITIAL_ADMINISTRASI_GURU: TeacherDocumentCheck[] = [
  {
    id: 'doc-1',
    guruId: 'guru-1',
    namaDokumen: 'Alur Tujuan Pembelajaran (ATP)',
    kategori: 'Perencanaan',
    ada: true,
    kualitas: 4,
    catatan: 'Sesuai dengan Capaian Pembelajaran Fase F, alur logis dan terstruktur',
    tanggalPeriksa: '2026-09-18',
    pemeriksa: 'Drs. H. Ahmad Mustofa, M.Pd.'
  },
  {
    id: 'doc-2',
    guruId: 'guru-1',
    namaDokumen: 'Modul Ajar / RPP Berdiferensiasi',
    kategori: 'Perencanaan',
    ada: true,
    kualitas: 4,
    catatan: 'Lengkap dengan asesmen diagnostik, formatif, LKPD, dan materi pengayaan',
    tanggalPeriksa: '2026-09-18',
    pemeriksa: 'Drs. H. Ahmad Mustofa, M.Pd.'
  },
  {
    id: 'doc-3',
    guruId: 'guru-1',
    namaDokumen: 'Program Tahunan (Prota) & Program Semester (Promes)',
    kategori: 'Perencanaan',
    ada: true,
    kualitas: 4,
    catatan: 'Alokasi minggu efektif telah disesuaikan kalender pendidikan sekolah',
    tanggalPeriksa: '2026-09-18',
    pemeriksa: 'Drs. H. Ahmad Mustofa, M.Pd.'
  },
  {
    id: 'doc-4',
    guruId: 'guru-1',
    namaDokumen: 'Jurnal Agenda Mengajar & Presensi Murid',
    kategori: 'Pelaksanaan',
    ada: true,
    kualitas: 3,
    catatan: 'Rutin terisi, perlu ditambahkan catatan khusus siswa inklusi/remedial',
    tanggalPeriksa: '2026-09-18',
    pemeriksa: 'Drs. H. Ahmad Mustofa, M.Pd.'
  },
  {
    id: 'doc-5',
    guruId: 'guru-1',
    namaDokumen: 'Buku Nilai & Rekap Capaian Kriteria Ketercapaian TP (KKTP)',
    kategori: 'Penilaian',
    ada: true,
    kualitas: 4,
    catatan: 'Tercatat digital dengan rubrik deskripsi pencapaian',
    tanggalPeriksa: '2026-09-18',
    pemeriksa: 'Drs. H. Ahmad Mustofa, M.Pd.'
  },
  {
    id: 'doc-6',
    guruId: 'guru-2',
    namaDokumen: 'Alur Tujuan Pembelajaran (ATP)',
    kategori: 'Perencanaan',
    ada: true,
    kualitas: 4,
    catatan: 'Pemetaan capaian sangat sistematis',
    tanggalPeriksa: '2026-09-20',
    pemeriksa: 'Drs. H. Ahmad Mustofa, M.Pd.'
  },
  {
    id: 'doc-7',
    guruId: 'guru-2',
    namaDokumen: 'Modul Ajar / RPP Berdiferensiasi',
    kategori: 'Perencanaan',
    ada: true,
    kualitas: 4,
    catatan: 'Integrasi software GeoGebra sangat inovatif',
    tanggalPeriksa: '2026-09-20',
    pemeriksa: 'Drs. H. Ahmad Mustofa, M.Pd.'
  }
];

export const INITIAL_TELAAH_ADM: TelaahAdmRecord[] = [
  {
    id: 't-adm-1',
    guruId: 'guru-1',
    tanggal: '2026-09-22',
    semester: 'Ganjil',
    tahunAjaran: '2026/2027',
    penilai: 'Drs. H. Ahmad Mustofa, M.Pd.',
    items: [
      { id: '1', aspek: 'Kalender Pendidikan', indikator: 'Kesesuaian dengan kalender pendidikan provinsi dan yayasan', skor: 4, catatan: 'Sangat sesuai' },
      { id: '2', aspek: 'Program Tahunan (Prota)', indikator: 'Kelengkapan format dan alokasi waktu per Capaian Pembelajaran', skor: 4, catatan: 'Perhitungan minggu efektif tepat' },
      { id: '3', aspek: 'Program Semester (Promes)', indikator: 'Distribusi materi dan rencana asesmen berkala per pekan', skor: 4, catatan: 'Jelas dan terstruktur' },
      { id: '4', aspek: 'Capaian Pembelajaran (CP)', indikator: 'Ketepatan pemetaan elemen dan sub-elemen fase', skor: 4, catatan: 'Fase F diturunkan tepat' },
      { id: '5', aspek: 'Tujuan Pembelajaran (TP)', indikator: 'Memuat kompetensi dan lingkup materi dengan kata kerja operasional', skor: 4, catatan: 'Sesuai Taksonomi Bloom revisi' },
      { id: '6', aspek: 'Alur Tujuan Pembelajaran (ATP)', indikator: 'Keruntutan alur logis dari konkret ke abstrak', skor: 4, catatan: 'Sangat baik' },
      { id: '7', aspek: 'Modul Ajar / RPP', indikator: 'Kelengkapan komponen identitas, pemantik, LKPD, rubrik asesmen', skor: 4, catatan: 'Inspiratif' },
      { id: '8', aspek: 'Buku Nilai Siswa', indikator: 'Pencatatan nilai formatif dan sumatif secara transparan', skor: 3, catatan: 'Baik, disarankan tambah portofolio' },
      { id: '9', aspek: 'Jurnal Agenda Kelas', indikator: 'Pencatatan materi, absensi, dan kejadian kelas harian', skor: 4, catatan: 'Tertib dan up to date' },
      { id: '10', aspek: 'Program Remedial & Pengayaan', indikator: 'Rencana tindak lanjut bagi siswa belum tuntas dan pengayaan', skor: 3, catatan: 'Instrumen remedial siap' }
    ],
    totalSkor: 38,
    skorMaksimal: 40,
    nilaiAkhir: 95,
    predikat: 'Amat Baik',
    catatanRekomendasi: 'Administrasi perencanaan pembelajaran Bu Siti Nurhaliza sangat lengkap, terstruktur, dan patut menjadi rujukan guru bidang sains lainnya.'
  },
  {
    id: 't-adm-2',
    guruId: 'guru-2',
    tanggal: '2026-09-24',
    semester: 'Ganjil',
    tahunAjaran: '2026/2027',
    penilai: 'Drs. H. Ahmad Mustofa, M.Pd.',
    items: [
      { id: '1', aspek: 'Kalender Pendidikan', indikator: 'Kesesuaian dengan kalender pendidikan provinsi dan yayasan', skor: 4 },
      { id: '2', aspek: 'Program Tahunan (Prota)', indikator: 'Kelengkapan format dan alokasi waktu per Capaian Pembelajaran', skor: 4 },
      { id: '3', aspek: 'Program Semester (Promes)', indikator: 'Distribusi materi dan rencana asesmen berkala per pekan', skor: 4 },
      { id: '4', aspek: 'Capaian Pembelajaran (CP)', indikator: 'Ketepatan pemetaan elemen dan sub-elemen fase', skor: 4 },
      { id: '5', aspek: 'Tujuan Pembelajaran (TP)', indikator: 'Memuat kompetensi dan lingkup materi dengan kata kerja operasional', skor: 4 },
      { id: '6', aspek: 'Alur Tujuan Pembelajaran (ATP)', indikator: 'Keruntutan alur logis dari konkret ke abstrak', skor: 4 },
      { id: '7', aspek: 'Modul Ajar / RPP', indikator: 'Kelengkapan komponen identitas, pemantik, LKPD, rubrik asesmen', skor: 4 },
      { id: '8', aspek: 'Buku Nilai Siswa', indikator: 'Pencatatan nilai formatif dan sumatif secara transparan', skor: 4 },
      { id: '9', aspek: 'Jurnal Agenda Kelas', indikator: 'Pencatatan materi, absensi, dan kejadian kelas harian', skor: 3 },
      { id: '10', aspek: 'Program Remedial & Pengayaan', indikator: 'Rencana tindak lanjut bagi siswa belum tuntas dan pengayaan', skor: 3 }
    ],
    totalSkor: 38,
    skorMaksimal: 40,
    nilaiAkhir: 95,
    predikat: 'Amat Baik',
    catatanRekomendasi: 'Kualitas administrasi sangat prima, modul pembelajaran matematika terintegrasi dengan pemecahan masalah kontekstual.'
  }
];

export const INITIAL_SUPERVISI_KBM: SupervisiPembelajaranRecord[] = [
  {
    id: 'sup-kbm-1',
    guruId: 'guru-1',
    tanggal: '2026-10-20',
    kelas: 'XI MIPA 1',
    mapel: 'Fisika',
    materiPokok: 'Hukum Termodinamika & Efisiensi Mesin Carnot',
    penilai: 'Drs. H. Ahmad Mustofa, M.Pd.',
    kegiatanAwal: [
      { id: 'a1', aspek: 'Apersepsi & Doa', indikator: 'Menyiapkan peserta didik secara psikis dan fisik mengawali pembelajaran', skor: 4, catatan: 'Diawali doa, tadarus singkat, cek kehadiran ramah' },
      { id: 'a2', aspek: 'Pertanyaan Pemantik', indikator: 'Mengajukan pertanyaan yang mengaitkan pengetahuan sebelumnya dengan materi', skor: 4, catatan: 'Menampilkan fenomena kulkas & mesin motor' },
      { id: 'a3', aspek: 'Penyampaian Tujuan', indikator: 'Menjelaskan tujuan pembelajaran dan skenario kegiatan hari ini', skor: 4, catatan: 'Murid mencatat tujuan dan kriteria keberhasilan' }
    ],
    kegiatanInti: [
      { id: 'i1', aspek: 'Penguasaan Materi', indikator: 'Menunjukkan pemahaman konsep yang mendalam dan bebas miskonsepsi', skor: 4, catatan: 'Konsep entropi dan kalor dijelaskan sangat gamblang' },
      { id: 'i2', aspek: 'Penerapan Model Inovatif', indikator: 'Melaksanakan tahapan model pembelajaran (Problem/Project/Inquiry Based)', skor: 4, catatan: 'Inquiry based lab simulation berjalan aktif' },
      { id: 'i3', aspek: 'Diferensiasi Pembelajaran', indikator: 'Memberikan bantuan berjenjang (scaffolding) sesuai kesiapan belajar murid', skor: 3, catatan: 'Kelompok mahir mandiri, kelompok awal dipandu LKPD bergambar' },
      { id: 'i4', aspek: 'Pemanfaatan Media/TIK', indikator: 'Menggunakan proyektor, simulasi PhET / aplikasi interaktif', skor: 4, catatan: 'Simulasi PhET Fisika interaktif digunakan efektif di layar lebar' },
      { id: 'i5', aspek: 'Keterlibatan Aktif Siswa', indikator: 'Mendorong murid bertanya, berdiskusi, dan mempresentasikan temuan', skor: 4, catatan: 'Suasana kelas hidup, hampir seluruh kelompok aktif bicara' }
    ],
    kegiatanPenutup: [
      { id: 'p1', aspek: 'Penyimpulan Bersama', indikator: 'Memfasilitasi murid merangkum intisari materi pembelajaran', skor: 4, catatan: 'Murid menyimpulkan persamaan efisiensi' },
      { id: 'p2', aspek: 'Asesmen Formatif', indikator: 'Melakukan kuis singkat / exit ticket pengukur ketercapaian', skor: 4, catatan: 'Quizizz singkat 5 soal menguji konsep' },
      { id: 'p3', aspek: 'Refleksi & Doa Penutup', indikator: 'Melakukan refleksi bersama dan menginformasikan rencana pertemuan berikutnya', skor: 3, catatan: 'Refleksi lisan sangat baik, salam penutup ramah' }
    ],
    manajemenKelas: [
      { id: 'm1', aspek: 'Suasana Positif', indikator: 'Menciptakan iklim kelas yang aman, menghargai, dan kondusif', skor: 4, catatan: 'Saling respek tinggi' },
      { id: 'm2', aspek: 'Pengelolaan Waktu', indikator: 'Penggunaan alokasi 90 menit berjalan tepat waktu dan efisien', skor: 4, catatan: 'Pacing sangat teratur' }
    ],
    totalSkor: 50,
    nilaiAkhir: 96,
    predikat: 'Amat Baik',
    catatanKelebihan: 'Bu Siti sangat menguasai pedagogi sains modern. Menggunakan simulasi digital dengan sangat interaktif. Keterlibatan murid mencapai lebih dari 90%.',
    catatanPeningkatan: 'Bisa ditingkatkan pada dokumentasi lembar refleksi tertulis murid untuk portofolio asesmen berkelanjutan.'
  }
];

export const INITIAL_PRA_OBSERVASI: PraObservasiRecord[] = [
  {
    id: 'pra-1',
    guruId: 'guru-1',
    tanggal: '2026-10-18',
    tujuanPembelajaran: 'Peserta didik mampu menganalisis hubungan usaha, kalor, dan hukum termodinamika serta menghitung efisiensi mesin Carnot melalui percobaan virtual simulasi PhET.',
    areaFokusPengembangan: 'Peningkatan keterlibatan murid pasif dan penerapan scaffolding pada lembar kerja berdiferensiasi.',
    strategiPembelajaran: 'Model Guided Inquiry Learning dipadukan simulasi virtual interaktif PhET Colorado dan kuis formatif interaktif Quizizz.',
    mediaAlatBantu: 'Laptop, Smart TV/Proyektor, LKPD Berdiferensiasi, Simulasi PhET Termodinamika, Smartphone siswa untuk Quizizz.',
    kesepakatanFokus: [
      'Observasi interaksi antar anggota kelompok saat analisis data simulasi',
      'Observasi efektivitas pertanyaan pemantik di awal kegiatan',
      'Pengelolaan alokasi waktu presentasi kelompok'
    ],
    waktuPelaksanaan: 'Selasa, 20 Oktober 2026, Pukul 08.45 - 10.15 WIB (Kelas XI MIPA 1)',
    catatanSupervisor: 'Rancangan pembelajaran sangat matang, instrumen lembar observasi siap digunakan.',
    status: 'Disepakati'
  },
  {
    id: 'pra-2',
    guruId: 'guru-3',
    tanggal: '2026-10-24',
    tujuanPembelajaran: 'Peserta didik mampu menyusun teks argumentasi kritis berbasis data dan fakta tentang pelestarian lingkungan hidup dengan kaidah kebahasaan baku.',
    areaFokusPengembangan: 'Keterampilan bertanya tingkat tinggi (HOTS) dan teknik pembimbingan peer review.',
    strategiPembelajaran: 'Problem Based Learning berbasis studi kasus berita faktual dan debat argumen konstruktif.',
    mediaAlatBantu: 'Artikel berita aktual, lembar kerja analisis argumen, lembar telaah sejawat.',
    kesepakatanFokus: [
      'Pemberian umpan balik langsung pada draf tulisan siswa',
      'Manajemen waktu sesi adu argumen'
    ],
    waktuPelaksanaan: 'Senin, 27 Oktober 2026, Pukul 10.30 - 12.00 WIB (Kelas X-1)',
    catatanSupervisor: 'Tujuan pembelajaran sangat kontekstual dengan tema kepedulian lingkungan.',
    status: 'Disepakati'
  }
];

export const INITIAL_PASCA_OBSERVASI: PascaObservasiRecord[] = [
  {
    id: 'pasca-1',
    guruId: 'guru-1',
    tanggal: '2026-10-21',
    refleksiGuru: 'Saya merasa sangat bersyukur karena sebagian besar murid sangat antusias ketika memanipulasi variabel suhu dan volume pada simulasi virtual PhET. Namun, kelompok 4 sempat tertinggal di bagian penurunan rumus matematis efisiensi.',
    aspekTercapai: 'Pemahaman konsep dasar siklus Carnot dan hukum pertama termodinamika tercapai dengan skor rata-rata kuis 88. Suasana diskusi aktif dan terarah.',
    aspekBelumTercapai: 'Waktu untuk sesi refleksi akhir sedikit terburu-buru (tersisa 5 menit) karena antusiasme siswa saat presentasi kelompok melebihi estimasi.',
    umpanBalikSupervisor: 'Secara keseluruhan luar biasa! Cara mengajar Bu Siti sangat komunikatif, hangat, dan mendorong nalar kritis murid. Penguasaan kelas dan media simulasi sangat memukau.',
    rencanaPerbaikan: 'Menetapkan batasan waktu presentasi tiap kelompok maksimal 3 menit dengan timer visual agar alokasi refleksi penutup tetap leluasa.',
    kesepakatanBersama: 'Mempertahankan konsistensi diferensiasi dan berbagi best practice pembelajaran sains digital pada forum MGMP sekolah.',
    rekomendasiTindakLanjut: 'Disarankan menjadi narasumber tutor sebaya dalam pelatihan Pemanfaatan PhET Simulation untuk dewan guru SMA Plus UQ Al-Mustofa.'
  }
];

export const INITIAL_TINDAK_LANJUT: TindakLanjutRecord[] = [
  {
    id: 'tl-1',
    guruId: 'guru-1',
    hasilSupervisiSkor: 96,
    bentukTindakLanjut: 'Peer Tutoring (Tutor Sebaya)',
    uraianKegiatan: 'Menjadi pemateri dan pembimbing bagi rekan guru rumpun sains dalam workshop pembuatan Modul Ajar Berdiferensiasi dan Media Digital.',
    tenggatWaktu: '2026-11-15',
    penanggungJawab: 'Wakasek Kurikulum & Kepala Sekolah',
    status: 'Sedang Berjalan',
    hasilEvaluasi: 'Materi workshop telah disiapkan dan draf paparan disetujui Kepala Sekolah.'
  },
  {
    id: 'tl-2',
    guruId: 'guru-2',
    hasilSupervisiSkor: 95,
    bentukTindakLanjut: 'Workshop MGMP',
    uraianKegiatan: 'Mengikuti workshop penguatan asesmen berbasis penalaran tingkat tinggi (AKM & SNBT) tingkat Kota Depok.',
    tenggatWaktu: '2026-11-20',
    penanggungJawab: 'Koordinator MGMP Matematika',
    status: 'Rencana'
  },
  {
    id: 'tl-3',
    guruId: 'guru-8',
    hasilSupervisiSkor: 82,
    bentukTindakLanjut: 'Bimbingan Teknis Individu',
    uraianKegiatan: 'Pendampingan khusus oleh pengawas pembina terkait penyusunan rubrik asesmen autentik dan instrumen observasi minat belajar murid.',
    tenggatWaktu: '2026-11-10',
    penanggungJawab: 'Drs. H. Ahmad Mustofa, M.Pd.',
  status: 'Sedang Berjalan'
  }
];

export const INITIAL_TIMELINE_SUPERVISI = [
  {
    id: 'tl-sup-1',
    tahap: 'Tahap 1: Persiapan & Sosialisasi Instrumen',
    periode: 'Juli - Agustus 2026',
    tanggalMulai: '2026-07-15',
    tanggalSelesai: '2026-08-25',
    penanggungJawab: 'Kepala Sekolah & Wakasek Kurikulum',
    status: 'Selesai' as const,
    deskripsi: 'Penyusunan tim supervisi internal, kalender kerja, serta sosialisasi instrumen Kurikulum Merdeka kepada dewan guru.',
    kegiatan: [
      'Pembentukan Tim Supervisi Internal SMA Plus UQ Al-Mustofa',
      'Sosialisasi Instrumen Supervisi Kurikulum Merdeka kepada seluruh dewan guru',
      'Penetapan jadwal visitasi kelas semester ganjil'
    ],
    targetTab: 'program_supervisi'
  },
  {
    id: 'tl-sup-2',
    tahap: 'Tahap 2: Pemeriksaan Administrasi & Dokumen Kurikulum',
    periode: 'September 2026',
    tanggalMulai: '2026-09-01',
    tanggalSelesai: '2026-09-30',
    penanggungJawab: 'Tim Pengembang Kurikulum',
    status: 'Selesai' as const,
    deskripsi: 'Verifikasi kelengkapan perangkat ajar guru meliputi Kalender Pendidikan, Prota, Promes, ATP, dan Modul Ajar.',
    kegiatan: [
      'Pemeriksaan berkas Prota, Promes, dan Kalender Pendidikan',
      'Verifikasi Alur Tujuan Pembelajaran (ATP) Fase E dan F',
      'Validasi Modul Ajar dan integrasi pembelajaran berdiferensiasi'
    ],
    targetTab: 'administrasi_guru'
  },
  {
    id: 'tl-sup-3',
    tahap: 'Tahap 3: Pelaksanaan Visitasi & Observasi KBM Kelas',
    periode: 'Oktober - November 2026',
    tanggalMulai: '2026-10-05',
    tanggalSelesai: '2026-11-15',
    penanggungJawab: 'Drs. H. Ahmad Mustofa, M.Pd.',
    status: 'Sedang Berjalan' as const,
    deskripsi: 'Kunjungan langsung ke ruang kelas sesuai jadwal visitasi untuk mengamati keterlibatan siswa dan efektivitas KBM.',
    kegiatan: [
      'Koordinasi kesepakatan pra-observasi dan fokus pengamatan',
      'Observasi langsung proses belajar mengajar di ruang kelas',
      'Pencatatan instrumen dan dokumentasi hasil pengamatan'
    ],
    targetTab: 'jadwal_visitasi'
  },
  {
    id: 'tl-sup-4',
    tahap: 'Tahap 4: Rekapitulasi Nilai & Tindak Lanjut Pembinaan',
    periode: 'November 2026',
    tanggalMulai: '2026-11-16',
    tanggalSelesai: '2026-11-30',
    penanggungJawab: 'Kepala Sekolah & Koordinator MGMP',
    status: 'Mendatang' as const,
    deskripsi: 'Pengolahan skor hasil supervisi, penetapan predikat mutu, serta pelaksanaan program tindak lanjut (Bimtek / Tutor Sebaya).',
    kegiatan: [
      'Rekapitulasi nilai administrasi, KBM, dan asesmen guru',
      'Penyusunan matriks Rencana Tindak Lanjut (RTL) pembinaan',
      'Pelaksanaan peer tutoring dan workshop MGMP internal'
    ],
    targetTab: 'tindak_lanjut'
  },
  {
    id: 'tl-sup-5',
    tahap: 'Tahap 5: Pelaporan Resmi & Evaluasi Mutu Semester',
    periode: 'Desember 2026',
    tanggalMulai: '2026-12-01',
    tanggalSelesai: '2026-12-18',
    penanggungJawab: 'Admin & Kepala Sekolah',
    status: 'Mendatang' as const,
    deskripsi: 'Penyusunan dan pengesahan laporan akhir hasil supervisi akademik untuk diserahkan kepada Yayasan dan Pengawas Pembina.',
    kegiatan: [
      'Finalisasi dokumen laporan resmi supervisi akademik',
      'Pengesahan oleh Kepala Sekolah dan Pengawas Pembina',
      'Rapat evaluasi akhir semester bersama seluruh dewan guru'
    ],
    targetTab: 'laporan_supervisi'
  }
];

export const INITIAL_PROGRAM_DOCUMENTS = [
  {
    id: 'prog-doc-1',
    kategori: 'PROGRAM TAHUNAN' as const,
    tanggal: '2024-07-20',
    judul: 'Program Tahunan Supervisi Akademik TP 2024/2025',
    deskripsi: 'Pedoman umum pelaksanaan supervisi akademik semester ganjil dan genap untuk seluruh pendidik.',
    driveLink: 'https://drive.google.com/file/d/1x9kL2mP8qR5vN7wY4zT3_Program_Tahunan_Supervisi/view',
    oleh: 'Admin Kurikulum',
  },
  {
    id: 'prog-doc-2',
    kategori: 'PANDUAN OPERASIONAL' as const,
    tanggal: '2024-08-01',
    judul: 'Panduan Operasional Instrumen Supervisi Kurikulum Merdeka',
    deskripsi: 'Petunjuk teknis pengisian rubrik telaah modul ajar, ATP, observasi kelas, dan asesmen formatif.',
    driveLink: 'https://drive.google.com/file/d/2a8bC3dE4fG5hI6jK7lM9_Panduan_Operasional_KM/view',
    oleh: 'Supervisor',
  },
  {
    id: 'prog-doc-3',
    kategori: 'SK TIM SUPERVISI' as const,
    tanggal: '2024-07-22',
    judul: 'SK Tim Supervisi Akademik & Penilai Kinerja Guru',
    deskripsi: 'Surat Keputusan Kepala Sekolah tentang penetapan struktur tim pelaksana supervisi internal sekolah.',
    driveLink: 'https://drive.google.com/file/d/3p4qR5sT6uV7wX8yZ9aB0_SK_Tim_Supervisi_PKG/view',
    oleh: 'Kepala Satuan Pendidikan',
  },
  {
    id: 'prog-doc-4',
    kategori: 'KALENDER AKADEMIK' as const,
    tanggal: '2024-08-10',
    judul: 'Kalender & Matriks Jadwal Supervisi Semester Ganjil',
    deskripsi: 'Pemetaan minggu efektif pelaksanaan pra-observasi, kunjungan kelas, dan evaluasi tindak lanjut.',
    driveLink: 'https://drive.google.com/file/d/4c5dE6fG7hI8jK9lM0nO1_Kalender_Matriks_Jadwal/view',
    oleh: 'Admin Kurikulum',
  },
];

export const INITIAL_GURU_UPLOADED_DOCS = [
  {
    id: 'gdoc-1',
    guruId: 'guru-1',
    guruNama: 'Siti Nurhaliza, S.Pd.',
    tahunAjaran: 'TA 2026/2027',
    komponen: 'Program Tahunan' as const,
    komponenLabel: 'Program Tahunan (Prota)',
    judulBerkas: 'Program Tahunan Fisika Fase F Kelas XI',
    tanggalUnggah: '2026-09-12',
    driveLink: 'https://drive.google.com/file/d/1ProtaFisikaFaseF_SitiNurhaliza/view',
    statusVerifikasi: 'Terverifikasi Sesuai' as const,
    catatanUmpanBalik: 'Struktur alokasi waktu dan pembagian pekan efektif sudah sangat rapi.',
    verifikator: 'Drs. H. Ahmad Mustofa, M.Pd.',
    tanggalVerifikasi: '2026-09-18',
  },
  {
    id: 'gdoc-2',
    guruId: 'guru-1',
    guruNama: 'Siti Nurhaliza, S.Pd.',
    tahunAjaran: 'TA 2026/2027',
    komponen: 'Alur Tujuan Pembelajaran' as const,
    komponenLabel: 'Alur Tujuan Pembelajaran (ATP)',
    judulBerkas: 'Alur Tujuan Pembelajaran (ATP) Termodinamika & Gelombang',
    tanggalUnggah: '2026-09-14',
    driveLink: 'https://drive.google.com/file/d/1ATPFisikaFaseF_SitiNurhaliza/view',
    statusVerifikasi: 'Terverifikasi Sesuai' as const,
    catatanUmpanBalik: 'Keterkaitan CP ke TP tersusun secara spiral dan sistematis.',
    verifikator: 'Drs. H. Ahmad Mustofa, M.Pd.',
    tanggalVerifikasi: '2026-09-18',
  },
  {
    id: 'gdoc-3',
    guruId: 'guru-2',
    guruNama: 'Budi Santoso, M.Pd.',
    tahunAjaran: 'TA 2026/2027',
    komponen: 'Modul Ajar / RPP' as const,
    komponenLabel: 'Modul Ajar / RPP',
    judulBerkas: 'Modul Ajar Berdiferensiasi Integral Tentu & GeoGebra',
    tanggalUnggah: '2026-09-16',
    driveLink: 'https://drive.google.com/file/d/1ModulAjarIntegral_BudiSantoso/view',
    statusVerifikasi: 'Terverifikasi Sesuai' as const,
    catatanUmpanBalik: 'Integrasi media GeoGebra dan asesmen formatif sangat inovatif.',
    verifikator: 'Drs. H. Ahmad Mustofa, M.Pd.',
    tanggalVerifikasi: '2026-09-20',
  },
  {
    id: 'gdoc-4',
    guruId: 'guru-3',
    guruNama: 'Farida Kusumastuti, S.Pd., M.Hum.',
    tahunAjaran: 'TA 2026/2027',
    komponen: 'Kriteria Ketuntasan Tujuan Pembelajaran' as const,
    komponenLabel: 'Kriteria Ketuntasan Tujuan Pembelajaran (KKTP)',
    judulBerkas: 'Rubrik KKTP Teks Argumentasi Kelas X Fase E',
    tanggalUnggah: '2026-09-19',
    driveLink: 'https://drive.google.com/file/d/1KKTPBahasaIndonesia_Farida/view',
    statusVerifikasi: 'Menunggu Verifikasi' as const,
    catatanUmpanBalik: 'Menunggu pemeriksaan oleh tim verifikator.',
  },
  {
    id: 'gdoc-5',
    guruId: 'guru-4',
    guruNama: 'Ustadz Muhammad Faisal, Lc., M.Ag.',
    tahunAjaran: 'TA 2026/2027',
    komponen: 'Modul Ajar / RPP' as const,
    komponenLabel: 'Modul Ajar / RPP',
    judulBerkas: 'Modul Ajar PAI & Integrasi Tahfidz Al-Qur\'an Fase E',
    tanggalUnggah: '2026-09-21',
    driveLink: 'https://drive.google.com/file/d/1ModulPAITahfidz_UstadzFaisal/view',
    statusVerifikasi: 'Terverifikasi Sesuai' as const,
    catatanUmpanBalik: 'Muatan akhlak Qurani terintegrasi dengan sangat baik dalam aktivitas.',
    verifikator: 'Drs. H. Ahmad Mustofa, M.Pd.',
    tanggalVerifikasi: '2026-09-24',
  },
];

export const INITIAL_LAPORAN_DOCUMENTS = [
  {
    id: 'lap-doc-1',
    kategori: 'LAPORAN SEMESTER' as const,
    tanggal: '2026-10-16',
    judul: 'Laporan Akhir Hasil Supervisi Akademik Semester Ganjil TP 2026/2027',
    deskripsi: 'Dokumen laporan komprehensif hasil supervisi perencanaan, pelaksanaan KBM, dan asesmen seluruh dewan guru.',
    driveLink: 'https://drive.google.com/file/d/1LaporanAkhirSupervisi_Ganjil2026/view',
    oleh: 'Admin Kurikulum',
  },
  {
    id: 'lap-doc-2',
    kategori: 'REKAPITULASI NILAI' as const,
    tanggal: '2026-10-18',
    judul: 'Rekapitulasi Nilai & Predikat Mutu Kinerja Guru',
    deskripsi: 'Matriks capaian skor telaah administrasi, ATP, modul ajar, observasi kelas, dan asesmen per mata pelajaran.',
    driveLink: 'https://drive.google.com/file/d/1RekapNilaiMutuGuru_2026/view',
    oleh: 'Supervisor',
  },
  {
    id: 'lap-doc-3',
    kategori: 'LAPORAN TINDAK LANJUT' as const,
    tanggal: '2026-10-20',
    judul: 'Laporan Pelaksanaan Tindak Lanjut & Pembinaan Guru (RTL)',
    deskripsi: 'Dokumentasi hasil pendampingan bimtek individu, workshop MGMP, dan program peer tutoring.',
    driveLink: 'https://drive.google.com/file/d/1LaporanTindakLanjut_Supervisi2026/view',
    oleh: 'Kepala Sekolah',
  },
];

export const INITIAL_CERTIFICATE_SETTINGS = {
  tempatTerbit: 'Sumedang',
  tanggalTerbit: '',
  penandatangan: 'Abdul Rohman, S.Pd., Gr.',
  nuptkPenandatangan: '1460766667130123',
  penyelenggara: 'SMA Plus Ulumul Qur\'an Al-Mustofa',
};

export const INITIAL_CERTIFICATES = [
  { guruId: 'guru-1', nomorSertifikat: '421.3/001/SERT-SUP/SMA-UQ/2026' },
  { guruId: 'guru-2', nomorSertifikat: '421.3/002/SERT-SUP/SMA-UQ/2026' },
];

export const INITIAL_ACADEMIC_PERIODS: AcademicPeriod[] = [
  { id: 'ap-1', tahunAjaran: '2025/2026', semester: 'Ganjil', status: 'Off' },
  { id: 'ap-2', tahunAjaran: '2025/2026', semester: 'Genap', status: 'Off' },
  { id: 'ap-3', tahunAjaran: '2026/2027', semester: 'Ganjil', status: 'Aktif' },
  { id: 'ap-4', tahunAjaran: '2026/2027', semester: 'Genap', status: 'Off' },
];

export const INITIAL_TEACHER_PROFILES: TeacherPersonalProfile[] = [
  {
    guruId: 'guru-1',
    tempatTanggalLahir: 'Bandung, 22 April 1989',
    jenisKelamin: 'Perempuan',
    pendidikanTerakhir: 'S1 Pendidikan Fisika (UPI)',
    nuptk: '4538767669210082',
    noRekening: '1340018294012',
    namaBank: 'Bank Mandiri',
    tempatTugas: 'SMA PLUS UQ AL-MUSTOFA',
    tanggalMulaiTugas: '2015-07-01',
    masaKerja: '11 Tahun',
    alamat: 'Jl. Pesantren Luhur No. 14, Sukajadi, Cilodong, Kota Depok',
    nomorHandphone: '0812-3456-7890',
    email: 'siti.nurhaliza@smaplusuq.sch.id',
    visi: 'Menjadi pendidik fisika yang menginspirasi peserta didik berpikir ilmiah, kritis, dan berakhlak Qurani.',
    misi: 'Mengembangkan pembelajaran fisika kontekstual berbasis eksperimen dan teknologi digital.',
    mottoHidup: 'Mendidik dengan hati, menginspirasi dengan keteladanan.',
  },
];

// Helper to load/save from localStorage
export const STORAGE_KEYS = {
  PROFILE: 'super_guru_profile',
  TEACHERS: 'super_guru_teachers',
  TEACHER_PROFILES: 'super_guru_teacher_profiles',
  VISITATION: 'super_guru_visitation',
  DOCUMENTS: 'super_guru_documents',
  GURU_UPLOADED_DOCS: 'super_guru_uploaded_guru_docs',
  TELAAH_ADM: 'super_guru_telaah_adm',
  SUPERVISI_KBM: 'super_guru_supervisi_kbm',
  PRA_OBSERVASI: 'super_guru_pra_observasi',
  PASCA_OBSERVASI: 'super_guru_pasca_observasi',
  TINDAK_LANJUT: 'super_guru_tindak_lanjut',
  TIMELINE_SUPERVISI: 'super_guru_timeline_supervisi',
  PROGRAM_DOCS: 'super_guru_program_docs',
  LAPORAN_DOCS: 'super_guru_laporan_docs',
  CERTIFICATES: 'super_guru_certificates',
  CERTIFICATE_SETTINGS: 'super_guru_certificate_settings',
  ACADEMIC_PERIODS: 'super_guru_academic_periods',
  ACTIVE_USER: 'super_guru_active_user'
};

export function getStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load from localStorage', e);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}
