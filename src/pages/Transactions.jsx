import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const Transactions = () => {
  const { transactions } = useAuth();
  
  // State for pagination and search
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const rowsPerPage = 10;
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Helper to extract nested values for sorting
  const getSortValue = (tx, key) => {
    switch (key) {
      case 'DATE':
        return new Date(tx.time?.detail?.transaction_time || tx.payment?.detail?.transaction_time || tx.time?.timestamp || Date.now()).getTime();
      case 'ORDER ID':
        return (tx.detail?.order_id || tx.id || '').toLowerCase();
      case 'PRODUCT':
        return (tx.product?.name || '').toLowerCase();
      case 'PRICE':
        return tx.product?.price || tx.payment?.amount || 0;
      case 'QTY':
        return tx.product?.quantity || 1;
      case 'PAYMENT METHOD':
        return (tx.payment?.method || '').toLowerCase();
      case 'STATUS':
        return (tx.payment?.detail?.transaction_status || tx.detail?.transaction_status || '').toLowerCase();
      default:
        return '';
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter & Pagination Logic
  const filteredAndSortedTransactions = useMemo(() => {
    let processed = transactions || [];
    
    // 1. Search filter
    if (searchQuery) {
      processed = processed.filter((tx) => {
        const searchLower = searchQuery.toLowerCase();
        const orderId = (tx.detail?.order_id || tx.id || '').toLowerCase();
        const productName = (tx.product?.name || '').toLowerCase();
        const paymentMethod = (tx.payment?.method || '').toLowerCase();
        const txStatus = (tx.payment?.detail?.transaction_status || tx.detail?.transaction_status || '').toLowerCase();
        
        return orderId.includes(searchLower) || 
               productName.includes(searchLower) || 
               paymentMethod.includes(searchLower) ||
               txStatus.includes(searchLower);
      });
    }

    // 2. Sorting
    if (sortConfig.key) {
      processed = [...processed].sort((a, b) => {
        const valA = getSortValue(a, sortConfig.key);
        const valB = getSortValue(b, sortConfig.key);

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processed;
  }, [transactions, searchQuery, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / rowsPerPage);
  
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * rowsPerPage;
    const lastPageIndex = firstPageIndex + rowsPerPage;
    return filteredAndSortedTransactions.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredAndSortedTransactions]);

  // Handle page change safely
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset to page 1 on search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="animate-fade-in flex-col gap-6">
      
      <div className="flex items-center justify-between device-header-mobile">
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Transactions</h1>
          <p>Recent vending transactions securely fetched from the login API payload.</p>
        </div>
        
        {/* Search Input replacing Filter/Export */}
        <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchQuery}
            onChange={handleSearch}
            style={{ 
              paddingLeft: '2.5rem', 
              background: 'rgba(255,255,255,0.02)'
            }} 
          />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {filteredAndSortedTransactions.length > 0 ? (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {['DATE', 'ORDER ID', 'PRODUCT', 'PRICE', 'QTY', 'PAYMENT METHOD', 'STATUS'].map((col) => (
                    <th 
                      key={col} 
                      onClick={() => handleSort(col)} 
                      style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div className="flex items-center gap-2">
                        {col}
                        {sortConfig.key === col ? (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} style={{ opacity: 0.3 }} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTableData.map((tx, idx) => {
                  const dateStr = tx.time?.detail?.transaction_time || tx.payment?.detail?.transaction_time || new Date(tx.time?.timestamp || Date.now()).toLocaleString();
                  const productName = tx.product?.name || 'Unknown Product';
                  const price = formatCurrency(tx.product?.price || tx.payment?.amount || 0);
                  const qty = tx.product?.quantity || 1;
                  const orderId = tx.detail?.order_id || tx.id || 'N/A';
                  const paymentMethod = tx.payment?.method || 'N/A';
                  const txStatus = tx.payment?.detail?.transaction_status || tx.detail?.transaction_status || 'completed';
                  
                  return (
                    <tr key={idx}>
                      <td>{dateStr}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{orderId}</td>
                      <td>{productName}</td>
                      <td>{price}</td>
                      <td>{qty}</td>
                      <td>{paymentMethod}</td>
                      <td>
                        <span className={`badge ${txStatus.toLowerCase() === 'settlement' || txStatus.toLowerCase() === 'success' || txStatus.toLowerCase() === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                          {txStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <Search size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }} />
            <h3>No Transactions Found</h3>
            <p>We couldn't find any transactions matching your query.</p>
          </div>
        )}
        
        {/* Pagination Controls */}
        {filteredAndSortedTransactions.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedTransactions.length)} of {filteredAndSortedTransactions.length} entries
            </p>
            
            <div className="flex gap-2">
              <button 
                className="btn btn-ghost" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ padding: '0.5rem', opacity: currentPage === 1 ? 0.3 : 1 }}
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center" style={{ padding: '0 0.5rem', fontWeight: 600 }}>
                Page {currentPage} of {totalPages}
              </div>
              
              <button 
                className="btn btn-ghost" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ padding: '0.5rem', opacity: currentPage === totalPages ? 0.3 : 1 }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default Transactions;
