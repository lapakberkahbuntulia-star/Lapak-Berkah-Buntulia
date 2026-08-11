import { useState, useRef, useEffect, useMemo } from 'react';
import { productService, transactionService, transactionItemService, stockMovementService, mitraService, heldTransactionService } from '../lib/services';
import { printReceipt } from '../lib/bluetoothPrinter';

function createEmptyTransaction(id) {
  return {
    id,
    items: [],
    status: 'active',
    createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  };
}

const initialTransactions = [
  createEmptyTransaction(1),
  createEmptyTransaction(2),
  createEmptyTransaction(3),
];

function KasirDesktop({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [barcode, setBarcode] = useState('');
  const [flash, setFlash] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(false);
  const barcodeRef = useRef(null);

  const handleConnectPrinter = async () => {
    try {
      const { connectPrinter } = await import('../lib/bluetoothPrinter');
      await connectPrinter();
      setPrinterConnected(true);
    } catch (error) {
      setPrinterConnected(false);
    }
  };

  const handleDisconnectPrinter = async () => {
    try {
      const { clearPrinterCache } = await import('../lib/bluetoothPrinter');
      clearPrinterCache();
      setPrinterConnected(false);
    } catch {}
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      const mapped = data.map((p) => ({
        id: p.id,
        name: p.nama_produk,
        sku: p.sku,
        category: p.category ? { name: p.category.name } : null,
        type: p.type ? { name: p.type.name } : null,
        mitra: p.mitra ? { full_name: p.mitra.full_name } : null,
        mitraId: p.mitra_id,
        mitraPrice: p.mitra_price,
        sellingPrice: p.selling_price,
        stock: p.stock,
        unit: p.unit,
        photo: p.photo,
        barcodeId: p.barcode_id,
        description: p.description,
      }));
      setProducts(mapped);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const updatedProducts = e.detail?.products;
      if (Array.isArray(updatedProducts)) {
        setProducts((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          for (const p of updatedProducts) {
            map.set(p.id, p);
          }
          return Array.from(map.values());
        });
      } else {
        loadProducts();
      }
    };
    window.addEventListener('kasir:stock-updated', handler);
    return () => window.removeEventListener('kasir:stock-updated', handler);
  }, []);

  const categories = useMemo(() => ['Semua', ...new Set(products.map((p) => p.category?.name).filter(Boolean))], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => selectedCategory === 'Semua' || product.category?.name === selectedCategory);
  }, [products, selectedCategory]);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const trimmed = barcode.trim();
    if (!trimmed) return;
    const product = products.find((p) => p.barcodeId === trimmed || p.sku === trimmed);
    if (product) {
      setFlash(product.id);
      setTimeout(() => setFlash(null), 600);
      window.dispatchEvent(new CustomEvent('kasir:add-product', { detail: { productId: product.id, product } }));
    }
    setBarcode('');
    barcodeRef.current?.focus();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-container-lowest relative xl:pr-[380px]">
      {/* Header */}
      <header className="h-16 bg-surface border-b border-outline-variant flex items-center justify-between px-4 md:px-6 z-10 shrink-0 gap-4">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => setMenuOpen(true)}
            className="h-10 w-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <button
            onClick={printerConnected ? handleDisconnectPrinter : handleConnectPrinter}
            className={`h-10 px-3 rounded-lg border flex items-center gap-2 text-label-sm font-label-sm transition-colors ${
              printerConnected
                ? 'bg-tertiary-fixed/15 text-tertiary-container border-tertiary-fixed/30'
                : 'bg-surface-container border-outline-variant text-on-surface hover:bg-surface-container-high'
            }`}
            aria-label={printerConnected ? 'Printer terhubung' : 'Hubungkan printer'}
          >
            <span className="material-symbols-outlined text-[18px]">{printerConnected ? 'print' : 'print_disabled'}</span>
            <span className="hidden sm:inline">{printerConnected ? 'Printer OK' : 'Connect Printer'}</span>
          </button>
          <form onSubmit={handleBarcodeSubmit} className="flex-1 max-w-xl">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">barcode_scanner</span>
              <input
                ref={barcodeRef}
                className={`w-full h-10 pl-10 pr-4 rounded-xl border-2 bg-surface-container-lowest font-body-md text-body-md outline-none transition-colors ${flash ? 'border-primary' : 'border-outline-variant focus:border-primary focus:ring-0'}`}
                placeholder="Scan barcode atau ketik SKU/Barcode ID..."
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </div>
          </form>
        </div>
        <div className="text-right hidden sm:block">
          <div className="font-label-sm text-label-sm text-on-surface-variant">Tanggal Aktif</div>
          <div className="font-label-md text-label-md text-on-surface">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </header>

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
                { icon: 'point_of_sale', label: 'POS Cashier', page: 'pos-desktop' },
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

      {/* Filter Tabs */}
      <div className="px-4 md:px-6 py-2 flex gap-2 overflow-x-auto shrink-0 hide-scrollbar border-b border-outline-variant bg-surface">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`h-8 px-4 rounded-full font-label-sm text-label-sm whitespace-nowrap transition-colors ${
              selectedCategory === cat ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="font-body-md text-body-md text-on-surface-variant">Memuat produk...</p>
          </div>
        ) : (
          <>
            {products.filter((p) => p.stock > 0 && p.stock <= 10).length > 0 && (
              <div className="mb-3 p-2.5 bg-[#fdf2d5] border border-[#ebd083] rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7a590c] text-[20px]">warning</span>
                <div className="flex-1">
                  <p className="font-label-sm text-label-sm text-[#7a590c]">
                    {products.filter((p) => p.stock > 0 && p.stock <= 10).length} produk stok menipis
                  </p>
                </div>
              </div>
            )}

            {/* Compact Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setFlash(product.id);
                    setTimeout(() => setFlash(null), 600);
                    window.dispatchEvent(new CustomEvent('kasir:add-product', { detail: { productId: product.id, product } }));
                  }}
                  className={`bg-surface border rounded-xl p-2.5 flex flex-col gap-1.5 hover:shadow-md transition-all text-left relative overflow-hidden ${
                    product.stock === 0 ? 'border-error-container opacity-75 cursor-not-allowed' : 'border-outline-variant cursor-pointer active:scale-95'
                  } ${flash === product.id ? 'ring-2 ring-primary' : ''}`}
                  disabled={product.stock === 0}
                >
                  {/* Reduced Image Container */}
                  <div className="h-28 sm:h-32 w-full rounded-lg bg-surface-container overflow-hidden relative">
                    {product.photo ? (
                      <img
                        className="w-full h-full object-cover"
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        src={product.photo}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-outline">image</span>
                      </div>
                    )}
                    <div
                      className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded font-label-sm text-[10px] border ${
                        product.stock === 0
                          ? 'bg-error-container text-on-error-container border-error/20 font-bold'
                          : product.stock <= 5
                            ? 'bg-[#fdf2d5] text-[#7a590c] border-[#ebd083]'
                            : 'bg-[#d1f4e0] text-[#0d592a] border-[#93d8b5]'
                      }`}
                    >
                      {product.stock === 0 ? 'Habis' : product.stock <= 5 ? `Sisa ${product.stock}` : `Stok: ${product.stock}`}
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-label-md text-label-md text-on-surface line-clamp-1 leading-snug" title={product.name}>
                      {product.name}
                    </h3>
                    <p className={`font-numeric-data text-label-md font-semibold ${product.stock === 0 ? 'text-on-surface-variant line-through' : 'text-primary'}`}>
                      Rp {product.sellingPrice.toLocaleString('id-ID')}
                    </p>
                    <p className="font-label-sm text-[11px] text-on-surface-variant">{product.barcodeId}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { KasirDesktop, KasirDesktopCart };