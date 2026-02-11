// src/helpers/api.js - COMPLETE FIXED VERSION
const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ============================
// AUTH STORAGE
// ============================
export const authStorage = {
  saveAuth: (data) => {
    if (!data) return;
    const token =
      data.token || data.accessToken || data.jwt || data.authToken || null;
    if (token) localStorage.setItem("token", token);
    if (data.role)
      localStorage.setItem("role", (data.role || "").toLowerCase());
    if (data.email) localStorage.setItem("email", data.email);
    if (data.name) localStorage.setItem("name", data.name);
    if (data.businessName)
      localStorage.setItem("businessName", data.businessName);
    if (data.vendorId) localStorage.setItem("vendorId", data.vendorId);
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("businessName");
    localStorage.removeItem("vendorId");
  },

  getToken: () => localStorage.getItem("token"),
  getRole: () => localStorage.getItem("role"),
  getUser: () => ({
    email: localStorage.getItem("email"),
    name: localStorage.getItem("name"),
    businessName: localStorage.getItem("businessName"),
    vendorId: localStorage.getItem("vendorId"),
  }),
};

// ============================
// VENDOR SPECIFIC API
// ============================
export const vendorApi = {
  // -----------------------
  // DELIVERY PARTNERS - COMPLETE
  // -----------------------
  getDeliveryPartners: async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/delivery-partners/vendor/my-partners`,
        {
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
        },
      );
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getDeliveryPartners error", e);
      return { ok: false, error: e };
    }
  },

  createDeliveryPartner: async (partnerData) => {
    try {
      const res = await fetch(`${BASE_URL}/delivery-partners`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(partnerData),
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("createDeliveryPartner error", e);
      return { ok: false, error: e };
    }
  },

  updateDeliveryPartner: async (partnerId, partnerData) => {
    try {
      const res = await fetch(
        `${BASE_URL}/delivery-partners/vendor/${partnerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(partnerData),
        },
      );
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("updateDeliveryPartner error", e);
      return { ok: false, error: e };
    }
  },

  deleteDeliveryPartner: async (partnerId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/delivery-partners/vendor/${partnerId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
        },
      );
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("deleteDeliveryPartner error", e);
      return { ok: false, error: e };
    }
  },

  updateDeliveryPartnerStatus: async (partnerId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/delivery-partners/vendor/${partnerId}/toggle-availability`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
        },
      );
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("updateDeliveryPartnerStatus error", e);
      return { ok: false, error: e };
    }
  },

  resetDeliveryPartnerPassword: async (partnerId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/delivery-partners/vendor/${partnerId}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
        },
      );
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("resetDeliveryPartnerPassword error", e);
      return { ok: false, error: e };
    }
  },

  getDeliveryStats: async () => {
    try {
      const res = await fetch(`${BASE_URL}/delivery-partners/vendor/stats`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getDeliveryStats error", e);
      return { ok: false, error: e };
    }
  },

  // -----------------------
  // ORDERS
  // -----------------------
  getVendorOrders: async (date) => {
    try {
      const url = `${BASE_URL}/orders/vendor${date ? `?date=${date}` : ""}`;
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getVendorOrders error", e);
      return { ok: false, error: e };
    }
  },

  getOrdersByDateRange: async (startDate, endDate) => {
    try {
      const url = `${BASE_URL}/orders/vendor/date-range?startDate=${startDate}&endDate=${endDate}`;
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getOrdersByDateRange error", e);
      return { ok: false, error: e };
    }
  },

  getUpcomingOrders: async () => {
    try {
      const res = await fetch(`${BASE_URL}/orders/vendor/upcoming`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getUpcomingOrders error", e);
      return { ok: false, error: e };
    }
  },

  updateOrderStatus: async (orderId, status, deliveryPersonId = null) => {
    try {
      let url = `${BASE_URL}/orders/${orderId}/status?status=${status}`;
      if (deliveryPersonId) {
        url += `&deliveryPersonId=${deliveryPersonId}`;
      }

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("updateOrderStatus error", e);
      return { ok: false, error: e };
    }
  },

  getTodayStats: async () => {
    try {
      const res = await fetch(`${BASE_URL}/orders/today`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getTodayStats error", e);
      return { ok: false, error: e };
    }
  },

  // -----------------------
  // CUSTOMERS
  // -----------------------
  getVendorCustomers: async (search = "") => {
    try {
      let url = `${BASE_URL}/vendors/customers`;
      if (search) {
        url = `${BASE_URL}/vendors/customers/search?search=${encodeURIComponent(search)}`;
      }

      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getVendorCustomers error", e);
      return { ok: false, error: e };
    }
  },

  getCustomerDetails: async (customerId) => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/customers/${customerId}`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getCustomerDetails error", e);
      return { ok: false, error: e };
    }
  },

  // -----------------------
  // SUBSCRIPTIONS
  // -----------------------
  getVendorSubscriptions: async (filter = "ALL") => {
    try {
      let url = `${BASE_URL}/subscriptions/vendor/all`;
      if (filter !== "ALL") {
        url = `${BASE_URL}/subscriptions/vendor/status/${filter.toLowerCase()}`;
      }

      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getVendorSubscriptions error", e);
      return { ok: false, error: e };
    }
  },

  getSubscriptionDetails: async (subscriptionId) => {
    try {
      const res = await fetch(`${BASE_URL}/subscriptions/${subscriptionId}`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getSubscriptionDetails error", e);
      return { ok: false, error: e };
    }
  },

  updateSubscriptionStatus: async (subscriptionId, status, reason = "") => {
    try {
      const body = { status };
      if (reason) body.reason = reason;

      const res = await fetch(
        `${BASE_URL}/subscriptions/${subscriptionId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(body),
        },
      );
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("updateSubscriptionStatus error", e);
      return { ok: false, error: e };
    }
  },

  pauseSubscription: async (subscriptionId, pauseReason = "") => {
    try {
      const body = { status: "PAUSED" };
      if (pauseReason) body.reason = pauseReason;

      const res = await fetch(
        `${BASE_URL}/subscriptions/${subscriptionId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(body),
        },
      );
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("pauseSubscription error", e);
      return { ok: false, error: e };
    }
  },

  resumeSubscription: async (subscriptionId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/subscriptions/${subscriptionId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify({ status: "ACTIVE" }),
        },
      );
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("resumeSubscription error", e);
      return { ok: false, error: e };
    }
  },

  cancelSubscription: async (subscriptionId, cancelReason = "") => {
    try {
      const body = { status: "CANCELLED" };
      if (cancelReason) body.reason = cancelReason;

      const res = await fetch(
        `${BASE_URL}/subscriptions/${subscriptionId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(body),
        },
      );
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("cancelSubscription error", e);
      return { ok: false, error: e };
    }
  },

  // -----------------------
  // DASHBOARD STATS
  // -----------------------
  getDashboardStats: async () => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/dashboard-stats`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getDashboardStats error", e);
      return { ok: false, error: e };
    }
  },

  // -----------------------
  // VENDOR PAYMENTS & EARNINGS
  // -----------------------
  getVendorPayments: async () => {
    try {
      const res = await fetch(`${BASE_URL}/payments/vendor`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      const data = await safeJson(res);
      return { ok: res.ok, data: data, status: res.status };
    } catch (e) {
      console.error("getVendorPayments error", e);
      return { ok: false, error: e };
    }
  },

  getVendorEarnings: async (timeRange = "30days") => {
    try {
      const res = await fetch(
        `${BASE_URL}/vendors/earnings?period=${timeRange}`,
        {
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
        },
      );
      const data = await safeJson(res);

      if (res.ok && data) {
        return { ok: true, data: data.payments || data, status: res.status };
      }

      return await vendorApi.getVendorEarningsFallback(timeRange);
    } catch (e) {
      console.error("getVendorEarnings error", e);
      return await vendorApi.getVendorEarningsFallback(timeRange);
    }
  },

  getVendorEarningsFallback: async (timeRange = "30days") => {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case "7days":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const ordersRes = await vendorApi.getOrdersByDateRange(
        startDateStr,
        endDateStr,
      );
      const subsRes = await vendorApi.getVendorSubscriptions("ALL");

      const orders = ordersRes.ok ? ordersRes.data || [] : [];
      const subscriptions = subsRes.ok ? subsRes.data || [] : [];

      const payments = [];

      orders.forEach((order) => {
        if (
          order.totalAmount &&
          (order.paymentStatus ||
            order.status === "DELIVERED" ||
            order.status === "COMPLETED")
        ) {
          payments.push({
            paymentId: `ORD-${order.orderId}`,
            amount: order.totalAmount,
            type: "ORDER",
            status:
              order.paymentStatus ||
              (order.status === "DELIVERED" ? "COMPLETED" : "PENDING"),
            date:
              order.createdAt || order.orderDate || new Date().toISOString(),
            customerName:
              order.customer?.userName || order.customerName || "Customer",
            customerEmail: order.customer?.email || order.customerEmail || "",
            transactionId:
              order.transactionId ||
              order.payment?.transactionId ||
              `TXN-ORD-${order.orderId}`,
            description: `Order #${order.orderId}`,
            category: order.category || "Meal",
            paymentMethod:
              order.payment?.paymentMethod ||
              (order.status === "DELIVERED" ? "COD" : "CARD"),
          });
        }
      });

      subscriptions.forEach((subscription) => {
        if (subscription.totalAmount || subscription.packagePrice) {
          const amount = subscription.totalAmount || subscription.packagePrice;
          payments.push({
            paymentId: `SUB-${subscription.subscriptionId}`,
            amount: amount,
            type: "SUBSCRIPTION",
            status:
              subscription.payment?.paymentStatus ||
              subscription.status ||
              "COMPLETED",
            date:
              subscription.startDate ||
              subscription.createdAt ||
              new Date().toISOString(),
            customerName:
              subscription.customer?.userName ||
              subscription.customerName ||
              "Customer",
            customerEmail:
              subscription.customer?.email || subscription.customerEmail || "",
            transactionId:
              subscription.payment?.transactionId ||
              `TXN-SUB-${subscription.subscriptionId}`,
            description: `Subscription #${subscription.subscriptionId}`,
            category: "Subscription",
            paymentMethod: subscription.payment?.paymentMethod || "CARD",
          });
        }
      });

      return {
        ok: true,
        data: payments,
        usingFallback: true,
      };
    } catch (e) {
      console.error("getVendorEarningsFallback error", e);
      return { ok: false, error: e, data: [] };
    }
  },

  // -----------------------
  // VENDOR PROFILE
  // -----------------------
  getVendorProfile: async () => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/profile`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getVendorProfile error", e);
      return { ok: false, error: e };
    }
  },

  updateVendorProfile: async (profileData) => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(profileData),
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("updateVendorProfile error", e);
      return { ok: false, error: e };
    }
  },
};

// ============================
// MAIN API (Keep existing for compatibility)
// ============================
export const api = {
  // -----------------------
  // AUTH
  // -----------------------
  login: async (email, password) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await safeJson(res);

      if (res.ok && data) {
        authStorage.saveAuth(data);
      }

      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      console.error("login error", e);
      return { ok: false, error: e };
    }
  },

  registerUser: async (payload) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return { ok: res.ok, status: res.status, data: await safeJson(res) };
    } catch (e) {
      console.error("registerUser error", e);
      return { ok: false, error: e };
    }
  },

  registerVendor: async (payload) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register/vendor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return { ok: res.ok, status: res.status, data: await safeJson(res) };
    } catch (e) {
      console.error("registerVendor error", e);
      return { ok: false, error: e };
    }
  },

  // -----------------------
  // ADMIN STATS
  // -----------------------
  getAdminStats: async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/stats`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      const data = await safeJson(res);
      if (!data) {
        return {
          usersCount: 0,
          vendorsCount: 0,
          pendingVendorsCount: 0,
          ordersCount: 0,
          orders: [],
        };
      }
      return {
        usersCount: data.usersCount ?? data.users ?? 0,
        vendorsCount: data.vendorsCount ?? data.vendors ?? 0,
        pendingVendorsCount: data.pendingVendorsCount ?? data.pending ?? 0,
        ordersCount: data.ordersCount ?? data.orders ?? 0,
        orders: data.ordersList || data.orders || [],
      };
    } catch (e) {
      console.error("getAdminStats error", e);
      return {
        usersCount: 0,
        vendorsCount: 0,
        pendingVendorsCount: 0,
        ordersCount: 0,
        orders: [],
      };
    }
  },

  // -----------------------
  // VENDORS MANAGEMENT
  // -----------------------
  getVendors: async () => {
    try {
      const res = await fetch(`${BASE_URL}/vendors`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return await safeJson(res);
    } catch (e) {
      console.error("getVendors error", e);
      return [];
    }
  },

  getPendingVendors: async () => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/status/pending`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return await safeJson(res);
    } catch (e) {
      console.error("getPendingVendors error", e);
      return [];
    }
  },

  getVendorById: async (vendorId) => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return await safeJson(res);
    } catch (e) {
      console.error("getVendorById error", e);
      return null;
    }
  },

  approveVendor: async (vendorId) => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/${vendorId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          status: "approved",
          reason: "Approved by admin",
        }),
      });
      const data = await safeJson(res);
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      console.error("approveVendor error", e);
      return { ok: false, error: e };
    }
  },

  rejectVendor: async (vendorId, reason = "Not approved") => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/${vendorId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ status: "rejected", reason }),
      });
      const data = await safeJson(res);
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      console.error("rejectVendor error", e);
      return { ok: false, error: e };
    }
  },

  updateVendor: async (vendorId, payload) => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const data = await safeJson(res);
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      console.error("updateVendor error", e);
      return { ok: false, error: e };
    }
  },

  changeVendorPassword: async (vendorId, newPassword) => {
    try {
      const res = await fetch(
        `${BASE_URL}/vendors/${vendorId}/change-password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify({ newPassword }),
        },
      );
      const data = await safeJson(res);
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      console.error("changeVendorPassword error", e);
      return { ok: false, error: e };
    }
  },

  deleteVendor: async (vendorId) => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
      });
      return res.ok;
    } catch (e) {
      console.error("deleteVendor error", e);
      return false;
    }
  },

  // -----------------------
  // DELIVERY PARTNERS (for compatibility with existing code)
  // -----------------------
  createDeliveryPartner: vendorApi.createDeliveryPartner,
  updateDeliveryPartner: vendorApi.updateDeliveryPartner,
  deleteDeliveryPartner: vendorApi.deleteDeliveryPartner,
  updateDeliveryPartnerStatus: vendorApi.updateDeliveryPartnerStatus,
  resetDeliveryPartnerPassword: vendorApi.resetDeliveryPartnerPassword,
  getDeliveryPartners: vendorApi.getDeliveryPartners,
  getDeliveryStats: vendorApi.getDeliveryStats,

  // -----------------------
  // VENDOR API (Re-export vendorApi methods for compatibility)
  // -----------------------
  getVendorOrders: vendorApi.getVendorOrders,
  getUpcomingOrders: vendorApi.getUpcomingOrders,
  updateOrderStatus: vendorApi.updateOrderStatus,
  getVendorCustomers: vendorApi.getVendorCustomers,
  getVendorSubscriptions: vendorApi.getVendorSubscriptions,
  getDashboardStats: vendorApi.getDashboardStats,
  getVendorPayments: vendorApi.getVendorPayments,
  getVendorEarnings: vendorApi.getVendorEarnings,

  // -----------------------
  // PAYMENTS
  // -----------------------
  getPayments: async () => {
    try {
      const res = await fetch(`${BASE_URL}/payments/admin/all`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("getPayments error", e);
      return { ok: false, error: e };
    }
  },

  // -----------------------
  // MEAL PLANS & SCHEDULES
  // -----------------------
  getMealPlansForVendor: async () => {
    try {
      const res = await fetch(`${BASE_URL}/meal-plans/vendor`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return await safeJson(res);
    } catch (e) {
      console.error("getMealPlansForVendor error", e);
      return [];
    }
  },

  createMealPlan: async (payload) => {
    try {
      const res = await fetch(`${BASE_URL}/meal-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("createMealPlan error", e);
      return { ok: false, error: e };
    }
  },

  // -----------------------
  // Generic wrapper
  // -----------------------
  fetchJson: async (path, opts = {}) => {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
          ...(opts.headers || {}),
        },
        ...opts,
      });
      return { ok: res.ok, status: res.status, data: await safeJson(res) };
    } catch (e) {
      console.error("fetchJson error", e);
      return { ok: false, error: e };
    }
  },
};

export default api;
