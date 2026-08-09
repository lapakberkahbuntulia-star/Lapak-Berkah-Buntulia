import { useState, useEffect, useMemo } from 'react';
import { productService } from '../lib/services';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      showToast('Gagal memuat produk', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (product) => {
    if (product.stock === 0) {
      return { label: 'Habis', class: 'bg-red-50 text-red-700 border-red-200' };
    } else if (product.stock <= 10) {
      return { label: 'Stok Rendah', class: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Tersedia', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const categories = useMemo(() => ['Semua', ...new Set(products.map(p => p.category?.name).filter(Boolean))], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode_id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || product.category?.name === selectedCategory;
      const matchesStatus = selectedStatus === 'Semua' ||
        (selectedStatus === 'Habis' && product.stock === 0) ||
        (selectedStatus === 'Stok Rendah' && product.stock > 0 && product.stock <= 10) ||
        (selectedStatus === 'Tersedia' && product.stock > 10);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    /* Perbaikan: Menghilangkan md:ml-72 dan menggunakan flex-1 min-w-0 agar tata letak menyesuaikan sidebar secara otomatis */
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 h-full">
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 w-full">
          
          {/* Page Header Desktop */}
          <header className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory</h2>
              <p className="text-sm text-slate-500 mt-1">
                Pantau stok dan status inventaris
              </p>
            </div>
          </header>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inventory</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pantau stok inventaris</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">Total</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Total Produk</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{totalProducts}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <span className="material-symbols-outlined">shopping_cart</span>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">Qty</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Total Stok</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{totalStock}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                      <span className="material-symbols-outlined">warning</span>
                    </div>
                    <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full font-medium">Perhatian</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Stok Menipis</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{lowStock}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                      <span className="material-symbols-outlined">remove_circle</span>
                    </div>
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full font-medium">Kritis</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Stok Habis</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{outOfStock}</p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cari Produk</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                      <input
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all placeholder:text-slate-400"
                        placeholder="Nama, SKU, atau Barcode ID..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                    <select
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full md:w-48">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="Semua">Semua</option>
                      <option value="Tersedia">Tersedia</option>
                      <option value="Stok Rendah">Stok Rendah</option>
                      <option value="Habis">Habis</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-white">
                  <h3 className="text-lg font-bold text-slate-900">Daftar Inventaris</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Menampilkan {filteredProducts.length} dari {products.length} produk</p>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-3">inventory_2</span>
                    <p className="text-sm text-slate-500">Tidak ada produk yang ditemukan</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold text-left">Produk</th>
                          <th className="px-6 py-4 font-semibold text-left">SKU</th>
                          <th className="px-6 py-4 font-semibold text-left">Kategori</th>
                          <th className="px-6 py-4 font-semibold text-left">Jenis</th>
                          <th className="px-6 py-4 font-semibold text-left">Mitra</th>
                          <th className="px-6 py-4 font-semibold text-right">Stok</th>
                          <th className="px-6 py-4 font-semibold text-center">Status</th>
                          <th className="px-6 py-4 font-semibold text-left">Barcode</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-slate-100 text-slate-700">
                        {filteredProducts.map((product, idx) => {
                          const status = getStatusBadge(product);
                          return (
                            <tr
                              key={product.id}
                              className={`hover:bg-slate-50 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0 shadow-sm">
                                    {product.photo ? (
                                      <img src={product.photo} alt={product.nama_produk} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined text-xl">image</span>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-900 text-base">{product.nama_produk}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">Rp {product.selling_price.toLocaleString('id-ID')}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600">{product.sku}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  {product.category?.name}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  {product.type?.name}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-600">{product.mitra?.full_name}</td>
                              <td className="px-6 py-4 text-right font-medium text-slate-900">{product.stock} {product.unit}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.class}`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md text-slate-600">{product.barcode_id}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Inventory;