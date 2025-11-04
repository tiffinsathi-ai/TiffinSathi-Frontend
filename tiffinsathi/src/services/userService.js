import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
});

async function hashPasswordSha256(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export async function createUser(user) {
  const { name, email, phone, address, password } = user;
  const hashed = await hashPasswordSha256(password || "");
  const payload = { name, email, phone, address, password: hashed };
  const res = await api.post("/users", payload);
  return res.data;
}

export async function getUsers(params) {
  const res = await api.get("/users", { params });
  return res.data;
}

export async function getUserById(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function updateUser(id, updates) {
  const payload = { ...updates };
  if (typeof updates.password === "string" && updates.password.length > 0) {
    payload.password = await hashPasswordSha256(updates.password);
  } else if ("password" in updates) {
    delete payload.password;
  }
  const res = await api.patch(`/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function findUserByEmail(email) {
  const res = await api.get("/users", { params: { email } });
  const users = res.data || [];
  return users.length ? users[0] : null;
}

export default {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  findUserByEmail,
};
