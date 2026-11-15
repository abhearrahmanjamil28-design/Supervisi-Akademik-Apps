export type UserRole = 'admin' | 'kepala_sekolah' | 'guru';

export interface User {
  id: string;
  name: string;
  nip?: string;
  role: UserRole;
  email: string;
  avatar?: string;
  subject?: string;
  title: string;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  nss: string;
  status: 'Swasta' | 'Negeri';
  akreditasi: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  pengawasPembina: string;
  nipPengawas: string;
  kurikulum: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  periodeStatus?: 'Aktif' | 'Off';
  visi: string;
  misi: string[];
  tujuan: string[];
}

export interface Teacher {
  id: string;
  nip: string;
  nuptk: string;
  nama: string;
  gelar: string;
  jenisKelamin: 'L' | 'P';
  mapel: string;
  kelas: string[];
  statusKepegawaian: 'GTY' | 'GTT' | 'PNS' | 'PPPK';
  pendidikanTerakhir: string;
  telepon: string;
  email: string;
  username?: string;
  password?: string;
  totalJamMengajar: number;
  foto?: string;
}

export interface VisitationSchedule {
  id: string;
  guruId: string;
  guruNama: string;
  mapel: string;
  kelas: string;
  tanggal: string;
  jamKe: string;
  supervisor: string;
  fokusObservasi: string;
  status: 'Terjadwal' | 'Sedang Berlangsung' | 'Selesai' | 'Ditunda';
  catatan?: string;
}

export interface TeacherDocumentCheck {
  id: string;
  guruId: string;
  namaDokumen: string;
  kategori: 'Perencanaan' | 'Pelaksanaan' | 'Penilaian';
  ada: boolean;
  kualitas: 1 | 2 | 3 | 4; // 1: Kurang, 2: Cukup, 3: Baik, 4: Sangat Baik
  catatan: string;
  tanggalPeriksa: string;
  pemeriksa: string;
}

export interface RubricItem {
  id: string;
  aspek: string;
  indikator: string;
  skor: number; // 1 - 4
  catatan?: string;
}

export interface TelaahAdmRecord {
  id: string;
  guruId: string;
  tanggal: string;
  semester: 'Ganjil' | 'Genap';
  tahunAjaran: string;
  penilai: string;
  items: RubricItem[];
  totalSkor: number;
  skorMaksimal: number;
  nilaiAkhir: number;
  predikat: 'Amat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  catatanRekomendasi: string;
}

export interface TelaahATPRecord {
  id: string;
  guruId: string;
  tanggal: string;
  mapel: string;
  faseKelas: string;
  penilai: string;
  items: RubricItem[];
  totalSkor: number;
  skorMaksimal: number;
  nilaiAkhir: number;
  predikat: 'Amat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  catatan: string;
}

export interface TelaahModulRecord {
  id: string;
  guruId: string;
  tanggal: string;
  mapel: string;
  topikModul: string;
  penilai: string;
  items: RubricItem[];
  totalSkor: number;
  nilaiAkhir: number;
  predikat: 'Amat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  catatan: string;
}

export interface PraObservasiQuestion {
  id: string;
  pertanyaan: string;
  placeholder?: string;
  fieldKey?:
    | 'tujuanPembelajaran'
    | 'areaFokusPengembangan'
    | 'strategiPembelajaran'
    | 'mediaAlatBantu';
}

export interface PraObservasiRecord {
  id: string;
  guruId: string;
  tanggal: string;
  tujuanPembelajaran: string;
  areaFokusPengembangan: string;
  strategiPembelajaran: string;
  mediaAlatBantu: string;
  kesepakatanFokus: string[];
  waktuPelaksanaan: string;
  catatanSupervisor: string;
  status: 'Draf' | 'Disepakati';
  customAnswers?: Record<string, string>;
  submittedByGuru?: boolean;
  submittedAt?: string;
  agreedAt?: string;
}

export interface SupervisiPembelajaranRecord {
  id: string;
  guruId: string;
  tanggal: string;
  kelas: string;
  mapel: string;
  materiPokok: string;
  penilai: string;
  kegiatanAwal: RubricItem[];
  kegiatanInti: RubricItem[];
  kegiatanPenutup: RubricItem[];
  manajemenKelas: RubricItem[];
  totalSkor: number;
  nilaiAkhir: number;
  predikat: 'Amat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  catatanKelebihan: string;
  catatanPeningkatan: string;
}

export interface PascaObservasiQuestion {
  id: string;
  section: 'refleksi_guru' | 'umpan_balik_supervisor';
  pertanyaan: string;
  placeholder?: string;
  fieldKey?:
    | 'refleksiGuru'
    | 'aspekTercapai'
    | 'aspekBelumTercapai'
    | 'umpanBalikSupervisor'
    | 'rencanaPerbaikan'
    | 'kesepakatanBersama'
    | 'rekomendasiTindakLanjut';
}

