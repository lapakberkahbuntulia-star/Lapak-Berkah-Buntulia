import { useState } from 'react';

const initialTransactions = [
  { id: 1, date: '2025-08-07', mitraName: 'Toko Makmur', productName: 'Nasi Kuning', qty: 5, total: 90000, paymentMethod: 'Tunai', status: 'Selesai' },
  { id: 2, date: '2025-08-07', mitraName: 'Grosir Jaya', productName: 'Mie Instan Goreng', qty: 10, total: 45000, paymentMethod: 'QRIS', status: 'Selesai' },
  { id: 3, date: '2025-08-06', mitraName: 'Toko Harapan', productName: 'Es Teh Manis', qty: 8, total: 40000, paymentMethod: 'Tunai', status: 'Selesai' },
  { id: 4, date: '2025-08-06', mitraName: 'Toko Makmur', productName: 'Kopi Susu Gula Aren', qty: 3, total: 36000, paymentMethod: 'Transfer', status: 'Selesai' },
  { id: 5, date: '2025-08-05', mitraName: 'Grosir Jaya', productName: 'Kerupuk', qty: 20, total: 70000, paymentMethod: 'Tunai', status: 'Selesai' },
];

const mitraList = ['Semua Mitra', 'Toko Makmur', 'Grosir Jaya', 'Toko Harapan'];

function SalesRecap() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMitra, setSelectedMitra] = useState('Semua Mitra');

  const filteredTransactions = transactions.filter((t) => {
    const matchesDate = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);
    const matchesMitra = selectedMitra === 'Semua Mitra' || t.mitraName === selectedMitra;
    return matchesDate && matchesMitra;
  });

  const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalQty = filteredTransactions.reduce((sum, t) => sum + t.qty, 0);

  const handleExportPDF = () => {
    alert('Fitur Export PDF akan segera tersedia. Data dapat diekspor ke format PDF.');
  };

  const handleExportExcel = () => {
    alert('Fitur Export Excel akan segera tersedia. Data dapat diekspor ke format Excel.');
  };

  return (
    <div className="flex-1 flex flex-col md:ml-72 relative z-0 h-full">
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Page Header */}
          <header className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Laporan Penjualan</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Ringkasan penjualan dan rekap transaksi
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="h-12 px-6 bg-surface border border-primary text-primary rounded-xl flex items-center gap-2 transition-colors font-label-md text-label-md hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">description</span>
                Export Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="h-12 px-6 bg-secondary text-on-secondary rounded-xl flex items-center gap-2 transition-colors font-label-md text-label-md hover:bg-secondary/90"
              >
                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                Export PDF
              </button>
            </div>
          </header>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Laporan</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Rekap penjualan</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExportExcel} className="h-10 w-10 bg-surface border border-primary text-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">description</span>
              </button>
              <button onClick={handleExportPDF} className="h-10 w-10 bg-secondary text-on-secondary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">Total</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Transaksi</p>
                <p className="font-display-lg text-display-lg text-on-background tracking-tight">{filteredTransactions.length}</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  <span className="material-symbols-outlined">shopping_cart</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">Qty</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Item</p>
                <p className="font-display-lg text-display-lg text-on-background tracking-tight">{totalQty}</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">Omzet</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Penjualan</p>
                <p className="font-display-lg text-display-lg text-on-background tracking-tight">Rp {totalSales.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#d1f4e0] flex items-center justify-center text-[#0d592a]">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <span className="font-label-sm text-label-sm text-[#0d592a] bg-[#d1f4e0]/50 px-2 py-1 rounded-full">Rata-rata</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant mb-1">Rata-rata Transaksi</p>
                <p className="font-display-lg text-display-lg text-on-background tracking-tight">Rp {filteredTransactions.length > 0 ? Math.round(totalSales / filteredTransactions.length).toLocaleString('id-ID') : 0}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Tanggal Akhir</label>
                <input
                  type="date"
                  className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Mitra</label>
                <select
                  className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none"
                  value={selectedMitra}
                  onChange={(e) => setSelectedMitra(e.target.value)}
                >
                  {mitraList.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant bg-surface">
              <h3 className="font-headline-sm text-headline-sm text-on-background">Daftar Transaksi</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Menampilkan {filteredTransactions.length} transaksi</p>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-outline mb-3">receipt_long</span>
                <p className="font-body-md text-body-md text-on-surface-variant">Tidak ada transaksi yang ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">ID</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Tanggal</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Mitra</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Produk</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Qty</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Total</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Metode</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md divide-y divide-outline-variant/50">
                    {filteredTransactions.map((transaction, idx) => (
                      <tr
                        key={transaction.id}
                        className={`hover:bg-surface-container-low/50 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">#{transaction.id.toString().padStart(4, '0')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-body-sm text-body-sm text-on-surface">{transaction.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-body-sm text-body-sm text-on-surface">{transaction.mitraName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-body-sm text-body-sm text-on-surface">{transaction.productName}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-numeric-data text-numeric-data text-on-background">{transaction.qty}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-numeric-data text-numeric-data text-primary font-semibold">Rp {transaction.total.toLocaleString('id-ID')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant border border-outline-variant">
                            {transaction.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-label-sm bg-tertiary-fixed/15 text-tertiary-container border border-tertiary-fixed/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SalesRecap;
