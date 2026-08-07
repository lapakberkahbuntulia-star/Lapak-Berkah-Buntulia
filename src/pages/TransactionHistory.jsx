import { useState, useEffect } from 'react';
import { transactionService } from '../lib/services';

function TransactionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('Semua');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getHistory();

      const mapped = data.map((tx) => {
        const txId = tx.transaction_id || `TX-${String(tx.id).padStart(3, '0')}`;
        const rawDate = tx.created_at || '';
        const formattedDate = rawDate
          ? rawDate.replace('T', ' ').replace(/\.\d+Z$/, '').substring(0, 16)
          : '';
        const totalQty = tx.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

        return {
          id: tx.id,
          transactionId: txId,
          date: formattedDate,
          mitraName: tx.mitra?.full_name || 'Tidak Diketahui',
          items: totalQty,
          total: tx.total || 0,
          paymentMethod: tx.metode_pembayaran || '-',
          status: tx.status || '-',
          paid: tx.paid || 0,
          change: tx.change || 0,
        };
      });

      setHistory(mapped);
    } catch (err) {
      setError(err.message || 'Gagal memuat riwayat transaksi');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((h) => {
    const matchesSearch = h.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.mitraName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = (!startDate || h.date >= startDate) && (!endDate || h.date <= endDate + ' 23:59');
    const matchesPayment = selectedPayment === 'Semua' || h.paymentMethod === selectedPayment;
    return matchesSearch && matchesDate && matchesPayment;
  });

  const totalTransactions = filteredHistory.length;
  const totalOmzet = filteredHistory.reduce((sum, h) => sum + (h.total || 0), 0);

  const printReceipt = (transaction) => {
    const receiptWindow = window.open('', '_blank', 'width=320,height=600');
    if (!receiptWindow) return;
    receiptWindow.document.write(`
      <html>
        <head>
          <title>Struk #${transaction.transactionId}</title>
          <style>
            body { font-family: 'Hanken Grotesk', sans-serif; padding: 16px; color: #000; }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 4px; }
          </style>
        </head>
        <body>
          <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700;">Lapak Berkah Buntulia</h3>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: #424750;">Struk Pembelian</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">No. Transaksi: #${transaction.transactionId}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">Tanggal: ${transaction.date}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">Mitra: ${transaction.mitraName}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">Metode: ${transaction.paymentMethod}</p>
          <p style="margin: 0 0 12px 0; font-size: 12px;">Status: ${transaction.status}</p>
          <table>
            <thead>
              <tr>
                <th style="text-align: left; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">Item</th>
                <th style="text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">Qty</th>
                <th style="text-align: right; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 4px 0; font-size: 12px;">Total Item</td>
                <td style="padding: 4px 0; font-size: 12px; text-align: center;">${transaction.items}</td>
                <td style="padding: 4px 0; font-size: 12px; text-align: right;">Rp ${transaction.total.toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 12px; border-top: 1px dashed #ccc; padding-top: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 700;">
              <span>Total</span>
              <span>Rp ${transaction.total.toLocaleString('id-ID')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px;">
              <span>Bayar</span>
              <span>Rp ${transaction.paid.toLocaleString('id-ID')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px;">
              <span>Kembali</span>
              <span>Rp ${transaction.change.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <p style="margin-top: 16px; font-size: 12px; text-align: center; color: #424750;">Terima kasih telah berbelanja</p>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col md:ml-72 relative z-0 h-full">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-outline animate-pulse">receipt_long</span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-4">Memuat riwayat transaksi...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col md:ml-72 relative z-0 h-full">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-error">error</span>
                <p className="font-body-md text-body-md text-on-surface-variant mt-4">{error}</p>
                <button
                  onClick={loadTransactions}
                  className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary font-body-md text-body-md hover:bg-primary/90 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:ml-72 relative z-0 h-full">
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Page Header */}
          <header className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Riwayat Transaksi</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Daftar transaksi yang telah selesai
              </p>
            </div>
          </header>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Riwayat</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Transaksi selesai</p>
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
                <p className="font-display-lg text-display-lg text-on-background tracking-tight">{totalTransactions}</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  <span className="material-symbols-outlined">shopping_cart</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">Item</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Item</p>
                <p className="font-display-lg text-display-lg text-on-background tracking-tight">{filteredHistory.reduce((sum, h) => sum + h.items, 0)}</p>
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
                <p className="font-display-lg text-display-lg text-on-background tracking-tight">Rp {totalOmzet.toLocaleString('id-ID')}</p>
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
                <p className="font-display-lg text-display-lg text-on-background tracking-tight">Rp {totalTransactions > 0 ? Math.round(totalOmzet / totalTransactions).toLocaleString('id-ID') : 0}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Cari Transaksi</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                  <input
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md transition-all placeholder:text-outline/70"
                    placeholder="ID Transaksi atau Mitra..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Dari Tanggal</label>
                <input
                  type="date"
                  className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Sampai Tanggal</label>
                <input
                  type="date"
                  className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="w-full md:w-48">
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Metode</label>
                <select
                  className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none"
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                >
                  <option value="Semua">Semua</option>
                  <option value="Tunai">Tunai</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant bg-surface">
              <h3 className="font-headline-sm text-headline-sm text-on-background">Daftar Transaksi</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Menampilkan {filteredHistory.length} transaksi</p>
            </div>

            {filteredHistory.length === 0 ? (
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
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Item</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Total</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Metode</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-center">Status</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md divide-y divide-outline-variant/50">
                    {filteredHistory.map((h, idx) => (
                      <tr key={h.id} className={`hover:bg-surface-container-low/50 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">#{h.transactionId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-body-sm text-body-sm text-on-surface">{h.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-body-sm text-body-sm text-on-surface">{h.mitraName}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-numeric-data text-numeric-data text-on-background">{h.items}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-numeric-data text-numeric-data text-primary font-semibold">Rp {h.total.toLocaleString('id-ID')}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant border border-outline-variant">
                            {h.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-label-sm bg-tertiary-fixed/15 text-tertiary-container border border-tertiary-fixed/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {h.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => printReceipt(h)}
                            className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center transition-all duration-200"
                            title="Cetak Struk"
                          >
                            <span className="material-symbols-outlined text-[18px]">print</span>
                          </button>
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

export default TransactionHistory;
