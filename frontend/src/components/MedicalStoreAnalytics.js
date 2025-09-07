import React, { useState } from 'react';
import './MedicalStoreAnalytics.css';
import { 
  ShoppingCart, 
  TrendingUp,
  AlertTriangle,
  Package,
  DollarSign,
  Store,
  Clock,
  Activity,
  BarChart3,
  Pill
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const MedicalStoreAnalytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedStore, setSelectedStore] = useState('All');

  // Medical Stores Sales Data
  const storesSalesData = [
    { 
      store: 'Nabha Medical Store', 
      totalSales: 45000, 
      dailyAvg: 6428, 
      growth: 15, 
      orders: 234, 
      customers: 189,
      topMedicine: 'Paracetamol',
      location: 'Nabha',
      rating: 4.7
    },
    { 
      store: 'City Pharmacy', 
      totalSales: 38500, 
      dailyAvg: 5500, 
      growth: 8, 
      orders: 198, 
      customers: 156,
      topMedicine: 'Crocin',
      location: 'Patiala',
      rating: 4.5
    },
    { 
      store: 'Health Plus Medicos', 
      totalSales: 32000, 
      dailyAvg: 4571, 
      growth: 22, 
      orders: 167, 
      customers: 134,
      topMedicine: 'Amoxicillin',
      location: 'Sangrur',
      rating: 4.6
    },
    { 
      store: 'MediCare Pharmacy', 
      totalSales: 28500, 
      dailyAvg: 4071, 
      growth: -3, 
      orders: 143, 
      customers: 112,
      topMedicine: 'Aspirin',
      location: 'Barnala',
      rating: 4.3
    },
    { 
      store: 'Apollo Pharmacy', 
      totalSales: 52000, 
      dailyAvg: 7428, 
      growth: 18, 
      orders: 278, 
      customers: 223,
      topMedicine: 'Insulin',
      location: 'Patiala',
      rating: 4.8
    }
  ];

  // Most Demanded Medicines
  const highDemandMedicines = [
    { 
      medicine: 'Paracetamol', 
      totalSold: 1250, 
      revenue: 12500, 
      demand: 95, 
      growth: 12,
      category: 'Pain Relief',
      avgPrice: 10,
      stores: 5,
      stockStatus: 'Good'
    },
    { 
      medicine: 'Crocin', 
      totalSold: 980, 
      revenue: 14700, 
      demand: 88, 
      growth: 8,
      category: 'Fever',
      avgPrice: 15,
      stores: 5,
      stockStatus: 'Low'
    },
    { 
      medicine: 'Amoxicillin', 
      totalSold: 756, 
      revenue: 22680, 
      demand: 76, 
      growth: 15,
      category: 'Antibiotic',
      avgPrice: 30,
      stores: 4,
      stockStatus: 'Critical'
    },
    { 
      medicine: 'Insulin', 
      totalSold: 234, 
      revenue: 35100, 
      demand: 92, 
      growth: 25,
      category: 'Diabetes',
      avgPrice: 150,
      stores: 3,
      stockStatus: 'Critical'
    },
    { 
      medicine: 'Aspirin', 
      totalSold: 567, 
      revenue: 8505, 
      demand: 65, 
      growth: 5,
      category: 'Heart Care',
      avgPrice: 15,
      stores: 5,
      stockStatus: 'Good'
    },
    { 
      medicine: 'Metformin', 
      totalSold: 445, 
      revenue: 17800, 
      demand: 82, 
      growth: 18,
      category: 'Diabetes',
      avgPrice: 40,
      stores: 4,
      stockStatus: 'Low'
    }
  ];

  // Stock Alert Data (medicines ending soon)
  const stockAlerts = [
    { 
      medicine: 'Insulin', 
      currentStock: 15, 
      minRequired: 50, 
      daysLeft: 3, 
      dailyConsumption: 5,
      store: 'MediCare Pharmacy',
      severity: 'critical',
      estimatedRevenueLoss: 7500
    },
    { 
      medicine: 'Amoxicillin', 
      currentStock: 25, 
      minRequired: 100, 
      daysLeft: 5, 
      dailyConsumption: 8,
      store: 'Health Plus Medicos',
      severity: 'critical',
      estimatedRevenueLoss: 2400
    },
    { 
      medicine: 'Crocin', 
      currentStock: 45, 
      minRequired: 80, 
      daysLeft: 8, 
      dailyConsumption: 12,
      store: 'City Pharmacy',
      severity: 'high',
      estimatedRevenueLoss: 1800
    },
    { 
      medicine: 'Metformin', 
      currentStock: 32, 
      minRequired: 60, 
      daysLeft: 12, 
      dailyConsumption: 6,
      store: 'Nabha Medical Store',
      severity: 'medium',
      estimatedRevenueLoss: 1200
    },
    { 
      medicine: 'Blood Pressure Medicine', 
      currentStock: 18, 
      minRequired: 40, 
      daysLeft: 6, 
      dailyConsumption: 4,
      store: 'Apollo Pharmacy',
      severity: 'high',
      estimatedRevenueLoss: 800
    }
  ];

  // Weekly Sales Trend
  const weeklySalesTrend = [
    { week: 'Week 1', totalSales: 185000, orders: 456, avgOrder: 405 },
    { week: 'Week 2', totalSales: 198000, orders: 489, avgOrder: 405 },
    { week: 'Week 3', totalSales: 175000, orders: 432, avgOrder: 405 },
    { week: 'Week 4', totalSales: 212000, orders: 523, avgOrder: 405 }
  ];

  // Category-wise Sales
  const categorySales = [
    { category: 'Pain Relief', sales: 45000, percentage: 22.5, color: '#3b82f6' },
    { category: 'Antibiotics', sales: 38000, percentage: 19.0, color: '#ef4444' },
    { category: 'Diabetes Care', sales: 35000, percentage: 17.5, color: '#10b981' },
    { category: 'Heart Care', sales: 28000, percentage: 14.0, color: '#f59e0b' },
    { category: 'Vitamins', sales: 25000, percentage: 12.5, color: '#8b5cf6' },
    { category: 'Others', sales: 29000, percentage: 14.5, color: '#6b7280' }
  ];

  // Daily Sales by Store
  const dailyStoreSales = [
    { day: 'Mon', nabha: 6500, city: 5200, health: 4800, medicare: 4100, apollo: 7200 },
    { day: 'Tue', nabha: 7200, city: 5800, health: 5200, medicare: 3800, apollo: 7800 },
    { day: 'Wed', nabha: 6800, city: 5500, health: 4600, medicare: 4200, apollo: 7500 },
    { day: 'Thu', nabha: 7500, city: 6200, health: 5800, medicare: 4500, apollo: 8200 },
    { day: 'Fri', nabha: 8200, city: 6800, health: 6200, medicare: 4800, apollo: 8800 },
    { day: 'Sat', nabha: 7800, city: 6500, health: 5900, medicare: 4600, apollo: 8500 },
    { day: 'Sun', nabha: 5500, city: 4200, health: 3800, medicare: 3200, apollo: 6500 }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle = '' }) => (
    <div className="stat-card">
      <div className="stat-card-content">
        <div className="stat-info">
          <p className="stat-title">{title}</p>
          <p className="stat-value">{value}</p>
          {subtitle && <p className="stat-subtitle">{subtitle}</p>}
          {change !== undefined && (
            <p className={`stat-change ${change > 0 ? 'trend-up' : 'trend-down'}`}>
              <TrendingUp className={`trend-icon ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change)}% vs last week
            </p>
          )}
        </div>
        <div className={`stat-icon ${color}`}>
          <Icon className="icon" />
        </div>
      </div>
    </div>
  );

  const StoreCard = ({ store }) => (
    <div className="store-card">
      <div className="store-header">
        <div className="store-info">
          <h4 className="store-name">{store.store}</h4>
          <p className="store-location">{store.location}</p>
          <div className="store-rating">
            <span className="rating-value">⭐ {store.rating}</span>
          </div>
        </div>
        <div className="store-growth">
          <span className={`growth-badge ${store.growth > 0 ? 'growth-positive' : 'growth-negative'}`}>
            {store.growth > 0 ? '+' : ''}{store.growth}%
          </span>
        </div>
      </div>
      
      <div className="store-metrics">
        <div className="metric-row">
          <span className="metric-label">Total Sales</span>
          <span className="metric-value">₹{store.totalSales.toLocaleString()}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Daily Average</span>
          <span className="metric-value">₹{store.dailyAvg.toLocaleString()}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Orders</span>
          <span className="metric-value">{store.orders}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Customers</span>
          <span className="metric-value">{store.customers}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Top Medicine</span>
          <span className="metric-medicine">{store.topMedicine}</span>
        </div>
      </div>
    </div>
  );

  const MedicineCard = ({ medicine }) => (
    <div className="medicine-card">
      <div className="medicine-header">
        <h4 className="medicine-name">{medicine.medicine}</h4>
        <span className={`stock-badge stock-${medicine.stockStatus.toLowerCase()}`}>
          {medicine.stockStatus}
        </span>
      </div>
      
      <div className="medicine-category">
        <span className="category-tag">{medicine.category}</span>
      </div>
      
      <div className="medicine-stats">
        <div className="stat-row">
          <span className="stat-label">Units Sold</span>
          <span className="stat-number">{medicine.totalSold}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Revenue</span>
          <span className="stat-revenue">₹{medicine.revenue.toLocaleString()}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Demand Score</span>
          <span className="stat-demand">{medicine.demand}/100</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Growth</span>
          <span className={`stat-growth ${medicine.growth > 0 ? 'growth-positive' : 'growth-negative'}`}>
            +{medicine.growth}%
          </span>
        </div>
      </div>
      
      <div className="demand-bar">
        <div className="demand-fill" style={{ width: `${medicine.demand}%` }}></div>
      </div>
      
      <div className="medicine-footer">
        <span className="price-tag">₹{medicine.avgPrice}/unit</span>
        <span className="stores-count">{medicine.stores} stores</span>
      </div>
    </div>
  );

  const StockAlertCard = ({ alert }) => (
    <div className={`stock-alert-card alert-${alert.severity}`}>
      <div className="alert-header">
        <div className="alert-info">
          <h4 className="alert-medicine">{alert.medicine}</h4>
          <p className="alert-store">{alert.store}</p>
        </div>
        <div className="alert-urgency">
          <AlertTriangle className={`alert-icon alert-${alert.severity}`} />
          <span className="days-left">{alert.daysLeft} days</span>
        </div>
      </div>
      
      <div className="alert-details">
        <div className="stock-info">
          <div className="stock-numbers">
            <span className="current-stock">Current: {alert.currentStock}</span>
            <span className="min-required">Required: {alert.minRequired}</span>
          </div>
          <div className="stock-bar">
            <div 
              className="stock-fill" 
              style={{ width: `${(alert.currentStock / alert.minRequired) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="consumption-info">
          <span className="daily-use">Daily use: {alert.dailyConsumption} units</span>
          <span className="revenue-loss">Potential loss: ₹{alert.estimatedRevenueLoss.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="alert-actions">
        <button className="reorder-btn">Reorder Now</button>
        <button className="supplier-btn">Contact Supplier</button>
      </div>
    </div>
  );

  return (
    <div className="medical-analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="main-title">Medical Store Analytics</h1>
            <p className="subtitle">Sales Performance, Demand Analysis & Stock Management</p>
          </div>
          
          <div className="header-controls">
            <select 
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="select-dropdown"
            >
              <option value="All">All Stores</option>
              <option value="Nabha Medical Store">Nabha Medical Store</option>
              <option value="City Pharmacy">City Pharmacy</option>
              <option value="Health Plus Medicos">Health Plus Medicos</option>
              <option value="MediCare Pharmacy">MediCare Pharmacy</option>
              <option value="Apollo Pharmacy">Apollo Pharmacy</option>
            </select>
            
            <select 
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="select-dropdown"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="stats-grid">
        <StatCard
          title="Total Sales"
          value="₹196K"
          change={12}
          icon={DollarSign}
          color="bg-green"
          subtitle="this week"
        />
        <StatCard
          title="Total Orders"
          value="1,020"
          change={8}
          icon={ShoppingCart}
          color="bg-blue"
          subtitle="completed"
        />
        <StatCard
          title="Stock Alerts"
          value="5"
          icon={AlertTriangle}
          color="bg-red"
          subtitle="critical items"
        />
        <StatCard
          title="Top Store"
          value="Apollo Pharmacy"
          change={18}
          icon={Store}
          color="bg-purple"
          subtitle="highest sales"
        />
      </div>

      {/* Critical Stock Alerts */}
      <div className="alerts-section">
        <div className="section-header">
          <h3 className="section-title">
            <AlertTriangle className="title-icon" />
            Critical Stock Alerts - Immediate Action Required
          </h3>
        </div>
        <div className="alerts-grid">
          {stockAlerts.slice(0, 3).map((alert, index) => (
            <StockAlertCard key={index} alert={alert} />
          ))}
        </div>
      </div>

      {/* Store Performance Comparison */}
      <div className="stores-section">
        <h3 className="section-title">Store Performance Comparison</h3>
        <div className="stores-grid">
          {storesSalesData.map((store, index) => (
            <StoreCard key={index} store={store} />
          ))}
        </div>
      </div>

      {/* Sales Analytics Charts */}
      <div className="charts-grid">
        {/* Weekly Sales Trend */}
        <div className="chart-container">
          <h3 className="chart-title">Weekly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklySalesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'totalSales' ? `₹${value.toLocaleString()}` : value,
                name === 'totalSales' ? 'Sales' : name === 'orders' ? 'Orders' : 'Avg Order'
              ]} />
              <Legend />
              <Line type="monotone" dataKey="totalSales" stroke="#10b981" strokeWidth={3} name="Total Sales" />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Store Comparison */}
        <div className="chart-container">
          <h3 className="chart-title">Daily Sales by Store</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyStoreSales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="apollo" fill="#8b5cf6" name="Apollo Pharmacy" />
              <Bar dataKey="nabha" fill="#3b82f6" name="Nabha Medical" />
              <Bar dataKey="city" fill="#10b981" name="City Pharmacy" />
              <Bar dataKey="health" fill="#f59e0b" name="Health Plus" />
              <Bar dataKey="medicare" fill="#ef4444" name="MediCare" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Sales Distribution */}
      <div className="category-chart-container">
        <h3 className="chart-title">Category-wise Sales Distribution</h3>
        <div className="category-chart-wrapper">
          <div className="pie-chart-section">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sales"
                  label={({ category, percentage }) => `${category} ${percentage}%`}
                >
                  {categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="category-details">
            {categorySales.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-info">
                  <div className="category-color" style={{ backgroundColor: category.color }}></div>
                  <span className="category-name">{category.category}</span>
                </div>
                <div className="category-stats">
                  <span className="category-sales">₹{category.sales.toLocaleString()}</span>
                  <span className="category-percentage">{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High Demand Medicines */}
      <div className="medicines-section">
        <h3 className="section-title">High Demand Medicines</h3>
        <div className="medicines-grid">
          {highDemandMedicines.map((medicine, index) => (
            <MedicineCard key={index} medicine={medicine} />
          ))}
        </div>
      </div>

      {/* All Stock Alerts */}
      <div className="all-alerts-section">
        <h3 className="section-title">All Stock Alerts</h3>
        <div className="alerts-table">
          <div className="table-header">
            <span>Medicine</span>
            <span>Store</span>
            <span>Current Stock</span>
            <span>Days Left</span>
            <span>Severity</span>
            <span>Revenue Impact</span>
          </div>
          {stockAlerts.map((alert, index) => (
            <div key={index} className="table-row">
              <span className="medicine-name">{alert.medicine}</span>
              <span className="store-name">{alert.store}</span>
              <span className="stock-amount">{alert.currentStock} units</span>
              <span className="days-remaining">{alert.daysLeft} days</span>
              <span className={`severity-indicator severity-${alert.severity}`}>
                {alert.severity}
              </span>
              <span className="revenue-impact">₹{alert.estimatedRevenueLoss.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="insights-section">
        <h3 className="section-title">Key Business Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4 className="insight-title">🏆 Top Performing Store</h4>
            <p className="insight-text">Apollo Pharmacy leads with ₹52K weekly sales and 18% growth</p>
          </div>
          <div className="insight-card">
            <h4 className="insight-title">📈 Highest Demand</h4>
            <p className="insight-text">Paracetamol and Insulin show highest demand with 95% and 92% scores</p>
          </div>
          <div className="insight-card">
            <h4 className="insight-title">⚠️ Critical Stock</h4>
            <p className="insight-text">Insulin and Amoxicillin require immediate restocking (3-5 days left)</p>
          </div>
          <div className="insight-card">
            <h4 className="insight-title">💰 Revenue Opportunity</h4>
            <p className="insight-text">Diabetes care category growing 25% - expand insulin inventory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalStoreAnalytics;
