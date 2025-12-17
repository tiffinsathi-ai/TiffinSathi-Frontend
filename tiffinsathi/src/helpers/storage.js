// src/helpers/storage.js
const VENDOR_DATA_KEY = "tiffinsathi_vendor_data_v1";

const defaultData = {
  vendorProfile: {
    ownerName: "Rajesh Sharma",
    businessName: "Mom's Kitchen",
    email: "contact@momskitchen.com",
    phone: "9812345678",
    address: "Lazimpat, Kathmandu, Nepal",
    bank: { 
      bankName: "Nepal Investment Bank", 
      accountNumber: "123456789012", 
      branch: "Lazimpat", 
      holderName: "Rajesh Sharma" 
    },
  },

  tiffins: [
    {
      id: "t1",
      name: "Veg Nepali Thali",
      price: 250,
      plan_type: "7 days",
      category: "veg",
      description: "Traditional Nepali meal with rice, dal, seasonal vegetables, pickle, and papad",
      image: "/src/assets/meal1.jpg",
      capacity: 50,
      preparation_time: 45,
      ingredients: "Rice, Lentils, Seasonal Vegetables, Spices, Pickle, Papad",
      dietary_info: "Vegetarian, No onion garlic option available",
      spice_level: "medium",
      is_available: true,
      createdAt: new Date().toISOString(),
      orders_today: 8,
      total_orders: 156,
      rating: 4.7
    },
    {
      id: "t2",
      name: "Indian Veg Delight",
      price: 300,
      plan_type: "7 days",
      category: "veg",
      description: "North Indian special thali with paneer butter masala, naan, and jeera rice",
      image: "/src/assets/meal2.jpg",
      capacity: 30,
      preparation_time: 60,
      ingredients: "Paneer, Butter, Cream, Naan, Rice, Spices",
      dietary_info: "Vegetarian, Contains dairy",
      spice_level: "medium",
      is_available: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      orders_today: 5,
      total_orders: 89,
      rating: 4.5
    },
    {
      id: "t3",
      name: "Chicken Thakali Set",
      price: 350,
      plan_type: "15 days",
      category: "non-veg",
      description: "Authentic Thakali chicken set with ghee rice, dal, and traditional accompaniments",
      image: "/src/assets/meal1.jpg",
      capacity: 25,
      preparation_time: 50,
      ingredients: "Chicken, Rice, Ghee, Lentils, Thakali Spices",
      dietary_info: "Non-vegetarian",
      spice_level: "hot",
      is_available: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      orders_today: 0,
      total_orders: 42,
      rating: 4.8
    }
  ],

  orders: [
    {
      id: "o1",
      userName: "Rohit Sharma",
      userId: "u1",
      items: [{ name: "Veg Nepali Thali", qty: 1, price: 250 }],
      address: "Office - 3rd Floor, Lazimpat, Kathmandu",
      total: 250,
      status: "pending",
      paymentStatus: "paid",
      deliveryPartnerId: null,
      specialInstructions: "Please pack separately",
      createdAt: new Date().toISOString(),
    },
    {
      id: "o2",
      userName: "Priya K.",
      userId: "u2",
      items: [{ name: "Indian Veg Delight", qty: 2, price: 600 }],
      address: "Baneshwor, Kathmandu - House No. 45",
      total: 600,
      status: "preparing",
      paymentStatus: "paid",
      deliveryPartnerId: "d1",
      specialInstructions: "Less spicy",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "o3",
      userName: "Amit Patel",
      userId: "u3",
      items: [{ name: "Veg Nepali Thali", qty: 1, price: 250 }],
      address: "Thamel, Kathmandu - Hotel Mountain View",
      total: 250,
      status: "out_for_delivery",
      paymentStatus: "paid",
      deliveryPartnerId: "d2",
      specialInstructions: "Extra pickle please",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "o4",
      userName: "Sita Gurung",
      userId: "u4",
      items: [{ name: "Indian Veg Delight", qty: 1, price: 300 }],
      address: "Patan, Lalitpur - Near Patan Durbar Square",
      total: 300,
      status: "delivered",
      paymentStatus: "paid",
      deliveryPartnerId: "d1",
      specialInstructions: "",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ],

  transactions: [
    { id: "tx1", date: new Date().toISOString(), amount: 250, type: "order", orderId: "o1" },
    { id: "tx2", date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), amount: 600, type: "order", orderId: "o2" },
    { id: "tx3", date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), amount: 250, type: "order", orderId: "o3" },
    { id: "tx4", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), amount: 300, type: "order", orderId: "o4" },
    { id: "tx5", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), amount: 1750, type: "subscription", subscriptionId: "s1" }
  ],

  subscriptions: [
    {
      id: "s1",
      userId: "u1",
      userName: "Rohit Sharma",
      mealPlanId: "t1",
      mealPlanName: "Veg Nepali Thali",
      address: "Lazimpat, Kathmandu",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      deliveryTime: 780, // 13:00
      status: "active",
      paymentStatus: "paid",
      totalAmount: 1750,
      createdAt: new Date().toISOString(),
    }
  ],

  customers: [
    { id: "u1", name: "Rohit Sharma", email: "rohit@example.com", phone: "9801111111", joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "u2", name: "Priya K.", email: "priya@example.com", phone: "9802222222", joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "u3", name: "Amit Patel", email: "amit@example.com", phone: "9803333333", joinDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "u4", name: "Sita Gurung", email: "sita@example.com", phone: "9804444444", joinDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
  ],

  deliveryPartners: [
    { id: "d1", name: "Suman Thapa", phone: "9800000001", status: "available", image: "/src/assets/admin-banner.jpg", vehicle: "Bike", rating: 4.8 },
    { id: "d2", name: "Ramesh K.C.", phone: "9800000002", status: "busy", image: "/src/assets/admin-banner.jpg", vehicle: "Bike", rating: 4.6 },
    { id: "d3", name: "Hari Basnet", phone: "9800000003", status: "available", image: "/src/assets/admin-banner.jpg", vehicle: "Scooter", rating: 4.9 }
  ],

  reviews: [
    {
      id: "rv1",
      userId: "u1",
      userName: "Rohit Sharma",
      rating: 5,
      comment: "Great food and on-time delivery! The taste is consistent and packaging is excellent.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      mealPlanId: "t1",
      mealPlanName: "Veg Nepali Thali"
    },
    {
      id: "rv2",
      userName: "Priya K.",
      rating: 4,
      comment: "Tasty food, but sometimes the delivery gets delayed during peak hours.",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      mealPlanId: "t2",
      mealPlanName: "Indian Veg Delight"
    },
    {
      id: "rv3",
      userName: "Amit Patel",
      rating: 5,
      comment: "Best thakali set in town! Authentic taste and good portion size.",
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      mealPlanId: "t3",
      mealPlanName: "Chicken Thakali Set"
    }
  ]
};

export function readData() {
  try {
    const raw = localStorage.getItem(VENDOR_DATA_KEY);
    if (!raw) {
      localStorage.setItem(VENDOR_DATA_KEY, JSON.stringify(defaultData));
      return JSON.parse(JSON.stringify(defaultData));
    }
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed };
  } catch (err) {
    console.error("Failed to read vendor data, restoring default:", err);
    localStorage.setItem(VENDOR_DATA_KEY, JSON.stringify(defaultData));
    return JSON.parse(JSON.stringify(defaultData));
  }
}

export function writeData(data) {
  try {
    const currentData = readData();
    const merged = { ...currentData, ...data };
    localStorage.setItem(VENDOR_DATA_KEY, JSON.stringify(merged));
    return true;
  } catch (err) {
    console.error("Failed to write vendor data:", err);
    return false;
  }
}