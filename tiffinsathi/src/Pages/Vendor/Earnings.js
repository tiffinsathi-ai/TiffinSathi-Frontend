// src/Pages/Vendor/Earnings.js
import React, { useState, useEffect, useCallback } from 'react';
import { vendorApi } from '../../helpers/api';
import { 
  DollarSign, 
  Download,
  Filter,
  TrendingUp,
  Users,
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Wallet,
  FileText,
  XCircle as XCircleIcon,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Smartphone,
  QrCode,
  Banknote,
  CreditCard as CardIcon,
  Smartphone as MobileIcon
} from "lucide-react";
import {
  BarChart, Bar, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';

const Earnings = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [usingFallback, setUsingFallback] = useState(false);
  const [chartType, setChartType] = useState('line');
  const [expandedStats, setExpandedStats] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Stats state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    completedPayments: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    activeCustomers: 0,
    lastPeriodRevenue: 0,
    growthRate: 0
  });

  // Chart data state
  const [chartData, setChartData] = useState([]);
  const [earningsByPaymentMethod, setEarningsByPaymentMethod] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);

  // Payment method colors and icons
  const paymentMethodConfig = {
    ESEWA: { 
      color: '#4F46E5', 
      bgColor: '#EEF2FF', 
      textColor: '#4F46E5',
      icon: Smartphone,
      name: 'e-Sewa'
    },
    KHALTI: { 
      color: '#7C3AED', 
      bgColor: '#F5F3FF', 
      textColor: '#7C3AED',
      icon: MobileIcon,
      name: 'Khalti'
    },
    COD: { 
      color: '#059669', 
      bgColor: '#ECFDF5', 
      textColor: '#059669',
      icon: Banknote,
      name: 'Cash on Delivery'
    },
    CARD: { 
      color: '#DC2626', 
      bgColor: '#FEF2F2', 
      textColor: '#DC2626',
      icon: CardIcon,
      name: 'Credit/Debit Card'
    },
    IME: { 
      color: '#EA580C', 
      bgColor: '#FFF7ED', 
      textColor: '#EA580C',
      icon: QrCode,
      name: 'IME Pay'
    },
    BANK_TRANSFER: { 
      color: '#0EA5E9', 
      bgColor: '#F0F9FF', 
      textColor: '#0EA5E9',
      icon: CreditCard,
      name: 'Bank Transfer'
    },
    DEFAULT: { 
      color: '#6B7280', 
      bgColor: '#F9FAFB', 
      textColor: '#6B7280',
      icon: DollarSign,
      name: 'Other'
    }
  };

  // Simulated payment methods for fallback data
  const getPaymentMethod = (paymentId) => {
    const methods = ['ESEWA', 'KHALTI', 'COD', 'CARD', 'IME', 'BANK_TRANSFER'];
    // Deterministic but "random" based on paymentId
    const hash = paymentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return methods[hash % methods.length];
  };

  // Load earnings data with fallback - UPDATED VERSION
  const loadEarningsData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try to get data from API first
      let response = await vendorApi.getVendorPayments();
      
      // If API returns error (like 500), use fallback data
      if (!response.ok || !response.data) {
        setUsingFallback(true);
        console.log("Using fallback data due to API error:", response.error);
        
        // Create fallback data directly in component
        const fallbackData = {
          orders: [
            { orderId: "1001", totalAmount: 1500, paymentStatus: "COMPLETED", createdAt: "2024-07-15T10:30:00Z", customer: { userName: "Rajesh Sharma", email: "rajesh@example.com" }, status: "DELIVERED", category: "Meal", paymentMethod: "ESEWA" },
            { orderId: "1002", totalAmount: 2500, paymentStatus: "COMPLETED", createdAt: "2024-07-14T14:45:00Z", customer: { userName: "Priya Patel", email: "priya@example.com" }, status: "DELIVERED", category: "Meal", paymentMethod: "KHALTI" },
            { orderId: "1003", totalAmount: 1800, paymentStatus: "PENDING", createdAt: "2024-07-13T12:15:00Z", customer: { userName: "Amit Kumar", email: "amit@example.com" }, status: "PREPARING", category: "Meal", paymentMethod: "COD" },
            { orderId: "1004", totalAmount: 3200, paymentStatus: "COMPLETED", createdAt: "2024-07-12T09:20:00Z", customer: { userName: "Sunita Devi", email: "sunita@example.com" }, status: "DELIVERED", category: "Meal", paymentMethod: "CARD" },
            { orderId: "1005", totalAmount: 2100, paymentStatus: "COMPLETED", createdAt: "2024-07-11T18:30:00Z", customer: { userName: "Rahul Verma", email: "rahul@example.com" }, status: "DELIVERED", category: "Meal", paymentMethod: "IME" },
            { orderId: "1006", totalAmount: 2900, paymentStatus: "COMPLETED", createdAt: "2024-07-10T16:10:00Z", customer: { userName: "Meera Singh", email: "meera@example.com" }, status: "DELIVERED", category: "Meal", paymentMethod: "BANK_TRANSFER" },
            { orderId: "1007", totalAmount: 1750, paymentStatus: "COMPLETED", createdAt: "2024-07-09T11:30:00Z", customer: { userName: "Arjun Shrestha", email: "arjun@example.com" }, status: "DELIVERED", category: "Meal", paymentMethod: "ESEWA" },
            { orderId: "1008", totalAmount: 2200, paymentStatus: "COMPLETED", createdAt: "2024-07-08T13:45:00Z", customer: { userName: "Bina Magar", email: "bina@example.com" }, status: "DELIVERED", category: "Meal", paymentMethod: "KHALTI" }
          ],
          subscriptions: [
            { subscriptionId: "2001", packagePrice: 5000, totalAmount: 5000, payment: { paymentStatus: "COMPLETED", transactionId: "TXN-SUB-001" }, startDate: "2024-07-01T00:00:00Z", customer: { userName: "Suresh Joshi", email: "suresh@example.com" }, status: "ACTIVE", paymentMethod: "ESEWA" },
            { subscriptionId: "2002", packagePrice: 4500, totalAmount: 4500, payment: { paymentStatus: "COMPLETED", transactionId: "TXN-SUB-002" }, startDate: "2024-07-05T00:00:00Z", customer: { userName: "Anjali Gupta", email: "anjali@example.com" }, status: "ACTIVE", paymentMethod: "KHALTI" },
            { subscriptionId: "2003", packagePrice: 6000, totalAmount: 6000, payment: { paymentStatus: "PENDING", transactionId: "TXN-SUB-003" }, startDate: "2024-07-10T00:00:00Z", customer: { userName: "Vikram Reddy", email: "vikram@example.com" }, status: "PENDING", paymentMethod: "CARD" }
          ]
        };
        
        // Transform orders to payment format
        let paymentsData = [];
        
        // Transform orders
        fallbackData.orders.forEach(order => {
          if (order.totalAmount) {
            const paymentMethod = order.paymentMethod || getPaymentMethod(`ORD-${order.orderId}`);
            paymentsData.push({
              paymentId: `ORD-${order.orderId}`,
              amount: order.totalAmount,
              type: 'ORDER',
              status: order.paymentStatus || (order.status === 'DELIVERED' ? 'COMPLETED' : 'PENDING'),
              date: order.createdAt || order.orderDate || new Date().toISOString(),
              customerName: order.customer?.userName || order.customerName || 'Customer',
              customerEmail: order.customer?.email || order.customerEmail || '',
              transactionId: order.transactionId || `TXN-ORD-${order.orderId}`,
              description: `Order #${order.orderId}`,
              category: order.category || 'Meal',
              paymentMethod: paymentMethod,
              paymentMethodName: paymentMethodConfig[paymentMethod]?.name || paymentMethod
            });
          }
        });
        
        // Transform subscriptions
        fallbackData.subscriptions.forEach(subscription => {
          if (subscription.totalAmount || subscription.packagePrice) {
            const amount = subscription.totalAmount || subscription.packagePrice;
            const paymentMethod = subscription.paymentMethod || getPaymentMethod(`SUB-${subscription.subscriptionId}`);
            paymentsData.push({
              paymentId: `SUB-${subscription.subscriptionId}`,
              amount: amount,
              type: 'SUBSCRIPTION',
              status: subscription.payment?.paymentStatus || subscription.status || 'COMPLETED',
              date: subscription.startDate || subscription.createdAt || new Date().toISOString(),
              customerName: subscription.customer?.userName || subscription.customerName || 'Customer',
              customerEmail: subscription.customer?.email || subscription.customerEmail || '',
              transactionId: subscription.payment?.transactionId || `TXN-SUB-${subscription.subscriptionId}`,
              description: `Subscription #${subscription.subscriptionId}`,
              category: 'Subscription',
              paymentMethod: paymentMethod,
              paymentMethodName: paymentMethodConfig[paymentMethod]?.name || paymentMethod
            });
          }
        });
        
        setPayments(paymentsData);
        calculateStats(paymentsData);
        calculateChartData(paymentsData);
        calculateMonthlyData(paymentsData);
        calculateHourlyData(paymentsData);
        
      } else if (response.ok && response.data) {
        // If API call was successful
        let paymentsData = [];
        
        if (response.data.orders) {
          // Using orders data structure
          const { orders = [], subscriptions = [] } = response.data;
          
          // Transform orders to payment format
          orders.forEach(order => {
            if (order.totalAmount) {
              const paymentMethod = order.paymentMethod || getPaymentMethod(`ORD-${order.orderId}`);
              paymentsData.push({
                paymentId: `ORD-${order.orderId}`,
                amount: order.totalAmount,
                type: 'ORDER',
                status: order.paymentStatus || (order.status === 'DELIVERED' ? 'COMPLETED' : 'PENDING'),
                date: order.createdAt || order.orderDate || new Date().toISOString(),
                customerName: order.customer?.userName || order.customerName || 'Customer',
                customerEmail: order.customer?.email || order.customerEmail || '',
                transactionId: order.transactionId || `TXN-ORD-${order.orderId}`,
                description: `Order #${order.orderId}`,
                category: order.category || 'Meal',
                paymentMethod: paymentMethod,
                paymentMethodName: paymentMethodConfig[paymentMethod]?.name || paymentMethod
              });
            }
          });
          
          // Transform subscriptions to payment format
          subscriptions.forEach(subscription => {
            if (subscription.totalAmount || subscription.packagePrice) {
              const amount = subscription.totalAmount || subscription.packagePrice;
              const paymentMethod = subscription.paymentMethod || getPaymentMethod(`SUB-${subscription.subscriptionId}`);
              paymentsData.push({
                paymentId: `SUB-${subscription.subscriptionId}`,
                amount: amount,
                type: 'SUBSCRIPTION',
                status: subscription.payment?.paymentStatus || subscription.status || 'COMPLETED',
                date: subscription.startDate || subscription.createdAt || new Date().toISOString(),
                customerName: subscription.customer?.userName || subscription.customerName || 'Customer',
                customerEmail: subscription.customer?.email || subscription.customerEmail || '',
                transactionId: subscription.payment?.transactionId || `TXN-SUB-${subscription.subscriptionId}`,
                description: `Subscription #${subscription.subscriptionId}`,
                category: 'Subscription',
                paymentMethod: paymentMethod,
                paymentMethodName: paymentMethodConfig[paymentMethod]?.name || paymentMethod
              });
            }
          });
        } else {
          // Using direct payments data - transform to include payment method
          paymentsData = Array.isArray(response.data) ? response.data.map(payment => ({
            ...payment,
            paymentMethod: payment.paymentMethod || getPaymentMethod(payment.paymentId || payment.transactionId),
            paymentMethodName: paymentMethodConfig[payment.paymentMethod || getPaymentMethod(payment.paymentId || payment.transactionId)]?.name || 
                             (payment.paymentMethod || getPaymentMethod(payment.paymentId || payment.transactionId))
          })) : [];
        }
        
        setPayments(paymentsData);
        calculateStats(paymentsData);
        calculateChartData(paymentsData);
        calculateMonthlyData(paymentsData);
        calculateHourlyData(paymentsData);
        
      } else {
        // If API returns non-ok status but no data
        setError('No earnings data available');
      }
    } catch (err) {
      console.error('Error loading earnings data:', err);
      setError('Error loading earnings data. Using fallback data instead.');
      setUsingFallback(true);
      
      // Create minimal fallback data on error
      const fallbackPayments = [
        {
          paymentId: 'ORD-001',
          amount: 1500,
          type: 'ORDER',
          status: 'COMPLETED',
          date: new Date().toISOString(),
          customerName: 'Sample Customer',
          paymentMethod: 'ESEWA',
          paymentMethodName: 'e-Sewa'
        }
      ];
      setPayments(fallbackPayments);
      calculateStats(fallbackPayments);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Calculate statistics
  const calculateStats = (paymentsData) => {
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

    const filteredPayments = paymentsData.filter(payment =>
      new Date(payment.date) >= startDate
    );

    // Calculate earnings by payment method
    const earningsByMethodData = {};
    
    filteredPayments.forEach(payment => {
      if (payment.status === 'COMPLETED') {
        const method = payment.paymentMethod || 'DEFAULT';
        earningsByMethodData[method] = {
          amount: (earningsByMethodData[method]?.amount || 0) + (payment.amount || 0),
          count: (earningsByMethodData[method]?.count || 0) + 1,
          name: payment.paymentMethodName || paymentMethodConfig[method]?.name || method
        };
      }
    });
    setEarningsByPaymentMethod(earningsByMethodData);

    // Calculate main stats
    const totalRevenue = filteredPayments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const pendingAmount = filteredPayments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const completedPayments = filteredPayments.filter(p => p.status === 'COMPLETED').length;
    const totalOrders = filteredPayments.filter(p => p.type === 'ORDER' && p.status === 'COMPLETED').length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Count unique customers
    const uniqueCustomers = new Set(
      filteredPayments
        .filter(p => p.status === 'COMPLETED')
        .map(p => p.customerEmail || p.customerName)
        .filter(Boolean)
    ).size;

    // Calculate growth (simulated)
    const lastPeriodRevenue = totalRevenue * 0.85;
    const growthRate = ((totalRevenue - lastPeriodRevenue) / lastPeriodRevenue) * 100;

    setStats({
      totalRevenue,
      pendingAmount,
      completedPayments,
      totalOrders,
      avgOrderValue,
      activeCustomers: uniqueCustomers,
      lastPeriodRevenue,
      growthRate
    });
  };

  // Calculate chart data
  const calculateChartData = (paymentsData) => {
    const now = new Date();
    let days;
    
    switch (timeRange) {
      case "7days":
        days = 7;
        break;
      case "30days":
        days = 30;
        break;
      case "90days":
        days = 90;
        break;
      default:
        days = 30;
    }

    const earningsByDay = {};
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      earningsByDay[dateKey] = { date: dateKey, earnings: 0, orders: 0 };
    }

    paymentsData.forEach(payment => {
      if (payment.status === 'COMPLETED') {
        const dateKey = new Date(payment.date).toISOString().split('T')[0];
        if (earningsByDay.hasOwnProperty(dateKey)) {
          earningsByDay[dateKey].earnings += (payment.amount || 0);
          earningsByDay[dateKey].orders += 1;
        }
      }
    });

    const chartData = Object.values(earningsByDay);

    // Add moving average for trend line
    const windowSize = Math.min(5, Math.floor(days / 7));
    if (windowSize > 1) {
      for (let i = 0; i < chartData.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
          sum += chartData[j].earnings;
          count++;
        }
        chartData[i].movingAvg = sum / count;
      }
    }

    setChartData(chartData);
  };

  // Calculate monthly data
  const calculateMonthlyData = (paymentsData) => {
    const monthly = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    paymentsData.forEach(payment => {
      if (payment.status === 'COMPLETED') {
        const date = new Date(payment.date);
        const monthKey = date.getMonth();
        if (!monthly[monthKey]) {
          monthly[monthKey] = { month: months[monthKey], earnings: 0, orders: 0 };
        }
        monthly[monthKey].earnings += payment.amount || 0;
        monthly[monthKey].orders += 1;
      }
    });

    const monthlyData = Object.values(monthly);
    setMonthlyData(monthlyData);
  };

  // Calculate hourly data
  const calculateHourlyData = (paymentsData) => {
    const hourly = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      earnings: 0,
      orders: 0
    }));

    paymentsData.forEach(payment => {
      if (payment.status === 'COMPLETED') {
        const date = new Date(payment.date);
        const hour = date.getHours();
        hourly[hour].earnings += payment.amount || 0;
        hourly[hour].orders += 1;
      }
    });

    setHourlyData(hourly);
  };

  useEffect(() => {
    loadEarningsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Filter payments based on search and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentMethodName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'ALL' || 
      payment.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodIcon = (method) => {
    const Icon = paymentMethodConfig[method]?.icon || DollarSign;
    return <Icon className="h-4 w-4" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-NP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportEarnings = () => {
    const headers = [
      'Payment ID',
      'Date',
      'Type',
      'Payment Method',
      'Customer',
      'Amount',
      'Status',
      'Transaction ID',
      'Description'
    ].join(',');

    const csvData = filteredPayments.map(payment => [
      payment.paymentId,
      formatDate(payment.date),
      payment.type,
      payment.paymentMethodName || payment.paymentMethod,
      payment.customerName,
      payment.amount,
      payment.status,
      payment.transactionId,
      payment.description || ''
    ].join(',')).join('\n');

    const csv = `${headers}\n${csvData}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getChartComponent = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `Rs ${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'earnings') return [`Rs ${value.toLocaleString()}`, 'Earnings'];
                if (name === 'movingAvg') return [`Rs ${value.toLocaleString()}`, 'Trend'];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              }}
            />
            <Bar 
              dataKey="earnings" 
              name="Daily Earnings"
              fill="#4f46e5" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              onMouseEnter={(data, index) => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `Rs ${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Earnings']}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              }}
            />
            <Area 
              type="monotone" 
              dataKey="earnings" 
              name="Earnings"
              stroke="#4f46e5" 
              fill="url(#colorEarnings)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        );
      
      default: // line chart
        return (
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `Rs ${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'earnings') return [`Rs ${value.toLocaleString()}`, 'Earnings'];
                if (name === 'movingAvg') return [`Rs ${value.toLocaleString()}`, 'Trend'];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              }}
            />
            <Line 
              type="monotone" 
              dataKey="movingAvg" 
              name="Trend"
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
            <Line 
              type="monotone" 
              dataKey="earnings" 
              name="Daily Earnings"
              stroke="#4f46e5" 
              strokeWidth={3}
              dot={{ stroke: '#4f46e5', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#4f46e5' }}
            />
          </ComposedChart>
        );
    }
  };

  const renderPaymentMethodPieChart = () => {
    const pieData = Object.entries(earningsByPaymentMethod).map(([method, data]) => ({
      name: data.name,
      value: data.amount,
      count: data.count,
      color: paymentMethodConfig[method]?.color || paymentMethodConfig.DEFAULT.color
    }));

    const COLORS = pieData.map(d => d.color);

    return (
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => `${entry.name}: Rs ${entry.value.toLocaleString()}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name, props) => {
            if (name === 'value') return [`Rs ${value.toLocaleString()}`, 'Earnings'];
            if (name === 'count') return [value, 'Transactions'];
            return [value, name];
          }}
          labelFormatter={(label) => label}
        />
        <Legend />
      </PieChart>
    );
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "analytics", label: "Analytics", icon: PieChartIcon },
    { id: "transactions", label: "Transactions", icon: FileText },
    { id: "payouts", label: "Payouts", icon: Wallet }
  ];

  const filterOptions = [
    { value: 'ALL', label: 'All Payments' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' }
  ];

  const chartTypes = [
    { id: 'line', label: 'Line Chart', icon: LineChartIcon },
    { id: 'bar', label: 'Bar Chart', icon: BarChartIcon },
    { id: 'area', label: 'Area Chart', icon: AreaChart }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Earnings & Revenue</h2>
          <p className="text-gray-600">Track your earnings and payment history</p>
          {usingFallback && (
            <div className="mt-2 flex items-center gap-2 text-sm text-yellow-600">
              <AlertCircle className="h-4 w-4" />
              <span>Using sample data - API is temporarily unavailable</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={loadEarningsData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-2 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="bg-white p-4 rounded-xl border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              <button
                onClick={() => setExpandedStats(!expandedStats)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {expandedStats ? 'Show Less' : 'Show More'}
                {expandedStats ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                    <div className={`flex items-center text-sm mt-1 ${stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.growthRate >= 0 ? 
                        <TrendingUp size={14} className="mr-1" /> : 
                        <TrendingDown size={14} className="mr-1" />
                      }
                      <span>{Math.abs(stats.growthRate).toFixed(1)}% from last period</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pending Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.pendingAmount)}
                    </p>
                    <div className="text-sm text-gray-500 mt-1">
                      {stats.completedPayments} completed payments
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.avgOrderValue)}
                    </p>
                    <div className="flex items-center text-sm text-green-600 mt-1">
                      <TrendingUp size={14} className="mr-1" />
                      <span>+5.2% from last period</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Customers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.activeCustomers}
                    </p>
                    <div className="text-sm text-green-600 mt-1">
                      +15 new customers
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {expandedStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                  <div className="text-sm text-green-600 mt-1">
                    +8% from last period
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
                  <p className="text-xl font-bold text-gray-900">
                    {payments.length > 0 
                      ? Math.round((stats.completedPayments / payments.length) * 100) 
                      : 0}%
                  </p>
                  <div className="text-sm text-gray-500 mt-1">
                    Successful payments
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Daily Average</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue / (timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90))}
                  </p>
                  <div className="text-sm text-gray-500 mt-1">
                    Per day revenue
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Earnings Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Earnings Trend</h3>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  {timeRange === "7days" ? "Last 7 Days" : 
                   timeRange === "30days" ? "Last 30 Days" : 
                   timeRange === "90days" ? "Last 90 Days" : "This Year"}
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {chartTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setChartType(type.id)}
                        className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors ${
                          chartType === type.id
                            ? 'bg-white shadow text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Icon size={14} />
                        <span className="hidden sm:inline">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {getChartComponent()}
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <BarChart3 size={48} className="mb-4 opacity-50" />
                  <p>No earnings data available for the selected period</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-4">Earnings by Payment Method</h4>
              <div className="h-64">
                {Object.entries(earningsByPaymentMethod).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {renderPaymentMethodPieChart()}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No earnings data by payment method
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-3">
                {Object.entries(earningsByPaymentMethod)
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .slice(0, 4)
                  .map(([method, data]) => {
                    const config = paymentMethodConfig[method] || paymentMethodConfig.DEFAULT;
                    const Icon = config.icon;
                    const percentage = stats.totalRevenue > 0 ? (data.amount / stats.totalRevenue * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={method} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: config.bgColor }}>
                            <Icon className="h-4 w-4" style={{ color: config.color }} />
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: config.textColor }}>
                              {data.name}
                            </p>
                            <p className="text-xs text-gray-500">{data.count} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(data.amount)}</p>
                          <p className="text-sm text-gray-500">{percentage}% of total</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-4">Recent Transactions</h4>
              <div className="space-y-3">
                {filteredPayments.slice(0, 5).map(payment => {
                  const methodConfig = paymentMethodConfig[payment.paymentMethod] || paymentMethodConfig.DEFAULT;
                  const Icon = methodConfig.icon;
                  
                  return (
                    <div 
                      key={payment.paymentId} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowPaymentModal(true);
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{payment.customerName}</p>
                          <Eye size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Icon size={10} className={methodConfig.textColor} />
                            <span className={methodConfig.textColor}>
                              {payment.paymentMethodName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {formatDate(payment.date)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${payment.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {formatCurrency(payment.amount)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {filteredPayments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No recent transactions
                  </div>
                )}
                {filteredPayments.length > 5 && (
                  <button 
                    onClick={() => setActiveTab('transactions')}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-2"
                  >
                    View all transactions →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Method Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-4">Payment Method Performance</h4>
              <div className="space-y-4">
                {Object.entries(earningsByPaymentMethod)
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .map(([method, data]) => {
                    const config = paymentMethodConfig[method] || paymentMethodConfig.DEFAULT;
                    const Icon = config.icon;
                    const percentage = stats.totalRevenue > 0 ? (data.amount / stats.totalRevenue * 100).toFixed(1) : 0;
                    const avgTransaction = data.count > 0 ? data.amount / data.count : 0;
                    
                    return (
                      <div key={method} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: config.bgColor }}>
                              <Icon className="h-5 w-5" style={{ color: config.color }} />
                            </div>
                            <div>
                              <p className="font-bold" style={{ color: config.textColor }}>
                                {data.name}
                              </p>
                              <p className="text-xs text-gray-500">{data.count} transactions</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(data.amount)}</p>
                            <p className="text-sm text-gray-500">{percentage}% of total</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Avg. transaction:</span>
                          <span className="font-medium">{formatCurrency(avgTransaction)}</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Performance</span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: config.color
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {Object.entries(earningsByPaymentMethod).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No payment method data available
                  </div>
                )}
              </div>
            </div>

            {/* Hourly Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-bold text-gray-900 mb-4">Hourly Earnings Pattern</h4>
              <div className="h-64">
                {hourlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="hour" />
                      <YAxis tickFormatter={(value) => `Rs ${value.toLocaleString()}`} />
                      <Tooltip formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Earnings']} />
                      <Area 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="#f59e0b" 
                        fill="#fef3c7"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No hourly data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="font-bold text-gray-900 mb-6">Payment Method Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Object.keys(earningsByPaymentMethod).length}
                </div>
                <p className="text-sm text-gray-600">Payment Methods Used</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(() => {
                    const method = Object.entries(earningsByPaymentMethod)
                      .sort(([, a], [, b]) => b.amount - a.amount)[0];
                    return method ? paymentMethodConfig[method[0]]?.name || method[0] : 'N/A';
                  })()}
                </div>
                <p className="text-sm text-gray-600">Most Popular Method</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {payments.length > 0 
                    ? Math.round((stats.completedPayments / payments.length) * 100) 
                    : 0}%
                </div>
                <p className="text-sm text-gray-600">Payment Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="text-sm text-gray-600 flex items-center">
                <Filter size={16} className="mr-2" />
                <span>{filteredPayments.length} transactions found</span>
              </div>
              <button
                onClick={handleExportEarnings}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading transactions...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="bg-white border rounded-lg p-12 text-center shadow-sm">
              <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'ALL' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No transaction data available'
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => {
                      const methodConfig = paymentMethodConfig[payment.paymentMethod] || paymentMethodConfig.DEFAULT;
                      const Icon = methodConfig.icon;
                      
                      return (
                        <tr 
                          key={payment.paymentId} 
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.paymentId}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.transactionId}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.customerEmail}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.type === 'ORDER' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {payment.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded" style={{ backgroundColor: methodConfig.bgColor }}>
                                <Icon className="h-4 w-4" style={{ color: methodConfig.color }} />
                              </div>
                              <span className="text-sm font-medium" style={{ color: methodConfig.textColor }}>
                                {payment.paymentMethodName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {getStatusIcon(payment.status)}
                              <span>{payment.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payment.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowPaymentModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredPayments.length > 10 && (
                <div className="px-6 py-4 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    Showing {Math.min(10, filteredPayments.length)} of {filteredPayments.length} transactions
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "payouts" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Wallet size={64} className="mx-auto text-blue-500 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Payouts Management</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Track and manage your earnings payouts. Your completed payments are automatically added to your payout balance.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-blue-900 mb-2">Available Balance</h4>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-sm text-blue-700">
                  Total earnings ready for payout
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <h4 className="font-bold text-green-900 mb-2">Next Payout Date</h4>
                <p className="text-2xl font-bold text-green-600 mb-2">
                  {(() => {
                    const nextFriday = new Date();
                    const dayOfWeek = nextFriday.getDay();
                    const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 6 + (5 - dayOfWeek);
                    nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);
                    return nextFriday.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                  })()}
                </p>
                <p className="text-sm text-green-700">
                  Payouts are processed every Friday
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h4 className="font-bold text-gray-900 mb-4">Payout History</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium">Payout #PAY-001</p>
                    <p className="text-sm text-gray-500">Last Friday, 10:30 AM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Rs 15,750.00</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium">Payout #PAY-002</p>
                    <p className="text-sm text-gray-500">2 weeks ago</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Rs 12,450.00</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center pt-4">
                  More payout history will appear here as you continue to earn
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> To receive payouts, please ensure your bank account details are updated in your vendor profile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-medium">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment ID</p>
                  <p className="font-medium">{selectedPayment.paymentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{selectedPayment.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{formatDate(selectedPayment.date)}</p>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ 
                    backgroundColor: paymentMethodConfig[selectedPayment.paymentMethod]?.bgColor || paymentMethodConfig.DEFAULT.bgColor 
                  }}>
                    {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium" style={{ 
                      color: paymentMethodConfig[selectedPayment.paymentMethod]?.textColor || paymentMethodConfig.DEFAULT.textColor 
                    }}>
                      {selectedPayment.paymentMethodName || selectedPayment.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Amount and Status */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
                      {getStatusIcon(selectedPayment.status)}
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Customer Info */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{selectedPayment.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{selectedPayment.customerEmail}</p>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              {selectedPayment.description && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-700">{selectedPayment.description}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleExportEarnings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Export This
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;