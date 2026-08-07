import { useState, useRef, useEffect } from 'react';

const products = [
  { id: 1, name: 'Nasi Kuning', sku: 'BRP-001', category: 'Perishable', type: 'Makanan Basah', mitraName: 'Toko Makmur', mitraPrice: 14500, sellingPrice: 18000, stock: 45, unit: 'Pcs', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9S0lXMpRCIso-L8CBlj_U0MUQvoGBrQKhOVgsA54pAt-PbsyTJM5gPW1TDbWseVKIKBbDhf4ZBtI9wMQ3FSzouSGDMY3xbXtIyxirFJxSlk0YSDW7OUkpsvxjNQLl2kWrsF3Q_nFdCLy1SZReZR-SRm3wBB_5OpY9hjjEWFHzgwtfw9gjAbWHi0YbuDlNjGtlO_-LjzIh24qq9oobBsLzLD9oM_y5o3An1VRKRe8fWYF5RiZ30xX89A', description: 'Nasi kuning siap saji', barcodeId: 'BC-001' },
  { id: 2, name: 'Kerupuk', sku: 'MNG-002', category: 'Non-Perishable', type: 'Makanan Kering', mitraName: 'Grosir Jaya', mitraPrice: 2000, sellingPrice: 3500, stock: 120, unit: 'Pack', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy_dC_R3oRxJ1d0ReP2F5QktKPUd4al-jRFlh_0wQDF5chjbpIErEr9nIyhA_Pak9a2yQqI_V_35NFG_290FDhpcyTxNSv5JBNTx01cGw0SQz98-vHdeijubwm-9cpLLsEVJ-5y1fe19ELkvf8a-Ze0RTkv1a4f7-yK5geAC8q0yx9_JtPC0wk8fWx9NOCBUxQ9rFCz0mwqFdPOaCh0bDJi3PGTTQoQMDveIbCK8762GcRQVbUuz-nkQ', description: 'Kerupuk gurih renyah', barcodeId: 'BC-002' },
  { id: 3, name: 'Es Teh Manis', sku: 'GLP-003', category: 'Perishable', type: 'Minuman', mitraName: 'Toko Harapan', mitraPrice: 3000, sellingPrice: 5000, stock: 0, unit: 'Gelas', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD45ZfKiOkzCqbc-spfBj-jJwJbWtVxit5ZTkS7gWepe3UrNb1wJVvMnTQqpxYY0-ZaECpGJypxNBWPJcM-NjIkiT99Gbt8kTM09FpleP3YFBpXhOzZQ0ffJVKBjqq2pToEqGI4tGDaiaPIfVWCKuz6X6cMk8NMuVlm9c31YKH5ivXc2IouBfmjKOAsA70ObFR8T5IiVgAcFYtrJHRDfvLySUxMw_I5Aw7HJPd9C1taAui0kx5wEqLipA', description: 'Es teh manis segar', barcodeId: 'BC-003' },
  { id: 4, name: 'Susu UHT 250ml', sku: 'MIG-004', category: 'Non-Perishable', type: 'Minuman', mitraName: 'Toko Makmur', mitraPrice: 5500, sellingPrice: 8000, stock: 24, unit: 'Karton', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE_TgX6dU09YE_ejm-rY1i1uZgfVoBKai_Mcqh_eObBkWYkJ9vlvLEhzR9L0eIRxdgVFCsXzX8i6alv81Nm7JZmYy-wFiZjceZf3h0EtMmtvkVqWRzbUzrGaNQSKKox1PpDb8pWapwZh1el6BJYVhKwoDoXfib2bPXIENjILDqMOzMttAn97H-Qbn_MWTCSHTPswap9e-wD-XNGzYq8mX8Wdm0z4n8XH7CLGhi_ikJn-tgMjSfz5ZZ3A', description: 'Susu UHT segar', barcodeId: 'BC-004' },
  { id: 5, name: 'Mie Instan Goreng', sku: 'SUS-005', category: 'Non-Perishable', type: 'Makanan Kering', mitraName: 'Grosir Jaya', mitraPrice: 3000, sellingPrice: 4500, stock: 120, unit: 'Pcs', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5qejlFpuAvF4M0PzqD6tNHnw6z1CjHJelomAYXJWHwCJIMsFaVz4LizVtCJDepveg23kZ1jtsSfCsIZgoL2YHjVkruEf4beb4auqiUQP4BTdIOrcNdPRnhKI3moA-cNa28RClHLo_B-Tr-3AyluWfaAgHALbMmEp6Z9LhFjN18Nfwzl4UblrTmIp1EGoD5YzlVxYofuUezaaJjaQZgJxKGKhGEgPHN77eU21_AVhSJNoszydXrUXxJg', description: 'Mie instan rasa goreng', barcodeId: 'BC-005' },
  { id: 6, name: 'Kopi Susu Gula Aren', sku: 'KOP-006', category: 'Perishable', type: 'Minuman', mitraName: 'Toko Makmur', mitraPrice: 8000, sellingPrice: 12000, stock: 50, unit: 'Gelas', photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB49vG9Vi3qbccoLZTXOLCqShe83hxitKq-wO3Iud7yeRH4bnZt2z0KcWxLd05BsiXOGCsKYwMKMXivhLKmYbr5fjtWgLkZixOEhtdAXQMZFIsO098CSV5idKs-jD4BvjZ4O9yC5r0GgwI95lKuy2oX4MFkNyI0hV-fY2GQnKYnBnyKDMJHPpOFzE66yL9OywVNAdvHQb1dvhuWq4bYsPLpVExHIszD98fWP0RqV2EVmKnMEPCPM_8WEaD-B1rebwVHSrA', description: 'Kopi susu gula aren premium', barcodeId: 'BC-006' },
];

const categories = ['Semua', 'Perishable', 'Non-Perishable'];

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

const completedTransactions = [];

function KasirDesktop() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [barcode, setBarcode] = useState('');
  const [flash, setFlash] = useState(null);
  const barcodeRef = useRef(null);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchesCategory;
  });

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const trimmed = barcode.trim();
    if (!trimmed) return;
    const product = products.find((p) => p.barcodeId === trimmed || p.sku === trimmed);
    if (product) {
      setFlash(product.id);
      setTimeout(() => setFlash(null), 600);
      window.dispatchEvent(new CustomEvent('kasir:add-product', { detail: { productId: product.id } }));
    }
    setBarcode('');
    barcodeRef.current?.focus();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface-container-lowest">
      {/* Header */}
      <header className="h-16 bg-surface border-b border-outline-variant flex items-center justify-between px-4 md:px-6 z-10 shrink-0 gap-4">
        <form onSubmit={handleBarcodeSubmit} className="flex-1 max-w-2xl">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">barcode_scanner</span>
            <input
              ref={barcodeRef}
              className={`w-full h-11 pl-10 pr-4 rounded-xl border-2 bg-surface-container-lowest font-body-md text-body-md outline-none transition-colors ${flash ? 'border-primary' : 'border-outline-variant focus:border-primary focus:ring-0'}`}
              placeholder="Scan barcode atau ketik SKU/Barcode ID..."
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
          </div>
        </form>
        <div className="text-right hidden sm:block">
          <div className="font-label-sm text-label-sm text-on-surface-variant">Tanggal Aktif</div>
          <div className="font-label-md text-label-md text-on-surface">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="px-4 md:px-6 py-3 flex gap-3 overflow-x-auto shrink-0 hide-scrollbar border-b border-outline-variant bg-surface">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`h-9 px-5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${
              selectedCategory === cat ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                setFlash(product.id);
                setTimeout(() => setFlash(null), 600);
                window.dispatchEvent(new CustomEvent('kasir:add-product', { detail: { productId: product.id } }));
              }}
              className={`bg-surface border rounded-xl p-3 flex flex-col gap-2 hover:shadow-md transition-all text-left relative overflow-hidden ${
                product.stock === 0 ? 'border-error-container opacity-75 cursor-not-allowed' : 'border-outline-variant cursor-pointer active:scale-95'
              } ${flash === product.id ? 'ring-2 ring-primary' : ''}`}
              disabled={product.stock === 0}
            >
              <div className="aspect-square w-full rounded-lg bg-surface-container overflow-hidden relative">
                <img className="w-full h-full object-cover" data-alt={product.name} src={product.photo} />
                <div
                  className={`absolute top-2 right-2 px-2 py-1 rounded-md font-label-sm text-label-sm border ${
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
              <div className="flex flex-col gap-1">
                <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2 leading-tight">{product.name}</h3>
                <p className={`font-numeric-data text-numeric-data ${product.stock === 0 ? 'text-on-surface-variant line-through' : 'text-primary'}`}>
                  Rp {product.sellingPrice.toLocaleString('id-ID')}
                </p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{product.barcodeId}</p>
              </div>
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-error/5 z-10 pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function KasirDesktopCart() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [activeTransactionId, setActiveTransactionId] = useState(initialTransactions[0].id);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [toast, setToast] = useState(null);
  const [completedTransactions, setCompletedTransactions] = useState([]);

  const activeTransaction = transactions.find((t) => t.id === activeTransactionId) || transactions[0];

  const updateQty = (transactionId, productId, delta) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== transactionId) return t;
        const updatedItems = t.items
          .map((item) => (item.productId === productId ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
          .filter((item) => item.qty > 0);
        return { ...t, items: updatedItems };
      }),
    );
  };

  const removeItem = (transactionId, productId) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== transactionId) return t;
        return { ...t, items: t.items.filter((item) => item.productId !== productId) };
      }),
    );
  };

  const addProductToTransaction = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== activeTransactionId) return t;
        const existing = t.items.find((item) => item.productId === productId);
        const updatedItems = existing
          ? t.items.map((item) => (item.productId === productId ? { ...item, qty: item.qty + 1 } : item))
          : [
              ...t.items,
              {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                barcodeId: product.barcodeId,
                sellingPrice: product.sellingPrice,
                unit: product.unit,
                qty: 1,
              },
            ];
        return { ...t, items: updatedItems };
      }),
    );
  };

  const holdTransaction = () => {
    if (activeTransaction.items.length === 0) return;
    const newTransaction = createEmptyTransaction(Date.now());
    setTransactions((prev) => [...prev, newTransaction]);
    setActiveTransactionId(newTransaction.id);
    setPaymentAmount('');
  };

  const resumeTransaction = (id) => {
    setActiveTransactionId(id);
    setPaymentAmount('');
  };

  const deleteTransaction = (id, e) => {
    e.stopPropagation();
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (activeTransactionId === id) {
      const remaining = transactions.filter((t) => t.id !== id);
      setActiveTransactionId(remaining[0]?.id || null);
    }
  };

  const handleCheckout = () => {
    const total = activeTransaction.items.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0);
    const paid = Number(paymentAmount);
    if (!paymentMethod || total <= 0) return;
    if (paymentMethod === 'Tunai' && (isNaN(paid) || paid < total)) {
      setToast({ message: 'Jumlah pembayaran kurang', type: 'error' });
      return;
    }
    const completed = {
      ...activeTransaction,
      total,
      paid: paymentMethod === 'Tunai' ? paid : total,
      change: paymentMethod === 'Tunai' ? Math.max(0, paid - total) : 0,
      paymentMethod,
      completedAt: new Date().toLocaleString('id-ID'),
    };
    setCompletedTransactions((prev) => [completed, ...prev]);
    setToast({ message: `Pembayaran ${paymentMethod} berhasil`, type: 'success' });
    setPaymentAmount('');
    setTransactions((prev) => prev.filter((t) => t.id !== activeTransactionId));
    const remaining = transactions.filter((t) => t.id !== activeTransactionId);
    setActiveTransactionId(remaining[0]?.id || null);
  };

  const printReceipt = (transaction) => {
    const receiptWindow = window.open('', '_blank', 'width=320,height=600');
    if (!receiptWindow) return;
    const total = transaction.items.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0);
    const itemsHtml = transaction.items.map((item) => `
      <tr>
        <td style="padding: 4px 0; font-size: 12px;">${item.name}</td>
        <td style="padding: 4px 0; font-size: 12px; text-align: center;">${item.qty} x ${item.sellingPrice.toLocaleString('id-ID')}</td>
        <td style="padding: 4px 0; font-size: 12px; text-align: right;">Rp ${(item.sellingPrice * item.qty).toLocaleString('id-ID')}</td>
      </tr>
    `).join('');
    const now = new Date().toLocaleString('id-ID');
    receiptWindow.document.write(`
      <html>
        <head>
          <title>Struk #${transaction.id.toString().slice(-2)}</title>
          <style>
            body { font-family: 'Hanken Grotesk', sans-serif; padding: 16px; color: #000; }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 4px; }
          </style>
        </head>
        <body>
          <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700;">Lapak Berkah Buntulia</h3>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: #424750;">Struk Pembelian</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">No. Transaksi: #${transaction.id.toString().slice(-2)}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">Tanggal: ${transaction.completedAt || now}</p>
          <p style="margin: 0 0 12px 0; font-size: 12px;">Metode: ${transaction.paymentMethod || 'Tunai'}</p>
          <table>
            <thead>
              <tr>
                <th style="text-align: left; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">Item</th>
                <th style="text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">Qty x Harga</th>
                <th style="text-align: right; border-bottom: 1px dashed #ccc; padding-bottom: 4px;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="margin-top: 12px; border-top: 1px dashed #ccc; padding-top: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 700;">
              <span>Total</span>
              <span>Rp ${total.toLocaleString('id-ID')}</span>
            </div>
            ${transaction.paid > 0 ? `
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px;">
              <span>Bayar</span>
              <span>Rp ${transaction.paid.toLocaleString('id-ID')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px;">
              <span>Kembali</span>
              <span>Rp ${transaction.change.toLocaleString('id-ID')}</span>
            </div>
            ` : ''}
          </div>
          <p style="margin-top: 16px; font-size: 12px; text-align: center; color: #424750;">Terima kasih telah berbelanja</p>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  const subtotal = activeTransaction.items.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0);
  const tax = 0;
  const total = subtotal - tax;
  const change = paymentMethod === 'Tunai' ? Number(paymentAmount || 0) - total : 0;

  useEffect(() => {
    const handler = (e) => {
      addProductToTransaction(e.detail.productId);
    };
    window.addEventListener('kasir:add-product', handler);
    return () => window.removeEventListener('kasir:add-product', handler);
  }, [activeTransactionId]);

  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-[380px] bg-surface-container-lowest border-l border-outline-variant shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] flex flex-col z-30">
      {/* Transaction Tabs */}
      <div className="border-b border-outline-variant bg-surface px-3 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Transaksi Aktif</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{transactions.length}/3</span>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {transactions.map((t) => (
            <button
              key={t.id}
              onClick={() => resumeTransaction(t.id)}
              className={`flex items-center gap-2 h-10 px-3 rounded-lg border text-label-sm font-label-sm whitespace-nowrap transition-colors ${
                activeTransactionId === t.id
                  ? 'bg-secondary-container border-secondary text-on-secondary-container shadow-sm'
                  : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span>#{t.id.toString().slice(-2)}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTransactionId === t.id ? 'bg-on-secondary-container/20 text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                {t.items.reduce((sum, item) => sum + item.qty, 0)}
              </span>
              <span
                onClick={(e) => deleteTransaction(t.id, e)}
                className="material-symbols-outlined text-[16px] hover:text-error cursor-pointer"
              >
                close
              </span>
            </button>
          ))}
          <button
            onClick={holdTransaction}
            className="h-10 px-4 rounded-lg border-2 border-dashed border-outline-variant text-label-sm font-label-sm text-on-surface-variant hover:border-primary hover:text-primary whitespace-nowrap transition-colors"
          >
            + Tab
          </button>
        </div>
      </div>

      {/* Cart Header */}
      <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Transaksi #{activeTransactionId.toString().slice(-2)}</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant">{activeTransaction.createdAt}</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTransaction.items.length > 0 && (
            <button
              onClick={() => printReceipt(activeTransaction)}
              className="text-primary hover:bg-primary-container p-2 rounded-full transition-colors"
              title="Cetak Struk"
            >
              <span className="material-symbols-outlined">print</span>
            </button>
          )}
          <button
            onClick={() => {
              setTransactions((prev) => prev.filter((t) => t.id !== activeTransactionId));
              const remaining = transactions.filter((t) => t.id !== activeTransactionId);
              setActiveTransactionId(remaining[0]?.id || null);
            }}
            className="text-error hover:bg-error-container p-2 rounded-full transition-colors"
            title="Tutup transaksi"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 hide-scrollbar">
        {activeTransaction.items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant gap-2">
            <span className="material-symbols-outlined text-4xl">shopping_cart</span>
            <p className="font-body-md text-body-md">Belum ada produk</p>
            <p className="font-label-sm text-label-sm">Scan barcode atau pilih produk</p>
          </div>
        ) : (
          activeTransaction.items.map((item) => (
            <div key={item.productId} className="flex gap-3 p-3 bg-surface rounded-xl border border-outline-variant">
              <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-outline text-2xl">image</span>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <h4 className="font-label-md text-label-md text-on-surface line-clamp-2 leading-tight">{item.name}</h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{item.sku} · {item.barcodeId}</p>
                  </div>
                  <button onClick={() => removeItem(activeTransaction.id, item.productId)} className="text-on-surface-variant hover:text-error p-1 -mr-1 -mt-1">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-numeric-data text-numeric-data text-primary text-sm">Rp {item.sellingPrice.toLocaleString('id-ID')}</p>
                  <div className="flex items-center gap-2 bg-surface-container-highest rounded-lg h-8">
                    <button onClick={() => updateQty(activeTransaction.id, item.productId, -1)} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">-</button>
                    <span className="font-numeric-data text-label-md w-8 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(activeTransaction.id, item.productId, 1)} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">+</button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Total</span>
                  <span className="font-numeric-data text-numeric-data text-on-surface font-semibold">Rp {(item.sellingPrice * item.qty).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals & Actions */}
      {activeTransaction.items.length > 0 && (
        <div className="border-t border-outline-variant bg-surface p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
            <span>Subtotal ({activeTransaction.items.reduce((sum, item) => sum + item.qty, 0)} item)</span>
            <span className="font-numeric-data">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
              <span>Pajak</span>
              <span className="font-numeric-data">Rp {tax.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="h-px w-full bg-outline-variant/50" />
          <div className="flex justify-between items-center">
            <span className="font-headline-sm text-headline-sm text-on-surface">Total</span>
            <span className="font-display-lg text-display-lg text-primary">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={holdTransaction} className="h-11 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors">
              Tahan
            </button>
            <button onClick={() => setPaymentMethod('Tunai')} className={`h-11 rounded-xl border font-label-md text-label-md transition-colors ${paymentMethod === 'Tunai' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
              Tunai
            </button>
          </div>
          {paymentMethod === 'Tunai' && (
            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface">Jumlah Bayar</label>
              <input
                className="w-full h-12 px-4 rounded-xl border border-outline bg-surface-container-low focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-numeric-data text-numeric-data text-body-md"
                type="number"
                placeholder="0"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <div className="grid grid-cols-4 gap-2">
                {[50000, 100000, 200000, 500000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setPaymentAmount(String(amount))}
                    className="h-9 rounded-lg border border-outline bg-surface-container-low hover:bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant transition-colors"
                  >
                    {amount >= 1000 ? `${(amount / 1000)}K` : amount}
                  </button>
                ))}
              </div>
              {Number(paymentAmount) >= total && (
                <div className="flex justify-between items-center text-body-md font-body-md">
                  <span className="text-on-surface-variant">Kembali</span>
                  <span className="font-numeric-data text-numeric-data text-tertiary-container font-semibold">Rp {change.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleCheckout}
            disabled={activeTransaction.items.length === 0 || (paymentMethod === 'Tunai' && (Number(paymentAmount) < total || Number(paymentAmount) === 0))}
            className="w-full h-12 bg-secondary-container hover:bg-[#f4a7b9] text-on-secondary-container font-headline-sm text-headline-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined">point_of_sale</span>
            Bayar
          </button>
        </div>
      )}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-label-md text-label-md">{toast.message}</span>
        </div>
      )}
    </aside>
  );
}

export { KasirDesktop, KasirDesktopCart };
