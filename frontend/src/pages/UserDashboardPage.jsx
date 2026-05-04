import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function UserDashboardPage() {
  const { account, updateAccount } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    fullName: account?.fullName || "",
    email: account?.email || "",
    phone: account?.phone || "",
    address: account?.address || ""
  });

  useEffect(() => {
    async function loadData() {
      const [profileRes, bookingsRes] = await Promise.all([
        api.get("/users/profile"),
        api.get("/users/bookings")
      ]);
      updateAccount(profileRes.data.data);
      setForm({
        fullName: profileRes.data.data.fullName || "",
        email: profileRes.data.data.email || "",
        phone: profileRes.data.data.phone || "",
        address: profileRes.data.data.address || ""
      });
      setBookings(bookingsRes.data.data);
    }

    loadData();
  }, [updateAccount]);

  async function handleSave(event) {
    event.preventDefault();
    const { data } = await api.put("/users/profile", form);
    updateAccount(data.data);
  }

  return (
    <div className="container dashboard-grid page-stack">
      <section className="card">
        <h2>User Dashboard</h2>
        <p className="muted">Manage your profile and bookings.</p>
        <form className="form" onSubmit={handleSave}>
          <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button className="btn primary">Save Profile</button>
        </form>
      </section>

      <section className="card">
        <h3>My Bookings</h3>
        <div className="stack-list">
          {bookings.map((booking) => (
            <div className="list-row" key={booking._id}>
              <div>
                <strong>{booking.service?.title}</strong>
                <p className="muted">{booking.vendor?.businessName} • {booking.timeSlot}</p>
              </div>
              <span className="status-pill">{booking.status}</span>
            </div>
          ))}
          {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
        </div>
      </section>
    </div>
  );
}
