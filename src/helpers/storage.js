// ✅ src/helpers/storage.js
const VENDOR_DATA_KEY = 'tiffinsathi_vendor_data_v1';

// Default dataset with realistic sample data
const defaultData = {
  vendorProfile: {
    ownerName: "Mom's Kitchen",
    businessName: "Mom's Kitchen",
    email: "contact@momskitchen.com",
    phone: "9812345678",
    address: "Kathmandu, Nepal",
    bank: {
      bankName: '',
      accountNumber: '',
      branch: '',
      holderName: ''
    }
  },

  // Meal plans / Tiffins
  tiffins: [
    {
      id: 't1',
      name: 'Veg Nepali Thali',
      price: 250,
      plan_type: '7 days',
      description: 'Rice, Dal, Aloo, Spinach Fry, Tomato Achar',
      image: '/src/assets/meal1.jpg',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 't2',
      name: 'Indian Veg Delight',
      price: 300,
      plan_type: '7 days',
      description: 'Paneer Butter Masala, Jeera Rice, Salad',
      image: '/src/assets/meal2.jpg',
      active: true,
      createdAt: new Date().toISOString()
    }
  ],

  schedules: [],

  orders: [
    {
      id: 'o1',
      userName: 'Rohit Sharma',
      userId: 'u1',
      items: [{ tiffinId: 't1', name: 'Veg Nepali Thali', qty: 1, price: 250 }],
      address: 'Office - 3rd Floor, Lazimpat, Kathmandu',
      total: 250,
      status: 'pending',
      paymentStatus: 'paid',
      deliveryPartnerId: null,
      createdAt: new Date().toISOString()
    },
    {
      id: 'o2',
      userName: 'Priya K.',
      userId: 'u2',
      items: [{ tiffinId: 't2', name: 'Indian Veg Delight', qty: 2, price: 600 }],
      address: 'Baneshwor, Kathmandu',
      total: 600,
      status: 'preparing',
      paymentStatus: 'paid',
      deliveryPartnerId: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    }
  ],

  transactions: [
    { id: 't_tx1', date: new Date().toISOString(), amount: 250, type: 'subscription' }
  ],

  deliveryPartners: [
    { id: 'd1', name: 'Suman', phone: '9800000001', status: 'available', image: '/src/assets/admin-banner.jpg' },
    { id: 'd2', name: 'Ramesh', phone: '9800000002', status: 'busy', image: '/src/assets/admin-banner.jpg' }
  ],

  customers: [
    { id: 'u1', name: 'Rohit Sharma', email: 'rohit@example.com', phone: '9801111111' },
    { id: 'u2', name: 'Priya K.', email: 'priya@example.com', phone: '9802222222' }
  ],

  reviews: [
    {
      id: 'rv1',
      userId: 'u1',
      userName: 'Rohit Sharma',
      vendorId: 'v1',
      rating: 5,
      comment: 'Great food, on time delivery!',
      createdAt: new Date().toISOString(),
      tiffinId: 't1'
    },
    {
      id: 'rv2',
      userId: 'u2',
      userName: 'Priya K.',
      vendorId: 'v1',
      rating: 4,
      comment: 'Tasty, but needs more veg.',
      createdAt: new Date().toISOString(),
      tiffinId: 't2'
    }
  ]
};

/**
 * Read vendor data safely from localStorage.
 * Always ensures a full valid dataset (never undefined arrays or objects).
 */
function readData() {
  try {
    const raw = localStorage.getItem(VENDOR_DATA_KEY);

    if (!raw) {
      // initialize localStorage with defaultData if empty
      localStorage.setItem(VENDOR_DATA_KEY, JSON.stringify(defaultData));
      return JSON.parse(JSON.stringify(defaultData));
    }

    const parsed = JSON.parse(raw);

    // Merge missing keys for forward compatibility
    return { ...defaultData, ...parsed };
  } catch (err) {
    console.error("⚠️ Failed to read vendor data, restoring default:", err);
    localStorage.setItem(VENDOR_DATA_KEY, JSON.stringify(defaultData));
    return JSON.parse(JSON.stringify(defaultData));
  }
}

/**
 * Write vendor data safely to localStorage.
 * Automatically merges with defaults to avoid structural breaks.
 */
function writeData(data) {
  try {
    const merged = { ...defaultData, ...data };
    localStorage.setItem(VENDOR_DATA_KEY, JSON.stringify(merged));
  } catch (err) {
    console.error("⚠️ Failed to write vendor data:", err);
  }
}

export { readData, writeData };