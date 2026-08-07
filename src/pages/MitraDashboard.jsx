import { useState, useEffect } from 'react';
import { mitraService, productService, pendingStockValidationService } from '../lib/services';

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

function MitraDashboard({ role }) {
  const isMitra = role === 'mitra';
  const [mitraList, setMitraList] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockInputs, setStockInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [selectedMitra, setSelectedMitra] = useState(isMitra ? '1' : '');
  const [stockDate, setStockDate] = useState(new Date().toISOString().split('T')[0]);
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
  const [productFilter, setProductFilter] = useState(isMitra ? '1' : 'Semua');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [mitraData, productData, stockData] = await Promise.all([
          mitraService.getAll(),
          productService.getAll(),
          pendingStockValidationService.getAll(),
        ]);

        const mappedMitra = (mitraData || []).map((m) => ({
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
        }));

        const mappedStock = (stockData || []).map((s) => ({
          id: s.id,
          mitraId: s.mitra_id,
          productId: s.product_id,
          date: s.date,
          quantity: s.quantity,
          note: s.note || '',
          status: s.status,
        }));

        setMitraList(mappedMitra);
        setProducts(mappedProducts);
        setStockInputs(mappedStock);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setToast({ message: 'Gagal memuat data dashboard', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (isMitra) {
      const currentMitra = mitraList.find((m) => m.status === 'Aktif');
      if (currentMitra) {
        setSelectedMitra(String(currentMitra.id));
      }
    }
  }, [isMitra, mitraList]);

  const totalMitra = mitraList.length;
  const activeMitra = mitraList.filter((m) => m.status === 'Aktif').length;
  const totalTransaction = mitraList.reduce((sum, m) => sum + (m.totalTransaction || 0), 0);
  const totalOmzet = mitraList.reduce((sum, m) => sum + (m.totalOmzet || 0), 0);

  const filteredMitra = mitraList.filter((mitra) =>
    mitra.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mitra.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mitra.phone.includes(searchQuery)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newMitra = await mitraService.create({
        full_name: formData.fullName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        photo: formData.photo,
        status: formData.status,
        total_transaction: 0,
        total_omzet: 0,
      });

      setMitraList([
        ...mitraList,
        {
          id: newMitra.id,
          fullName: newMitra.full_name,
          address: newMitra.address,
          phone: newMitra.phone,
          email: newMitra.email,
          gender: newMitra.gender,
          photo: newMitra.photo,
          status: newMitra.status,
          totalTransaction: newMitra.total_transaction || 0,
          totalOmzet: newMitra.total_omzet || 0,
        },
      ]);
      setFormData({ fullName: '', address: '', phone: '', email: '', gender: 'Laki-laki', photo: '' });
      setShowForm(false);
      setToast({ message: 'Mitra berhasil ditambahkan!', type: 'success' });
    } catch (error) {
      console.error('Failed to create mitra:', error);
      setToast({ message: 'Gagal menambahkan mitra', type: 'error' });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMitra || !stockFormData.productId || !stockFormData.stock) return;
    try {
      const newStock = await pendingStockValidationService.create({
        mitra_id: Number(selectedMitra),
        product_id: Number(stockFormData.productId),
        date: stockDate,
        quantity: Number(stockFormData.stock),
        note: stockFormData.note,
        status: 'pending',
      });

      setStockInputs([
        ...stockInputs,
        {
          id: newStock.id,
          mitraId: newStock.mitra_id,
          productId: newStock.product_id,
          date: newStock.date,
          quantity: newStock.quantity,
          note: newStock.note || '',
          status: newStock.status,
        },
      ]);
      setStockFormData({ productId: '', stock: '', note: '' });
      setShowStockForm(false);
      setToast({ message: 'Stok harian berhasil disimpan dan menunggu validasi admin!', type: 'success' });
    } catch (error) {
      console.error('Failed to create stock input:', error);
      setToast({ message: 'Gagal menyimpan stok harian', type: 'error' });
    }
  };

  const todayStock = stockInputs.filter((s) => s.date === stockDate);
  const _selectedMitraObj = mitraList.find((m) => m.id === Number(selectedMitra));

  if (loading) {
    return (
      <div className="flex-1 flex flex-col md:ml-72 relative z-0 h-full">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-6xl text-outline animate-spin">progress_activity</span>
                <p className="font-body-md text-body-md text-on-surface-variant">Memuat data dashboard...</p>
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
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Mitra Dashboard</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {isMitra ? 'Pantau stok dan performa mitra Anda' : 'Kelola data mitra dan pantau performa penjualan.'}
              </p>
            </div>
            {!isMitra && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="h-12 px-6 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-xl flex items-center gap-2 transition-all duration-200 font-label-md text-label-md shadow-sm hover:shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined">person_add</span>
                {showForm ? 'Batal' : 'Tambah Mitra'}
              </button>
            )}
          </header>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Mitra</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{isMitra ? 'Dashboard Mitra' : 'Kelola data mitra'}</p>
            </div>
            {!isMitra && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="h-10 w-10 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-full flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
              </button>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="group" label="Total Mitra" value={totalMitra} subtitle="Semua mitra terdaftar" colorClass="bg-primary-fixed text-on-primary-fixed" />
            <StatCard icon="check_circle" label="Mitra Aktif" value={activeMitra} subtitle={`${totalMitra > 0 ? Math.round((activeMitra / totalMitra) * 100) : 0}% dari total`} trend={`${totalMitra > 0 ? Math.round((activeMitra / totalMitra) * 100) : 0}%`} trendUp colorClass="bg-tertiary-fixed text-on-tertiary-fixed" />
            <StatCard icon="receipt_long" label="Total Transaksi" value={totalTransaction.toLocaleString('id-ID')} subtitle="Bulan ini" colorClass="bg-secondary-fixed text-on-secondary-fixed" />
            <StatCard icon="payments" label="Total Omzet" value={`Rp ${totalOmzet.toLocaleString('id-ID')}`} subtitle="Bulan ini" colorClass="bg-primary-fixed text-on-primary-fixed" />
          </div>

          {/* Input Stok Harian */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant/50 bg-surface flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">inventory</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-background">Input Stok Harian</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Catat stok harian per mitra</p>
                </div>
              </div>
              <button
                onClick={() => setShowStockForm(!showStockForm)}
                className="h-10 px-4 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-lg flex items-center gap-2 transition-colors font-label-md text-label-md"
              >
                <span className="material-symbols-outlined text-[18px]">{showStockForm ? 'close' : 'add'}</span>
                {showStockForm ? 'Batal' : 'Tambah'}
              </button>
            </div>

            {showStockForm && (
              <form className="p-6 border-b border-outline-variant/30 bg-surface-container-low" onSubmit={handleStockSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Mitra</label>
                    {isMitra ? (
                      <div className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low font-body-md text-body-md flex items-center text-on-surface-variant">
                        {mitraList.find((m) => m.id === Number(selectedMitra))?.fullName || '-'}
                      </div>
                    ) : (
                      <select
                        className="w-full h-12 pl-4 pr-10 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none"
                        value={selectedMitra}
                        onChange={(e) => setSelectedMitra(e.target.value)}
                        required
                      >
                        <option value="">Pilih Mitra</option>
                        {mitraList.filter((m) => m.status === 'Aktif').map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.fullName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Produk</label>
                    <select
                      className="w-full h-12 pl-4 pr-10 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none"
                      value={stockFormData.productId}
                      onChange={(e) => setStockFormData({ ...stockFormData, productId: e.target.value })}
                      required
                    >
                      <option value="">Pilih Produk</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Stok</label>
                    <input
                      className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                      type="number"
                      placeholder="0"
                      value={stockFormData.stock}
                      onChange={(e) => setStockFormData({ ...stockFormData, stock: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Catatan</label>
                    <input
                      className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                      type="text"
                      placeholder="Opsional"
                      value={stockFormData.note}
                      onChange={(e) => setStockFormData({ ...stockFormData, note: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="submit" className="h-12 px-6 bg-secondary-fixed-dim hover:bg-secondary-container text-on-secondary-container rounded-xl font-label-md text-label-md transition-colors">
                    Simpan Stok
                  </button>
                </div>
              </form>
            )}

            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Filter Tanggal</label>
                  <input
                    type="date"
                    className="w-full h-10 px-4 rounded-lg border border-outline bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                    value={stockDate}
                    onChange={(e) => setStockDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Filter Mitra</label>
                  <select
                    className="w-full h-10 px-4 rounded-lg border border-outline bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                    value={selectedMitra}
                    onChange={(e) => setSelectedMitra(e.target.value)}
                  >
                    <option value="">Semua Mitra</option>
                    {mitraList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Tanggal</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Mitra</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Produk</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Stok</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Status</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md divide-y divide-outline-variant/50">
                    {todayStock.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <span className="material-symbols-outlined text-6xl text-outline mb-3">inventory_2</span>
                          <p className="font-body-md text-body-md text-on-surface-variant">Tidak ada data stok untuk tanggal ini</p>
                        </td>
                      </tr>
                    ) : (
                      todayStock.map((stock, idx) => {
                        const mitra = mitraList.find((m) => m.id === stock.mitraId);
                        const product = products.find((p) => p.id === stock.productId);
                        if (selectedMitra && stock.mitraId !== Number(selectedMitra)) return null;
                        return (
                          <tr key={stock.id} className={`hover:bg-surface-container-low/50 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                            <td className="px-6 py-4">
                              <span className="font-body-sm text-body-sm text-on-surface">{stock.date}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-body-sm text-body-sm text-on-surface">{mitra?.fullName || '-'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-body-sm text-body-sm text-on-surface">{product?.name || '-'}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-numeric-data text-numeric-data text-on-background">{stock.quantity} {product?.unit || ''}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-label-sm border ${stock.status === 'validated' ? 'bg-tertiary-fixed/15 text-tertiary-container border-tertiary-fixed/30' : 'bg-[#fdf2d5] text-[#7a590c] border-[#ebd083]'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {stock.status === 'validated' ? 'Tervalidasi' : 'Menunggu'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-body-sm text-body-sm text-on-surface-variant">{stock.note || '-'}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Add Mitra Form - Collapsible */}
          {showForm && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-outline-variant/50 bg-surface flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-background">Tambah Mitra Baru</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Isi data mitra dengan lengkap</p>
                </div>
              </div>
              <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Lengkap */}
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="fullName">
                      Nama Lengkap <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </div>
                      <input
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70"
                        id="fullName"
                        type="text"
                        placeholder="Masukkan nama lengkap"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="email">
                      Email <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                      </div>
                      <input
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70"
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* No HP */}
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="phone">
                      No HP <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">phone</span>
                      </div>
                      <input
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70"
                        id="phone"
                        type="tel"
                        placeholder="081234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="gender">
                      Jenis Kelamin <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">wc</span>
                      </div>
                      <select
                        className="w-full h-12 pl-12 pr-10 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background appearance-none cursor-pointer"
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                      </div>
                    </div>
                  </div>

                  {/* Alamat - Full Width */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="address">
                      Alamat <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-4 left-0 pl-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">location_on</span>
                      </div>
                      <textarea
                        className="w-full h-24 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background placeholder:text-outline/70 resize-none"
                        id="address"
                        placeholder="Masukkan alamat lengkap"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Foto Mitra - Full Width */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium" htmlFor="photo">
                      Foto Mitra
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-surface-container overflow-hidden border-2 border-outline-variant flex items-center justify-center flex-shrink-0 shadow-sm">
                        {formData.photo ? (
                          <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-3xl text-outline">person</span>
                        )}
                      </div>
                      <label className="cursor-pointer bg-surface-container-low hover:bg-surface-container border border-outline px-4 py-2 rounded-xl font-label-md text-label-md text-on-surface transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">upload</span>
                        Pilih Foto
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="h-12 px-6 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-label-md text-label-md transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="h-12 px-6 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-xl font-label-md text-label-md transition-colors shadow-sm"
                  >
                    Simpan Mitra
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Toast Notification */}
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
      </main>
    </div>
  );
}

export default MitraDashboard;