import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const serviceInitial = {
  title: "",
  description: "",
  category: "",
  price: "",
  image: "",
  availability: true
};

export default function VendorDashboardPage() {
  const { account, updateAccount } = useAuth();
  const [profile, setProfile] = useState({
    businessName: account?.businessName || "",
    ownerName: account?.ownerName || "",
    email: account?.email || "",
    phone: account?.phone || "",
    businessAddress: account?.businessAddress || "",
    serviceCategory: account?.serviceCategory || "",
    gstNumber: account?.gstNumber || "",
    serviceArea: account?.serviceArea || "",
    location: account?.location || ""
  });
  const [serviceForm, setServiceForm] = useState(serviceInitial);
  const [editingId, setEditingId] = useState("");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);

  async function loadDashboard() {
    const [profileRes, servicesRes, bookingsRes] = await Promise.all([
      api.get("/vendors/profile"),
      api.get("/vendors/services"),
      api.get("/vendors/bookings")
    ]);

    updateAccount(profileRes.data.data);
    setProfile({
      businessName: profileRes.data.data.businessName || "",
      ownerName: profileRes.data.data.ownerName || "",
      email: profileRes.data.data.email || "",
      phone: profileRes.data.data.phone || "",
      businessAddress: profileRes.data.data.businessAddress || "",
      serviceCategory: profileRes.data.data.serviceCategory || "",
      gstNumber: profileRes.data.data.gstNumber || "",
      serviceArea: profileRes.data.data.serviceArea || "",
      location: profileRes.data.data.location || ""
    });
    setServices(servicesRes.data.data);
    setBookings(bookingsRes.data.data);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleProfileSave(event) {
    event.preventDefault();
    const { data } = await api.put("/vendors/profile", profile);
    updateAccount(data.data);
  }

  async function handleServiceSave(event) {
    event.preventDefault();
    if (editingId) {
      await api.put(`/vendors/services/${editingId}`, serviceForm);
    } else {
      await api.post("/vendors/services", serviceForm);
    }
    setServiceForm(serviceInitial);
    setEditingId("");
    await loadDashboard();
  }

  async function handleDeleteService(id) {
    await api.delete(`/vendors/services/${id}`);
    await loadDashboard();
  }

  async function handleStatusUpdate(id, status) {
    await api.put(`/vendors/bookings/${id}/status`, { status });
    await loadDashboard();
  }

  return (
    <div className="container page-stack">
      <section className="card">
        <h2>Vendor Dashboard</h2>
        <form className="form" onSubmit={handleProfileSave}>
          <input value={profile.businessName} onChange={(e) => setProfile({ ...profile, businessName: e.target.value })} />
          <input value={profile.ownerName} onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })} />
          <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          <input value={profile.businessAddress} onChange={(e) => setProfile({ ...profile, businessAddress: e.target.value })} />
          <input value={profile.serviceCategory} onChange={(e) => setProfile({ ...profile, serviceCategory: e.target.value })} />
          <input value={profile.gstNumber} onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })} />
          <input value={profile.serviceArea} onChange={(e) => setProfile({ ...profile, serviceArea: e.target.value })} />
          <input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
          <button className="btn primary">Save Vendor Profile</button>
        </form>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <h3>{editingId ? "Edit Service" : "Add Service"}</h3>
          <form className="form" onSubmit={handleServiceSave}>
            <input placeholder="Title" value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} />
            <textarea placeholder="Description" value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} />
            <input placeholder="Category" value={serviceForm.category} onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} />
            <input placeholder="Price" type="number" value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} />
            <input placeholder="Image URL" value={serviceForm.image} onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })} />
            <select value={String(serviceForm.availability)} onChange={(e) => setServiceForm({ ...serviceForm, availability: e.target.value === "true" })}>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
            <button className="btn primary">{editingId ? "Update Service" : "Create Service"}</button>
          </form>
        </div>

        <div className="card">
          <h3>My Services</h3>
          <div className="stack-list">
            {services.map((service) => (
              <div className="list-row" key={service._id}>
                <div>
                  <strong>{service.title}</strong>
                  <p className="muted">{service.category} • Rs. {service.price}</p>
                </div>
                <div className="row-actions">
                  <button
                    className="btn secondary small"
                    onClick={() => {
                      setEditingId(service._id);
                      setServiceForm({
                        title: service.title,
                        description: service.description,
                        category: service.category,
                        price: service.price,
                        image: service.image,
                        availability: service.availability
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn danger small" onClick={() => handleDeleteService(service._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h3>Incoming Bookings</h3>
        <div className="stack-list">
          {bookings.map((booking) => (
            <div className="list-row" key={booking._id}>
              <div>
                <strong>{booking.service?.title}</strong>
                <p className="muted">{booking.user?.fullName} • {booking.timeSlot}</p>
              </div>
              <select value={booking.status} onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>
          ))}
          {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
        </div>
      </section>
    </div>
  );
}
