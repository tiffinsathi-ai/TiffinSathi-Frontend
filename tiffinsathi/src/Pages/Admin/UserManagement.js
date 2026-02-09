import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, 
  Edit, 
  Trash2, 
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Calendar,
  Phone,
  Eye,
  Download,
  RefreshCw,
  Mail,
  CreditCard,
  TrendingUp,
  FileText
} from 'lucide-react';
import AdminApi from '../../helpers/adminApi';
import Pagination from '../../Components/Admin/Pagination';
import ConfirmationModal from '../../Components/Admin/ConfirmationModal';
import Modal from '../../Components/Admin/Modal';
import StatsCard from '../../Components/Admin/StatsCard';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [actionMenu, setActionMenu] = useState(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    adminUsers: 0
  });
  
  const itemsPerPage = 8;
  const actionMenuRefs = useRef({});
  const menuPortalRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({});

  // Create portal container for menus
  useEffect(() => {
    const portalContainer = document.createElement('div');
    portalContainer.style.position = 'fixed';
    portalContainer.style.top = '0';
    portalContainer.style.left = '0';
    portalContainer.style.zIndex = '9999';
    portalContainer.style.pointerEvents = 'none';
    document.body.appendChild(portalContainer);
    menuPortalRef.current = portalContainer;

    return () => {
      if (menuPortalRef.current && document.body.contains(menuPortalRef.current)) {
        document.body.removeChild(menuPortalRef.current);
      }
    };
  }, []);

  // Calculate menu position - FIXED: Menu should appear right next to the button
  const calculateMenuPosition = (userId) => {
    const button = actionMenuRefs.current[userId];
    if (!button) return {};

    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const menuHeight = 180; // More accurate menu height (4 items)
    const menuWidth = 192; // Menu width (w-48 = 192px)

    let top = rect.bottom + 4;
    let left = rect.left;
    
    // Adjust if menu would go off the bottom of the screen
    if (top + menuHeight > viewportHeight) {
      top = rect.top - menuHeight - 2; // Reduced gap from 4px to 2px
    }
    
    // Adjust if menu would go off the right side of the screen
    if (left + menuWidth > viewportWidth) {
      left = rect.right - menuWidth;
    }
    
    // Adjust if menu would go off the left side of the screen
    if (left < 10) {
      left = 10;
    }

    return {
      top: `${Math.max(top, 10)}px`,
      left: `${left}px`,
      position: 'fixed',
      zIndex: 9999,
    };
  };

  // Calculate stats
  const calculateStats = (usersData) => {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(u => u.status === 'ACTIVE').length;
    const blockedUsers = usersData.filter(u => u.status === 'BLOCK').length;
    const adminUsers = usersData.filter(u => u.role === 'ADMIN').length;

    setStats({
      totalUsers,
      activeUsers,
      blockedUsers,
      adminUsers
    });
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      ACTIVE: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: UserCheck,
        label: 'Active'
      },
      BLOCK: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: UserX,
        label: 'Blocked'
      }
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  // Role badge component
  const RoleBadge = ({ role }) => {
    const roleColors = {
      ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
      VENDOR: 'bg-blue-100 text-blue-800 border-blue-200',
      USER: 'bg-gray-100 text-gray-800 border-gray-200',
      DELIVERY: 'bg-orange-100 text-orange-800 border-orange-200'
    };

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleColors[role] || roleColors.USER}`}>
        <Shield className="h-3 w-3" />
        {role}
      </span>
    );
  };

  // API functions
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminApi.getUsers();
      setUsers(data);
      calculateStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    setIsLoadingAction(true);
    try {
      const updatedUser = await AdminApi.updateUserStatus(userId, status);
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      calculateStats(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
      throw err;
    } finally {
      setIsLoadingAction(false);
    }
  };

  const updateUserRole = async (userId, role) => {
    setIsLoadingAction(true);
    try {
      const updatedUser = await AdminApi.updateUserRole(userId, role);
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      calculateStats(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
      throw err;
    } finally {
      setIsLoadingAction(false);
    }
  };

  const deleteUser = async (userId) => {
    setIsLoadingAction(true);
    try {
      await AdminApi.deleteUser(userId);
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      calculateStats(updatedUsers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      throw err;
    } finally {
      setIsLoadingAction(false);
    }
  };

  const updateUser = async (userId, userData) => {
    setIsLoadingAction(true);
    try {
      const updatedUser = await AdminApi.updateUser(userId, userData);
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
      throw err;
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.phoneNumber?.includes(searchTerm);
      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  // Paginate users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'BLOCK', label: 'Blocked' }
  ];

  const roleOptions = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'USER', label: 'User' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  // Calculate percentage change for stats
  const calculatePercentage = (current, previous) => {
    if (previous === 0) return '+100%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Event handlers
  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      userName: user.userName,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture
    });
    setIsEditModalOpen(true);
    setActionMenu(null);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
    setActionMenu(null);
  };

  const handleStatusChange = (user) => {
    setSelectedUser(user);
    setIsStatusModalOpen(true);
    setActionMenu(null);
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setEditForm(prev => ({ ...prev, role: user.role }));
    setIsRoleModalOpen(true);
    setActionMenu(null);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
    setActionMenu(null);
  };

  const confirmStatusChange = async () => {
    if (selectedUser) {
      const newStatus = selectedUser.status === 'ACTIVE' ? 'BLOCK' : 'ACTIVE';
      await updateUserStatus(selectedUser.id, newStatus);
      setIsStatusModalOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmRoleChange = async () => {
    if (selectedUser && editForm.role) {
      await updateUserRole(selectedUser.id, editForm.role);
      setIsRoleModalOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleSaveEdit = async () => {
    if (selectedUser) {
      await updateUser(selectedUser.id, editForm);
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'Created Date'],
      ...filteredUsers.map(user => [
        user.userName,
        user.email,
        user.phoneNumber || 'N/A',
        user.role,
        user.status,
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside any action button
      const isButtonClick = Object.values(actionMenuRefs.current).some(ref => {
        return ref && ref.contains(event.target);
      });
      
      // Check if click is inside any action menu (via portal)
      const menuElements = document.querySelectorAll('[data-action-menu]');
      const isMenuClick = Array.from(menuElements).some(element => 
        element.contains(event.target)
      );
      
      if (!isButtonClick && !isMenuClick) {
        setActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on scroll, recalculate only on resize
  useEffect(() => {
    const handleScroll = () => {
      if (actionMenu) {
        setActionMenu(null);
      }
    };

    const handleResize = () => {
      if (actionMenu) {
        const position = calculateMenuPosition(actionMenu);
        setMenuPosition(prev => ({
          ...prev,
          [actionMenu]: position
        }));
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [actionMenu]);

  // Action Menu Portal Component
  const ActionMenuPortal = ({ user, isOpen, position }) => {
    if (!isOpen || !menuPortalRef.current) return null;

    return (
      <div 
        data-action-menu
        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 pointer-events-auto w-48"
        style={position}
      >
        <button
          onClick={() => handleView(user)}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
        <button
          onClick={() => handleEdit(user)}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit Profile
        </button>
        <button
          onClick={() => handleRoleChange(user)}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Shield className="h-4 w-4" />
          Change Role
        </button>
        <div className="border-t border-gray-100 my-1"></div>
        <button
          onClick={() => handleDelete(user)}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete User
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section - Consistent with PaymentManagement */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all users in the system</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportUsers}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards - Consistent with PaymentManagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="blue"
          changeText={calculatePercentage(stats.totalUsers, stats.totalUsers * 0.9)}
          changePositive={true}
        />
        
        <StatsCard
          title="Active Users"
          value={stats.activeUsers}
          icon={UserCheck}
          color="green"
          changeText={stats.activeUsers > 0 ? 'Active' : 'None'}
        />
        
        <StatsCard
          title="Blocked Users"
          value={stats.blockedUsers}
          icon={UserX}
          color="red"
          changeText={stats.blockedUsers > 0 ? 'Requires attention' : 'All good'}
        />
        
        <StatsCard
          title="Admin Users"
          value={stats.adminUsers}
          icon={Shield}
          color="purple"
          changeText={stats.adminUsers > 0 ? 'Admin accounts' : 'No admins'}
        />
      </div>

      {/* Search and Filter Section - Consistent with PaymentManagement */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-full lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserCheck className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="rounded-md bg-red-50 p-4 mx-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Users</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.profilePicture ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                src={user.profilePicture}
                                alt={user.userName}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                <Users className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.userName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {user.phoneNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusChange(user)}
                          className="cursor-pointer transition-transform hover:scale-105"
                        >
                          <StatusBadge status={user.status} />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <div className="relative">
                            <button
                              ref={el => actionMenuRefs.current[user.id] = el}
                              onClick={() => {
                                if (actionMenu === user.id) {
                                  setActionMenu(null);
                                } else {
                                  setActionMenu(user.id);
                                  // Calculate position after a small delay
                                  setTimeout(() => {
                                    const position = calculateMenuPosition(user.id);
                                    setMenuPosition(prev => ({
                                      ...prev,
                                      [user.id]: position
                                    }));
                                  }, 10);
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {paginatedUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-blue-50 rounded-full mb-4">
                  <Users className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'ALL' || roleFilter !== 'ALL' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'No user data available'
                  }
                </p>
              </div>
            )}
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredUsers.length}
              currentItemsCount={paginatedUsers.length}
            />
          </>
        )}
      </div>

      {/* Action Menus via Portal */}
      {paginatedUsers.map((user) => {
        const portalContainer = menuPortalRef.current;
        if (!portalContainer) return null;

        const portalElement = (
          <ActionMenuPortal
            key={`menu-${user.id}`}
            user={user}
            isOpen={actionMenu === user.id}
            position={menuPosition[user.id] || {}}
          />
        );

        return createPortal(portalElement, portalContainer);
      })}

      {/* Modern User Details Modal - Similar to Payment Details */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="User Details"
        size="xl"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold truncate max-w-[300px]">
                      {selectedUser.userName}
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">User Profile</p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end">
                  <div className="flex gap-2">
                    <RoleBadge role={selectedUser.role} />
                    <StatusBadge status={selectedUser.status} />
                  </div>
                  <p className="text-blue-100 text-sm mt-2">Joined: {formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - User Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">User Information</h4>
                        <p className="text-sm text-gray-600">Complete user profile details</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-4 mb-6">
                      {selectedUser.profilePicture ? (
                        <img
                          src={selectedUser.profilePicture}
                          alt={selectedUser.userName}
                          className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-4 border-white shadow-lg">
                          <Users className="h-10 w-10 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedUser.userName}</h3>
                        <p className="text-gray-600">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Email Address</span>
                        </div>
                        <p className="text-base font-semibold text-gray-900 truncate">
                          {selectedUser.email}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">Phone Number</span>
                        </div>
                        <p className="text-base font-semibold text-gray-900">
                          {selectedUser.phoneNumber || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Role Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Shield className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Account Role</h4>
                        <p className="text-sm text-gray-600">User permissions and access level</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Current Role</p>
                        <RoleBadge role={selectedUser.role} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Role Description</p>
                        <p className="text-sm text-gray-900">
                          {selectedUser.role === 'ADMIN' 
                            ? 'Full administrative access to all system features'
                            : selectedUser.role === 'VENDOR'
                            ? 'Vendor access with business management capabilities'
                            : 'Standard user access with basic features'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 ${selectedUser.status === 'ACTIVE' ? 'bg-green-100' : 'bg-red-100'} rounded-lg`}>
                        {selectedUser.status === 'ACTIVE' 
                          ? <UserCheck className="h-5 w-5 text-green-600" />
                          : <UserX className="h-5 w-5 text-red-600" />
                        }
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Account Status</h4>
                        <p className="text-sm text-gray-600">Current account availability</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Status</p>
                        <StatusBadge status={selectedUser.status} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Status Description</p>
                        <p className="text-sm text-gray-900">
                          {selectedUser.status === 'ACTIVE' 
                            ? 'Account is active and can access all features'
                            : 'Account is blocked and cannot access the system'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Account & Dates */}
              <div className="space-y-6">
                {/* Account Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Account Details</h4>
                      <p className="text-sm text-gray-600">User account information</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">User ID</p>
                      <p className="text-sm font-medium text-gray-900 font-mono">{selectedUser.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Email Verified</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedUser.emailVerified ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Two-Factor Auth</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dates Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Timeline</h4>
                      <p className="text-sm text-gray-600">Account activity timeline</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created At</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Updated</span>
                        <span className="text-sm font-medium text-gray-900">{formatDate(selectedUser.updatedAt)}</span>
                      </div>
                    </div>
                    {selectedUser.lastLogin && (
                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last Login</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(selectedUser.lastLogin)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">User Activity</h4>
                      <p className="text-sm text-gray-600">Recent account activity</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Orders</span>
                      <span className="text-sm font-medium text-gray-900">{selectedUser.totalOrders || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Spent</span>
                      <span className="text-sm font-medium text-gray-900">Rs. {selectedUser.totalSpent || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payment Methods</span>
                      <span className="text-sm font-medium text-gray-900">{selectedUser.paymentMethods || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>User ID: {selectedUser.id}</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEdit(selectedUser);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  <Edit className="h-4 w-4" />
                  Edit User
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Profile"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={editForm.userName || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, userName: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                value={editForm.phoneNumber || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isLoadingAction}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoadingAction ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Status Change Confirmation */}
      <ConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={confirmStatusChange}
        title={`${selectedUser?.status === 'ACTIVE' ? 'Block' : 'Activate'} User`}
        message={`Are you sure you want to ${selectedUser?.status === 'ACTIVE' ? 'block' : 'activate'} ${selectedUser?.userName}? ${selectedUser?.status === 'ACTIVE' ? 'They will no longer be able to access their account.' : 'They will regain access to their account.'}`}
        confirmText={selectedUser?.status === 'ACTIVE' ? 'Block User' : 'Activate User'}
        type={selectedUser?.status === 'ACTIVE' ? 'warning' : 'success'}
        isLoading={isLoadingAction}
      />

      {/* Role Change Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Change User Role"
        size="sm"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Change the role for <span className="font-semibold text-gray-900">{selectedUser?.userName}</span>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
            <select
              value={editForm.role || selectedUser?.role}
              onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmRoleChange}
              disabled={isLoadingAction}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoadingAction ? 'Updating...' : 'Change Role'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.userName}? This action cannot be undone and all user data will be permanently removed.`}
        confirmText="Delete User"
        type="delete"
        isLoading={isLoadingAction}
      />
    </div>
  );
};

export default UserManagement;