import { useState, useEffect, useMemo } from 'react';
import { transactionService, returnService, productService, stockMovementService } from '../lib/services';
import Pagination from '../components/Pagination';

function TransactionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('Semua');
  const [returnModal, setReturnModal] = useState({ open: false, transaction: null });
  const [returnItems, setReturnItems] = useState({});
  const [returnReason, setReturnReason] = useState('');
  const [processingReturn, setProcessingReturn] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const matchesSearch = h.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.mitraName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = (!startDate || h.date >= startDate) && (!endDate || h.date >= endDate + ' 23:59');
      const matchesPayment = selectedPayment === 'Semua' || h.paymentMethod === selectedPayment;
      return matchesSearch && matchesDate && matchesPayment;
    });
  }, [history, searchQuery, startDate, endDate, selectedPayment]);

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(start, start + itemsPerPage);
  }, [filteredHistory, currentPage, itemsPerPage]);

  const totalTransactions = filteredHistory.length;
  const totalOmzet = useMemo(() => filteredHistory.reduce((sum, h) => sum + h.total, 0), [filteredHistory]);

  useEffect(() => {
    (async () => {
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
            rawItems: tx.items || [],
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
    })();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate, selectedPayment]);

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

  const openReturnModal = (transaction) => {
    setReturnModal({ open: true, transaction });
    setReturnItems({});
    setReturnReason('');
  };

  const handleReturnQuantityChange = (itemId, maxQty, value) => {
    const qty = Math.max(1, Math.min(Number(value) || 0, maxQty));
    setReturnItems((prev) => ({ ...prev, [itemId]: qty }));
  };

  const handleSubmitReturn = async () => {
    if (!returnModal.transaction || processingReturn) return;

    const itemsToReturn = Object.entries(returnItems)
      .filter(([_itemId, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, qty }));

    if (itemsToReturn.length === 0) {
      showToast('Pilih minimal satu item untuk diretur', 'error');
      return;
    }

    setProcessingReturn(true);
    try {
      for (const { itemId, qty } of itemsToReturn) {
        const item = returnModal.transaction.rawItems.find((i) => i.id === itemId);
        if (!item) continue;

        await returnService.create({
          transaction_id: returnModal.transaction.id,
          transaction_item_id: itemId,
          product_id: item.product_id,
          quantity: qty,
          reason: returnReason,
          user_id: null,
        });

        const newStock = (item.product?.stock || 0) + qty;
        await productService.update(item.product_id, { stock: newStock });

        await stockMovementService.create({
          type: 'in',
          product_id: item.product_id,
          quantity: qty,
          note: `Retur #${returnModal.transaction.transactionId}`,
          mitra_id: null,
        });
      }

      showToast('Retur berhasil diproses', 'success');
      setReturnModal({ open: false, transaction: null });
      setReturnItems({});
      setReturnReason('');
      loadTransactions();
    } catch {
      showToast('Gagal memproses retur', 'error');
    } finally {
      setProcessingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
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
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
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
               <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Menampilkan {totalTransactions} transaksi</p>
            </div>

             {paginatedHistory.length === 0 ? (
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
                     {paginatedHistory.map((h, idx) => (
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
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openReturnModal(h)}
                              className="w-8 h-8 rounded-lg bg-tertiary-fixed/15 text-tertiary-container hover:bg-tertiary-fixed hover:text-on-tertiary-fixed flex items-center justify-center transition-all duration-200"
                              title="Retur"
                              aria-label="Retur transaksi"
                            >
                              <span className="material-symbols-outlined text-[18px]">undo</span>
                            </button>
                            <button
                              onClick={() => printReceipt(h)}
                              className="w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary flex items-center justify-center transition-all duration-200"
                              title="Cetak Struk"
                              aria-label="Cetak struk"
                            >
                              <span className="material-symbols-outlined text-[18px]">print</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  totalItems={totalTransactions}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm flex items-center gap-2 animate-bounce ${
          toast.type === 'error'
            ? 'bg-error-container text-error border-error/30'
            : 'bg-surface-container-high text-on-background border-outline-variant'
        }`}>
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="font-label-md text-label-md">{toast.message}</span>
        </div>
      )}

      {returnModal.open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant">
              <h3 className="font-headline-md text-headline-md text-on-surface">Retur Transaksi</h3>
              <button onClick={() => setReturnModal({ open: false, transaction: null })} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Transaksi: <span className="font-mono text-sm bg-surface-container px-2 py-1 rounded-md">#{returnModal.transaction?.transactionId}</span>
              </p>
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">Alasan Retur</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  placeholder="Masukkan alasan retur..."
                />
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface block">Pilih Item</label>
                {returnModal.transaction?.rawItems?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/50">
                    <div className="flex-1">
                      <p className="font-body-md text-body-md text-on-surface">{item.product?.nama_produk || 'Produk'}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        Qty: {item.quantity} | Rp {(item.harga_satuan * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={item.quantity}
                        value={returnItems[item.id] || ''}
                        onChange={(e) => handleReturnQuantityChange(item.id, item.quantity, e.target.value)}
                        className="w-16 px-2 py-1 border border-outline-variant rounded-md text-center font-numeric-data text-numeric-data text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                      />
                      <span className="font-label-sm text-label-sm text-on-surface-variant">/ {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-outline-variant">
              <button
                onClick={() => setReturnModal({ open: false, transaction: null })}
                className="flex-1 h-10 px-4 bg-surface border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitReturn}
                disabled={processingReturn}
                className="flex-1 h-10 px-4 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg font-label-md text-label-md hover:bg-tertiary-fixed/90 transition-colors disabled:opacity-50"
              >
                {processingReturn ? 'Memproses...' : 'Proses Retur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
