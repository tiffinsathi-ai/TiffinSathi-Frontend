import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { readData } from "../../helpers/storage";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    setLoading(true);
    setError("");
    try {
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

      const filteredOrders = (data.orders || []).filter(order => 
        new Date(order.createdAt) >= startDate
      );

      const filteredTransactions = (data.transactions || []).filter(transaction =>
        new Date(transaction.date) >= startDate
      );

      // Calculate metrics
      const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalOrders = filteredOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const completedOrders = filteredOrders.filter(order => 
        order.status === "delivered" || order.status === "completed"
      ).length;
      
      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      // Customer metrics
      const uniqueCustomers = [...new Set(filteredOrders.map(order => order.userId))].length;
      const newCustomers = (data.customers || []).filter(customer => 
        new Date(customer.joinDate || customer.createdAt) >= startDate
      ).length;

      // Popular items
      const itemCounts = {};
      filteredOrders.forEach(order => {
        order.items?.forEach(item => {
          const itemName = item.name || "Unknown Item";
          itemCounts[itemName] = (itemCounts[itemName] || 0) + (item.qty || item.quantity || 1);
        });
      });

      const popularItems = Object.entries(itemCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      // Revenue by day (last 7 days for chart)
      const revenueByDay = {};
      const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        revenueByDay[dateKey] = 0;
      }

      filteredTransactions.forEach(transaction => {
        const dateKey = transaction.date?.split('T')[0];
        if (dateKey && revenueByDay.hasOwnProperty(dateKey)) {
          revenueByDay[dateKey] += transaction.amount || 0;
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
        filteredOrders,
        startDate: new Date(startDate).toLocaleDateString(),
        endDate: new Date().toLocaleDateString()
      });
    } catch (err) {
      setError("Failed to load analytics data: " + err.message);
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced StatCard component
  const StatCard = ({ title, value, icon: Icon, color, change }) => {
    const colors = {
      blue: "text-blue-600 bg-blue-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
      orange: "text-orange-600 bg-orange-50",
      emerald: "text-emerald-600 bg-emerald-50"
    };

    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          {change && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {change}
            </span>
          )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    );
  };

  const getMaxRevenue = () => {
    if (!analyticsData.chartData || analyticsData.chartData.length === 0) return 1;
    return Math.max(...analyticsData.chartData.map(d => d.revenue), 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
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
          <button 
            onClick={loadAnalyticsData}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`Rs ${analyticsData.totalRevenue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          color="green"
          change="+12.5% from previous"
        />
        <StatCard
          title="Total Orders"
          value={analyticsData.totalOrders || '0'}
          icon={Package}
          color="blue"
          change="+8% from previous"
        />
        <StatCard
          title="Unique Customers"
          value={analyticsData.uniqueCustomers || '0'}
          icon={Users}
          color="purple"
          change={`${analyticsData.newCustomers || 0} new`}
        />
        <StatCard
          title="Completion Rate"
          value={`${analyticsData.completionRate?.toFixed(1) || '0'}%`}
          icon={TrendingUp}
          color="emerald"
          change="+2.3% from previous"
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
                        width: `${(item.count / Math.max(...analyticsData.popularItems.map(i => i.count), 1)) * 100}%` 
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
                    {analyticsData.filteredOrders.filter(o => 
                      o.status === 'delivered' || o.status === 'completed'
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium">
                    {analyticsData.filteredOrders.filter(o => 
                      ['preparing', 'out_for_delivery', 'assigned'].includes(o.status)
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium">
                    {analyticsData.filteredOrders.filter(o => 
                      o.status === 'pending' || o.status === 'confirmed'
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancelled</span>
                  <span className="font-medium">
                    {analyticsData.filteredOrders.filter(o => o.status === 'cancelled').length}
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
          <p className="text-sm text-gray-500 mt-1">
            Period: {analyticsData.startDate} to {analyticsData.endDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;