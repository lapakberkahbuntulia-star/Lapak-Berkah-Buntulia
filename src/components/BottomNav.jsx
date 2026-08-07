const bottomNavItems = [
  { icon: 'dashboard', label: 'Dashboard', page: 'dashboard', roles: ['admin', 'kasir', 'mitra'] },
  { icon: 'barcode_scanner', label: 'POS', page: 'pos-desktop', roles: ['admin', 'kasir'] },
  { icon: 'group', label: 'Mitra', page: 'mitra', roles: ['admin', 'mitra'] },
  { icon: 'assessment', label: 'Laporan', page: 'sales-recap', roles: ['admin'] },
  { icon: 'history', label: 'Riwayat', page: 'transaction-history', roles: ['admin', 'kasir'] },
  { icon: 'swap_vert', label: 'Stok', page: 'stock-management', roles: ['admin', 'kasir'] },
  { icon: 'shopping_bag', label: 'Produk', page: 'product', roles: ['admin'] },
  { icon: 'admin_panel_settings', label: 'Admin', page: 'financial', roles: ['admin'] },
];

function BottomNav({ activePage, onNavigate, onLogout, role }) {
  const accessibleItems = bottomNavItems.filter((item) => !role || item.roles.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex md:hidden justify-around items-center px-2 pb-safe h-20 bg-surface shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-xl">
      {accessibleItems.map((item) => (
        <button
          key={item.label}
          onClick={() => onNavigate(item.page)}
          className={`flex flex-col items-center justify-center transition-all min-h-[48px] px-2 py-1 ${
            activePage === item.page
              ? 'bg-secondary-container text-on-secondary-container rounded-full px-5 py-1.5'
              : 'text-on-surface-variant hover:bg-surface-container active:scale-90'
          }`}
        >
          <span
            className="material-symbols-outlined"
            data-icon={item.icon}
            data-weight={item.icon === 'admin_panel_settings' ? 'fill' : undefined}
          >
            {item.icon}
          </span>
          <span className="font-label-sm text-label-sm mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
