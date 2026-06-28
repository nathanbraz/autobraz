import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/components/Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1 && pageSize >= totalItems) {
    // If only one page and no pagination is actually needed, show minimal info but hide buttons
    if (totalItems === 0) return null;
    return (
      <div className="pagination-container pagination-container--empty">
        <span className="pagination-info">
          Exibindo todos os {totalItems} registro{totalItems !== 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Middle pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-left">
        <span className="pagination-info">
          Exibindo <strong>{startItem}</strong> - <strong>{endItem}</strong> de <strong>{totalItems}</strong> registro{totalItems !== 1 ? 's' : ''}
        </span>
        {onPageSizeChange && (
          <div className="pagination-size-selector">
            <span className="pagination-size-label">Exibir</span>
            <select
              className="form-control pagination-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value) || 10)}
            >
              <option value={5}>5 por página</option>
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        )}
      </div>

      <div className="pagination-buttons">
        <button
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Página Anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                ...
              </span>
            );
          }

          return (
            <button
              key={`page-${p}`}
              className={`pagination-btn ${currentPage === p ? 'pagination-btn--active' : ''}`}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </button>
          );
        })}

        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Próxima Página"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
