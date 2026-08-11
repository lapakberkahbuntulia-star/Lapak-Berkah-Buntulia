import { useState, useEffect, useMemo, useCallback } from 'react';
import { mitraService, productService, pendingStockValidationService, stockMovementService, transactionService, userService } from '../lib/services';
import Pagination from '../components/Pagination';
import compressImage from '../utils/compressImage';

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container';

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${bgColor} animate-pulse`}>
      <span className="material-symbols-outlined">{type === 'success' ? 'check_circle' : 'error'}</span>
      <span className="font-label-md text-label-md">{message}</span>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, trend, trendUp, colorClass = 'bg-primary-fixed text-on-primary-fixed' }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex justify-between items-start mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform duration-200`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && (
          <span className={`flex items-center gap-1 font-label-sm text-label-sm px-2 py-1 rounded-full ${trendUp ? 'bg-tertiary-fixed/20 text-tertiary-container' : 'bg-error-container/20 text-error'}`}>
            <span className="material-symbols-outlined text-[14px]">{trendUp ? 'arrow_upward' : 'arrow_downward'}</span>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="font-label-md text-label-md text-on-surface-variant mb-1">{label}</p>
        <p className="font-display-lg text-display-lg text-on-background tracking-tight">{value}</p>
        {subtitle && <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function MitraDashboard({ role, user }) {
  const isMitra = role === 'mitra';
  const getLocalDate = useCallback((value) => {
    const d = value instanceof Date ? value : new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [mitraList, setMitraList] = useState([]);
  const [allMitra, setAllMitra] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockInputs, setStockInputs] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [selectedMitra, setSelectedMitra] = useState('');
  const [stockDate, setStockDate] = useState(() => getLocalDate(new Date()));
  const [stockFormData, setStockFormData] = useState({ productId: '', stock: '', note: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    email: '',
    gender: 'Laki-laki',
    photo: '',
    status: 'Aktif',
  });

  const [productFilter, setProductFilter] = useState('Semua');
  const [activeTab, setActiveTab] = useState(isMitra ? 'stock' : 'mitra');

  const loggedInMitraId = useMemo(() => {
    if (!isMitra || !user?.email) return null;
    const currentMitra = allMitra.find((m) => m.email === user.email);
    return currentMitra ? String(currentMitra.id) : null;
  }, [isMitra, user?.email, allMitra]);

  useEffect(() => {
    if (isMitra && loggedInMitraId) {
      setSelectedMitra(loggedInMitraId);
    }
  }, [isMitra, loggedInMitraId]);

  const visibleProductIds = useMemo(() => {
    if (isMitra) {
      if (!loggedInMitraId) return new Set();
      return new Set(products.filter((p) => String(p.mitraId) === loggedInMitraId || !p.mitraId).map((p) => p.id));
    }
    const activeFilter = activeTab === 'stock' ? selectedMitra : productFilter;
    if (!activeFilter || activeFilter === 'Semua') return new Set();
    return new Set(products.filter((p) => String(p.mitraId) === activeFilter).map((p) => p.id));
  }, [isMitra, loggedInMitraId, activeTab, selectedMitra, productFilter, products]);

  const [profitMonth, setProfitMonth] = useState(new Date().toISOString().slice(0, 7));
  const [profitStartDate, setProfitStartDate] = useState('');
  const [profitEndDate, setProfitEndDate] = useState('');
  const [editingMitra, setEditingMitra] = useState(null);
  const [editMitraName, setEditMitraName] = useState('');
  const [mitraSearch, setMitraSearch] = useState('');
  const [mitraPage, setMitraPage] = useState(1);
  const mitraPerPage = 10;

  const loadData = useCallback(async () => {
    try {
      const [allMitraData, productData, pendingStockData, stockHistoryData, txData] = await Promise.all([
        mitraService.getAll(),
        productService.getAll(),
        pendingStockValidationService.getAll(),
        pendingStockValidationService.getAllHistory(),
        transactionService.getHistory(),
      ]);

      const mappedMitra = (allMitraData || []).map((m) => ({
        id: m.id,
        fullName: m.full_name,
        address: m.address,
        phone: m.phone,
        email: m.email,
        gender: m.gender,
        photo: m.photo,
        status: m.status,
        totalTransaction: m.total_transaction || 0,
        totalOmzet: m.total_omzet || 0,
      }));

      const mappedProducts = (productData || []).map((p) => ({
        id: p.id,
        name: p.nama_produk,
        sku: p.sku,
        category: p.category?.name || '',
        type: p.type?.name || '',
        mitraName: p.mitra?.full_name || p.mitra_name || '-',
        mitraId: p.mitra_id,
        unit: p.unit || '',
        mitraPrice: p.mitra_price || 0,
        stock: p.stock || 0,
      }));

      const mitraMap = new Map((allMitraData || []).map((m) => [m.id, m]));
      const productMap = new Map((productData || []).map((p) => [p.id, p]));

      const mappedPendingStock = (pendingStockData || []).map((s) => {
        const mitra = mitraMap.get(s.mitra_id);
        const product = productMap.get(s.product_id);
        return {
          id: s.id,
          mitraId: s.mitra_id,
          productId: s.product_id,
          date: s.date,
          quantity: s.quantity,
          note: s.note || '',
          status: s.status,
          mitraName: mitra?.full_name || s.mitra?.full_name || '-',
          productName: product?.nama_produk || s.product?.nama_produk || '-',
        };
      });

      const mappedStockHistory = (stockHistoryData || []).map((s) => {
        const mitra = mitraMap.get(s.mitra_id);
        const product = productMap.get(s.product_id);
        return {
          id: s.id,
          mitraId: s.mitra_id,
          productId: s.product_id,
          date: s.date,
          quantity: s.quantity,
          note: s.note || '',
          status: s.status,
          mitraName: mitra?.full_name || s.mitra?.full_name || '-',
          productName: product?.nama_produk || s.product?.nama_produk || '-',
          currentStock: product?.stock || 0,
        };
      });

      const mappedTx = (txData || []).map((tx) => ({
        id: tx.id,
        date: tx.created_at ? getLocalDate(tx.created_at) : '',
        mitraId: tx.mitra_id,
        total: tx.total || 0,
        items: tx.items || [],
      }));

      setAllMitra(mappedMitra);
      setMitraList(mappedMitra);
      setProducts(mappedProducts);
      setStockInputs(mappedPendingStock);
      setStockHistory(mappedStockHistory);
      setTransactions(mappedTx);
    } catch {
      setToast({ message: 'Gagal memuat data dashboard', type: 'error' });
    }
  }, [getLocalDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setMitraPage(1);
  }, [mitraSearch]);

  const filteredMitra = useMemo(() => {
    return allMitra.filter((mitra) =>
      mitra.fullName.toLowerCase().includes(mitraSearch.toLowerCase()) ||
      mitra.email.toLowerCase().includes(mitraSearch.toLowerCase()) ||
      mitra.phone.includes(mitraSearch)
    );
  }, [allMitra, mitraSearch]);

  const paginatedMitra = useMemo(() => {
    const start = (mitraPage - 1) * mitraPerPage;
    return filteredMitra.slice(start, start + mitraPerPage);
  }, [filteredMitra, mitraPage, mitraPerPage]);

  const activeMitra = useMemo(() => allMitra.filter((m) => m.status === 'Aktif').length, [allMitra]);
  const totalTransaction = useMemo(() => allMitra.reduce((sum, m) => sum + (m.totalTransaction || 0), 0), [allMitra]);
  const totalOmzet = useMemo(() => allMitra.reduce((sum, m) => sum + (m.totalOmzet || 0), 0), [allMitra]);

  const today = getLocalDate(new Date());

  const todayTransactions = useMemo(() => transactions.filter((tx) => {
    if (!isMitra) return tx.date === today;
    return tx.date === today && String(tx.mitraId) === selectedMitra;
  }), [transactions, isMitra, today, selectedMitra]);

  const todayOmzet = useMemo(() => todayTransactions.reduce((sum, tx) => sum + tx.total, 0), [todayTransactions]);
  const todayTransactionCount = useMemo(() => todayTransactions.length, [todayTransactions]);

  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const todayStock = useMemo(() => {
    return stockHistory.filter((s) => s.date === stockDate);
  }, [stockHistory, stockDate]);

  const filteredTodayStock = useMemo(() => {
    if (isMitra) {
      if (!loggedInMitraId) return [];
      return todayStock.filter((s) => String(s.mitraId) === loggedInMitraId);
    }
    if (selectedMitra) {
      return todayStock.filter((s) => String(s.mitraId) === selectedMitra);
    }
    return todayStock;
  }, [isMitra, loggedInMitraId, selectedMitra, todayStock]);

  const tabs = useMemo(() => {
    const base = [
      { id: 'stock', label: 'Input Stok Harian', icon: 'inventory' },
      { id: 'product', label: 'Daftar Produk', icon: 'shopping_bag' },
    ];
    if (isMitra) {
      return [...base, { id: 'profit', label: 'Riwayat Laba Bersih', icon: 'payments' }];
    }
    return [{ id: 'mitra', label: 'Daftar Mitra', icon: 'group' }, ...base];
  }, [isMitra]);

  const profitHistory = useMemo(() => {
    let filtered = transactions;

    if (isMitra) {
      filtered = filtered.filter((tx) => String(tx.mitraId) === selectedMitra);
    }

    if (profitStartDate) {
      filtered = filtered.filter((tx) => tx.date >= profitStartDate);
    }
    if (profitEndDate) {
      filtered = filtered.filter((tx) => tx.date <= profitEndDate);
    }
    if (profitMonth) {
      filtered = filtered.filter((tx) => tx.date.startsWith(profitMonth));
    }

    const dailyMap = new Map();
    filtered.forEach((tx) => {
      const items = tx.items || [];
      const profit = items.reduce((sum, item) => {
        const product = productMap.get(item.product_id);
        const cost = product ? product.mitraPrice : 0;
        const revenue = item.harga_satuan || 0;
        return sum + (revenue - cost) * item.quantity;
      }, 0);

      const existing = dailyMap.get(tx.date) || { date: tx.date, omzet: 0, modal: 0, profit: 0, count: 0 };
      existing.omzet += tx.total;
      existing.modal += items.reduce((sum, item) => {
        const product = productMap.get(item.product_id);
        return sum + (product ? product.mitraPrice : 0) * item.quantity;
      }, 0);
      existing.profit += profit;
      existing.count += 1;
      dailyMap.set(tx.date, existing);
    });

    return Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, productMap, isMitra, selectedMitra, profitMonth, profitStartDate, profitEndDate]);

  const totalProfit = useMemo(() => profitHistory.reduce((sum, row) => sum + row.profit, 0), [profitHistory]);
  const totalOmzetFiltered = useMemo(() => profitHistory.reduce((sum, row) => sum + row.omzet, 0), [profitHistory]);

  /* ... Handlers: handleSubmit, handleStockSubmit, handleValidateStock, dll ... */
  // (Tetap menggunakan implementasi fungsi logis Anda sebelumnya)

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Header & Stat Cards */}
          {/* Tabs */}

          <div className="p-4 md:p-6">
            {/* Tab Mitra */}
            {activeTab === 'mitra' && !isMitra && (
              <div className="space-y-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                  <input
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-outline"
                    placeholder="Cari mitra..."
                    value={mitraSearch}
                    onChange={(e) => setMitraSearch(e.target.value)}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>{/* Header Tabel */}</thead>
                    <tbody>
                      {paginatedMitra.map((mitra) => (
                        <tr key={mitra.id}>
                          <td>{mitra.fullName}</td>
                          <td>
                            <div>{mitra.phone}</div>
                            <div>{mitra.email}</div>
                          </td>
                          <td>{mitra.status}</td>
                          <td>{mitra.totalTransaction}</td>
                          <td>Rp {mitra.totalOmzet.toLocaleString('id-ID')}</td>
                          <td>{/* Action Buttons */}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Diletakkan secara BENAR di luar tabel */}
                {filteredMitra.length > mitraPerPage && (
                  <div className="mt-4 flex justify-end">
                    <Pagination
                      totalItems={filteredMitra.length}
                      itemsPerPage={mitraPerPage}
                      currentPage={mitraPage}
                      onPageChange={setMitraPage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default MitraDashboard;