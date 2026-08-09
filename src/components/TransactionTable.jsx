const transactions = [
  { time: '14:32', id: '#TRX-0982', product: 'Beras Premium 5kg', partner: 'Toko Makmur', sell: 'Rp 75.000', cost: 'Rp 70.000', profit: '+Rp 5.000' },
  { time: '14:15', id: '#TRX-0981', product: 'Minyak Goreng 2L', partner: 'Grosir Jaya', sell: 'Rp 34.000', cost: 'Rp 31.500', profit: '+Rp 2.500', zebra: true },
  { time: '13:50', id: '#TRX-0980', product: 'Gula Pasir 1kg', partner: 'Toko Makmur', sell: 'Rp 16.000', cost: 'Rp 15.000', profit: '+Rp 1.000' },
  { time: '13:22', id: '#TRX-0979', product: 'Telur Ayam 1kg', partner: 'Toko Harapan', sell: 'Rp 28.000', cost: 'Rp 26.500', profit: '+Rp 1.500', zebra: true },
];

function TransactionTable() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-outline-variant bg-surface flex justify-between items-center">
        <h3 className="font-headline-md text-headline-sm text-on-surface">Detail Transaksi Terbaru</h3>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">
            search
          </span>
          <input
            className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary w-full md:w-64 font-body-md text-body-md h-[48px]"
            placeholder="Cari ID Transaksi..."
            type="text"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Waktu / ID</th>
              <th className="px-6 py-4 font-semibold">Mitra / Produk</th>
              <th className="px-6 py-4 text-right font-semibold">Harga Jual</th>
              <th className="px-6 py-4 text-right font-semibold">Modal Mitra</th>
              <th className="px-6 py-4 text-right font-semibold">Profit</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md">
            {transactions.map((trx) => (
              <tr
                key={trx.id}
                className={`border-b border-outline-variant hover:bg-surface-container-lowest/50 transition-colors ${
                  trx.zebra ? 'bg-surface-container-low/30' : ''
                }`}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-on-surface">{trx.time}</div>
                  <div className="text-on-surface-variant font-label-sm text-label-sm">{trx.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-on-surface">{trx.product}</div>
                  <div className="text-on-surface-variant font-label-sm text-label-sm">{trx.partner}</div>
                </td>
                <td className="px-6 py-4 text-right font-numeric-data text-numeric-data">{trx.sell}</td>
                <td className="px-6 py-4 text-right font-numeric-data text-numeric-data text-on-surface-variant">{trx.cost}</td>
                <td className="px-6 py-4 text-right font-numeric-data text-numeric-data font-bold text-tertiary-container">{trx.profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm">
        <span>Menampilkan 1-4 dari 240 transaksi</span>
        <div className="flex gap-2">
          <button aria-label="Halaman sebelumnya" className="p-2 border border-outline-variant rounded-md hover:bg-surface-container-lowest h-[48px] w-[48px] flex items-center justify-center disabled:opacity-50" disabled>
            <span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
          </button>
          <button aria-label="Halaman berikutnya" className="p-2 border border-outline-variant rounded-md hover:bg-surface-container-lowest h-[48px] w-[48px] flex items-center justify-center">
            <span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionTable;
