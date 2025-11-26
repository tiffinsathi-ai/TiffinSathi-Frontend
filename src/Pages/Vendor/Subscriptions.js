// src/Pages/Vendor/Subscriptions.js
import React, { useState, useEffect } from "react";
import { readData, writeData } from "../../helpers/storage";
import {
Search,
Filter,
Package,
User,
Calendar,
DollarSign,
PauseCircle,
PlayCircle,
XCircle,
TrendingUp,
} from "lucide-react";

const Subscriptions = () => {
const [subscriptions, setSubscriptions] = useState([]);
const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");

useEffect(() => {
loadSubscriptions();
}, []);

useEffect(() => {
filterSubscriptions();
}, [subscriptions, searchTerm, statusFilter]);

const loadSubscriptions = () => {
const data = readData();
const subs = data.subscriptions || [];
setSubscriptions(subs);
};

const filterSubscriptions = () => {
let filtered = [...subscriptions];
if (searchTerm) {
  const term = searchTerm.toLowerCase();
  filtered = filtered.filter(
    (s) =>
      (s.userName && s.userName.toLowerCase().includes(term)) ||
      (s.planName && s.planName.toLowerCase().includes(term)) ||
      (s.tiffinName && s.tiffinName.toLowerCase().includes(term))
  );
}

if (statusFilter !== "all") {
  filtered = filtered.filter((s) => s.status === statusFilter);
}

setFilteredSubscriptions(filtered);
};

const updateSubscriptionStatus = (id, newStatus) => {
const data = readData();
const subs = data.subscriptions || [];
const updated = subs.map((s) =>
s.id === id ? { ...s, status: newStatus } : s
);
data.subscriptions = updated;
writeData(data);
setSubscriptions(updated);
};

const handlePauseResume = (sub) => {
if (sub.status === "cancelled") return;
const nextStatus = sub.status === "paused" ? "active" : "paused";
updateSubscriptionStatus(sub.id, nextStatus);
};

const handleCancel = (sub) => {
if (!window.confirm("Cancel this subscription? This cannot be undone.")) {
return;
}
updateSubscriptionStatus(sub.id, "cancelled");
};

const getStatusBadgeClasses = (status) => {
const map = {
active: "bg-green-100 text-green-800",
paused: "bg-yellow-100 text-yellow-800",
cancelled: "bg-red-100 text-red-800",
};
return map[status] || "bg-gray-100 text-gray-800";
};

const formatDate = (dateString) => {
if (!dateString) return "N/A";
const d = new Date(dateString);
if (Number.isNaN(d.getTime())) return "N/A";
return d.toLocaleDateString();
};

const getEstimatedCycles = (sub) => {
if (!sub.totalBilled || !sub.pricePerCycle || sub.pricePerCycle <= 0) {
return null;
}
return Math.round(sub.totalBilled / sub.pricePerCycle);
};

const statusOptions = [
{ value: "all", label: "All Status" },
{ value: "active", label: "Active" },
{ value: "paused", label: "Paused" },
{ value: "cancelled", label: "Cancelled" },
];

return (
<div className="space-y-6">
{/* Header */}
<div className="flex justify-between items-center">
<div>
<h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
<p className="text-gray-600">
Manage customer meal plan subscriptions
</p>
</div>
</div>
  {/* Filters */}
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <div className="relative md:col-span-2">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by customer, plan, or tiffin..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter size={18} className="text-gray-400" />
        <select
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>

  {/* Subscriptions Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredSubscriptions.map((sub) => {
      const estimatedCycles = getEstimatedCycles(sub);
      return (
        <div
          key={sub.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User size={16} className="text-blue-600" />
                <span className="font-semibold text-gray-900">
                  {sub.userName || "Unknown customer"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package size={16} className="text-green-600" />
                <span className="text-sm text-gray-700 font-medium">
                  {sub.planName || sub.tiffinName || "Subscription"}
                </span>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                sub.status
              )}`}
            >
              {sub.status || "unknown"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
            <div className="flex items-center text-gray-600">
              <DollarSign size={14} className="mr-1 flex-shrink-0" />
              <span className="truncate">
                Rs {sub.pricePerCycle || 0} / {sub.billingCycle || "cycle"}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar size={14} className="mr-1.flex-shrink-0" />
              <span className="truncate">
                Start: {formatDate(sub.startDate)}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar size={14} className="mr-1 flex-shrink-0" />
              <span className="truncate">
                Next: {formatDate(sub.nextBillingDate)}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar size={14} className="mr-1 flex-shrink-0" />
              <span className="truncate">
                End: {sub.endDate ? formatDate(sub.endDate) : "Ongoing"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-gray-700">
              <TrendingUp size={14} className="mr-1 text-indigo-500" />
              <span className="truncate">
                Billed: Rs {sub.totalBilled || 0}
              </span>
            </div>
            <div className="flex items-center text-gray-700">
              <TrendingUp size={14} className="mr-1 text-indigo-500" />
              <span className="truncate">
                Cycles: {estimatedCycles || 0}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => handlePauseResume(sub)}
              disabled={sub.status === "cancelled"}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium border transition-colors ${
                sub.status === "paused"
                  ? "border-green-500 text-green-700 hover:bg-green-50"
                  : "border-yellow-500 text-yellow-700 hover:bg-yellow-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {sub.status === "paused" ? (
                <PlayCircle size={14} />
              ) : (
                <PauseCircle size={14} />
              )}
              <span>{sub.status === "paused" ? "Resume" : "Pause"}</span>
            </button>
            <button
              onClick={() => handleCancel(sub)}
              disabled={sub.status === "cancelled"}
              className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium border border-red-500 text-red-600 hover:bg-red-50.disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle size={14} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      );
    })}
  </div>
  {filteredSubscriptions.length === 0 && (
    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex.items-center.justify-center mx-auto mb-4">
        <Package size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Subscriptions Found
      </h3>
      <p className="text-gray-600 max-w-md mx-auto">
        Once customers subscribe to your meal plans, their subscriptions
        will appear here for easy management.
      </p>
    </div>
  )}
</div>
);
};
export default Subscriptions;