import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function DoctorDashboard() {
  // Dummy Data
  const [appointments] = useState([
    { id: 1, patient: "Raj Kumar", time: "10:00 AM", status: "Upcoming" },
    { id: 2, patient: "Sita Sharma", time: "11:30 AM", status: "Upcoming" },
    { id: 3, patient: "Anil Verma", time: "Yesterday", status: "Completed" },
  ]);

  const patientHistory = [
    { name: "Raj Kumar", lastVisit: "2025-08-15", condition: "Fever" },
    { name: "Sita Sharma", lastVisit: "2025-08-20", condition: "Cold" },
    { name: "Anil Verma", lastVisit: "2025-08-25", condition: "Headache" },
  ];

  const statsData = [
    { metric: "Appointments Today", value: 5 },
    { metric: "Teleconsultations Completed", value: 12 },
    { metric: "Pending Follow-ups", value: 3 },
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Welcome, Doctor!</h1>

      {/* Stats */}
      <div style={{ display: "flex", justifyContent: "space-around", margin: "20px 0" }}>
        {statsData.map((stat) => (
          <div key={stat.metric} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", width: "30%", textAlign: "center" }}>
            <h3>{stat.metric}</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div style={{ margin: "20px 0" }}>
        <h3>Upcoming Appointments</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Patient</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Time / Date</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td style={{ padding: "8px" }}>{appt.patient}</td>
                <td style={{ padding: "8px" }}>{appt.time}</td>
                <td style={{ padding: "8px" }}>{appt.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Patient History */}
      <div style={{ margin: "20px 0" }}>
        <h3>Patient History</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Patient</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Last Visit</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Condition</th>
            </tr>
          </thead>
          <tbody>
            {patientHistory.map((patient, idx) => (
              <tr key={idx}>
                <td style={{ padding: "8px" }}>{patient.name}</td>
                <td style={{ padding: "8px" }}>{patient.lastVisit}</td>
                <td style={{ padding: "8px" }}>{patient.condition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Patient Condition Chart */}
      <div style={{ margin: "20px 0" }}>
        <h3>Patient Conditions Overview</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={patientHistory.map(p => ({ symptom: p.condition, value: 1 }))}>
            <XAxis dataKey="symptom" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DoctorDashboard;