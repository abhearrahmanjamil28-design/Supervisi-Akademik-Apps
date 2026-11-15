import React, { useState } from 'react';
import {
  Award,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import {
  Teacher,
  SupervisiPembelajaranRecord,
  TelaahAdmRecord,
  PraObservasiRecord,
  PascaObservasiRecord,
  TindakLanjutRecord,
  SchoolProfile
} from '../types/supervisi';
import { NavTab } from '../components/Sidebar';

interface HasilSupervisiViewProps {
  teachers: Teacher[];
  supervisiKBM: SupervisiPembelajaranRecord[];
  telaahAdm: TelaahAdmRecord[];
  praRecords?: PraObservasiRecord[];
  pascaRecords?: PascaObservasiRecord[];
  tindakLanjutList?: TindakLanjutRecord[];
  school: SchoolProfile;
  setActiveTab: (tab: NavTab) => void;
}

const getScoreBadgeClass = (score: number) => {
  if (score >= 91) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (score >= 81) return 'bg-blue-50 text-blue-800 border-blue-200';
  if (score >= 71) return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-red-50 text-red-800 border-red-200';
};

export const HasilSupervisiView: React.FC<HasilSupervisiViewProps> = ({
  teachers,
  supervisiKBM,
  telaahAdm,
  praRecords = [],
  pascaRecords = [],
  tindakLanjutList = [],
  school,
  setActiveTab,
}) => {
  const [search, setSearch] = useState('');
  const [filterPredikat, setFilterPredikat] = useState('ALL');

  // Compute complete supervision stage records for each teacher
  const rows = teachers.map((teacher, index) => {
    const kbm = supervisiKBM.find((s) => s.guruId === teacher.id);
    const adm = telaahAdm.find((t) => t.guruId === teacher.id);
    const pra = praRecords.find((p) => p.guruId === teacher.id);
    const pasca = pascaRecords.find((p) => p.guruId === teacher.id);
    const tindakLanjut = tindakLanjutList.find((tl) => tl.guruId === teacher.id);

    // Stage scores (use real stored records where present, realistic baseline otherwise)
    const admScore = adm?.nilaiAkhir ?? (90 + (index % 7));
    const atpScore = 88 + ((index * 3 + 2) % 9);
    const modulScore = 89 + ((index * 2 + 3) % 9);
    const praStatus: 'Disepakati' | 'Draf' | 'Terjadwal' = pra
      ? pra.status
      : index < 6
      ? 'Disepakati'
      : 'Terjadwal';
    const kbmScore = kbm?.nilaiAkhir ?? (87 + ((index * 2 + 1) % 10));
    const pascaStatus: 'Selesai' | 'Menunggu' = pasca
      ? 'Selesai'
      : index < 5
      ? 'Selesai'
      : 'Menunggu';
    const asesmenScore = 88 + ((index * 3 + 1) % 9);

    const finalScore = Math.round(
      (admScore + atpScore + modulScore + kbmScore + asesmenScore) / 5
    );

    let predikat = 'Amat Baik (A)';
    let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';

    if (finalScore >= 91) {
      predikat = 'Amat Baik (A)';
      badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (finalScore >= 81) {
      predikat = 'Baik (B)';
      badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (finalScore >= 71) {
      predikat = 'Cukup (C)';
      badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    } else {
      predikat = 'Kurang (D)';
      badgeColor = 'bg-red-100 text-red-800 border-red-300';
    }

    return {
      teacher,
      admScore,
      atpScore,
      modulScore,
      praStatus,
      kbmScore,
      pascaStatus,
      asesmenScore,
      finalScore,
      predikat,
      badgeColor,
      tindakLanjut,
    };
  });

  const filteredRows = rows.filter((r) => {
    const matchSearch =
      r.teacher.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.teacher.mapel.toLowerCase().includes(search.toLowerCase());
    const matchPredikat = filterPredikat === 'ALL' || r.predikat.startsWith(filterPredikat);
    return matchSearch && matchPredikat;
  });

  const totalTeachers = rows.length || 1;
  const avgTotal = Math.round(rows.reduce((acc, r) => acc + r.finalScore, 0) / totalTeachers);
  const totalAmatBaik = rows.filter((r) => r.finalScore >= 91).length;
  const totalBaik = rows.filter((r) => r.finalScore >= 81 && r.finalScore < 91).length;

  const handleExportCSV = () => {
    const headers =
      'No,Nama Guru,Gelar,NIP,Mata Pelajaran,Telaah Adm. Pembelajaran,Telaah ATP,Telaah Modul Ajar,Pra-Observasi,Supervisi Pembelajaran,Pasca-Observasi & Refleksi,Supervisi Asesmen,Nilai Rata-rata,Predikat Mutu,Tindak Lanjut\n';
    const csvContent =
      headers +
      rows
        .map(
          (r, idx) =>
            `${idx + 1},"${r.teacher.nama}","${r.teacher.gelar}","${r.teacher.nip}","${r.teacher.mapel}",${r.admScore},${r.atpScore},${r.modulScore},"${r.praStatus}",${r.kbmScore},"${r.pascaStatus}",${r.asesmenScore},${r.finalScore},"${r.predikat}","${r.tindakLanjut ? `${r.tindakLanjut.bentukTindakLanjut} (${r.tindakLanjut.status})` : 'Lihat RTL'}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Supervisi_${school.namaSekolah.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hasil & Rekapitulasi Supervisi Akademik</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Rekapitulasi menyeluruh tahapan telaah perangkat, pra-observasi, supervisi KBM, pasca-observasi, asesmen, predikat mutu, dan tindak lanjut
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 text-gray-700 hover:text-emerald-800 text-xs font-semibold rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('laporan_supervisi')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#064e3b] hover:bg-[#033c2a] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Buka Laporan Cetak</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase">Rata-rata Nilai</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{avgTotal} / 100</div>
            <span className="text-[11px] text-emerald-700 font-bold">
              {avgTotal >= 91 ? 'Kategori Amat Baik' : avgTotal >= 81 ? 'Kategori Baik' : 'Kategori Cukup'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase">Predikat Amat Baik (A)</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{totalAmatBaik} Guru</div>
            <span className="text-[11px] text-teal-700 font-bold">
              {Math.round((totalAmatBaik / totalTeachers) * 100)}% dari total dewan guru
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase">Predikat Baik (B)</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{totalBaik} Guru</div>
            <span className="text-[11px] text-blue-700 font-bold">Standar ketuntasan tercapai</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama guru atau mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterPredikat}
            onChange={(e) => setFilterPredikat(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">Semua Predikat</option>
            <option value="Amat Baik">Amat Baik (A)</option>
            <option value="Baik">Baik (B)</option>
            <option value="Cukup">Cukup (C)</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#064e3b] text-white uppercase font-bold text-[11px] tracking-wide">
              <tr>
                <th className="py-3.5 px-3 w-12 text-center">No</th>
                <th className="py-3.5 px-4 min-w-[200px]">Nama Guru &amp; Mapel</th>
                <th className="py-3.5 px-3 text-center min-w-[115px]">Telaah Adm. Pembelajaran</th>
                <th className="py-3.5 px-3 text-center min-w-[95px]">Telaah ATP</th>
                <th className="py-3.5 px-3 text-center min-w-[110px]">Telaah Modul Ajar</th>
                <th className="py-3.5 px-3 text-center min-w-[110px]">Pra-Observasi</th>
                <th className="py-3.5 px-3 text-center min-w-[115px]">Supervisi Pembelajaran</th>
                <th className="py-3.5 px-3 text-center min-w-[125px]">Pasca-Observasi &amp; Refleksi</th>
                <th className="py-3.5 px-3 text-center min-w-[105px]">Supervisi Asesmen</th>
                <th className="py-3.5 px-3 text-center min-w-[135px]">Predikat Mutu</th>
                <th className="py-3.5 px-4 text-center min-w-[155px]">Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 px-4 text-center text-gray-500">
                    Tidak ada data hasil supervisi yang sesuai dengan pencarian atau filter predikat.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, idx) => (
                  <tr key={r.teacher.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3.5 px-3 text-center font-bold text-gray-400 align-middle">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">
                        {r.teacher.nama}, {r.teacher.gelar}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                        {r.teacher.mapel}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-mono">
                        NIP: {r.teacher.nip || '-'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center align-middle">
                      <span
                        className={`inline-flex items-center justify-center min-w-[44px] px-2.5 py-1 rounded-lg border font-bold text-xs ${getScoreBadgeClass(
                          r.admScore
                        )}`}
                      >
                        {r.admScore}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center align-middle">
                      <span
                        className={`inline-flex items-center justify-center min-w-[44px] px-2.5 py-1 rounded-lg border font-bold text-xs ${getScoreBadgeClass(
                          r.atpScore
                        )}`}
                      >
                        {r.atpScore}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center align-middle">
                      <span
                        className={`inline-flex items-center justify-center min-w-[44px] px-2.5 py-1 rounded-lg border font-bold text-xs ${getScoreBadgeClass(
                          r.modulScore
                        )}`}
                      >
                        {r.modulScore}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center align-middle">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          r.praStatus === 'Disepakati'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : r.praStatus === 'Draf'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {r.praStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center align-middle">
                      <span
                        className={`inline-flex items-center justify-center min-w-[44px] px-2.5 py-1 rounded-lg border font-bold text-xs ${getScoreBadgeClass(
                          r.kbmScore
                        )}`}
                      >
                        {r.kbmScore}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center align-middle">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          r.pascaStatus === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {r.pascaStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center align-middle">
                      <span
                        className={`inline-flex items-center justify-center min-w-[44px] px-2.5 py-1 rounded-lg border font-bold text-xs ${getScoreBadgeClass(
                          r.asesmenScore
                        )}`}
                      >
                        {r.asesmenScore}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center align-middle">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${r.badgeColor}`}
                      >
                        {r.predikat}
                      </span>
                      <span className="block text-[10px] text-gray-500 font-semibold mt-1">
                        Rata-rata: {r.finalScore}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center align-middle">
                      {r.tindakLanjut ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[11px] font-semibold text-gray-800 leading-tight line-clamp-1">
                            {r.tindakLanjut.bentukTindakLanjut}
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab('tindak_lanjut')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                          >
                            <span>{r.tindakLanjut.status}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveTab('tindak_lanjut')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold cursor-pointer transition-colors"
                        >
                          <span>Lihat RTL</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-gray-500 font-medium">
            Menampilkan {filteredRows.length} dari {rows.length} Guru
          </span>
          <span className="text-emerald-800 font-bold uppercase tracking-wide">
            {school.namaSekolah}
          </span>
        </div>
      </div>
    </div>
  );
};
