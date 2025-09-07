import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp,
  Calendar,
  Activity,
  AlertTriangle,
  Heart,
  Thermometer,
  Eye,
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

const WeeklyPatientDiseaseAnalytics = () => {
  const [timeRange, setTimeRange] = useState('current_week');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  // Weekly Patient Data (Last 4 weeks)
  const weeklyPatientData = [
    { week: 'Week 1', totalPatients: 245, newPatients: 67, urgentCases: 23, consultations: 189 },
    { week: 'Week 2', totalPatients: 289, newPatients: 78, urgentCases: 31, consultations: 234 },
    { week: 'Week 3', totalPatients: 312, newPatients: 89, urgentCases: 28, consultations: 267 },
    { week: 'Week 4', totalPatients: 341, newPatients: 94, urgentCases: 35, consultations: 298 }
  ];

  // Daily Patient Count for Current Week
  const dailyPatientCount = [
    { day: 'Monday', patients: 52, emergency: 8, followUp: 15, newCase: 29 },
    { day: 'Tuesday', patients: 47, emergency: 6, followUp: 12, newCase: 29 },
    { day: 'Wednesday', patients: 59, emergency: 11, followUp: 18, newCase: 30 },
    { day: 'Thursday', patients: 45, emergency: 7, followUp: 14, newCase: 24 },
    { day: 'Friday', patients: 63, emergency: 9, followUp: 21, newCase: 33 },
    { day: 'Saturday', patients: 41, emergency: 5, followUp: 13, newCase: 23 },
    { day: 'Sunday', patients: 34, emergency: 4, followUp: 9, newCase: 21 }
  ];

  // Most Common Diseases Data
  const diseaseData = [
    { 
      disease: 'Hypertension (High BP)', 
      patients: 234, 
      percentage: 18.8, 
      trend: 5, 
      severity: 'medium',
      ageGroup: '45-65',
      gender: { male: 52, female: 48 }
    },
    { 
      disease: 'Diabetes Type 2', 
      patients: 189, 
      percentage: 15.1, 
      trend: 8, 
      severity: 'high',
      ageGroup: '35-60',
      gender: { male: 55, female: 45 }
    },
    { 
      disease: 'Common Cold/Flu', 
      patients: 145, 
      percentage: 11.6, 
      trend: -2, 
      severity: 'low',
      ageGroup: 'All Ages',
      gender: { male: 48, female: 52 }
    },
    { 
      disease: 'Heart Disease', 
      patients: 112, 
      percentage: 9.0, 
      trend: 3, 
      severity: 'critical',
      ageGroup: '50+',
      gender: { male: 65, female: 35 }
    },
    { 
      disease: 'Skin Problems', 
      patients: 98, 
      percentage: 7.9, 
      trend: 12, 
      severity: 'low',
      ageGroup: '20-40',
      gender: { male: 45, female: 55 }
    },
    { 
      disease: 'Mental Health', 
      patients: 87, 
      percentage: 7.0, 
      trend: 15, 
      severity: 'medium',
      ageGroup: '18-45',
      gender: { male: 40, female: 60 }
    },
    { 
      disease: 'Respiratory Issues', 
      patients: 76, 
      percentage: 6.1, 
      trend: -5, 
      severity: 'medium',
      ageGroup: '30-65',
      gender: { male: 58, female: 42 }
    },
    { 
      disease: 'Digestive Problems', 
      patients: 65, 
      percentage: 5.2, 
      trend: 7, 
      severity: 'low',
      ageGroup: '25-55',
      gender: { male: 50, female: 50 }
    }
  ];

  // Disease Severity Distribution
  const severityDistribution = [
    { name: 'Critical', value: 18, color: '#dc2626', diseases: ['Heart Disease', 'Stroke'] },
    { name: 'High', value: 25, color: '#ea580c', diseases: ['Diabetes', 'Cancer'] },
    { name: 'Medium', value: 32, color: '#d97706', diseases: ['Hypertension', 'Mental Health'] },
    { name: 'Low', value: 25, color: '#16a34a', diseases: ['Skin Issues', 'Common Cold'] }
  ];

  // Age-wise Disease Distribution
  const ageWiseDisease = [
    { ageGroup: '0-18', diabetes: 2, hypertension: 1, heartDisease: 0, mentalHealth: 8, skinIssues: 23 },
    { ageGroup: '19-35', diabetes: 15, hypertension: 18, heartDisease: 3, mentalHealth: 35, skinIssues: 42 },
    { ageGroup: '36-50', diabetes: 45, hypertension: 67, heartDisease: 18, mentalHealth: 28, skinIssues: 25 },
    { ageGroup: '51-65', diabetes: 89, hypertension: 98, heartDisease: 56, mentalHealth: 12, skinIssues: 6 },
    { ageGroup: '65+', diabetes: 38, hypertension: 50, heartDisease: 35, mentalHealth: 4, skinIssues: 2 }
  ];

  // Seasonal Disease Trends
  const seasonalTrends = [
    { month: 'Jan', fever: 45, cold: 67, heartIssues: 23, diabetes: 89 },
    { month: 'Feb', fever: 52, cold: 78, heartIssues: 25, diabetes: 92 },
    { month: 'Mar', fever: 38, cold: 56, heartIssues: 28, diabetes: 95 },
    { month: 'Apr', fever: 29, cold: 34, heartIssues: 31, diabetes: 98 },
    { month: 'May', fever: 67, cold: 23, heartIssues: 29, diabetes: 102 },
    { month: 'Jun', fever: 89, cold: 18, heartIssues: 33, diabetes: 105 }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle = '' }) => (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {change !== undefined && (
            <p className={`text-sm flex items-center ${change > 0 ? 'text-red-600' : 'text-green-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change)}% vs last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const DiseaseCard = ({ disease }) => (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{disease.disease}</h4>
        <span className={`px-2 py-1 rounded-full text-xs ${
          disease.severity === 'critical' ? 'bg-red-100 text-red-800' :
          disease.severity === 'high' ? 'bg-orange-100 text-orange-800' :
          disease.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {disease.severity}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Patients</span>
          <span className="text-lg font-bold text-gray-900">{disease.patients}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Percentage</span>
          <span className="text-sm font-semibold">{disease.percentage}%</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Primary Age</span>
          <span className="text-sm">{disease.ageGroup}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Trend</span>
          <span className={`text-sm font-medium flex items-center ${
            disease.trend > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${disease.trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(disease.trend)}%
          </span>
        </div>
        
        {/* Gender Distribution */}
        <div className="pt-2">
          <p className="text-xs text-gray-500 mb-1">Gender Distribution</p>
          <div className="flex">
            <div className="flex-1 bg-blue-200 h-2 rounded-l" style={{width: `${disease.gender.male}%`}}></div>
            <div className="flex-1 bg-pink-200 h-2 rounded-r" style={{width: `${disease.gender.female}%`}}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>M: {disease.gender.male}%</span>
            <span>F: {disease.gender.female}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weekly Patients & Disease Analytics</h1>
            <p className="text-gray-600 mt-1">Patient Flow & Disease Pattern Analysis</p>
          </div>
          
          <div className="flex gap-4">
            <select 
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Districts</option>
              <option value="Nabha">Nabha</option>
              <option value="Patiala">Patiala</option>
              <option value="Sangrur">Sangrur</option>
              <option value="Barnala">Barnala</option>
            </select>
            
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="current_week">Current Week</option>
              <option value="last_4_weeks">Last 4 Weeks</option>
              <option value="monthly">Monthly Trend</option>
            </select>
          </div>
        </div>
      </div>

      {/* Weekly Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="This Week Patients"
          value="341"
          change={9}
          icon={Users}
          color="bg-blue-500"
          subtitle="94 new patients"
        />
        <StatCard
          title="Daily Average"
          value="49"
          change={12}
          icon={Activity}
          color="bg-green-500"
          subtitle="patients per day"
        />
        <StatCard
          title="Emergency Cases"
          value="35"
          change={25}
          icon={AlertTriangle}
          color="bg-red-500"
          subtitle="this week"
        />
        <StatCard
          title="Total Consultations"
          value="298"
          change={11}
          icon={Calendar}
          color="bg-purple-500"
          subtitle="completed"
        />
      </div>

      {/* Weekly Patient Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Patient Growth */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Weekly Patient Trends (Last 4 Weeks)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyPatientData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalPatients" stroke="#3b82f6" strokeWidth={3} name="Total Patients" />
              <Line type="monotone" dataKey="newPatients" stroke="#10b981" strokeWidth={2} name="New Patients" />
              <Line type="monotone" dataKey="urgentCases" stroke="#ef4444" strokeWidth={2} name="Urgent Cases" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Patient Distribution */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Daily Patient Distribution (Current Week)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyPatientCount}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="emergency" stackId="a" fill="#ef4444" name="Emergency" />
              <Bar dataKey="followUp" stackId="a" fill="#f59e0b" name="Follow-up" />
              <Bar dataKey="newCase" stackId="a" fill="#10b981" name="New Cases" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Common Diseases */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Most Common Diseases & Health Issues</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {diseaseData.map((disease, index) => (
            <DiseaseCard key={index} disease={disease} />
          ))}
        </div>
      </div>

      {/* Disease Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Disease Severity Distribution */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Disease Severity Distribution</h3>
          <div className="flex items-center justify-center mb-4">
            <ResponsiveContainer width="60%" height={250}>
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {severityDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded mr-3`} style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-medium">{item.name} Risk</span>
                </div>
                <span className="text-sm text-gray-600">{item.value}% of cases</span>
              </div>
            ))}
          </div>
        </div>

        {/* Age-wise Disease Distribution */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Age-wise Disease Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageWiseDisease}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="diabetes" fill="#ef4444" name="Diabetes" />
              <Bar dataKey="hypertension" fill="#f59e0b" name="Hypertension" />
              <Bar dataKey="heartDisease" fill="#dc2626" name="Heart Disease" />
              <Bar dataKey="mentalHealth" fill="#8b5cf6" name="Mental Health" />
              <Bar dataKey="skinIssues" fill="#10b981" name="Skin Issues" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seasonal Disease Trends */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Seasonal Disease Trends (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={seasonalTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="fever" stackId="1" stroke="#ef4444" fill="#ef4444" name="Fever/Flu" />
            <Area type="monotone" dataKey="cold" stackId="1" stroke="#06b6d4" fill="#06b6d4" name="Cold/Cough" />
            <Area type="monotone" dataKey="heartIssues" stackId="1" stroke="#dc2626" fill="#dc2626" name="Heart Issues" />
            <Area type="monotone" dataKey="diabetes" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Diabetes" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insights */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">📈 Patient Trends</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 9% increase in weekly patients compared to last week</li>
              <li>• Friday shows highest patient volume (63 patients)</li>
              <li>• Emergency cases increased by 25% this week</li>
              <li>• Follow-up compliance rate is 78%</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">🏥 Disease Patterns</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Hypertension affects 18.8% of all patients</li>
              <li>• Mental health cases increasing by 15%</li>
              <li>• Heart disease more common in males (65%)</li>
              <li>• Skin problems peak in age group 20-40</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPatientDiseaseAnalytics;
