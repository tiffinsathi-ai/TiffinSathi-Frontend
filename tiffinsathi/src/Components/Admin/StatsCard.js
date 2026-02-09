import React from 'react';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  changeText,
  changePositive = true,
  compact = false 
}) => {
  const colorClasses = {
    blue: { iconBg: 'bg-white/50 border-blue-200', iconColor: 'text-blue-600' },
    green: {  iconBg: 'bg-white/50 border-green-200', iconColor: 'text-green-600' },
    yellow: { iconBg: 'bg-white/50 border-yellow-200', iconColor: 'text-yellow-600' },
    red: { iconBg: 'bg-white/50 border-red-200', iconColor: 'text-red-600' },
    purple: { iconBg: 'bg-white/50 border-purple-200', iconColor: 'text-purple-600' },
    orange: { iconBg: 'bg-white/50 border-orange-200', iconColor: 'text-orange-600' }
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`bg-gradient-to-br ${selectedColor.bg} p-5 rounded-xl border ${selectedColor.border} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className={compact ? '' : 'flex-1'}>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-xl font-bold text-gray-900 ${compact ? 'mt-1' : 'mt-2'}`}>
            {value}
          </p>
          {changeText && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-medium ${changePositive ? 'text-green-600' : 'text-red-600'}`}>
                {changeText}
              </span>
              {!compact && <span className="text-xs text-gray-500">from last month</span>}
            </div>
          )}
        </div>
        <div className={`p-2 ${selectedColor.iconBg} rounded-lg border ${selectedColor.border}`}>
          <Icon className={`h-5 w-5 ${selectedColor.iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;