export interface PascaObservasiRecord {
  id: string;
  guruId: string;
  tanggal: string;
  refleksiGuru: string;
  aspekTercapai: string;
  aspekBelumTercapai: string;
  umpanBalikSupervisor: string;
  rencanaPerbaikan: string;
  kesepakatanBersama: string;
  rekomendasiTindakLanjut: string;
  status?: 'Draf' | 'Disepakati';
  customAnswers?: Record<string, string>;
  submittedByGuru?: boolean;
  submittedAt?: string;
  agreedAt?: string;
}

export interface SupervisiAsesmenRecord {
  id: string;
  guruId: string;
  tanggal: string;
  mapel: string;
  items: RubricItem[];
  totalSkor: number;
  nilaiAkhir: number;
  predikat: 'Amat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  catatan: string;
}

export interface TindakLanjutRecord {
  id: string;
  guruId: string;
  hasilSupervisiSkor: number;
  bentukTindakLanjut: 'Bimbingan Teknis Individu' | 'Workshop MGMP' | 'Peer Tutoring (Tutor Sebaya)' | 'Pelatihan Mandiri PMM' | 'Supervisi Ulang';
  uraianKegiatan: string;
  tenggatWaktu: string;
  penanggungJawab: string;
  status: 'Rencana' | 'Sedang Berjalan' | 'Selesai';
  hasilEvaluasi?: string;
}

export interface TimelineEntry {
  id: string;
  tahap: string;
  periode: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  penanggungJawab: string;
  status: 'Selesai' | 'Sedang Berjalan' | 'Mendatang';
  deskripsi: string;
  kegiatan: string[];
  targetTab?: string;
}

export type ProgramDocCategory =
  | 'PROGRAM TAHUNAN'
  | 'PANDUAN OPERASIONAL'
  | 'SK TIM SUPERVISI'
  | 'KALENDER AKADEMIK';

export interface ProgramDocument {
  id: string;
  kategori: ProgramDocCategory;
  tanggal: string;
  judul: string;
  deskripsi: string;
  driveLink: string;
  oleh: string;
}

export type GuruAdminComponent =
  | 'Kalender Akademik'
  | 'Program Tahunan'
  | 'Program Semester'
  | 'Capaian Pembelajaran'
  | 'Alur Tujuan Pembelajaran'
  | 'Kriteria Ketuntasan Tujuan Pembelajaran'
  | 'Asesmen Diagnostik'
  | 'Modul Ajar / RPP'
  | 'Bahan Ajar'
  | 'Lembar Kerja Peserta Didik'
  | 'Jadwal Pelajaran'
  | 'Jurnal Mengajar'
  | 'Perencanaan Asesmen'
  | 'Daftar Nilai/Hasil Asesmen'
  | 'Absensi Murid';

export interface GuruUploadedDoc {
  id: string;
  guruId: string;
  guruNama: string;
  tahunAjaran: string;
  komponen: GuruAdminComponent;
  komponenLabel: string;
  judulBerkas: string;
  tanggalUnggah: string;
  driveLink: string;
  statusVerifikasi: 'Menunggu Verifikasi' | 'Terverifikasi Sesuai' | 'Perlu Revisi';
  catatanUmpanBalik: string;
  verifikator?: string;
  tanggalVerifikasi?: string;
}

export type LaporanDocCategory =
  | 'LAPORAN SEMESTER'
  | 'REKAPITULASI NILAI'
  | 'LAPORAN TINDAK LANJUT'
  | 'DOKUMEN PENGESAHAN';

export interface LaporanDocument {
  id: string;
  kategori: LaporanDocCategory;
  tanggal: string;
  judul: string;
  deskripsi: string;
  driveLink: string;
  oleh: string;
}

export interface TeacherCertificateRecord {
  guruId: string;
  nomorSertifikat: string;
  tanggalTerbit?: string;
}

export interface CertificateSettings {
  tempatTerbit: string;
  tanggalTerbit: string;
  penandatangan: string;
  nuptkPenandatangan: string;
  penyelenggara: string;
}

export interface AcademicPeriod {
  id: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  status: 'Aktif' | 'Off';
}

export interface TeacherPersonalProfile {
  guruId: string;
  tempatTanggalLahir: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan' | '';
  pendidikanTerakhir: string;
  nuptk: string;
  noRekening: string;
  namaBank: string;
  tempatTugas: string;
  tanggalMulaiTugas: string;
  masaKerja: string;
  alamat: string;
  nomorHandphone: string;
  email: string;
  visi: string;
  misi: string;
  mottoHidup: string;
  updatedAt?: string;
}

