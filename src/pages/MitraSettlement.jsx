import { useState, useEffect, useMemo } from 'react';
import { mitraSettlementService, mitraService, productService } from '../lib/services';

function MitraSettlement({ user }) {
  const [settlements, setSettlements] = useState([]);
  const [mitraList, setMitraList] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState(null);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    mitra_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    items: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settlementsData, mitraData, productsData] = await Promise.all([
        mitraSettlementService.getAll().catch(() => []),
        mitraService.getAll(),
        productService.getAll(),
      ]);
      setSettlements(settlementsData || []);
      setMitraList(mitraData || []);
      setProducts(productsData || []);
      console.log('[MitraSettlement] loaded mitra:', mitraData);
    } catch (error) {
      console.error('Failed to load settlement data:', error);
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  console.log('[MitraSettlement] render mitraList:', mitraList);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', product_name: '', quantity: 0, selling_price: 0, cost_price: 0 }],
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      updatedItems[index] = {
        ...updatedItems[index],
        product_id: value,
        product_name: product?.nama_produk || '',
        selling_price: product?.selling_price || 0,
        cost_price: product?.mitra_price || 0,
      };
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const totals = useMemo(() => {
    const totalAmount = formData.items.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
    const totalCost = formData.items.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0);
    const totalProfit = totalAmount - totalCost;
    return { totalAmount, totalCost, totalProfit };
  }, [formData.items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mitra_id || formData.items.length === 0) {
      showToast('Pilih mitra dan minimal satu produk', 'error');
      return;
    }

    try {
      const settlementData = {
        mitra_id: formData.mitra_id,
        invoice_number: editingSettlement ? editingSettlement.invoice_number : generateInvoiceNumber(),
        items: formData.items,
        total_amount: totals.totalAmount,
        total_profit: totals.totalProfit,
        date: formData.date,
        status: formData.status,
        user_id: user?.id || null,
      };

      if (editingSettlement) {
        await mitraSettlementService.update(editingSettlement.id, settlementData);
        showToast('Invoice berhasil diperbarui!', 'success');
      } else {
        await mitraSettlementService.create(settlementData);
        showToast('Invoice berhasil dibuat!', 'success');
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error('Failed to save settlement:', error);
      showToast('Gagal menyimpan invoice: ' + (error?.message || ''), 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      mitra_id: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      items: [],
    });
    setShowForm(false);
    setEditingSettlement(null);
  };

  const handleEdit = (settlement) => {
    setEditingSettlement(settlement);
    setFormData({
      mitra_id: settlement.mitra_id,
      date: settlement.date,
      status: settlement.status,
      items: settlement.items || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus invoice ini?')) return;
    try {
      await mitraSettlementService.delete(id);
      showToast('Invoice berhasil dihapus!', 'success');
      await loadData();
    } catch (error) {
      console.error('Failed to delete settlement:', error);
      showToast('Gagal menghapus invoice', 'error');
    }
  };

  const handlePrint = (settlement) => {
    setSelectedSettlement(settlement);
    setTimeout(() => window.print(), 100);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return { label: 'Lunas', class: 'bg-tertiary-fixed/15 text-tertiary-container border-tertiary-fixed/30' };
      case 'pending':
        return { label: 'Menunggu', class: 'bg-[#fdf2d5] text-[#7a590c] border-[#ebd083]' };
      case 'cancelled':
        return { label: 'Dibatalkan', class: 'bg-error-container/15 text-error border-error-container/30' };
      default:
        return { label: status, class: 'bg-surface-container text-on-surface-variant border-outline-variant' };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-6xl text-primary animate-pulse">progress_activity</span>
              <p className="font-body-md text-body-md text-on-surface-variant">Memuat data invoice...</p>
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
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Nota Penjualan Mitra</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Buat dan kelola invoice penjualan ke mitra
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="h-12 px-6 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-xl flex items-center gap-2 transition-all duration-200 font-label-md text-label-md shadow-sm hover:shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
              {showForm ? 'Batal' : 'Buat Invoice'}
            </button>
          </header>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Invoice Mitra</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Nota penjualan mitra</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="h-10 w-10 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-full flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
            </button>
          </div>

          {/* Create/Edit Form */}
          {showForm && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-outline-variant/50 bg-surface flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">{editingSettlement ? 'edit' : 'receipt'}</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-background">{editingSettlement ? 'Edit Invoice' : 'Buat Invoice Baru'}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{editingSettlement ? 'Perbarui invoice penjualan' : 'Buat nota penjualan untuk mitra'}</p>
                </div>
              </div>
              <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Mitra */}
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Mitra <span className="text-error">*</span></label>
                    <select
                      className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                      value={formData.mitra_id}
                      onChange={(e) => setFormData({ ...formData, mitra_id: e.target.value })}
                      required
                    >
                      <option value="">Pilih Mitra</option>
                      {mitraList.map(mitra => (
                        <option key={mitra.id} value={mitra.id}>{mitra.full_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tanggal */}
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Tanggal <span className="text-error">*</span></label>
                    <input
                      type="date"
                      className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Status</label>
                    <select
                      className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="pending">Menunggu</option>
                      <option value="paid">Lunas</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block font-label-md text-label-md text-on-surface font-medium">Detail Produk</label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="h-10 px-4 bg-secondary-fixed-dim hover:bg-secondary-container text-on-secondary-container rounded-lg flex items-center gap-2 transition-colors font-label-md text-label-md"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      Tambah Produk
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-surface-container rounded-xl border border-outline-variant">
                        <div className="md:col-span-4 space-y-2">
                          <label className="block font-label-sm text-label-sm text-on-surface-variant">Produk</label>
                          <select
                            className="w-full h-10 px-3 rounded-lg border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                            value={item.product_id}
                            onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                            required
                          >
                            <option value="">Pilih Produk</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.nama_produk}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="block font-label-sm text-label-sm text-on-surface-variant">Jumlah</label>
                          <input
                            type="number"
                            className="w-full h-10 px-3 rounded-lg border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                            value={item.quantity || ''}
                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                            min="1"
                            required
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="block font-label-sm text-label-sm text-on-surface-variant">Harga Jual</label>
                          <input
                            type="number"
                            className="w-full h-10 px-3 rounded-lg border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                            value={item.selling_price || ''}
                            onChange={(e) => updateItem(index, 'selling_price', Number(e.target.value))}
                            min="0"
                            required
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="block font-label-sm text-label-sm text-on-surface-variant">Harga Modal</label>
                          <input
                            type="number"
                            className="w-full h-10 px-3 rounded-lg border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md"
                            value={item.cost_price || ''}
                            onChange={(e) => updateItem(index, 'cost_price', Number(e.target.value))}
                            min="0"
                            required
                          />
                        </div>
                        <div className="md:col-span-1 flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="h-10 w-10 rounded-lg bg-error-container/20 text-error hover:bg-error hover:text-on-error flex items-center justify-center transition-all"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant space-y-2">
                  <div className="flex justify-between font-body-md text-body-md">
                    <span className="text-on-surface-variant">Total Jual</span>
                    <span className="font-semibold text-on-background">Rp {totals.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-body-md text-body-md">
                    <span className="text-on-surface-variant">Total Modal</span>
                    <span className="font-semibold text-on-background">Rp {totals.totalCost.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-headline-sm text-headline-sm">
                    <span className="text-primary">Keuntungan</span>
                    <span className="text-primary font-semibold">Rp {totals.totalProfit.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="h-12 px-6 rounded-xl border border-outline text-on-surface font-label-md hover:bg-surface-container transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="h-12 px-6 bg-primary hover:bg-primary-fixed-variant text-on-primary rounded-xl font-label-md shadow-sm transition-all"
                  >
                    {editingSettlement ? 'Perbarui Invoice' : 'Simpan Invoice'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Settlements List */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-outline-variant/50">
              <h3 className="font-headline-sm text-headline-sm text-on-background">Daftar Invoice</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Riwayat nota penjualan ke mitra</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">No. Invoice</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Mitra</th>
                    <th className="py-3 px-4 text-right">Total Jual</th>
                    <th className="py-3 px-4 text-right">Keuntungan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 text-sm">
                  {settlements.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-on-surface-variant">
                        Belum ada invoice.
                      </td>
                    </tr>
                  ) : (
                    settlements.map((settlement) => {
                      const badge = getStatusBadge(settlement.status);
                      return (
                        <tr key={settlement.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-on-surface-variant">{settlement.invoice_number}</td>
                          <td className="py-3 px-4 text-on-surface">{settlement.date}</td>
                          <td className="py-3 px-4 text-on-surface">{settlement.mitra?.full_name || '-'}</td>
                          <td className="py-3 px-4 text-right font-medium text-on-background">
                            Rp {(settlement.total_amount || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-primary">
                            Rp {(settlement.total_profit || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs border ${badge.class}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handlePrint(settlement)}
                                className="w-8 h-8 rounded-lg bg-secondary-container/50 hover:bg-secondary-container text-on-secondary-container flex items-center justify-center transition-all"
                                title="Cetak"
                              >
                                <span className="material-symbols-outlined text-sm">print</span>
                              </button>
                              <button
                                onClick={() => handleEdit(settlement)}
                                className="w-8 h-8 rounded-lg bg-secondary-container/50 hover:bg-secondary-container text-on-secondary-container flex items-center justify-center transition-all"
                                title="Edit"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(settlement.id)}
                                className="w-8 h-8 rounded-lg bg-error-container/30 hover:bg-error-container/50 text-error flex items-center justify-center transition-all"
                                title="Hapus"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
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
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm flex items-center gap-2 animate-bounce ${
          toast.type === 'error' 
            ? 'bg-error-container text-error border-error/30' 
            : 'bg-surface-container-high text-on-background border-outline-variant'
        }`}>
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.message}
        </div>
      )}

      {/* Print Area */}
      {selectedSettlement && (
        <div className="fixed inset-0 bg-black/50 z-50 hidden print:block print:bg-transparent print:relative print:inset-auto print-area">
          <div className="absolute inset-4 bg-white rounded-lg shadow-2xl overflow-auto print:absolute print:inset-0 print:shadow-none print:rounded-none">
            <div className="p-8 max-w-[80mm] mx-auto print:max-w-none print:p-4">
              {/* Invoice Header */}
              <div className="text-center border-b-2 border-double border-gray-300 pb-4 mb-4">
                <h1 className="text-2xl font-bold mb-1">LAPAK BERKAH BUNTULIA</h1>
                <p className="text-sm text-gray-600 mb-2">Nota Penjualan Mitra</p>
                <div className="text-xs space-y-1">
                  <p>No. Invoice: <span className="font-bold">{selectedSettlement.invoice_number}</span></p>
                  <p>Tanggal: {selectedSettlement.date}</p>
                </div>
              </div>

              {/* Mitra Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="font-bold mb-1">Kepada:</p>
                <p className="font-bold">{selectedSettlement.mitra?.full_name || '-'}</p>
                <p className="text-xs text-gray-600">Mitra Lapak Berkah</p>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs border-collapse mb-4">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-1">Produk</th>
                    <th className="text-center py-2 px-1">Qty</th>
                    <th className="text-right py-2 px-1">Harga</th>
                    <th className="text-right py-2 px-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedSettlement.items || []).map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2 px-1">{item.product_name}</td>
                      <td className="text-center py-2 px-1">{item.quantity}</td>
                      <td className="text-right py-2 px-1">Rp {(item.selling_price || 0).toLocaleString('id-ID')}</td>
                      <td className="text-right py-2 px-1">Rp {(item.selling_price * item.quantity || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t-2 border-gray-300 pt-2 space-y-1 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Total Jual:</span>
                  <span className="font-bold">Rp {(selectedSettlement.total_amount || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Modal:</span>
                  <span className="font-bold">Rp {((selectedSettlement.items || []).reduce((sum, item) => sum + (item.cost_price * item.quantity), 0)).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-double border-gray-400 pt-2 mt-2">
                  <span>Keuntungan:</span>
                  <span className="text-primary">Rp {(selectedSettlement.total_profit || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 mt-8 pt-4">
                <div className="text-center">
                  <p className="font-bold mb-8">Mitra</p>
                  <div className="border-b border-gray-400 mb-2 h-8"></div>
                  <p className="text-sm font-bold">{selectedSettlement.mitra?.full_name || '_________________'}</p>
                  <p className="text-xs text-gray-500">Penerima</p>
                </div>
                <div className="text-center">
                  <p className="font-bold mb-8">Owner/Admin</p>
                  <div className="border-b border-gray-400 mb-2 h-8"></div>
                  <p className="text-sm font-bold">{selectedSettlement.user?.nama || user?.nama || '_________________'}</p>
                  <p className="text-xs text-gray-500">Pembuat</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Dokumen ini dicetak secara otomatis oleh sistem Lapak Berkah Buntulia</p>
                <p>{new Date().toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MitraSettlement;
