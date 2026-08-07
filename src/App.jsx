import { useState } from 'react';
import TopAppBar from './components/TopAppBar';
import NavDrawer from './components/NavDrawer';
import BottomNav from './components/BottomNav';
import SummaryCards from './components/SummaryCards';
import TransactionTable from './components/TransactionTable';
import MitraDashboard from './pages/MitraDashboard';
import KasirHP from './pages/KasirHP';
import { KasirDesktop, KasirDesktopCart } from './pages/KasirDesktop';
import ProductManagement from './pages/ProductManagement';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SalesRecap from './pages/SalesRecap';
import Inventory from './pages/Inventory';
import TransactionHistory from './pages/TransactionHistory';
import StockManagement from './pages/StockManagement';

const rolePageAccess = {
  admin: ['dashboard', 'pos-desktop', 'inventory', 'mitra', 'sales-recap', 'transaction-history', 'product', 'financial', 'stock-management'],
  kasir: ['dashboard', 'pos-desktop', 'inventory', 'transaction-history', 'stock-management'],
  mitra: ['dashboard', 'mitra'],
};

const roleDefaultPage = {
  admin: 'dashboard',
  kasir: 'pos-desktop',
  mitra: 'mitra',
};

function FinancialReports() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface">Laporan Laba & Profit</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Laporan keuangan harian untuk Admin.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center bg-surface-container-highest rounded-lg p-1">
            <button className="bg-surface text-on-surface px-4 py-2 rounded-md font-label-md text-label-md shadow-sm h-[48px]">Hari Ini</button>
            <button className="text-on-surface-variant px-4 py-2 rounded-md font-label-md text-label-md hover:bg-surface-variant h-[48px]">Bulan Ini</button>
            <button className="text-on-surface-variant px-4 py-2 rounded-md font-label-md text-label-md hover:bg-surface-variant h-[48px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]" data-icon="calendar_today">calendar_today</span>
              Pilih
            </button>
          </div>
          <div className="flex gap-2">
            <button className="bg-surface text-primary border border-primary hover:bg-surface-variant transition-colors px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 h-[48px]">
              <span className="material-symbols-outlined text-[20px]" data-icon="description">description</span>
              Export Excel
            </button>
            <button className="bg-secondary text-on-secondary hover:bg-secondary/90 transition-colors px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 h-[48px]">
              <span className="material-symbols-outlined text-[20px]" data-icon="picture_as_pdf">picture_as_pdf</span>
              Export PDF
            </button>
          </div>
        </div>
      </div>
      <SummaryCards />
      <TransactionTable />
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');

  const handleLogin = (selectedRole, userData = null) => {
    setIsAuthenticated(true);
    setRole(selectedRole);
    setUser(userData);
    setPage(roleDefaultPage[selectedRole] || 'dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUser(null);
  };

  const accessiblePages = role ? rolePageAccess[role] || [] : [];

  const navigateTo = (targetPage) => {
    if (!role || accessiblePages.includes(targetPage)) {
      setPage(targetPage);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen">
      <TopAppBar title={page === 'pos' || page === 'pos-desktop' ? 'Halaman Kasir' : 'Lapak Berkah'} showNotifications={page === 'pos' || page === 'pos-desktop'} onLogout={handleLogout} />
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <NavDrawer activePage={page} onNavigate={navigateTo} onLogout={handleLogout} role={role} />
        <main className={`flex-1 overflow-y-auto bg-surface md:ml-72 pb-24 md:pb-8 ${page === 'pos-desktop' ? 'md:mr-[380px]' : ''}`}>
          {page === 'financial' && <FinancialReports />}
          {page === 'dashboard' && <Dashboard />}
          {page === 'sales-recap' && <SalesRecap />}
          {page === 'mitra' && <MitraDashboard role={role} />}
          {page === 'inventory' && <Inventory />}
          {page === 'transaction-history' && <TransactionHistory />}
          {page === 'stock-management' && <StockManagement />}
          {page === 'product' && <ProductManagement />}
          {page === 'pos' && <KasirHP />}
          {page === 'pos-desktop' && <KasirDesktop />}
        </main>
        {page === 'pos-desktop' && <KasirDesktopCart />}
        <BottomNav activePage={page} onNavigate={navigateTo} onLogout={handleLogout} role={role} />
      </div>
    </div>
  );
}

export default App;
