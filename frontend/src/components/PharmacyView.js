import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { updateStock } from "../utils/api";
import "./PharmacyView.css"; // import CSS

function PharmacyView() {
  const [medicines, setMedicines] = useState([
    { id: 1, name: "Paracetamol", stock: 20 },
    { id: 2, name: "Vitamin D", stock: 5 },
    { id: 3, name: "Cough Syrup", stock: 2 },
    { id: 4, name: "Antibiotic", stock: 8 },
  ]);

  const handleStockChange = (id, value) => {
    setMedicines((prev) =>
      prev.map((med) => (med.id === id ? { ...med, stock: Number(value) } : med))
    );
  };

  const saveStock = async (id, stock) => {
    try {
      await updateStock(id, stock);
      alert("Stock updated successfully");
    } catch (err) {
      alert("Failed to update stock");
    }
  };

  return (
    <div className="pharmacy-view">
      <h1>Welcome, Pharmacy Owner!</h1>

      {/* Medicine Stock Table */}
      <div className="medicine-stock">
        <h3>Medicine Stock</h3>
        <table className="medicine-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => (
              <tr key={med.id}>
                <td>{med.name}</td>
                <td>
                  <input
                    type="number"
                    value={med.stock}
                    min="0"
                    onChange={(e) => handleStockChange(med.id, e.target.value)}
                  />
                </td>
                <td>
                  <button onClick={() => saveStock(med.id, med.stock)}>Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Low Stock Alert */}
      <div className="low-stock-list">
        <h3>Low Stock Medicines</h3>
        <ul>
          {medicines.filter((m) => m.stock < 5).map((med) => (
            <li key={med.id}>
              {med.name} - only {med.stock} left!
            </li>
          ))}
        </ul>
      </div>

      {/* Medicine Stock Chart */}
      <div className="chart-container">
        <h3>Medicine Stock Levels</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={medicines}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="stock" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders / Prescriptions */}
      <div className="recent-orders">
        <h3>Recent Orders / Prescriptions</h3>
        <ul>
          <li>Raj Kumar - Paracetamol x2</li>
          <li>Sita Sharma - Vitamin D x1</li>
          <li>Anil Verma - Cough Syrup x1</li>
        </ul>
      </div>
    </div>
  );
}

export default PharmacyView;
