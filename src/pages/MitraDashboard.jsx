import { useState, useEffect } from 'react';

const initialMitra = [
  { id: 1, fullName: 'Toko Makmur', address: 'Jl. Merdeka No. 45, Buntulia', phone: '081234567890', email: 'makmur@example.com', gender: 'Laki-laki', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB49vG9Vi3qbccoLZTXOLCqShe83hxitKq-wO3Iud7yeRH4bnZt2z0KcWxLd05BsiXOGCsKYwMKMXivhLKmYbr5fjtWgLkZixOEhtdAXQMZFIsO098CSV5idKs-jD4BvjZ4O9yC5r0GgwI95lKuy2oX4MFkNyI0hV-fY2GQnKYnBnyKDMJHPpOFzE66yL9OywVNAdvHQb1dvhuWq4bYsPLpVExHIszD98fWP0RqV2EVmKnMEPCPM_8WEaD-B1rebwVHSrA', status: 'Aktif', totalTransaction: 156, totalOmzet: 42500000 },
  { id: 2, fullName: 'Grosir Jaya', address: 'Jl. Sudirman No. 12, Buntulia', phone: '087765432101', email: 'jaya@example.com', gender: 'Laki-laki', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9S0lXMpRCIso-L8CBlj_U0MUQvoGBrQKhOVgsA54pAt-PbsyTJM5gPW1TDbWseVKIKBbDhf4ZBtI9wMQ3FSzouSGDMY3xbXtIyxirFJxSlk0YSDW7OUkpsvxjNQLl2kWrsF3Q_nFdCLy1SZReZR-SRm3wBB_5OpY9hjjEWFHzgwtfw9gjAbWHi0YbuDlNjGtlO_-LjzIh24qq9oobBsLzLD9oM_y5o3An1VRKRe8fWYF5RiZ30xX89A', status: 'Aktif', totalTransaction: 89, totalOmzet: 22150000 },
  { id: 3, fullName: 'Toko Harapan', address: 'Jl. Diponegoro No. 8, Buntulia', phone: '089912345678', email: 'harapan@example.com', gender: 'Perempuan', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy_dC_R3oRxJ1d0ReP2F5QktKPUd4al-jRFlh_0wQDF5chjbpIErEr9nIyhA_Pak9a2yQqI_V_35NFG_290FDhpcyTxNSv5JBNTx01cGw0SQz98-vHdeijubwm-9cpLLsEVJ-5y1fe19ELkvf8a-Ze0RTkv1a4f7-yK5geAC8q0yx9_JtPC0wk8fWx9NOCBUxQ9rFCz0mwqFdPOaCh0bDJi3PGTTQoQMDveIbCK8762GcRQVbUuz-nkQ', status: 'Tidak Aktif', totalTransaction: 45, totalOmzet: 11200000 },
];

const products = [
  { id: 1, name: 'Nasi Kuning', sku: 'BRP-001', category: 'Perishable', type: 'Makanan Basah', mitraName: 'Toko Makmur', mitraId: 1, unit: 'Pcs' },
  { id: 2, name: 'Kerupuk', sku: 'MNG-002', category: 'Non-Perishable', type: 'Makanan Kering', mitraName: 'Grosir Jaya', mitraId: 2, unit: 'Pack' },
  { id: 3, name: 'Es Teh Manis', sku: 'GLP-003', category: 'Perishable', type: 'Minuman', mitraName: 'Toko Harapan', mitraId: 3, unit: 'Gelas' },
  { id: 4, name: 'Susu UHT 250ml', sku: 'MIG-004', category: 'Non-Perishable', type: 'Minuman', mitraName: 'Toko Makmur', mitraId: 1, unit: 'Karton' },
  { id: 5, name: 'Mie Instan Goreng', sku: 'SUS-005', category: 'Non-Perishable', type: 'Makanan Kering', mitraName: 'Grosir Jaya', mitraId: 2, unit: 'Pcs' },
  { id: 6, name: 'Kopi Susu Gula Aren', sku: 'KOP-006', category: 'Perishable', type: 'Minuman', mitraName: 'Toko Makmur', mitraId: 1, unit: 'Gelas' },
];

const initialStockInputs = [
  { id: 1, mitraId: 1, productId: 1, date: '2025-08-07', stock: 45, note: 'Stok pagi hari' },
  { id: 2, mitraId: 1, productId: 2, date: '2025-08-07', stock: 120, note: '' },
  { id: 3, mitraId: 2, productId: 3, date: '2025-08-07', stock: 0, note: 'Stok habis' },
];

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
  const [mitraList, setMitraList] = useState(initialMitra);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [selectedMitra, setSelectedMitra] = useState(isMitra ? '1' : '');
  const [stockDate, setStockDate] = useState(new Date().toISOString().split('T')[0]);
  const [stockInputs, setStockInputs] = useState(initialStockInputs);
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
    if (isMitra) {
      const currentMitra = mitraList.find(m => m.status === 'Aktif');
      if (currentMitra) {
        setSelectedMitra(String(currentMitra.id));
      }
    }
  }, [isMitra, mitraList]);

  const totalMitra = mitraList.length;
  const activeMitra = mitraList.filter((m) => m.status === 'Aktif').length;
  const totalTransaction = mitraList.reduce((sum, m) => sum + m.totalTransaction, 0);
  const totalOmzet = mitraList.reduce((sum, m) => sum + m.totalOmzet, 0);

  const filteredMitra = mitraList.filter((mitra) =>
    mitra.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mitra.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mitra.phone.includes(searchQuery)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMitra = {
      id: Date.now(),
      ...formData,
      status: 'Aktif',
      totalTransaction: 0,
      totalOmzet: 0,
    };
    setMitraList([...mitraList, newMitra]);
    setFormData({ fullName: '', address: '', phone: '', email: '', gender: 'Laki-laki', photo: '' });
    setShowForm(false);
    setToast({ message: 'Mitra berhasil ditambahkan!', type: 'success' });
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

  const handleStockSubmit = (e) => {
    e.preventDefault();
    if (!selectedMitra || !stockFormData.productId || !stockFormData.stock) return;
    const mitra = mitraList.find(m => m.id === Number(selectedMitra));
    const newStock = {
      id: Date.now(),
      mitraId: Number(selectedMitra),
      mitraName: mitra?.fullName || '-',
      productId: Number(stockFormData.productId),
      date: stockDate,
      stock: Number(stockFormData.stock),
      note: stockFormData.note,
      status: 'pending',
    };
    setStockInputs([...stockInputs, newStock]);
    setStockFormData({ productId: '', stock: '', note: '' });
    setShowStockForm(false);
    setToast({ message: 'Stok harian berhasil disimpan dan menunggu validasi admin!', type: 'success' });
  };

  const todayStock = stockInputs.filter(s => s.date === stockDate);
  const selectedMitraObj = mitraList.find(m => m.id === Number(selectedMitra));

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
                        {mitraList.find(m => m.id === Number(selectedMitra))?.fullName || '-'}
                      </div>
                    ) : (
                      <select
                        className="w-full h-12 pl-4 pr-10 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none"
                        value={selectedMitra}
                        onChange={(e) => setSelectedMitra(e.target.value)}
                        required
                      >
                        <option value="">Pilih Mitra</option>
                        {mitraList.filter(m => m.status === 'Aktif').map(m => (
                          <option key={m.id} value={m.id}>{m.fullName}</option>
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
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
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
                    {mitraList.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName}</option>
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
                        const mitra = mitraList.find(m => m.id === stock.mitraId);
                        const product = products.find(p => p.id === stock.productId);
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
                              <span className="font-numeric-data text-numeric-data text-on-background">{stock.stock} {product?.unit || ''}</span>
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
                          <span className="material-symbols-outlined text-outline text-4xl">person</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          className="w-full h-12 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body-md text-body-md text-on-background file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary-fixed-variant"
                          id="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">Format: JPG, PNG. Maksimal 2MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
                  <button
                    type="submit"
                    className="h-12 px-8 bg-secondary-fixed-dim hover:bg-secondary-container text-on-secondary-container font-label-md text-label-md rounded-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined">save</span>
                    Simpan Mitra
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="h-12 px-8 bg-surface border border-outline-variant text-on-surface-variant font-label-md text-label-md rounded-xl hover:bg-surface-container transition-all duration-200"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mitra List Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-background">Daftar Mitra</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Kelola dan pantau semua mitra</p>
              </div>
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-outline bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md transition-all placeholder:text-outline/70"
                  placeholder="Cari mitra..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredMitra.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-outline mb-3">person_off</span>
                <p className="font-body-md text-body-md text-on-surface-variant">Tidak ada mitra yang ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Mitra</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Kontak</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-center">Status</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Transaksi</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Omzet</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md divide-y divide-outline-variant/50">
                    {filteredMitra.map((mitra, idx) => (
                      <tr
                        key={mitra.id}
                        className={`hover:bg-surface-container-low/50 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-surface-container overflow-hidden border border-outline-variant flex-shrink-0 shadow-sm">
                              {mitra.photo ? (
                                <img src={mitra.photo} alt={mitra.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-outline">
                                  <span className="material-symbols-outlined text-2xl">person</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-on-surface text-base">{mitra.fullName}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-label-sm text-label-sm text-on-surface-variant">{mitra.gender}</span>
                                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                                <span className="font-label-sm text-label-sm text-on-surface-variant">{mitra.address.split(',')[0]}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-on-surface mb-1">
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">phone</span>
                            <span className="font-numeric-data text-numeric-data text-sm">{mitra.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px]">mail</span>
                            <span className="font-body-sm text-body-sm">{mitra.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-label-md ${
                              mitra.status === 'Aktif'
                                ? 'bg-tertiary-fixed/15 text-tertiary-container border border-tertiary-fixed/30'
                                : 'bg-error-container/15 text-error border border-error-container/30'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {mitra.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-numeric-data text-numeric-data text-on-background">{mitra.totalTransaction}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-numeric-data text-numeric-data text-primary font-semibold">Rp {mitra.totalOmzet.toLocaleString('id-ID')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Menampilkan {filteredMitra.length} dari {mitraList.length} mitra
              </span>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-label-sm text-label-sm disabled:opacity-50" disabled>
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Daftar Produk */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant/50 bg-surface">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-background">Daftar Produk</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {isMitra ? 'Produk yang Anda kelola' : 'Semua produk mitra'}
                  </p>
                </div>
                {!isMitra && (
                  <div className="w-full sm:w-64">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Filter Mitra</label>
                    <select
                      className="w-full h-10 px-4 rounded-lg border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none"
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                    >
                      <option value="Semua">Semua Mitra</option>
                      {mitraList.filter(m => m.status === 'Aktif').map(m => (
                        <option key={m.id} value={m.id}>{m.fullName}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Produk</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">SKU</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Kategori</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Jenis</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Mitra</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md divide-y divide-outline-variant/50">
                  {products
                    .filter((p) => {
                      if (isMitra) {
                        return p.mitraId === Number(selectedMitra);
                      }
                      return productFilter === 'Semua' || p.mitraId === Number(productFilter);
                    })
                    .map((product, idx) => (
                      <tr key={product.id} className={`hover:bg-surface-container-low/50 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                        <td className="px-6 py-4">
                          <span className="font-body-sm text-body-sm text-on-surface">{product.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">{product.sku}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant border border-outline-variant">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant border border-outline-variant">
                            {product.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-body-sm text-body-sm text-on-surface">{product.mitraName}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default MitraDashboard;
