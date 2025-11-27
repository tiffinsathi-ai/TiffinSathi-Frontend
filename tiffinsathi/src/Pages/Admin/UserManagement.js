// src/pages/admin/AdminUserManagement.js
/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronUp, ChevronDown, Eye, Edit, Trash2, X } from "lucide-react";
import { api, authStorage } from "../../helpers/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await api.getUsers();
      if (mounted) setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
    return () => (mounted = false);
  }, []);

  const filteredAndSortedUsers = useMemo(() => {
    let list = Array.isArray(users) ? users : [];
    let filtered = list.filter(user => {
      const name = (user.name || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || ((user.role || "").toLowerCase() === roleFilter.toLowerCase());
      const matchesStatus = statusFilter === "All" || ((user.status || "").toLowerCase() === statusFilter.toLowerCase());
      return matchesSearch && matchesRole && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a,b) => {
        const A = ((a[sortConfig.key] || "") + "").toLowerCase();
        const B = ((b[sortConfig.key] || "") + "").toLowerCase();
        if (A < B) return sortConfig.direction === "asc" ? -1 : 1;
        if (A > B) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = key => {
    let dir = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") dir = "desc";
    setSortConfig({ key, direction: dir });
  };

  const changeRole = async (user, role) => {
    const { ok } = await api.updateUserRole(user.user_id || user.id, role);
    if (ok) {
      setUsers(prev => prev.map(u => (u.user_id === user.user_id || u.id === user.id) ? { ...u, role } : u));
    } else alert("Failed to change role");
  };

  const toggleStatus = async (user, status) => {
    // backend expects PUT /users/{id}/status - controller signature may vary
    try {
      const id = user.user_id || user.id;
      const ok = await api.updateUserStatus(id, status); // adapt if backend expects DTO
      if (ok) setUsers(prev => prev.map(u => (u.user_id === id || u.id === id) ? { ...u, status } : u));
      else alert("Failed to update status");
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const removeUser = async (user) => {
    if (!window.confirm("Delete user?")) return;
    const id = user.user_id || user.id;
    const ok = await api.deleteUser(id);
    if (ok) setUsers(prev => prev.filter(u => !(u.user_id === id || u.id === id)));
    else alert("Delete failed");
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input className="pl-10 w-full border px-3 py-2 rounded" placeholder="Search name or email..." value={searchTerm} onChange={e=>{setSearchTerm(e.target.value); setCurrentPage(1);}} />
          </div>
          <select value={roleFilter} onChange={e=>{setRoleFilter(e.target.value); setCurrentPage(1);}} className="px-3 py-2 border rounded">
            <option value="All">All Roles</option>
            <option value="admin">Admin</option>
            <option value="vendor">Vendor</option>
            <option value="user">User</option>
          </select>
          <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value); setCurrentPage(1);}} className="px-3 py-2 border rounded">
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left cursor-pointer" onClick={()=>handleSort("name")}>Name <SortIcon column="name" /></th>
              <th className="p-3 text-left cursor-pointer" onClick={()=>handleSort("email")}>Email <SortIcon column="email" /></th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="p-6 text-center">Loading...</td></tr> : (
              paginated.map(u => (
                <tr key={u.user_id || u.id || u.email} className="hover:bg-gray-50">
                  <td className="p-3">{u.name || u.email}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <select defaultValue={u.role} onChange={(e)=>changeRole(u, e.target.value)} className="px-2 py-1 border rounded">
                      <option value="user">user</option>
                      <option value="vendor">vendor</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button onClick={()=>toggleStatus(u, (u.status === "active" ? "blocked" : "active"))} className={`px-2 py-1 rounded ${u.status==="active"?"bg-green-100":"bg-red-100"}`}>
                      {u.status || "active"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={()=>{setSelectedUser(u); setModalType("view");}} className="px-2 py-1 border rounded">View</button>
                      <button onClick={()=>removeUser(u)} className="px-2 py-1 border rounded text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="p-3 flex items-center justify-between">
          <div>Showing {Math.min(startIndex+1, filteredAndSortedUsers.length)} to {Math.min(startIndex+itemsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length}</div>
          <div className="flex gap-2">
            <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} disabled={currentPage===1} className="px-3 py-1 border rounded">Prev</button>
            {[...Array(totalPages)].map((_,i)=>(
              <button key={i} onClick={()=>setCurrentPage(i+1)} className={`px-3 py-1 border rounded ${currentPage===i+1?"bg-blue-600 text-white":""}`}>{i+1}</button>
            ))}
            <button onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages} className="px-3 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>

      {selectedUser && modalType === "view" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded shadow max-w-lg w-full">
            <div className="flex justify-between">
              <h3 className="text-lg font-bold">User Details</h3>
              <button onClick={()=>{setSelectedUser(null); setModalType(null);}}>Close</button>
            </div>
            <div className="mt-4">
              <div><strong>Name:</strong> {selectedUser.name}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Role:</strong> {selectedUser.role}</div>
              <div><strong>Status:</strong> {selectedUser.status}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;