import React, { useEffect, useState } from "react";
import { 
  Package, 
  Users, 
  Clock, 
  Truck, 
  BarChart3, 
  RefreshCw,
  ShoppingBag,
  UserCheck,
  TrendingUp,
  DollarSign,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data - temporary until backend is fixed
  const mockData = {
    ordersToday: 8,
    activeSubscriptions: 12,
    totalCustomers: 45,
    pendingOrders: 3,
    todayRevenue: 2850,
    recentOrders: [
      { id: "ORD-001", userName: "John Doe", status: "pending", deliveryTime: "12:30 PM", amount: 450 },
      { id: "ORD-002", userName: "Jane Smith", status: "preparing", deliveryTime: "1:00 PM", amount: 320 },
      { id: "ORD-003", userName: "Robert Johnson", status: "out_for_delivery", deliveryTime: "11:45 AM", amount: 580 },
      { id: "ORD-004", userName: "Sarah Williams", status: "delivered", deliveryTime: "10:30 AM", amount: 620 },
    ],
    recentCustomers: [
      { id: "CUST-001", name: "Alice Johnson", phone: "123-456-7890", totalSpent: 500, totalSubscriptions: 1 },
      { id: "CUST-002", name: "Bob Williams", phone: "987-654-3210", totalSpent: 750, totalSubscriptions: 2 },
      { id: "CUST-003", name: "Charlie Brown", phone: "456-789-0123", totalSpent: 1200, totalSubscriptions: 1 },
    ],
    todaysPerformance: [
      { label: "New Orders", value: 8, change: "+12%", color: "blue" },
      { label: "Revenue", value: "₹2,850", change: "+8%", color: "green" },
      { label: "Avg Order", value: "₹356", change: "+5%", color: "purple" },
      { label: "Success Rate", value: "94%", change: "+2%", color: "orange" },
    ]
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, []);

  // Enhanced StatCard
  const StatCard = ({ title, value, icon: Icon, color, change, onClick }) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600",
      emerald: "from-emerald-500 to-emerald-600"
    };

    return (
      <div 
        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[color] || colors.blue} text-white`}>
            <Icon className="h-6 w-6" />
          </div>
          {change && (
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {change}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Click to view details →</span>
        </div>
      </div>
    );
  };

  // ActionButton component
  const ActionButton = ({ icon: Icon, label, onClick, color = "blue" }) => {
    const colors = {
      blue: "bg-blue-600 hover:bg-blue-700",
      green: "bg-green-600 hover:bg-green-700",
      purple: "bg-purple-600 hover:bg-purple-700",
      orange: "bg-orange-600 hover:bg-orange-700"
    };

    return (
      <button
        onClick={onClick}
        className={`flex items-center justify-center gap-2 text-white px-4 py-3 rounded-lg font-medium transition-all ${colors[color] || colors.blue} focus:outline-none focus:ring-2 focus:ring-offset-2 w-full`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      out_for_delivery: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-emerald-100 text-emerald-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <RefreshCw className="animate-spin text-green-600 mr-2" size={24} />
        <span className="text-gray-600 mt-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Welcome back!</h1>
            <p className="opacity-90 text-sm">Here's what's happening with your business today</p>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <p className="opacity-90 text-sm">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Orders"
          value={mockData.ordersToday}
          icon={ShoppingBag}
          color="blue"
          change="+12%"
          onClick={() => navigate("/vendor/orders")}
        />
        <StatCard
          title="Active Subscriptions"
          value={mockData.activeSubscriptions}
          icon={Calendar}
          color="green"
          change="+5"
          onClick={() => navigate("/vendor/subscriptions")}
        />
        <StatCard
          title="Total Customers"
          value={mockData.totalCustomers}
          icon={UserCheck}
          color="purple"
          change="+3"
          onClick={() => navigate("/vendor/customers")}
        />
        <StatCard
          title="Pending Orders"
          value={mockData.pendingOrders}
          icon={Clock}
          color="orange"
          change="Needs attention"
          onClick={() => navigate("/vendor/orders")}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ActionButton
            icon={Package}
            label="View Orders"
            onClick={() => navigate("/vendor/orders")}
            color="blue"
          />
          <ActionButton
            icon={Users}
            label="Manage Customers"
            onClick={() => navigate("/vendor/customers")}
            color="green"
          />
          <ActionButton
            icon={Truck}
            label="Delivery Partners"
            onClick={() => navigate("/vendor/delivery-partners")}
            color="purple"
          />
          <ActionButton
            icon={BarChart3}
            label="View Reports"
            onClick={() => navigate("/vendor/analytics")}
            color="orange"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button 
              onClick={() => navigate("/vendor/orders")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {mockData.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.userName} • {order.deliveryTime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <p className="text-xs font-medium text-gray-900 mt-1">
                    ₹{order.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Customers</h3>
            <button 
              onClick={() => navigate("/vendor/customers")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {mockData.recentCustomers.map(customer => (
              <div key={customer.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {customer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customer.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ₹{customer.totalSpent}
                  </p>
                  <p className="text-xs text-gray-500">
                    {customer.totalSubscriptions} sub(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Today's Performance</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {mockData.todaysPerformance.map((item, index) => (
            <div key={index} className="text-center p-3 sm:p-4 rounded-lg border border-gray-100">
              <p className="text-lg sm:text-xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-600">{item.label}</p>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp size={12} className="text-green-500 mr-1" />
                <span className="text-xs text-green-600">{item.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;