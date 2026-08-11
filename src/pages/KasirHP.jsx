import { useState, useEffect } from 'react';
import { productService } from '../lib/services';

function KasirHP({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cart, setCart] = useState([
    { id: 1, name: 'Nasi Kuning', sku: 'BRP-001', category: 'Perishable', type: 'Makanan Basah', mitraName: 'Toko Makmur', mitraPrice: 14500, sellingPrice: 18000, qty: 1, photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9S0lXMpRCIso-L8CBlj_U0MUQvoGBrQKhOVgsA54pAt-PbsyTJM5gPW1TDbWseVKIKBbDhf4ZBtI9wMQ3FSzouSGDMY3xbXtIyxirFJxSlk0YSDW7OUkpsvxjNQLl2kWrsF3Q_nFdCLy1SZReZR-SRm3wBB_5OpY9hjjEWFHzgwtfw9gjAbWHi0YbuDlNjGtlO_-LjzIh24qq9oobBsLzLD9oM_y5o3An1VRKRe8fWYF5RiZ30xX89A', description: 'Nasi kuning siap saji', barcodeId: 'BC-001' },
    { id: 4, name: 'Mie Instan Goreng', sku: 'SUS-004', category: 'Non-Perishable', type: 'Makanan Kering', mitraName: 'Grosir Jaya', mitraPrice: 3000, sellingPrice: 4500, qty: 5, photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5qejlFpuAvF4M0PzqD6tNHnw6z1CjHJelomAYXJWHwCJIMsFaVz4LizVtCJDepveg23kZ1jtsSfCsIZgoL2YHjVkruEf4beb4auqiUQP4BTdIOrcNdPRnhKI3moA-cNa28RClHLo_B-Tr-3AyluWfaAgHALbMmEp6Z9LhFjN18Nfwzl4UblrTmIp1EGoD5YzlVxYofuUezaaJjaQZgJxKGKhGEgPHN77eU21_AVhSJNoszydXrUXxJg', description: 'Mie instan rasa goreng', barcodeId: 'BC-004' },
  ]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getAll();
        const mapped = data.map((p) => ({
          id: p.id,
          name: p.nama_produk,
          sku: p.sku,
          sellingPrice: p.selling_price,
          stock: p.stock,
          unit: p.unit,
          photo: p.photo,
          barcodeId: p.barcode_id,
          description: p.description,
          mitraName: p.mitra?.full_name || '',
          category: p.category,
          type: p.type,
          mitraPrice: p.mitra_price,
        }));
        setProducts(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const categories = ['Semua', ...new Set(products.map((p) => p.category?.name).filter(Boolean))];

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0);
  const tax = 0;
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-lowest">
        <span className="material-symbols-outlined text-6xl text-primary animate-spin" data-icon="progress_activity">progress_activity</span>
        <p className="mt-4 font-body-md text-body-md text-on-surface-variant">Memuat produk...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-lowest p-4">
        <span className="material-symbols-outlined text-6xl text-error" data-icon="error">error</span>
        <p className="mt-4 font-body-md text-body-md text-on-surface-variant text-center">Gagal memuat produk: {error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 rounded-xl bg-primary text-on-primary font-label-md">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-surface-container-lowest relative">
      {/* Products Section */}
      <div className="flex-1 flex flex-col w-full h-full border-r border-outline-variant/30 bg-background relative">
        {/* Search & Scan Bar */}
        <div className="p-4 bg-surface shadow-sm z-10 flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              className="h-touch-target-min w-10 rounded-xl bg-surface-container flex items-center justify-center border border-outline text-on-surface hover:bg-surface-container-highest transition-colors flex-shrink-0"
              aria-label="Menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="w-full h-touch-target-min pl-10 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md text-body-md"
                placeholder="Cari produk, SKU, atau kategori..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <button className="h-touch-target-min px-6 rounded-xl bg-surface-container flex items-center justify-center gap-2 border border-outline text-on-surface hover:bg-surface-container-highest transition-colors flex-shrink-0">
            <span className="material-symbols-outlined" data-icon="barcode_scanner">barcode_scanner</span>
            <span className="font-label-md text-label-md">Scan Barcode</span>
          </button>
        </div>

        {/* Categories */}
        <div className="px-4 py-3 bg-surface-container-lowest border-b border-outline-variant/20 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Overlay */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setMenuOpen(false)} />
            <div className="fixed top-0 left-0 h-full w-72 bg-surface border-r border-outline-variant shadow-lg z-[70] flex flex-col">
              <div className="p-6 border-b border-outline-variant/50 flex items-center justify-between">
                <h2 className="font-headline-md text-headline-md text-primary">Lapak Berkah</h2>
                <button onClick={() => setMenuOpen(false)} aria-label="Tutup menu" className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {[
                  { icon: 'dashboard', label: 'Dashboard', page: 'dashboard' },
                  { icon: 'point_of_sale', label: 'POS Cashier', page: 'pos' },
                  { icon: 'inventory_2', label: 'Inventory', page: 'inventory' },
                  { icon: 'handshake', label: 'Mitra Dashboard', page: 'mitra' },
                  { icon: 'receipt_long', label: 'Nota Penjualan Mitra', page: 'mitra-settlement' },
                  { icon: 'assessment', label: 'Laporan Penjualan', page: 'sales-recap' },
                  { icon: 'history', label: 'Riwayat Transaksi', page: 'transaction-history' },
                  { icon: 'inventory', label: 'Product Management', page: 'product' },
                  { icon: 'swap_vert', label: 'Manajemen Stok', page: 'stock-management' },
                  { icon: 'payments', label: 'Financial Reports', page: 'financial' },
                ].map((item) => (
                  <button
                    key={item.page}
                    onClick={() => {
                      onNavigate?.(item.page);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-surface-container text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                    <span className="font-label-md text-label-md">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Categories */}
        <div className="px-4 py-3 bg-surface-container-lowest border-b border-outline-variant/20 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-32 md:pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-surface-container-lowest rounded-xl border overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer group ${
                  product.stock === 0 ? 'border-error/50 opacity-80 cursor-not-allowed' : 'border-outline-variant'
                }`}
              >
                <div className="aspect-square bg-surface-container-highest relative overflow-hidden">
                  {product.photo ? (
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={product.name}
                       src={product.photo}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container-low text-outline">
                      <span className="material-symbols-outlined text-4xl" data-icon="image">image</span>
                    </div>
                  )}
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-md font-label-sm text-label-sm flex items-center gap-1 shadow-sm ${
                      product.stock === 0
                        ? 'bg-error text-on-error'
                        : 'bg-tertiary-container text-on-tertiary-container'
                    }`}
                  >
                    {product.stock === 0 && (
                      <span className="material-symbols-outlined text-[12px]" data-icon="warning">warning</span>
                    )}
                    Stok: {product.stock}
                  </div>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-surface/40 flex items-center justify-center">
                      <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-sm text-label-sm border border-error/20 backdrop-blur-sm shadow-sm">
                        Kosong
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-label-md text-label-md text-on-surface line-clamp-2 mb-1">{product.name}</h3>
                   <p
                     className={`font-numeric-data text-numeric-data mt-auto ${
                       product.stock === 0 ? 'text-on-surface-variant' : 'text-primary'
                     }`}
                   >
                     Rp {product.sellingPrice.toLocaleString('id-ID')}
                   </p>
                   <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                     {product.mitraName} · {product.barcodeId}
                   </p>
                  <button
                    disabled={product.stock === 0}
                    className={`mt-3 w-full h-10 rounded-lg flex items-center justify-center gap-1 ${
                      product.stock === 0
                        ? 'bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed'
                        : 'bg-surface-container border border-outline-variant text-primary hover:bg-primary hover:text-on-primary transition-colors'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm" data-icon={product.stock === 0 ? 'block' : 'add_shopping_cart'}>
                      {product.stock === 0 ? 'block' : 'add_shopping_cart'}
                    </span>
                    <span className="font-label-md text-label-md">{product.stock === 0 ? '' : 'Tambah'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Warning Message */}
          <div className="mt-6 bg-error-container/30 border border-error-container rounded-xl p-4 flex gap-3 items-start max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-error mt-0.5" data-icon="info">info</span>
            <div>
              <h4 className="font-label-md text-label-md text-on-surface font-bold">Peringatan Sistem</h4>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                Beberapa item populer seperti <span className="font-bold">Minyak Goreng Bimoli 2L</span> memiliki status{' '}
                <span className="text-error font-bold">Stok Produk Kosong Hari Ini</span>. Pastikan untuk menginformasikan kepada pelanggan jika diminta.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart / Checkout Sidebar (Desktop) */}
      <div className="w-full md:w-[360px] lg:w-[400px] h-full bg-surface-container-lowest flex flex-col shrink-0 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.1)] z-20 hidden md:flex border-l border-outline-variant/30">
        <div className="p-4 border-b border-outline-variant/30 bg-surface flex justify-between items-center">
          <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" data-icon="shopping_cart">shopping_cart</span>
            Pesanan Saat Ini
          </h2>
          <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full text-xs font-bold">
            {cart.reduce((sum, item) => sum + item.qty, 0)} Item
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/50">
              <div className="w-16 h-16 bg-surface-container-highest rounded-lg flex-shrink-0 border border-outline-variant/20" />
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-label-md text-label-md text-on-surface line-clamp-2 leading-tight">{item.name}</h4>
                  <button className="text-on-surface-variant hover:text-error p-1 -mr-1 -mt-1">
                    <span className="material-symbols-outlined text-[18px]" data-icon="delete">delete</span>
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-numeric-data text-numeric-data text-primary text-sm">Rp {item.sellingPrice.toLocaleString('id-ID')}</p>
                  <div className="flex items-center gap-2 bg-surface rounded-lg border border-outline-variant/50 h-8">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-8 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-highest rounded-l-lg"
                    >
                      -
                    </button>
                    <span className="font-numeric-data text-numeric-data w-6 text-center text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-8 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-highest rounded-r-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest">
          <div className="flex justify-between items-center mb-2">
            <span className="font-body-md text-body-md text-on-surface-variant">Subtotal</span>
            <span className="font-numeric-data text-numeric-data text-on-surface">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="font-body-md text-body-md text-on-surface-variant">Pajak (0%)</span>
            <span className="font-numeric-data text-numeric-data text-on-surface">Rp {tax.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center mb-6 pt-3 border-t border-outline-variant/20">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Total</span>
            <span className="font-display-lg text-display-lg text-primary">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button className="h-touch-target-min rounded-xl bg-surface border border-primary text-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm" data-icon="pause">pause</span> Tahan
            </button>
            <button className="h-touch-target-min rounded-xl bg-surface border border-error text-error font-label-md text-label-md hover:bg-error-container hover:text-on-error-container transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm" data-icon="close">close</span> Batal
            </button>
          </div>
          <button className="w-full h-14 rounded-xl bg-[#F4A7B9] hover:bg-[#e091a4] text-white font-headline-sm text-headline-sm shadow-[0_4px_14px_0_rgba(244,167,185,0.39)] transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" data-icon="payments">payments</span>
            Checkout
          </button>
        </div>
      </div>

      {/* Mobile FAB for Scanning */}
      <button aria-label="Scan barcode" className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex items-center justify-center z-40 active:scale-90 transition-transform">
        <span className="material-symbols-outlined filled" data-icon="barcode_scanner">barcode_scanner</span>
      </button>

      {/* Mobile Cart Summary Banner */}
      <div className="md:hidden fixed bottom-20 left-0 w-full bg-surface-container-lowest border-t border-outline-variant p-3 flex justify-between items-center shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.1)] z-40 pb-safe">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Total ({cart.reduce((sum, item) => sum + item.qty, 0)} item)</span>
          <span className="font-numeric-data text-numeric-data text-primary font-bold text-lg">Rp {total.toLocaleString('id-ID')}</span>
        </div>
        <button className="h-10 px-6 rounded-lg bg-[#F4A7B9] text-white font-label-md text-label-md shadow-sm">Checkout</button>
      </div>
    </div>
  );
}

export default KasirHP;
