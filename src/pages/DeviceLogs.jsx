import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDeviceLogs } from '../services/api';
import { Terminal, RefreshCw, Server, AlertCircle, ShoppingCart } from 'lucide-react';

const DeviceLogs = () => {
  const { transactions } = useAuth();
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === 'Unknown' || amount === null) return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Parse raw log text into structured transactions
  const parseTransactionsFromLog = (logString) => {
    if (!logString) return [];
    // Handle JSON stringified or raw string
    const rawStr = typeof logString === 'string' ? logString : JSON.stringify(logString);
    const lines = rawStr.split(/\\n|\\t|\n/);
    const transactions = [];
    let currentTx = null;

    for (const line of lines) {
      // Extract date
      const dateMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
      const logDate = dateMatch ? dateMatch[1] : '';

      if (line.includes('Selection:')) {
        if (currentTx) transactions.push(currentTx);
        
        // Extract product name
        const productMatch = line.match(/Product:\s*(.*?)\s*\|/);
        const product = productMatch ? productMatch[1] : 'Unknown';
        
        currentTx = {
          date: logDate,
          product: product,
          price: 'Unknown',
          status: 'PENDING'
        };
      }
      
      if (currentTx) {
        // Find price: matches APPROVE,2000.00 or VEND,100.00
        const priceMatch = line.match(/(?:APPROVE|VEND),(\d+\.\d+)/);
        if (priceMatch && currentTx.price === 'Unknown') {
           currentTx.price = priceMatch[1];
        }
        
        // Find Status
        if (line.includes('Payment Success')) currentTx.status = 'PAYMENT SUCCESS';
        if (line.includes('Dispense Success')) currentTx.status = 'DISPENSE SUCCESS';
        if (line.includes('Transaction Completed')) currentTx.status = 'COMPLETED';
        if (line.includes('Cancelling Transaction') || line.includes('Failed') || line.includes('Denied')) currentTx.status = 'FAILED';
      }
    }
    
    if (currentTx) transactions.push(currentTx);
    
    return transactions.reverse(); // Newest first
  };

  const loadLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const data = await fetchDeviceLogs();
      setLogs(data);
    } catch (err) {
      setError('Failed to load device logs. Real-time endpoint might be unavailable.');
      console.error(err);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    
    // Auto refresh every 10 seconds
    const interval = setInterval(() => {
      loadLogs(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in flex-col gap-6" style={{ height: '100%', paddingBottom: '2rem' }}>
      
      <div className="flex items-center justify-between device-header-mobile">
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Live Device Monitor</h1>
          <p>Real-time telemetry and operation logs from vending devices.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => loadLogs(true)} 
          disabled={loading || refreshing}
        >
          <RefreshCw size={18} className={refreshing ? 'spinner' : ''} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', border: refreshing ? 'none' : '' }} /> 
          {refreshing ? 'Syncing...' : 'Sync Logs'}
        </button>
      </div>

      {error && (
        <div className="glass-panel items-center gap-4" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-danger)', display: 'flex' }}>
          <AlertCircle color="var(--accent-danger)" size={24} />
          <div>
            <h4 style={{ color: 'var(--text-main)', margin: 0 }}>Connection Error</h4>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        </div>
      )}

      {loading && !refreshing && !error ? (
        <div className="glass-panel flex-col items-center justify-center gap-4" style={{ padding: '4rem 2rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
          <p>Establishing secure connection to device endpoints...</p>
        </div>
      ) : (
        <div className="flex mobile-col gap-6 h-full" style={{ minHeight: '100%' }}>
          {Object.keys(logs).length > 0 ? Object.entries(logs).map(([id, deviceLogs]) => {
            // Parse transactions from the raw log output directly
            const deviceTransactions = parseTransactionsFromLog(deviceLogs?.log);

            return (
              <div key={id} className="glass-panel flex-col" style={{ padding: '1.5rem', display: 'flex', minWidth: 0 }}>
              
              <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
                <div className="flex items-center gap-3">
                  <div style={{ background: 'var(--bg-base)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <Server size={20} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{deviceLogs?.device_type || `Device ${id}`}</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accent-success)' }}>● Online - ID: {deviceLogs?.device_id || id}</p>
                  </div>
                </div>
                <div className="badge badge-blue">VENDING</div>
              </div>

              <div style={{
                flex: 1,
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflowY: 'auto',
                color: '#a3be8c',
                border: '1px solid var(--border-light)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
                minHeight: '100px',
                maxHeight: '300px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                  <Terminal size={14} /> <span>device_terminal_output</span>
                </div>
                {/* Parse raw log string if applicable */}
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#0ea5e9' }}>
                  {deviceLogs?.log ? deviceLogs.log.replace(/\\n/g, '\n').replace(/\\t/g, '  ') : JSON.stringify(deviceLogs, null, 2)}
                </pre>
              </div>

              {/* Transactions Section */}
              <div className="flex-col" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <ShoppingCart size={16} color="var(--accent-primary)" /> Logged Transactions
                </h4>
                {deviceTransactions.length > 0 ? (
                  <div className="data-table-wrapper custom-scrollbar" style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'auto', borderRadius: 'var(--radius-sm)' }}>
                    <table className="data-table" style={{ fontSize: '0.75rem', minWidth: '400px', tableLayout: 'auto' }}>
                      <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-card)' }}>
                        <tr>
                          <th style={{ padding: '0.4rem 0.5rem', whiteSpace: 'nowrap' }}>DATE</th>
                          <th style={{ padding: '0.4rem 0.5rem', whiteSpace: 'nowrap' }}>PRODUCT</th>
                          <th style={{ padding: '0.4rem 0.5rem', whiteSpace: 'nowrap' }}>PRICE</th>
                          <th style={{ padding: '0.4rem 0.5rem', whiteSpace: 'nowrap' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deviceTransactions.slice(0, 50).map((tx, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: '0.4rem 0.5rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                              {tx.date ? tx.date.split(' ')[0] + '\n' + tx.date.split(' ')[1] : 'Unknown'}
                            </td>
                            <td style={{ padding: '0.4rem 0.5rem', fontWeight: 500, minWidth: '80px' }}>{tx.product}</td>
                            <td style={{ padding: '0.4rem 0.5rem', color: 'var(--accent-success)', whiteSpace: 'nowrap' }}>{formatCurrency(tx.price)}</td>
                            <td style={{ padding: '0.4rem 0.5rem', whiteSpace: 'nowrap' }}>
                              <span className={`badge ${tx.status.toLowerCase() === 'completed' || tx.status.toLowerCase() === 'dispense success' || tx.status.toLowerCase() === 'payment success' ? 'badge-success' : tx.status.toLowerCase() === 'failed' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.6rem', padding: '0.15rem 0.3rem' }}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-light)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>No recent transactions recorded for this device.</p>
                  </div>
                )}
              </div>

            </div>
            );
          }) : !error ? (
            <div className="glass-panel flex items-center justify-center w-full" style={{ padding: '4rem 2rem' }}>
              <p>No active device streams detected.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DeviceLogs;
