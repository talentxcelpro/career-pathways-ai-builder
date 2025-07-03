import { useState } from 'react';
import { useRealtimePricingData } from './useRealtimePricingData';

export const usePricingPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const {
    revenueStats: paymentStats,
    plans,
    transactions,
    refreshData,
    isLoading
  } = useRealtimePricingData();

  // Filter transactions based on search and status
  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = transaction.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStats,
    plans,
    transactions: filteredTransactions,
    refreshData,
    isLoading
  };
};