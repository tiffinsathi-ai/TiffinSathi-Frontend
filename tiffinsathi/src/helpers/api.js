// src/helpers/api.js
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
    const token = data.token || data.accessToken || data.jwt || data.authToken || null;
    if (token) localStorage.setItem("token", token);
    if (data.role) localStorage.setItem("role", (data.role || "").toLowerCase());
    if (data.email) localStorage.setItem("email", data.email);
    if (data.name) localStorage.setItem("name", data.name);
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
  },

  getToken: () => localStorage.getItem("token"),
  getRole: () => localStorage.getItem("role"),
  getUser: () => ({
    email: localStorage.getItem("email"),
    name: localStorage.getItem("name"),
  }),
};

// ============================
// MAIN API
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
  // VENDORS - (match backend '/api/vendors' routes)
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
        body: JSON.stringify({ status: "approved", reason: "Approved by admin" }),
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
      const res = await fetch(`${BASE_URL}/vendors/${vendorId}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ newPassword }),
      });
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
  // ORDERS & SUBSCRIPTIONS
  // -----------------------
  getVendorOrders: async () => {
    try {
      const res = await fetch(`${BASE_URL}/orders/vendor`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      return await safeJson(res);
    } catch (e) {
      console.error("getVendorOrders error", e);
      return [];
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ status }),
      });
      return { ok: res.ok, data: await safeJson(res), status: res.status };
    } catch (e) {
      console.error("updateOrderStatus error", e);
      return { ok: false, error: e };
    }
  },

  // -----------------------
  // Generic wrapper
  // -----------------------
  fetchJson: async (path, opts = {}) => {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json", ...getAuthHeader(), ...(opts.headers || {}) },
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