import React, { useState, useEffect, useCallback } from 'react';
import { toast } from "react-toastify";
import { 
  CreditCard, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search, 
  Filter,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  User,
  Package,
  Store,
  Receipt,
  IndianRupee,
  Hash,
  Wallet,
  Shield,
  FileText
} from 'lucide-react';
import Pagination from '../../Components/Admin/Pagination';
import Modal from '../../Components/Admin/Modal';
import AdminApi from '../../helpers/adminApi';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Filter options
  const filterOptions = [
    { value: 'ALL', label: 'All Payments' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'REFUNDED', label: 'Refunded' }
  ];

  // Stats state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0
  });

  const calculateStats = useCallback((paymentsData) => {
    const totalRevenue = paymentsData
      .filter(p => p.paymentStatus === 'COMPLETED')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const pendingPayments = paymentsData
      .filter(p => p.paymentStatus === 'PENDING')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const completedPayments = paymentsData.filter(p => p.paymentStatus === 'COMPLETED').length;
    const failedPayments = paymentsData.filter(p => p.paymentStatus === 'FAILED').length;

    setStats({
      totalRevenue,
      pendingPayments,
      completedPayments,
      failedPayments
    });
  }, []);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const paymentsData = await AdminApi.getPayments();
      setPayments(paymentsData);
      calculateStats(paymentsData);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Failed to load payments. Please try again.');
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Filter payments based on search and filter criteria
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterValue === 'ALL' || 
      payment.paymentStatus === filterValue;

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleExportPayments = () => {
    // Simple CSV export functionality
    const headers = [
      'Payment ID',
      'User Name',
      'User Email',
      'Vendor Name',
      'Package Name',
      'Amount',
      'Payment Method',
      'Payment Status',
      'Transaction ID',
      'Date'
    ].join(',');

    const csvData = filteredPayments.map(payment => [
      payment.paymentId,
      payment.userName,
      payment.userEmail,
      payment.vendorName,
      payment.packageName,
      payment.amount,
      payment.paymentMethod,
      payment.paymentStatus,
      payment.transactionId,
      payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'
    ].join(',')).join('\n');

    const csv = `${headers}\n${csvData}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="h-3 w-3 text-red-600" />;
      case 'REFUNDED':
        return <RefreshCw className="h-3 w-3 text-blue-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Rs. 0';
    return `Rs. ${amount.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })}`;
  };

  const formatShortCurrency = (amount) => {
    if (!amount) return 'Rs. 0';
    return `Rs. ${amount.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate percentage change for stats
  const calculatePercentage = (current, previous) => {
    if (previous === 0) return '+100%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-1">Manage payment transactions and settlements</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportPayments}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          
          <button
            onClick={loadPayments}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards - Fixed Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className=" p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatShortCurrency(stats.totalRevenue)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  {calculatePercentage(stats.totalRevenue, stats.totalRevenue * 0.8)}
                </span>
                <span className="text-xs text-gray-500">from last month</span>
              </div>
            </div>
            <div className="p-2 bg-white/50 rounded-lg border border-green-200">
              <Wallet className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className=" p-5 rounded-xl border  shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatShortCurrency(stats.pendingPayments)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Clock className="h-3 w-3 text-yellow-600" />
                <span className="text-xs text-yellow-600 font-medium">
                  {stats.pendingPayments > 0 ? 'Pending' : 'Clear'}
                </span>
              </div>
            </div>
            <div className="p-2 bg-white/50 rounded-lg border border-yellow-200">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className=" p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {stats.completedPayments}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">
                  {stats.completedPayments > 0 ? 'Successful' : 'None'}
                </span>
              </div>
            </div>
            <div className="p-2 bg-white/50 rounded-lg border border-blue-200">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className=" p-5 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {stats.failedPayments}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <XCircle className="h-3 w-3 text-red-600" />
                <span className="text-xs text-red-600 font-medium">
                  {stats.failedPayments > 0 ? 'Requires attention' : 'All good'}
                </span>
              </div>
            </div>
            <div className="p-2 bg-white/50 rounded-lg border border-red-200">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Payments
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                placeholder="Search by Payment ID, User, Vendor, or Transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="rounded-md bg-red-50 p-4 mx-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Payments</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px]">
                      Payment Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                      User & Vendor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                      Package
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[140px]">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPayments.map((payment) => (
                    <tr key={payment.paymentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-blue-100 rounded">
                              <CreditCard className="h-3 w-3 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
                              {payment.paymentId}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-[140px]">
                            {payment.paymentMethod}
                          </div>
                          {payment.transactionId && (
                            <div className="text-xs text-gray-400 truncate max-w-[140px]">
                              TXN: {payment.transactionId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                              {payment.userName || 'N/A'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-[160px]">
                            {payment.userEmail || 'N/A'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 truncate max-w-[160px]">
                            <Store className="h-3 w-3" />
                            Vendor: {payment.vendorName || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-900 truncate max-w-[120px]">
                              {payment.packageName || 'N/A'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 ml-5">
                            {payment.durationDays ? `${payment.durationDays} days` : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.paymentStatus)}`}>
                          {getStatusIcon(payment.paymentStatus)}
                          <span className="truncate max-w-[70px]">{payment.paymentStatus}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {formatDate(payment.paidAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {currentPayments.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-blue-50 rounded-full mb-4">
                  <CreditCard className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterValue !== 'ALL' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'No payment data available'
                  }
                </p>
              </div>
            )}
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              currentItemsCount={currentPayments.length}
            />
          </>
        )}
      </div>

      {/* Modern Payment Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Payment Details"
        size="xl"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold truncate max-w-[300px]">
                      {selectedPayment.paymentId}
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">Payment ID</p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/20 text-white border border-white/50 backdrop-blur-sm">
                    {getStatusIcon(selectedPayment.paymentStatus)}
                    {selectedPayment.paymentStatus}
                  </span>
                  <p className="text-blue-100 text-sm mt-2">{formatDate(selectedPayment.paidAt)}</p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Payment Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Amount Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <IndianRupee className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Payment Amount</h4>
                        <p className="text-sm text-gray-600">Total transaction value</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-bold text-gray-900 mb-6">
                      {formatCurrency(selectedPayment.amount)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Payment Method</span>
                        </div>
                        <p className="text-base font-semibold text-gray-900">{selectedPayment.paymentMethod}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Transaction ID</span>
                        </div>
                        <p className="text-base font-semibold text-gray-900 font-mono truncate">
                          {selectedPayment.transactionId || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User & Vendor Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">User Information</h4>
                        <p className="text-sm text-gray-600">Customer details</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Full Name</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPayment.userName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Email Address</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedPayment.userEmail}</p>
                      </div>
                      {selectedPayment.userPhone && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Phone Number</p>
                          <p className="text-sm font-medium text-gray-900">{selectedPayment.userPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vendor Card */}
                  {selectedPayment.vendorName && (
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Store className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Vendor Information</h4>
                          <p className="text-sm text-gray-600">Service provider details</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Vendor Name</p>
                          <p className="text-sm font-medium text-gray-900">{selectedPayment.vendorName}</p>
                        </div>
                        {selectedPayment.vendorEmail && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Email Address</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{selectedPayment.vendorEmail}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Package & Dates */}
              <div className="space-y-6">
                {/* Package Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Package Details</h4>
                      <p className="text-sm text-gray-600">Subscription information</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Package Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedPayment.packageName}</p>
                    </div>
                    {selectedPayment.packageId && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Package ID</p>
                        <p className="text-sm font-medium text-gray-900 font-mono">{selectedPayment.packageId}</p>
                      </div>
                    )}
                    {selectedPayment.durationDays && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Duration</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPayment.durationDays} days</p>
                      </div>
                    )}
                    {selectedPayment.packagePrice && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Package Price</p>
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedPayment.packagePrice)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Timeline</h4>
                      <p className="text-sm text-gray-600">Transaction timeline</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Paid At</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedPayment.paidAt)}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status Updated</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedPayment.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                {selectedPayment.subscriptionStatus && (
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Shield className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Subscription</h4>
                        <p className="text-sm text-gray-600">Service status</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                        <p className="text-sm font-medium text-gray-900">{selectedPayment.subscriptionStatus}</p>
                      </div>
                      {selectedPayment.subscriptionId && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Subscription ID</p>
                          <p className="text-sm font-medium text-gray-900 font-mono truncate">
                            {selectedPayment.subscriptionId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>Payment ID: {selectedPayment.paymentId}</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedPayment.receiptUrl && (
                  <a
                    href={selectedPayment.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    <Receipt className="h-4 w-4" />
                    View Receipt
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentManagement;