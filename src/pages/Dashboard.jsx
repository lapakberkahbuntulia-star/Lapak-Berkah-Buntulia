import { useState, useEffect } from 'react';
import { dashboardService, transactionService } from '../lib/services';

function Dashboard() {
  const [stats, setStats] = useState({ totalTransactions: 0, totalSales: 0, totalItems: 0, activeMitra: 0 });
  const [todayTransactions, setTodayTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, transactionsData] = await Promise.all([
        dashboardService.getTodayStats(),
        transactionService.getHistory(),
      ]);

      setStats(statsData);
      setTodayTransactions(transactionsData.slice(0, 10).map(t => ({
        id: t.id,
        time: new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        productName: t.items?.[0]?.product?.nama_produk || '-',
        qty: t.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        total: t.total,
        paymentMethod: t.metode_pembayaran || '-',
        mitraName: t.mitra?.full_name || '-',
      })));
    } catch (error) {
      showToast('Gagal memuat data dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Perbaikan di sini: Pastikan flex-1 mengisi sisa ruang secara otomatis tanpa paksaan margin md:ml-72 yang sering bikin geser */
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 h-full">
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 w-full">
          
          {/* Page Header Desktop */}
          <header className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
              <p className="text-sm text-slate-500 mt-1">
                Ringkasan transaksi hari ini
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Tanggal Aktif</div>
              <div className="text-sm font-semibold text-slate-700">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </header>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ringkasan hari ini</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">Hari Ini</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Total Transaksi</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{loading ? '-' : stats.totalTransactions}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <span className="material-symbols-outlined">shopping_cart</span>
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">Item</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Total Item</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{loading ? '-' : stats.totalItems}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">Omzet</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Total Penjualan</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">Rp {loading ? '-' : stats.totalSales.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#d1f4e0] flex items-center justify-center text-[#0d592a]">
                  <span className="material-symbols-outlined">people</span>
                </div>
                <span className="text-xs text-[#0d592a] bg-[#d1f4e0]/50 px-2 py-1 rounded-full font-medium">Mitra</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Mitra Aktif</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{loading ? '-' : stats.activeMitra}</p>
              </div>
            </div>
          </div>

          {/* Today's Transactions Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-white">
              <h3 className="text-lg font-bold text-slate-900">Transaksi Hari Ini</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daftar transaksi yang terjadi hari ini</p>
            </div>

            {todayTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-3">receipt_long</span>
                <p className="text-sm text-slate-500">Belum ada transaksi hari ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Waktu</th>
                      <th className="px-6 py-4 font-semibold">Produk</th>
                      <th className="px-6 py-4 font-semibold">Mitra</th>
                      <th className="px-6 py-4 font-semibold text-right">Qty</th>
                      <th className="px-6 py-4 font-semibold text-right">Total</th>
                      <th className="px-6 py-4 font-semibold">Metode</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 text-slate-700">
                    {todayTransactions.map((transaction, idx) => (
                      <tr
                        key={transaction.id}
                        className={`hover:bg-slate-50 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                      >
                        <td className="px-6 py-4 text-slate-600 font-medium">{transaction.time}</td>
                        <td className="px-6 py-4 text-slate-900 font-medium">{transaction.productName}</td>
                        <td className="px-6 py-4 text-slate-600">{transaction.mitraName}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">{transaction.qty}</td>
                        <td className="px-6 py-4 text-right font-bold text-blue-600">Rp {transaction.total.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {transaction.paymentMethod}
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

export default Dashboard;