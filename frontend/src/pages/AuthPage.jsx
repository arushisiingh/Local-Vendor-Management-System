import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const userInitial = { fullName: "", email: "", phone: "", password: "", address: "" };
const vendorInitial = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  password: "",
  businessAddress: "",
  serviceCategory: "",
  gstNumber: "",
  serviceArea: "",
  location: ""
};

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [userForm, setUserForm] = useState(userInitial);
  const [vendorForm, setVendorForm] = useState(vendorInitial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", loginForm);
      login({ token: data.token, role: data.data.role, account: data.data.account });
      navigate(data.data.role === "vendor" ? "/vendor-dashboard" : "/user-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleUserSignup(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register-user", userForm);
      login({ token: data.token, role: data.data.role, account: data.data.account });
      navigate("/user-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVendorSignup(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register-vendor", vendorForm);
      login({ token: data.token, role: data.data.role, account: data.data.account });
      navigate("/vendor-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container auth-layout">
      <div className="tabs">
        <button className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Login</button>
        <button className={`tab ${mode === "user" ? "active" : ""}`} onClick={() => setMode("user")}>User Signup</button>
        <button className={`tab ${mode === "vendor" ? "active" : ""}`} onClick={() => setMode("vendor")}>Vendor Signup</button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      {mode === "login" && (
        <form className="card form" onSubmit={handleLogin}>
          <h2>Login</h2>
          <input placeholder="Email" type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
          <input placeholder="Password" type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
          <button className="btn primary" disabled={loading}>{loading ? "Please wait..." : "Login"}</button>
        </form>
      )}

      {mode === "user" && (
        <form className="card form" onSubmit={handleUserSignup}>
          <h2>Create User Account</h2>
          <input placeholder="Full name" value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} />
          <input placeholder="Email" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
          <input placeholder="Phone" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
          <input placeholder="Password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
          <textarea placeholder="Address" value={userForm.address} onChange={(e) => setUserForm({ ...userForm, address: e.target.value })} />
          <button className="btn primary" disabled={loading}>{loading ? "Please wait..." : "Register User"}</button>
        </form>
      )}

      {mode === "vendor" && (
        <form className="card form" onSubmit={handleVendorSignup}>
          <h2>Create Vendor Account</h2>
          <input placeholder="Business name" value={vendorForm.businessName} onChange={(e) => setVendorForm({ ...vendorForm, businessName: e.target.value })} />
          <input placeholder="Owner name" value={vendorForm.ownerName} onChange={(e) => setVendorForm({ ...vendorForm, ownerName: e.target.value })} />
          <input placeholder="Email" type="email" value={vendorForm.email} onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })} />
          <input placeholder="Phone" value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} />
          <input placeholder="Password" type="password" value={vendorForm.password} onChange={(e) => setVendorForm({ ...vendorForm, password: e.target.value })} />
          <input placeholder="Business address" value={vendorForm.businessAddress} onChange={(e) => setVendorForm({ ...vendorForm, businessAddress: e.target.value })} />
          <input placeholder="Service category" value={vendorForm.serviceCategory} onChange={(e) => setVendorForm({ ...vendorForm, serviceCategory: e.target.value })} />
          <input placeholder="GST number" value={vendorForm.gstNumber} onChange={(e) => setVendorForm({ ...vendorForm, gstNumber: e.target.value })} />
          <input placeholder="Service area" value={vendorForm.serviceArea} onChange={(e) => setVendorForm({ ...vendorForm, serviceArea: e.target.value })} />
          <input placeholder="Location" value={vendorForm.location} onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })} />
          <button className="btn primary" disabled={loading}>{loading ? "Please wait..." : "Register Vendor"}</button>
        </form>
      )}
    </div>
  );
}
