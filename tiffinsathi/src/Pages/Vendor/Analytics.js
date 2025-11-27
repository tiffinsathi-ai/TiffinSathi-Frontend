// src/Pages/Vendor/Analytics.js
import React, { useState, useEffect } from "react";
import { readData } from "../../helpers/storage";
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  Calendar,
  Download,
  Filter
} from "lucide-react";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    setLoading(true);
    const data = readData();
    
    // Calculate analytics based on time range
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
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const filteredOrders = data.orders.filter(order => 
      new Date(order.createdAt) >= startDate
    );

    const filteredTransactions = data.transactions.filter(transaction =>
      new Date(transaction.date) >= startDate
    );

    // Calculate metrics
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const completedOrders = filteredOrders.filter(order => 
      order.status === "delivered"
    ).length;
    
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Customer metrics
    const uniqueCustomers = [...new Set(filteredOrders.map(order => order.userId))].length;
    const newCustomers = data.customers.filter(customer => 
      new Date(customer.joinDate) >= startDate
    ).length;

    // Popular items
    const itemCounts = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.qty || 1);
      });
    });

    const popularItems = Object.entries(itemCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Revenue by day (last 7 days for chart)
    const revenueByDay = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      revenueByDay[dateKey] = 0;
    }

    filteredTransactions.forEach(transaction => {
      const dateKey = transaction.date.split('T')[0];
      if (revenueByDay.hasOwnProperty(dateKey)) {
        revenueByDay[dateKey] += transaction.amount;
      }
    });

    const chartData = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue
    }));

    setAnalyticsData({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      completionRate,
      uniqueCustomers,
      newCustomers,
      popularItems,
      chartData,
      filteredOrders
    });
    setLoading(false);
  };

  const StatCard = ({ icon, label, value, change, changeType }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );

  const getMaxRevenue = () => {
    return Math.max(...analyticsData.chartData.map(d => d.revenue), 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Analytics</h2>
          <p className="text-gray-600">Track your business performance and growth</p>
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
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<DollarSign size={24} />}
          label="Total Revenue"
          value={`Rs ${analyticsData.totalRevenue?.toLocaleString() || '0'}`}
          change="+12.5% from previous period"
          changeType="positive"
        />
        <StatCard
          icon={<Package size={24} />}
          label="Total Orders"
          value={analyticsData.totalOrders || '0'}
          change="+8% from previous period"
          changeType="positive"
        />
        <StatCard
          icon={<Users size={24} />}
          label="Unique Customers"
          value={analyticsData.uniqueCustomers || '0'}
          change={`${analyticsData.newCustomers || 0} new customers`}
          changeType="positive"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          label="Completion Rate"
          value={`${analyticsData.completionRate?.toFixed(1) || '0'}%`}
          change="+2.3% from previous period"
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="text-sm text-gray-600">
              {timeRange === "7days" ? "Last 7 Days" : 
               timeRange === "30days" ? "Last 30 Days" : "Last 90 Days"}
            </div>
          </div>
          <div className="h-64">
            {analyticsData.chartData && analyticsData.chartData.length > 0 ? (
              <div className="flex items-end justify-between h-48 space-x-2">
                {analyticsData.chartData.map((day, index) => {
                  const height = (day.revenue / getMaxRevenue()) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`Rs ${day.revenue}`}
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-xs font-medium mt-1">
                        Rs {day.revenue}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                No revenue data available for the selected period
              </div>
            )}
          </div>
        </div>

        {/* Popular Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Items</h3>
          <div className="space-y-4">
            {analyticsData.popularItems && analyticsData.popularItems.length > 0 ? (
              analyticsData.popularItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.count} orders</p>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(item.count / Math.max(...analyticsData.popularItems.map(i => i.count))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No order data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="font-medium text-gray-900 mb-4">Order Status Distribution</h4>
          <div className="space-y-3">
            {analyticsData.filteredOrders && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">
                    {analyticsData.filteredOrders.filter(o => o.status === 'delivered').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium">
                    {analyticsData.filteredOrders.filter(o => 
                      ['preparing', 'out_for_delivery'].includes(o.status)
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium">
                    {analyticsData.filteredOrders.filter(o => o.status === 'pending').length}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="font-medium text-gray-900 mb-4">Average Order Value</h4>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            Rs {analyticsData.avgOrderValue?.toFixed(2) || '0.00'}
          </div>
          <p className="text-green-600 text-sm">+5.2% from previous period</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="font-medium text-gray-900 mb-4">Customer Growth</h4>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            +{analyticsData.newCustomers || 0}
          </div>
          <p className="text-green-600 text-sm">new customers this period</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;