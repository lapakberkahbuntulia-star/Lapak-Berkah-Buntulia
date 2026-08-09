function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePrevious = () => {
    if (safeCurrentPage > 1) onPageChange(safeCurrentPage - 1);
  };

  const handleNext = () => {
    if (safeCurrentPage < totalPages) onPageChange(safeCurrentPage + 1);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant bg-surface">
      <div className="font-label-md text-label-md text-on-surface-variant">
        {totalItems === 0 ? 'Tidak ada data' : `Menampilkan ${(safeCurrentPage - 1) * itemsPerPage + 1}-${Math.min(safeCurrentPage * itemsPerPage, totalItems)} dari ${totalItems}`}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handlePrevious}
          disabled={safeCurrentPage === 1}
          className="h-8 w-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Halaman sebelumnya"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {getPageNumbers().map((page, idx) => (
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center font-label-md text-label-md text-on-surface-variant">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-8 min-w-8 px-2 rounded-md font-label-md text-label-md transition-colors ${
                safeCurrentPage === page
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
              aria-label={`Halaman ${page}`}
              aria-current={safeCurrentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={handleNext}
          disabled={safeCurrentPage === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded-md border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Halaman berikutnya"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}

export default Pagination;
