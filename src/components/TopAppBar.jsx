function TopAppBar({ title = 'Lapak Berkah', showNotifications = false, onLogout }) {
  return (
    <header className="flex justify-between items-center h-16 px-4 w-full z-50 bg-primary dark:bg-primary-container docked full-width top-0 shadow-sm sticky">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-on-primary/70 hover:bg-primary-fixed-dim/20 transition-colors duration-200 p-2 rounded-full h-[48px] w-[48px] flex items-center justify-center">
          <span className="material-symbols-outlined" data-icon="menu">menu</span>
        </button>
        <h1 className="font-headline-md text-headline-md-mobile font-bold text-secondary-fixed">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {showNotifications && (
          <button aria-label="Notifications" className="p-2 rounded-full hover:bg-primary-fixed-dim/20 transition-colors hidden md:flex">
            <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
          </button>
        )}
        {onLogout && (
          <button onClick={onLogout} className="text-on-primary/70 hover:bg-primary-fixed-dim/20 transition-colors duration-200 p-2 rounded-full h-[48px] w-[48px] flex items-center justify-center" title="Logout">
            <span className="material-symbols-outlined" data-icon="logout">logout</span>
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold md:hidden">
          <span className="material-symbols-outlined text-sm" data-icon="person">person</span>
        </div>
      </div>
    </header>
  );
}

export default TopAppBar;
