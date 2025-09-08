import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./AuthorityDashboard.css"; // Import CSS file

function AuthorityDashboard() {
  const [doctorAllocation] = useState([
    { doctor: "Dr. Singh", patients: 12 },
    { doctor: "Dr. Sharma", patients: 8 },
    { doctor: "Dr. Verma", patients: 15 },
  ]);

  const [patientLoad] = useState([
    { day: "Mon", count: 30 },
    { day: "Tue", count: 25 },
    { day: "Wed", count: 40 },
    { day: "Thu", count: 35 },
    { day: "Fri", count: 50 },
  ]);

  const [medicineStock] = useState([
    { name: "Paracetamol", stock: 20 },
    { name: "Vitamin D", stock: 15 },
    { name: "Cough Syrup", stock: 5 },
    { name: "Antibiotic", stock: 8 },
  ]);

  return (
    <div className="authority-dashboard">
      <h1>Authority Dashboard</h1>

      {/* Doctor Allocation Chart */}
      <div className="chart-section">
        <h3>Doctor Allocation (Patients per Doctor)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={doctorAllocation}>
            <XAxis dataKey="doctor" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="patients" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Patient Load Chart */}
      <div className="chart-section">
        <h3>Patient Load Over the Week</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={patientLoad}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Medicine Stock Overview */}
      <div className="medicine-stock">
        <h3>Medicine Stock</h3>
        <table className="medicine-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {medicineStock.map((med) => (
              <tr key={med.name}>
                <td>{med.name}</td>
                <td>{med.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Doctors</h3>
          <p>{doctorAllocation.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Patients Today</h3>
          <p>{patientLoad.reduce((sum, d) => sum + d.count, 0)}</p>
        </div>
        <div className="stat-card">
          <h3>Medicines Low in Stock</h3>
          <p>{medicineStock.filter((m) => m.stock < 10).length}</p>
        </div>
      </div>
    </div>
  );
}

export default AuthorityDashboard;