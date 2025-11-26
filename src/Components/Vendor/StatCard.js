// src/Components/Vendor/StatCard.js
import React from "react";

const StatCard = ({ icon, label, value, hint }) => {
  return (
    <div className="stat-card card">
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hint && <div className="muted" style={{ marginTop: 6 }}>{hint}</div>}
      </div>
    </div>
  );
};

export default StatCard;