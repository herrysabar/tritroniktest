import React, { createContext, useState, useContext } from 'react';
import { loginAndFetchTransactions } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await loginAndFetchTransactions(username, password);
      // Assuming the data contains a token and transactions list
      // Adapt this base on actual API response structure
      setIsAuthenticated(true);
      setUser({ username });
      
      // If transactions are nested, adjust here:
      // Extract transactions from data.data if it's an object of objects
      let txList = [];
      if (data && data.data && data.data.data) {
        // Handle payload: { message: "...", data: { data: { "ID": {...} } } }
        const rawTxs = data.data.data;
        if (typeof rawTxs === 'object' && !Array.isArray(rawTxs)) {
          txList = Object.entries(rawTxs).map(([id, details]) => ({
            id,
            ...details
          }));
        } else if (Array.isArray(rawTxs)) {
          txList = rawTxs;
        }
      } else if (data && data.data) {
        const rawTxs = data.data;
        if (typeof rawTxs === 'object' && !Array.isArray(rawTxs)) {
          txList = Object.entries(rawTxs).map(([id, details]) => ({
            id,
            ...details
          }));
        } else if (Array.isArray(rawTxs)) {
          txList = rawTxs;
        }
      } else if (Array.isArray(data)) {
        txList = data;
      } else if (data && data.transactions) {
        txList = Array.isArray(data.transactions) ? data.transactions : Object.values(data.transactions);
      } else {
        txList = [data]; // fallback
      }
      
      setTransactions(txList);
      
      return true;
    } catch (err) {
      setError('Invalid default credentials or server error.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setTransactions([]);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, transactions, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
