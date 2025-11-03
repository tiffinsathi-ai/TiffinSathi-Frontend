import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Eye, Edit, Trash2, X } from 'lucide-react';

const UserManagementTable = () => {
  // Sample user data
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-15', avatar: 'https://i.pravatar.cc/150?img=12' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', joinDate: '2024-02-20', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive', joinDate: '2024-03-10', avatar: 'https://i.pravatar.cc/150?img=33' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-25', avatar: 'https://i.pravatar.cc/150?img=9' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active', joinDate: '2024-04-05', avatar: 'https://i.pravatar.cc/150?img=14' },
    { id: 6, name: 'Diana Davis', email: 'diana@example.com', role: 'User', status: 'Inactive', joinDate: '2024-05-12', avatar: 'https://i.pravatar.cc/150?img=20' },
    { id: 7, name: 'Eve Martinez', email: 'eve@example.com', role: 'User', status: 'Active', joinDate: '2024-02-28', avatar: 'https://i.pravatar.cc/150?img=25' },
    { id: 8, name: 'Frank Lee', email: 'frank@example.com', role: 'Admin', status: 'Active', joinDate: '2024-03-15', avatar: 'https://i.pravatar.cc/150?img=51' },
    { id: 9, name: 'Grace Taylor', email: 'grace@example.com', role: 'User', status: 'Active', joinDate: '2024-04-20', avatar: 'https://i.pravatar.cc/150?img=31' },
    { id: 10, name: 'Henry Clark', email: 'henry@example.com', role: 'User', status: 'Inactive', joinDate: '2024-01-30', avatar: 'https://i.pravatar.cc/150?img=68' },
    { id: 11, name: 'Ivy Anderson', email: 'ivy@example.com', role: 'User', status: 'Active', joinDate: '2024-05-08', avatar: 'https://i.pravatar.cc/150?img=45' },
    { id: 12, name: 'Jack White', email: 'jack@example.com', role: 'Admin', status: 'Active', joinDate: '2024-02-14', avatar: 'https://i.pravatar.cc/150?img=59' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort data
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);

  // Actions
  const handleView = (user) => {
    setSelectedUser(user);
    setModalType('view');
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalType('edit');
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setModalType('delete');
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <SortIcon column="name" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('email')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Email
                      <SortIcon column="email" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('role')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Role
                      <SortIcon column="role" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <SortIcon column="status" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('joinDate')}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      Join Date
                      <SortIcon column="joinDate" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(user)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1 hover:bg-green-50 rounded text-green-600"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'view' && 'User Details'}
                  {modalType === 'edit' && 'Edit User'}
                  {modalType === 'delete' && 'Delete User'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {modalType === 'view' && (
                <div className="space-y-3">
                  <div className="flex justify-center mb-4">
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Name:</span> {selectedUser.name}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span> {selectedUser.email}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Role:</span> {selectedUser.role}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span> {selectedUser.status}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Join Date:</span> {selectedUser.joinDate}
                  </div>
                </div>
              )}

              {modalType === 'edit' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Email"
                  />
                  <select
                    defaultValue={selectedUser.role}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                  <select
                    defaultValue={selectedUser.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              )}

              {modalType === 'delete' && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete user "{selectedUser.name}"? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementTable;
