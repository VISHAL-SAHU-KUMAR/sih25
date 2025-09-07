import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../utils/api";
import "./RegisterDoctor.css"; // Add styling

function RegisterDoctor() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    gender: "",
    contact: "",
    address: "",
    qualification: "",
    specialization: "",
    experience: "",
    designation: "",
    hospital: "",
    licenseNumber: "", // Changed from regNumber to match backend
    regAuthority: "",
    regYear: "",
    licenseFile: null,
    workingDays: [],
    workingHours: "",
    onCall: "No"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckbox = (day) => {
    const updatedDays = formData.workingDays.includes(day)
      ? formData.workingDays.filter((d) => d !== day)
      : [...formData.workingDays, day];
    setFormData({ ...formData, workingDays: updatedDays });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || 
        !formData.specialization || !formData.experience) {
      return "Please fill in all required fields.";
    }
    
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }
    
    if (formData.password.length < 7) {
      return "Password must be at least 7 characters long.";
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      return "Please enter a valid email address.";
    }
    
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      // Prepare registration data
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        experience: parseInt(formData.experience) || 0,
        qualification: formData.qualification,
        designation: formData.designation,
        hospital: formData.hospital,
        contact: formData.contact,
        address: formData.address,
        dob: formData.dob,
        gender: formData.gender,
        regAuthority: formData.regAuthority,
        regYear: formData.regYear,
        workingDays: formData.workingDays,
        workingHours: formData.workingHours,
        onCall: formData.onCall
      };

      await registerUser("doctor", registrationData);
      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login/doctor");
      }, 2000);

    } catch (err) {
      console.error('Doctor registration error:', err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="doctor-register-container">
      <div className="register-card">
        <h2>🧑‍⚕️ Doctor Registration</h2>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleRegister}>
          {/* Personal Info */}
          <h3>Personal Information</h3>
          <input 
            name="name" 
            placeholder="Full Name *" 
            value={formData.name} 
            onChange={handleChange}
            required 
          />
          <input 
            name="email" 
            type="email"
            placeholder="Email Address *" 
            value={formData.email} 
            onChange={handleChange}
            required 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password *" 
            value={formData.password} 
            onChange={handleChange}
            required 
          />
          <input 
            type="password" 
            name="confirmPassword" 
            placeholder="Confirm Password *" 
            value={formData.confirmPassword} 
            onChange={handleChange}
            required 
          />
          <input 
            type="date" 
            name="dob" 
            value={formData.dob} 
            onChange={handleChange} 
          />
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input 
            name="contact" 
            placeholder="Contact Number" 
            value={formData.contact} 
            onChange={handleChange} 
          />
          <textarea 
            name="address" 
            placeholder="Permanent Address" 
            value={formData.address} 
            onChange={handleChange} 
          />

          {/* Professional Info */}
          <h3>🎓 Professional Information</h3>
          <input 
            name="qualification" 
            placeholder="Qualification (MBBS, MD...)" 
            value={formData.qualification} 
            onChange={handleChange} 
          />
          <input 
            name="specialization" 
            placeholder="Specialization *" 
            value={formData.specialization} 
            onChange={handleChange}
            required 
          />
          <input 
            type="number" 
            name="experience" 
            placeholder="Years of Experience *" 
            value={formData.experience} 
            onChange={handleChange}
            required 
          />
          <input 
            name="designation" 
            placeholder="Current Designation" 
            value={formData.designation} 
            onChange={handleChange} 
          />
          <input 
            name="hospital" 
            placeholder="Hospital/Clinic Affiliation" 
            value={formData.hospital} 
            onChange={handleChange} 
          />

          {/* Registration */}
          <h3>🏥 Registration & Verification</h3>
          <input 
            name="licenseNumber" 
            placeholder="Medical Council Registration Number" 
            value={formData.licenseNumber} 
            onChange={handleChange} 
          />
          <input 
            name="regAuthority" 
            placeholder="Issuing Authority" 
            value={formData.regAuthority} 
            onChange={handleChange} 
          />
          <input 
            type="number" 
            name="regYear" 
            placeholder="Year of Registration" 
            value={formData.regYear} 
            onChange={handleChange} 
          />
          <input 
            type="file" 
            name="licenseFile" 
            accept=".pdf,.jpg,.png" 
            onChange={handleChange} 
          />

          {/* Availability */}
          <h3>⏰ Availability</h3>
          <div className="days-checkbox">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <label key={day}>
                <input 
                  type="checkbox" 
                  checked={formData.workingDays.includes(day)} 
                  onChange={() => handleCheckbox(day)} 
                />
                {day}
              </label>
            ))}
          </div>
          <input 
            name="workingHours" 
            placeholder="Working Hours (e.g. 10 AM - 6 PM)" 
            value={formData.workingHours} 
            onChange={handleChange} 
          />
          <select name="onCall" value={formData.onCall} onChange={handleChange}>
            <option value="No">On-call Availability: No</option>
            <option value="Yes">On-call Availability: Yes</option>
          </select>

          <button type="submit" className="btn-primary">
            Register
          </button>
        </form>

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login/doctor" className="login-link">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterDoctor;
