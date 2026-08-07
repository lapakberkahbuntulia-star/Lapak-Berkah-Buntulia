import { useState, useEffect } from 'react';
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
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (product) => {
    if (product.stock === 0) {
      return { label: 'Habis', class: 'bg-error-container/15 text-error border-error-container/30' };
    } else if (product.stock <= 10) {
      return { label: 'Stok Rendah', class: 'bg-[#fdf2d5] text-[#7a590c] border-[#ebd083]' };
    }
    return { label: 'Tersedia', class: 'bg-tertiary-fixed/15 text-tertiary-container border-tertiary-fixed/30' };
  };

  const categories = ['Semua', ...new Set(products.map(p => p.category?.name).filter(Boolean))];

  const filteredProducts = products.filter((product) => {
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

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <div className="flex-1 flex flex-col md:ml-72 relative z-0 h-full">
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Page Header */}
          <header className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Inventory</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Pantau stok dan status inventaris
              </p>
            </div>
          </header>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Inventory</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Pantau stok inventaris</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">Total</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Produk</p>
                    <p className="font-display-lg text-display-lg text-on-background tracking-tight">{totalProducts}</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-11 h-11 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                      <span className="material-symbols-outlined">shopping_cart</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">Qty</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Stok</p>
                    <p className="font-display-lg text-display-lg text-on-background tracking-tight">{totalStock}</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-11 h-11 rounded-xl bg-[#fdf2d5] flex items-center justify-center text-[#7a590c]">
                      <span className="material-symbols-outlined">warning</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-[#7a590c] bg-[#fdf2d5]/50 px-2 py-1 rounded-full">Perhatian</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Stok Menipis</p>
                    <p className="font-display-lg text-display-lg text-on-background tracking-tight">{lowStock}</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-11 h-11 rounded-xl bg-error-container/30 flex items-center justify-center text-error">
                      <span className="material-symbols-outlined">remove_circle</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-error bg-error-container/20 px-2 py-1 rounded-full">Kritis</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant mb-1">Stok Habis</p>
                    <p className="font-display-lg text-display-lg text-on-background tracking-tight">{outOfStock}</p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Cari Produk</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                      <input
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md transition-all placeholder:text-outline/70"
                        placeholder="Nama, SKU, atau Barcode ID..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Kategori</label>
                    <select
                      className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full md:w-48">
                    <label className="block font-label-md text-label-md text-on-surface font-medium mb-2">Status</label>
                    <select
                      className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-body-md text-body-md appearance-none"
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
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant bg-surface">
                  <h3 className="font-headline-sm text-headline-sm text-on-background">Daftar Inventaris</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Menampilkan {filteredProducts.length} dari {products.length} produk</p>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-outline mb-3">inventory_2</span>
                    <p className="font-body-md text-body-md text-on-surface-variant">Tidak ada produk yang ditemukan</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant">
                          <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Produk</th>
                          <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">SKU</th>
                          <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Kategori</th>
                          <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Jenis</th>
                          <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Mitra</th>
                          <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-right">Stok</th>
                          <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-center">Status</th>
                          <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold text-left">Barcode</th>
                        </tr>
                      </thead>
                      <tbody className="font-body-md text-body-md divide-y divide-outline-variant/50">
                        {filteredProducts.map((product, idx) => {
                          const status = getStatusBadge(product);
                          return (
                            <tr
                              key={product.id}
                              className={`hover:bg-surface-container-low/50 transition-colors duration-150 ${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-surface-container overflow-hidden border border-outline-variant flex-shrink-0 shadow-sm">
                                    {product.photo ? (
                                      <img src={product.photo} alt={product.nama_produk} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-outline">
                                        <span className="material-symbols-outlined text-2xl">image</span>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-on-surface text-base">{product.nama_produk}</div>
                                    <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Rp {product.selling_price.toLocaleString('id-ID')}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-sm bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">{product.sku}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant border border-outline-variant">
                                  {product.category?.name}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-container text-on-surface-variant border border-outline-variant">
                                  {product.type?.name}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-body-sm text-body-sm text-on-surface">{product.mitra?.full_name}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="font-numeric-data text-numeric-data text-on-background">{product.stock} {product.unit}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-label-sm border ${status.class}`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-sm bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">{product.barcode_id}</span>
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
