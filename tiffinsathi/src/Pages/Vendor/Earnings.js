// src/Pages/Vendor/Earnings.js
import React, { useState, useEffect } from "react";
import { readData } from "../../helpers/storage";
import { 
  DollarSign, 
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  Package,
  CreditCard,
  RefreshCw
} from "lucide-react";

const Earnings = () => {
  const [earningsData, setEarningsData] = useState({});
  const [timeRange, setTimeRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEarningsData();
  }, [timeRange]);

  const loadEarningsData = () => {
    setLoading(true);
    const data = readData();
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case "7days":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "30days":
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case "90days":
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    const filteredTransactions = data.transactions.filter(transaction =>
      new Date(transaction.date) >= startDate
    );

    const filteredOrders = data.orders.filter(order =>
      new Date(order.createdAt) >= startDate
    );

    // Calculate earnings by type
    const earningsByType = {};
    filteredTransactions.forEach(transaction => {
      earningsByType[transaction.type] = (earningsByType[transaction.type] || 0) + transaction.amount;
    });

    // Calculate daily earnings for chart
    const earningsByDay = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      earningsByDay[dateKey] = 0;
    }

    filteredTransactions.forEach(transaction => {
      const dateKey = transaction.date.split('T')[0];
      if (earningsByDay.hasOwnProperty(dateKey)) {
        earningsByDay[dateKey] += transaction.amount;
      }
    });

    const chartData = Object.entries(earningsByDay).map(([date, earnings]) => ({
      date,
      earnings
    }));

    // Total calculations
    const totalEarnings = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalEarnings / totalOrders : 0;

    setEarningsData({
      totalEarnings,
      totalOrders,
      avgOrderValue,
      earningsByType,
      chartData,
      transactions: filteredTransactions,
      orders: filteredOrders
    });
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-600 mr-2" size={24} />
        <span className="text-gray-600">Loading earnings data...</span>
      </div>
    );
  }

  const StatCard = ({ icon, label, value, change }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change}</p>
          )}
        </div>
        <div className="p-3 rounded-full bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );

  const getMaxEarnings = () => {
    return Math.max(...earningsData.chartData?.map(d => d.earnings) || [1]);
  };

  const formatCurrency = (amount) => {
    return `Rs ${amount?.toLocaleString() || '0'}`;
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "transactions", label: "Transactions" },
    { id: "payouts", label: "Payouts" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Earnings & Payments</h2>
          <p className="text-gray-600">Track your revenue and payment history</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <button 
            onClick={loadEarningsData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<DollarSign size={24} />}
                  label="Total Earnings"
                  value={formatCurrency(earningsData.totalEarnings)}
                  change="+12.5% from last period"
                />
                <StatCard
                  icon={<Package size={24} />}
                  label="Total Orders"
                  value={earningsData.totalOrders || '0'}
                  change="+8% from last period"
                />
                <StatCard
                  icon={<TrendingUp size={24} />}
                  label="Avg Order Value"
                  value={formatCurrency(earningsData.avgOrderValue)}
                  change="+5.2% from last period"
                />
                <StatCard
                  icon={<Users size={24} />}
                  label="Active Customers"
                  value={earningsData.orders ? [...new Set(earningsData.orders.map(order => order.userId))].length : '0'}
                  change="+15 new customers"
                />
              </div>

              {/* Earnings Chart */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Earnings Trend</h3>
                  <div className="text-sm text-gray-600">
                    {timeRange === "7days" ? "Last 7 Days" : 
                     timeRange === "30days" ? "Last 30 Days" : "Last 90 Days"}
                  </div>
                </div>
                <div className="h-64">
                  {earningsData.chartData && earningsData.chartData.length > 0 ? (
                    <div className="flex items-end justify-between h-48 space-x-1">
                      {earningsData.chartData.map((day, index) => {
                        const height = (day.earnings / getMaxEarnings()) * 100;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-green-500 rounded-t-lg transition-all duration-300 hover:bg-green-600"
                              style={{ height: `${Math.max(height, 5)}%` }}
                              title={`Rs ${day.earnings}`}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-xs font-medium mt-1">
                              Rs {day.earnings}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                      No earnings data available for the selected period
                    </div>
                  )}
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Earnings by Type</h4>
                  <div className="space-y-3">
                    {earningsData.earningsByType && Object.entries(earningsData.earningsByType).map(([type, amount]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize">{type}</span>
                        <span className="font-bold">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Recent Transactions</h4>
                  <div className="space-y-3">
                    {earningsData.transactions && earningsData.transactions.slice(0, 5).map(transaction => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm capitalize">{transaction.type}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-green-600">+{formatCurrency(transaction.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                <div className="text-sm text-gray-600">
                  {earningsData.transactions?.length || 0} transactions found
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {earningsData.transactions && earningsData.transactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {transaction.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {transaction.orderId ? `Order #${transaction.orderId}` : 'Subscription Payment'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                          +{formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {(!earningsData.transactions || earningsData.transactions.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No transactions found for the selected period</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "payouts" && (
            <div className="text-center py-12">
              <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payouts Management</h3>
              <p className="text-gray-600 mb-4">
                Payout management features will be available soon. You'll be able to track and manage your earnings payouts here.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-700">
                  <strong>Next Payout:</strong> Rs {(earningsData.totalEarnings || 0).toLocaleString()} available
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Payouts are processed every Friday
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;