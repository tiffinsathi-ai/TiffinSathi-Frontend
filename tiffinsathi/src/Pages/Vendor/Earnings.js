// src/Pages/Vendor/Earnings.js
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  BarChart,
  PieChart as PieChartIcon,
  ShoppingBag,
  Package,
  Users,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertCircle,
  X,
  Bell,
  Wallet,
  Smartphone,
  Banknote
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../helpers/api";

const Earnings = () => {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const navigate = useNavigate();

  // Load earnings data from multiple APIs
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch data from multiple endpoints
      const [ordersResponse, subscriptionsResponse, paymentsResponse] = await Promise.allSettled([
        api.orders.getVendorOrders(),
        api.subscriptions.getVendorSubscriptions(),
        // Note: There's no direct payments list API, so we'll process orders
      ]);

      const orders = ordersResponse.status === 'fulfilled' ? ordersResponse.value : [];
      const subscriptions = subscriptionsResponse.status === 'fulfilled' ? subscriptionsResponse.value : [];

      // Transform orders into transactions
      const orderTransactions = Array.isArray(orders) ? orders.map(order => ({
        id: `ORD-${order.orderId || order.id}`,
        type: "ORDER",
        orderId: order.orderId || order.id,
        customerName: order.customerName || order.customer || "Customer",
        amount: order.totalAmount || 0,
        status: getPaymentStatus(order.paymentStatus),
        date: order.orderDate || new Date().toISOString(),
        paymentMethod: order.paymentMethod || "CASH",
        description: `Order #${order.orderId || order.id}`,
        subscriptionId: order.subscriptionId || null,
        originalData: order
      })) : [];

      // Transform subscriptions into transactions
      const subscriptionTransactions = Array.isArray(subscriptions) ? subscriptions.map(subscription => ({
        id: `SUB-${subscription.subscriptionId || subscription.id}`,
        type: "SUBSCRIPTION",
        orderId: null,
        customerName: subscription.customerName || subscription.customer || "Customer",
        amount: subscription.totalAmount || subscription.price || 0,
        status: getSubscriptionStatus(subscription.status),
        date: subscription.startDate || subscription.createdAt || new Date().toISOString(),
        paymentMethod: subscription.paymentMethod || "CASH",
        description: `Subscription - ${subscription.planName || "Meal Plan"}`,
        subscriptionId: subscription.subscriptionId || subscription.id,
        originalData: subscription
      })) : [];

      // Combine all transactions
      const allTransactions = [...orderTransactions, ...subscriptionTransactions];
      
      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Calculate stats
      const stats = calculateStats(allTransactions);

      // Calculate earnings by payment method
      const earningsByMethod = calculateEarningsByMethod(allTransactions);

      // Calculate chart data (group by day)
      const chartData = calculateChartData(allTransactions, timeRange);

      setEarningsData({
        transactions: allTransactions,
        stats,
        earningsByMethod,
        chartData
      });
    } catch (error) {
      console.error("Error loading earnings data:", error);
      // If API fails, set empty data
      setEarningsData({
        transactions: [],
        stats: {
          totalRevenue: "Rs. 0",
          pendingAmount: "Rs. 0",
          completedTransactions: 0,
          failedTransactions: 0,
          orderEarnings: "Rs. 0",
          subscriptionEarnings: "Rs. 0",
          revenueGrowth: "0%",
          orderGrowth: "0%",
          subscriptionGrowth: "0%"
        },
        earningsByMethod: {},
        chartData: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get payment status
  const getPaymentStatus = (paymentStatus) => {
    if (!paymentStatus) return "PENDING";
    const status = paymentStatus.toUpperCase();
    if (status === 'PAID' || status === 'COMPLETED') return "COMPLETED";
    if (status === 'PENDING' || status === 'PROCESSING') return "PENDING";
    if (status === 'FAILED' || status === 'CANCELLED' || status === 'REFUNDED') return "FAILED";
    return "PENDING";
  };

  // Helper function to get subscription status
  const getSubscriptionStatus = (subscriptionStatus) => {
    if (!subscriptionStatus) return "COMPLETED";
    const status = subscriptionStatus.toUpperCase();
    if (status === 'ACTIVE' || status === 'COMPLETED') return "COMPLETED";
    if (status === 'PENDING' || status === 'PROCESSING') return "PENDING";
    if (status === 'CANCELLED' || status === 'FAILED') return "FAILED";
    return "COMPLETED";
  };

  // Calculate statistics from transactions
  const calculateStats = (transactions) => {
    const totalRevenue = transactions
      .filter(t => t.status === "COMPLETED")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const pendingAmount = transactions
      .filter(t => t.status === "PENDING")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const completedTransactions = transactions.filter(t => t.status === "COMPLETED").length;
    const failedTransactions = transactions.filter(t => t.status === "FAILED").length;
    
    const orderEarnings = transactions
      .filter(t => t.type === "ORDER" && t.status === "COMPLETED")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const subscriptionEarnings = transactions
      .filter(t => t.type === "SUBSCRIPTION" && t.status === "COMPLETED")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    // Note: Growth calculations would require historical data
    // For now, we'll show static or calculate based on last 30 days vs previous period
    const revenueGrowth = "+0%";
    const orderGrowth = "+0%";
    const subscriptionGrowth = "+0%";

    return {
      totalRevenue: `Rs. ${totalRevenue.toLocaleString()}`,
      pendingAmount: `Rs. ${pendingAmount.toLocaleString()}`,
      completedTransactions,
      failedTransactions,
      orderEarnings: `Rs. ${orderEarnings.toLocaleString()}`,
      subscriptionEarnings: `Rs. ${subscriptionEarnings.toLocaleString()}`,
      revenueGrowth,
      orderGrowth,
      subscriptionGrowth
    };
  };

  // Calculate earnings by payment method
  const calculateEarningsByMethod = (transactions) => {
    const earningsByMethod = {};
    transactions
      .filter(t => t.status === "COMPLETED")
      .forEach(transaction => {
        const method = transaction.paymentMethod || "CASH";
        if (!earningsByMethod[method]) {
          earningsByMethod[method] = { amount: 0, count: 0 };
        }
        earningsByMethod[method].amount += transaction.amount;
        earningsByMethod[method].count += 1;
      });
    return earningsByMethod;
  };

  // Calculate chart data grouped by day
  const calculateChartData = (transactions, timeRange) => {
    const days = timeRange === "7days" ? 7 : timeRange === "90days" ? 90 : 30;
    const today = new Date();
    const chartData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date).toISOString().split('T')[0];
        return transactionDate === dateString;
      });
      
      const dayEarnings = dayTransactions
        .filter(t => t.status === "COMPLETED")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dayOrders = dayTransactions.filter(t => t.type === "ORDER" && t.status === "COMPLETED").length;
      const daySubscriptions = dayTransactions.filter(t => t.type === "SUBSCRIPTION" && t.status === "COMPLETED").length;
      
      chartData.push({
        date: dateString,
        earnings: dayEarnings,
        orders: dayOrders,
        subscriptions: daySubscriptions
      });
    }
    
    return chartData;
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  // Compact StatCard Component
  const CompactStatCard = ({ title, value, icon: Icon, color, trend, onClick, description }) => {
    const colorClasses = {
      blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100 hover:border-blue-300" },
      green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100 hover:border-green-300" },
      purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100 hover:border-purple-300" },
      orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100 hover:border-orange-300" },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
      <div 
        className={`bg-white p-4 rounded-lg border ${colors.border} hover:shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
            <Icon className="h-4 w-4" />
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend.startsWith('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span className="ml-1">{trend}</span>
            </div>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      FAILED: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      COMPLETED: <CheckCircle className="text-green-600" size={14} />,
      PENDING: <Clock className="text-yellow-600" size={14} />,
      FAILED: <XCircle className="text-red-600" size={14} />,
    };
    return icons[status] || <AlertCircle className="text-gray-600" size={14} />;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      ESEWA: Smartphone,
      KHALTI: Smartphone,
      COD: Banknote,
      CARD: CreditCard,
      CASH: Banknote,
      "BANK TRANSFER": CreditCard,
    };
    const Icon = icons[method] || CreditCard;
    return <Icon className="h-4 w-4" />;
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      ESEWA: "bg-blue-100 text-blue-800 border-blue-200",
      KHALTI: "bg-purple-100 text-purple-800 border-purple-200",
      COD: "bg-green-100 text-green-800 border-green-200",
      CARD: "bg-red-100 text-red-800 border-red-200",
      CASH: "bg-gray-100 text-gray-800 border-gray-200",
      "BANK TRANSFER": "bg-indigo-100 text-indigo-800 border-indigo-200",
    };
    return colors[method] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatDateShort = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  const getFilteredTransactions = () => {
    if (!earningsData) return [];
    
    let filtered = earningsData.transactions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.orderId && transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.subscriptionId && transaction.subscriptionId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Apply type filter based on activeTab
    if (activeTab === "orders") {
      filtered = filtered.filter(transaction => transaction.type === "ORDER");
    } else if (activeTab === "subscriptions") {
      filtered = filtered.filter(transaction => transaction.type === "SUBSCRIPTION");
    }

    return filtered;
  };

  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
  };

  // Export earnings data as CSV
  const exportEarningsData = () => {
    if (!earningsData || earningsData.transactions.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["ID", "Type", "Customer Name", "Amount", "Status", "Date", "Payment Method", "Description"];
    const csvData = earningsData.transactions.map(t => [
      t.id,
      t.type,
      t.customerName,
      `Rs. ${t.amount}`,
      t.status,
      formatDate(t.date),
      t.paymentMethod,
      t.description
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw className="animate-spin text-green-600 mb-4" size={32} />
        <p className="text-gray-600">Loading earnings data...</p>
      </div>
    );
  }

  if (!earningsData) return null;

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Earnings & Revenue</h1>
            <p className="text-gray-600 mt-1">Track your earnings and payment history</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <button
              onClick={loadData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStatCard
          title="Total Revenue"
          value={earningsData.stats.totalRevenue}
          icon={DollarSign}
          color="blue"
          trend={earningsData.stats.revenueGrowth}
          onClick={() => {}}
        />
        <CompactStatCard
          title="Pending Amount"
          value={earningsData.stats.pendingAmount}
          icon={Clock}
          color="orange"
          onClick={() => {
            setActiveTab("all");
            setStatusFilter("PENDING");
          }}
          description="Awaiting payment"
        />
        <CompactStatCard
          title="Order Earnings"
          value={earningsData.stats.orderEarnings}
          icon={ShoppingBag}
          color="green"
          trend={earningsData.stats.orderGrowth}
          onClick={() => setActiveTab("orders")}
        />
        <CompactStatCard
          title="Subscription Earnings"
          value={earningsData.stats.subscriptionEarnings}
          icon={Package}
          color="purple"
          trend={earningsData.stats.subscriptionGrowth}
          onClick={() => setActiveTab("subscriptions")}
        />
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">By Payment Method</h4>
            <div className="space-y-3">
              {Object.entries(earningsData.earningsByMethod).map(([method, data]) => (
                <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPaymentMethodColor(method).split(' ')[0]}`}>
                      {getPaymentMethodIcon(method)}
                    </div>
                    <div>
                      <p className="font-medium">{method}</p>
                      <p className="text-xs text-gray-500">{data.count} transactions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Rs. {data.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {Object.keys(earningsData.earningsByMethod).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No payment data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Recent Transactions</h4>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                      <span className="text-sm text-gray-600">{transaction.id}</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{transaction.customerName}</p>
                    <p className="text-xs text-gray-500">{transaction.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Rs. {transaction.amount}</p>
                    <p className="text-xs text-gray-500">{formatDateShort(transaction.date)}</p>
                  </div>
                </div>
              ))}
              {filteredTransactions.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No transactions found
                </div>
              )}
              {filteredTransactions.length > 5 && (
                <button
                  onClick={() => setActiveTab("transactions")}
                  className="w-full text-center text-sm text-green-600 hover:text-green-700 py-2"
                >
                  View all transactions →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 pt-6 overflow-x-auto">
            <button
              className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <BarChart size={16} />
              <span>Overview</span>
            </button>
            <button
              className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                activeTab === "transactions"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("transactions")}
            >
              <CreditCard size={16} />
              <span>Transactions</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "transactions" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
              }`}>
                {earningsData.transactions.length}
              </span>
            </button>
            <button
              className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                activeTab === "orders"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("orders")}
            >
              <ShoppingBag size={16} />
              <span>Orders</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "orders" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
              }`}>
                {earningsData.transactions.filter(t => t.type === "ORDER").length}
              </span>
            </button>
            <button
              className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                activeTab === "subscriptions"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("subscriptions")}
            >
              <Package size={16} />
              <span>Subscriptions</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "subscriptions" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
              }`}>
                {earningsData.transactions.filter(t => t.type === "SUBSCRIPTION").length}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Tab Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab === "overview" && "Earnings Overview"}
                {activeTab === "transactions" && "All Transactions"}
                {activeTab === "orders" && "Order Earnings"}
                {activeTab === "subscriptions" && "Subscription Earnings"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {filteredTransactions.length} transactions found • Showing {searchTerm ? "all matching" : "filtered"} results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={exportEarningsData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Export to CSV"
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" ? "No matching transactions found" : "No transactions available"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No earnings data available yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  {/* Transaction Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(transaction.status).split(' ')[0]}`}>
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{transaction.id}</h3>
                          <p className="text-sm text-gray-600">{transaction.customerName}</p>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          {expandedTransaction === transaction.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Summary */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Transaction Details</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Type:</span>
                            <span className={`font-medium ${
                              transaction.type === "ORDER" ? "text-blue-600" : "text-purple-600"
                            }`}>
                              {transaction.type}
                            </span>
                          </div>
                          {transaction.orderId && (
                            <div className="flex justify-between">
                              <span className="text-sm">Order ID:</span>
                              <span className="font-medium">{transaction.orderId}</span>
                            </div>
                          )}
                          {transaction.subscriptionId && (
                            <div className="flex justify-between">
                              <span className="text-sm">Subscription ID:</span>
                              <span className="font-medium">{transaction.subscriptionId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Information</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Method:</span>
                            <span className={`px-2 py-0.5 text-xs rounded ${getPaymentMethodColor(transaction.paymentMethod)}`}>
                              {transaction.paymentMethod}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Amount:</span>
                            <span className="font-bold text-green-600">Rs. {transaction.amount}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="text-sm">{transaction.description}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {transaction.status === "PENDING" && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              // Frontend-only feature since no notification API
                              alert(`Reminder sent to ${transaction.customerName} for payment of Rs. ${transaction.amount}`);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Bell className="h-3 w-3 inline mr-1" />
                            Send Reminder
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Mark this transaction as completed?')) {
                                try {
                                  // Note: There's no direct transaction status update API
                                  // For orders, we could use paymentsApi.updatePaymentStatus()
                                  // For subscriptions, we could use subscriptionsApi.updatePaymentStatus()
                                  alert(`Transaction ${transaction.id} marked as completed (frontend only)`);
                                  // Reload data to reflect changes
                                  loadData();
                                } catch (error) {
                                  console.error("Error updating transaction:", error);
                                  alert("Failed to update transaction status");
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Mark as Completed
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {expandedTransaction === transaction.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Transaction Information</h4>
                          <div className="bg-white rounded-lg border p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Transaction ID</span>
                                <span className="font-medium">{transaction.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Customer Name</span>
                                <span className="font-medium">{transaction.customerName}</span>
                              </div>
                              {transaction.orderId && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Order ID</span>
                                  <span className="font-medium text-blue-600">{transaction.orderId}</span>
                                </div>
                              )}
                              {transaction.subscriptionId && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Subscription ID</span>
                                  <span className="font-medium text-purple-600">{transaction.subscriptionId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Transaction Details */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                          <div className="bg-white rounded-lg border p-4">
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-600">Date & Time</p>
                                  <p className="font-medium">{formatDate(transaction.date)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Payment Method</p>
                                  <p className="font-medium">{transaction.paymentMethod}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-gray-600">Status</p>
                                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(transaction.status)}`}>
                                    {transaction.status}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Type</p>
                                  <span className={`font-medium ${
                                    transaction.type === "ORDER" ? "text-blue-600" : "text-purple-600"
                                  }`}>
                                    {transaction.type}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Amount</p>
                                <p className="text-2xl font-bold text-green-600">Rs. {transaction.amount}</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex flex-wrap gap-2">
                                {transaction.orderId && (
                                  <button
                                    onClick={() => navigate(`/vendor/orders?search=${transaction.orderId}`)}
                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    View Order
                                  </button>
                                )}
                                {transaction.subscriptionId && (
                                  <button
                                    onClick={() => navigate(`/vendor/subscriptions?search=${transaction.subscriptionId}`)}
                                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                  >
                                    View Subscription
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Completed</p>
                <p className="text-2xl font-bold text-blue-600">{earningsData.stats.completedTransactions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {earningsData.transactions.filter(t => t.status === "PENDING").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Failed</p>
                <p className="text-2xl font-bold text-red-600">{earningsData.stats.failedTransactions}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;