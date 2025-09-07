import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../utils/api";
import "./RegisterAuthority.css"; // for styling

function RegisterAuthority() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dob: "",
    department: "",
    designation: "",
    staffId: "",
    doj: "",
    organization: "",
    education: "",
    experience: "",
    govId: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await registerUser("authority", formData);
      navigate("/login/authority");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="title">Authority Registration</h2>
        <p className="subtitle">Fill in your details to create an account</p>

        {/* 👤 Personal Information */}
        <h3>👤 Personal Information</h3>
        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Contact Number"
          value={formData.phone}
          onChange={handleChange}
        />
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <label className="dob-label">Date of Birth:</label>
        <input
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
        />
        <label>Profile Photo (optional):</label>
        <input type="file" accept="image/*" />

        {/* 🏛️ Professional / Authority Details */}
        <h3>🏛️ Professional / Authority Details</h3>
        <input
          name="department"
          placeholder="Department (e.g. Admin, Records, Emergency)"
          value={formData.department}
          onChange={handleChange}
        />
        <input
          name="designation"
          placeholder="Designation (e.g. Medical Officer, HR)"
          value={formData.designation}
          onChange={handleChange}
        />
        <input
          name="staffId"
          placeholder="Employee / Staff ID"
          value={formData.staffId}
          onChange={handleChange}
        />
        <label>Date of Joining:</label>
        <input
          name="doj"
          type="date"
          value={formData.doj}
          onChange={handleChange}
        />
        <input
          name="organization"
          placeholder="Organization / Hospital Name"
          value={formData.organization}
          onChange={handleChange}
        />

        {/* Education & Experience */}
        <input
          name="education"
          placeholder="Highest Qualification"
          value={formData.education}
          onChange={handleChange}
        />
        <input
          name="experience"
          placeholder="Years of Experience"
          value={formData.experience}
          onChange={handleChange}
        />

        {/* 🪪 Verification */}
        <h3>🪪 Verification</h3>
        <input
          name="govId"
          placeholder="Government ID (Aadhaar, PAN, Passport)"
          value={formData.govId}
          onChange={handleChange}
        />
        <label>Upload Employee ID / Hospital ID Card:</label>
        <input type="file" accept="image/*,.pdf" />
        <label>Authorization Letter (optional):</label>
        <input type="file" accept="image/*,.pdf" />

        <button className="btn-primary" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
}

export default RegisterAuthority;
