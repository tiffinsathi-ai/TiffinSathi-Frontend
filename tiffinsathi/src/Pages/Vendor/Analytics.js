// src/Pages/Vendor/Analytics.js 
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { vendorApi } from "../../helpers/api";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Package, 
  DollarSign,
  RefreshCw,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color, onClick, trendValue, loading }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-green-600 bg-green-50 border-green-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    red: "text-red-600 bg-red-50 border-red-100"
  };

  const borderColors = {
    blue: "hover:border-blue-300",
    green: "hover:border-green-300",
    purple: "hover:border-purple-300",
    orange: "hover:border-orange-300",
    emerald: "hover:border-emerald-300",
    red: "hover:border-red-300"
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl border border-gray-200 ${borderColors[color]} transition-all duration-200 hover:shadow-lg cursor-pointer ${onClick ? 'hover:scale-[1.02]' : 'cursor-default'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trendValue !== undefined && trendValue !== null && !loading && (
          <div className={`flex items-center text-sm font-medium ${trendValue > 0 ? 'text-green-600' : trendValue < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trendValue > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : trendValue < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : null}
            {trendValue !== 0 && <span>{Math.abs(trendValue)}%</span>}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        ) : value}
      </h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
};

const Analytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState({});
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);

  // Load analytics data from API
  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      setError("");
      
      // Get analytics data from API
      const response = await vendorApi.getVendorAnalytics(timeRange);
      if (response.ok && response.data) {
        const data = response.data;
        
        // Calculate additional metrics
        const avgOrderValue = data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0;
        const completionRate = data.totalOrders > 0 ? (data.completedOrders / data.totalOrders) * 100 : 0;
        
        // Calculate growth percentages
        const revenueGrowth = data.previousPeriodRevenue > 0 
          ? ((data.totalRevenue - data.previousPeriodRevenue) / data.previousPeriodRevenue) * 100 
          : 0;
        
        const orderGrowth = data.previousPeriodOrders > 0 
          ? ((data.totalOrders - data.previousPeriodOrders) / data.previousPeriodOrders) * 100 
          : 0;
        
        const customerGrowth = data.previousPeriodCustomers > 0 
          ? ((data.uniqueCustomers - data.previousPeriodCustomers) / data.previousPeriodCustomers) * 100 
          : 0;
        
        // Process chart data
        const chartData = data.revenueByDay || data.dailyRevenue || [];
        
        // Process popular items
        const popularItems = data.popularItems || [];
        
        // Order status distribution
        const orderStatusDistribution = {
          completed: data.completedOrders || 0,
          inProgress: data.inProgressOrders || 0,
          pending: data.pendingOrders || 0,
          cancelled: data.cancelledOrders || 0
        };
        
        setAnalyticsData({
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          avgOrderValue,
          completionRate,
          uniqueCustomers: data.uniqueCustomers || 0,
          newCustomers: data.newCustomers || 0,
          revenueGrowth: Math.round(revenueGrowth),
          orderGrowth: Math.round(orderGrowth),
          customerGrowth: Math.round(customerGrowth),
          popularItems,
          chartData,
          orderStatusDistribution,
          startDate: data.startDate || new Date().toLocaleDateString(),
          endDate: data.endDate || new Date().toLocaleDateString()
        });
      }
    } catch (err) {
      setError("Failed to load analytics data. Please try again.");
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // Navigation functions for stat cards
  const navigateToOrders = () => {
    navigate('/vendor/orders');
  };

  const navigateToCustomers = () => {
    navigate('/vendor/customers');
  };

  const navigateToEarnings = () => {
    navigate('/vendor/earnings');
  };

  const navigateToRevenueDetails = () => {
    navigate('/vendor/earnings');
  };

  // Get max revenue for chart scaling
  const getMaxRevenue = () => {
    if (!analyticsData.chartData || analyticsData.chartData.length === 0) return 1;
    return Math.max(...analyticsData.chartData.map(d => d.revenue || d.value || 0), 1);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
            <p className="text-gray-600 mt-2">Track your business performance and growth metrics</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
            <button 
              onClick={loadAnalyticsData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Key Metrics - ALL WITH REAL DATA AND NAVIGATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${(analyticsData.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trendValue={analyticsData.revenueGrowth}
          onClick={navigateToRevenueDetails}
          loading={statsLoading}
        />
        <StatCard
          title="Total Orders"
          value={(analyticsData.totalOrders || 0).toLocaleString()}
          icon={Package}
          color="blue"
          trendValue={analyticsData.orderGrowth}
          onClick={navigateToOrders}
          loading={statsLoading}
        />
        <StatCard
          title="Unique Customers"
          value={(analyticsData.uniqueCustomers || 0).toLocaleString()}
          icon={Users}
          color="purple"
          trendValue={analyticsData.customerGrowth}
          onClick={navigateToCustomers}
          loading={statsLoading}
        />
        <StatCard
          title="Completion Rate"
          value={`${(analyticsData.completionRate || 0).toFixed(1)}%`}
          icon={TrendingUp}
          color="emerald"
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="text-sm text-gray-600">
              {timeRange === "7days" ? "Last 7 Days" : 
               timeRange === "30days" ? "Last 30 Days" : 
               timeRange === "90days" ? "Last 90 Days" :
               timeRange === "thisMonth" ? "This Month" : "Last Month"}
            </div>
          </div>
          <div className="h-64">
            {analyticsData.chartData && analyticsData.chartData.length > 0 ? (
              <div className="flex items-end justify-between h-48 space-x-2">
                {analyticsData.chartData.map((day, index) => {
                  const height = ((day.revenue || day.value || 0) / getMaxRevenue()) * 100;
                  const dateLabel = day.date ? formatDate(day.date) : `Day ${index + 1}`;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-green-500 rounded-t-lg transition-all duration-300 hover:bg-green-600 cursor-pointer"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`₹${(day.revenue || day.value || 0).toLocaleString()}`}
                        onClick={() => navigateToRevenueDetails()}
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        {dateLabel}
                      </div>
                      <div className="text-xs font-medium mt-1">
                        ₹{(day.revenue || day.value || 0).toLocaleString()}
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Items</h3>
          <div className="space-y-4">
            {analyticsData.popularItems && analyticsData.popularItems.length > 0 ? (
              analyticsData.popularItems.map((item, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => navigate('/vendor/tiffins')}
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.count || item.quantity || 0} orders</p>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${((item.count || item.quantity || 0) / Math.max(...analyticsData.popularItems.map(i => i.count || i.quantity || 0), 1)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No order data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-600" />
            Order Status Distribution
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-gray-600">Completed</span>
              </div>
              <span className="font-medium">
                {analyticsData.orderStatusDistribution?.completed || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="text-gray-600">In Progress</span>
              </div>
              <span className="font-medium">
                {analyticsData.orderStatusDistribution?.inProgress || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-gray-600">Pending</span>
              </div>
              <span className="font-medium">
                {analyticsData.orderStatusDistribution?.pending || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-gray-600">Cancelled</span>
              </div>
              <span className="font-medium">
                {analyticsData.orderStatusDistribution?.cancelled || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Average Order Value
          </h4>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            ₹{(analyticsData.avgOrderValue || 0).toFixed(2)}
          </div>
          <p className="text-sm text-gray-600 mb-4">Revenue per order</p>
          <button
            onClick={navigateToOrders}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            View order details →
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            Customer Growth
          </h4>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            +{(analyticsData.newCustomers || 0).toLocaleString()}
          </div>
          <p className="text-green-600 text-sm">
            {analyticsData.customerGrowth > 0 ? `↑ ${Math.abs(analyticsData.customerGrowth)}% growth` : 
             analyticsData.customerGrowth < 0 ? `↓ ${Math.abs(analyticsData.customerGrowth)}% decline` : 'No change'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Period: {analyticsData.startDate} to {analyticsData.endDate}
          </p>
          <button
            onClick={navigateToCustomers}
            className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            View customer details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;