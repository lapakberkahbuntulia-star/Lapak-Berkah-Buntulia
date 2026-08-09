import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  productService,
  stockMovementService,
  pendingStockValidationService,
  mitraService,
} from '../lib/services';

function StockManagement() {
  const [productsList, setProductsList] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [pendingValidations, setPendingValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('Semua');
  const [filterProduct, setFilterProduct] = useState('Semua');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [valStartDate, setValStartDate] = useState('');
  const [valEndDate, setValEndDate] = useState('');
  const [valMitra, setValMitra] = useState('Semua');
  const [formData, setFormData] = useState({ type: 'in', productId: '', quantity: '', note: '' });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, movementsData, validationsData, mitraData] = await Promise.all([
          productService.getAll(),
          stockMovementService.getAll(),
          pendingStockValidationService.getAll(),
          mitraService.getAll(),
        ]);

        setProductsList(
          productsData.map((p) => ({
            id: p.id,
            name: p.nama_produk,
            sku: p.sku,
            category: p.category?.name,
            type: p.type?.name,
            mitraName: p.mitra?.full_name,
            mitraId: p.mitra_id,
            stock: p.stock,
            unit: p.unit,
          })),
        );

        setStockMovements(
          movementsData.map((m) => ({
            id: m.id,
            type: m.type,
            productId: m.product_id,
            productName: m.product?.nama_produk,
            quantity: m.quantity,
            date: m.date || (m.created_at ? m.created_at.split('T')[0] : ''),
            note: m.note,
            mitraName: m.mitra?.full_name,
          })),
        );

        setPendingValidations(
          validationsData.map((v) => ({
            id: v.id,
            mitraName: v.mitra?.full_name,
            mitraId: v.mitra_id,
            productId: v.product_id,
            productName: v.product?.nama_produk,
            quantity: v.quantity,
            date: v.date,
            note: v.note,
          })),
        );
      } catch (error) {
        showToast('Gagal memuat data stok', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateProductStock = async (productId, quantity, type) => {
    const optimisticProduct = productsList.find((p) => p.id === productId);
    if (!optimisticProduct) return;

    setProductsList((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const delta = type === 'in' ? quantity : -quantity;
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }),
    );

    try {
      if (type === 'out') {
        const success = await productService.decrementStock(productId, quantity);
        if (!success) {
          throw new Error('Stok tidak cukup untuk dikurangi');
        }
      } else {
        const { data: currentProduct } = await supabase
          .from('products')
          .select('stock')
          .eq('id', productId)
          .single();
        const updatedStock = Math.max(0, (currentProduct?.stock || 0) + quantity);
        await productService.update(productId, { stock: updatedStock });
      }
    } catch (error) {
      showToast('Gagal memperbarui stok produk di database', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const product = productsList.find((p) => p.id === formData.productId);
    if (!product || !formData.quantity || Number(formData.quantity) <= 0) return;

    try {
      const newMovement = await stockMovementService.create({
        type: formData.type,
        product_id: String(formData.productId),
        quantity: Number(formData.quantity),
        note: formData.note,
        mitra_id: formData.type === 'in' ? String(product.mitraId) : null,
      });

      setStockMovements((prev) => [
        {
          id: newMovement.id,
          type: newMovement.type,
          productId: newMovement.product_id,
          productName: product.name,
          quantity: newMovement.quantity,
          date: newMovement.date || (newMovement.created_at ? newMovement.created_at.split('T')[0] : ''),
          note: newMovement.note,
          mitraName: newMovement.mitra?.full_name || (formData.type === 'in' ? product.mitraName : '-'),
        },
        ...prev,
      ]);
      await updateProductStock(formData.productId, Number(formData.quantity), formData.type);
      setFormData({ type: 'in', productId: '', quantity: '', note: '' });
      setShowForm(false);
      showToast('Transaksi stok berhasil disimpan!', 'success');
    } catch (error) {
      showToast('Gagal menyimpan transaksi stok', 'error');
    }
  };

  const handleValidate = async (validationId) => {
    const validation = pendingValidations.find((v) => v.id === validationId);
    if (!validation) return;

    const product = productsList.find((p) => p.id === validation.productId);
    if (!product) return;

    try {
      await pendingStockValidationService.validate(validationId);

      const newMovement = await stockMovementService.create({
        type: 'in',
        product_id: String(validation.productId),
        quantity: validation.quantity,
        note: validation.note,
        mitra_id: validation.mitraId ? String(validation.mitraId) : null,
      });

      setStockMovements((prev) => [
        {
          id: newMovement.id,
          type: 'in',
          productId: validation.productId,
          productName: product.name,
          quantity: validation.quantity,
          date: validation.date,
          note: validation.note,
          mitraName: validation.mitraName,
        },
        ...prev,
      ]);
      await updateProductStock(validation.productId, validation.quantity, 'in');
      setPendingValidations((prev) => prev.filter((v) => v.id !== validationId));
      showToast('Stok berhasil divalidasi!', 'success');
    } catch (error) {
      showToast('Gagal memvalidasi stok', 'error');
    }
  };

  const filteredMovements = stockMovements.filter((m) => {
    const matchesType = filterType === 'Semua' || m.type === filterType;
    const matchesProduct = filterProduct === 'Semua' || m.productId === Number(filterProduct);
    const matchesDate = (!startDate || m.date >= startDate) && (!endDate || m.date <= endDate);
    return matchesType && matchesProduct && matchesDate;
  });

  const filteredPendingValidations = pendingValidations.filter((v) => {
    const matchesMitra = valMitra === 'Semua' || v.mitraName === valMitra;
    const matchesDate = (!valStartDate || v.date >= valStartDate) && (!valEndDate || v.date <= valEndDate);
    return matchesMitra && matchesDate;
  });

  const mitraNames = ['Semua', ...new Set(pendingValidations.map((v) => v.mitraName))];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="font-body-md text-body-md text-on-surface-variant">Memuat data stok...</p>
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
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Manajemen Stok</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Validasi stok mitra dan catat stok masuk/keluar
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="h-12 px-6 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-xl flex items-center gap-2 transition-all duration-200 font-label-md text-label-md shadow-sm hover:shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined">add</span>
              {showForm ? 'Batal' : 'Tambah Transaksi'}
            </button>
          </header>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Stok</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Validasi dan manajemen stok</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="h-10 w-10 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-full flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
            </button>
          </div>

          {/* Validation Section */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant/50 bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/20 flex items-center justify-center text-tertiary-container">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-background">Validasi Stok Mitra</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {pendingValidations.length} menunggu validasi
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-48">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Filter Tanggal</label>
                  <input
                    type="date"
                    className="w-full h-10 px-4 rounded-lg border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                    value={valStartDate}
                    onChange={(e) => setValStartDate(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    className="w-full h-10 px-4 rounded-lg border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                    value={valEndDate}
                    onChange={(e) => setValEndDate(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Nama Mitra</label>
                  <select
                    className="w-full h-10 px-4 rounded-lg border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none"
                    value={valMitra}
                    onChange={(e) => setValMitra(e.target.value)}
                  >
                    {mitraNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredPendingValidations.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-5xl text-outline mb-2">check_circle</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">Tidak ada stok yang menunggu validasi</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Tanggal</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Mitra</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Produk</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Jumlah</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Catatan</th>
                        <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-body-md divide-y divide-outline-variant/50">
                      {filteredPendingValidations.map((validation, idx) => {
                        const product = productsList.find((p) => p.id === validation.productId);
                        return (
                          <tr key={validation.id} className={`hover:bg-surface-container-low/50 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}>
                            <td className="px-6 py-4">
                              <span className="font-body-sm text-body-sm text-on-surface">{validation.date}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-body-sm text-body-sm text-on-surface">{validation.mitraName}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-body-sm text-body-sm text-on-surface">{product?.name || '-'}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-numeric-data text-numeric-data text-on-background">{validation.quantity} {product?.unit || ''}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-body-sm text-body-sm text-on-surface-variant">{validation.note || '-'}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleValidate(validation.id)}
                                className="h-9 px-4 bg-tertiary-fixed/20 hover:bg-tertiary-fixed text-tertiary-container rounded-lg font-label-md text-label-md transition-colors flex items-center gap-2 mx-auto"
                              >
                                <span className="material-symbols-outlined text-[18px]">check</span>
                                Validasi
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Add/Edit Stock Movement Form */}
          {showForm && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-outline-variant/50 bg-surface flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">add_circle</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-background">Tambah Transaksi Stok</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Catat stok masuk atau keluar</p>
                </div>
              </div>
              <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Jenis Transaksi */}
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Jenis Transaksi</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">swap_vert</span>
                      </div>
                      <select
                        className="w-full h-12 pl-12 pr-10 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none cursor-pointer"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        <option value="in">Stok Masuk</option>
                        <option value="out">Stok Keluar</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                      </div>
                    </div>
                  </div>

                  {/* Produk */}
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Produk</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                      </div>
                      <select
                        className="w-full h-12 pl-12 pr-10 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none cursor-pointer"
                        value={formData.productId}
                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                        required
                      >
                        <option value="">Pilih Produk</option>
                        {productsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stok: {p.stock} {p.unit})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                      </div>
                    </div>
                  </div>

                  {/* Jumlah */}
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Jumlah</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">numbers</span>
                      </div>
                      <input
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                        type="number"
                        placeholder="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Catatan */}
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Catatan</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">notes</span>
                      </div>
                      <input
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                        type="text"
                        placeholder="Opsional"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      />
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
                    Simpan Transaksi
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

          {/* Filters */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-48">
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Jenis</label>
                <select
                  className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="Semua">Semua</option>
                  <option value="in">Stok Masuk</option>
                  <option value="out">Stok Keluar</option>
                </select>
              </div>
              <div className="w-full md:w-48">
                <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Produk</label>
                <select
                  className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none"
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(e.target.value)}
                >
                  <option value="Semua">Semua</option>
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
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
            </div>
          </div>

          {/* Stock Movements Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-outline-variant bg-surface">
              <h3 className="font-headline-sm text-headline-sm text-on-background">Riwayat Transaksi Stok</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Menampilkan {filteredMovements.length} transaksi</p>
            </div>

            {filteredMovements.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-outline mb-3">inventory_2</span>
                <p className="font-body-md text-body-md text-on-surface-variant">Tidak ada transaksi stok</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Tanggal</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Jenis</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Produk</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Jumlah</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Mitra</th>
                      <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md divide-y divide-outline-variant/50">
                    {filteredMovements.map((movement, idx) => {
                      const product = productsList.find((p) => p.id === movement.productId);
                      return (
                        <tr
                          key={movement.id}
                          className={`hover:bg-surface-container-low/50 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <span className="font-body-sm text-body-sm text-on-surface">{movement.date}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-label-sm border ${
                                movement.type === 'in'
                                  ? 'bg-tertiary-fixed/15 text-tertiary-container border-tertiary-fixed/30'
                                  : 'bg-error-container/15 text-error border-error-container/30'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {movement.type === 'in' ? 'Masuk' : 'Keluar'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-body-sm text-body-sm text-on-surface">{product?.name || '-'}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-numeric-data text-numeric-data ${movement.type === 'in' ? 'text-tertiary-container' : 'text-error'}`}>
                              {movement.type === 'in' ? '+' : '-'}
                              {movement.quantity} {product?.unit || ''}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-body-sm text-body-sm text-on-surface">{movement.mitraName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-body-sm text-body-sm text-on-surface-variant">{movement.note || '-'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-label-md text-label-md">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default StockManagement;