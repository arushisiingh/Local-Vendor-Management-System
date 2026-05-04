import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const { role } = useAuth();
  const [service, setService] = useState(null);
  const [form, setForm] = useState({ bookingDate: "", timeSlot: "", notes: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadService() {
      const { data } = await api.get(`/services/${id}`);
      setService(data.data);
    }

    loadService();
  }, [id]);

  async function handleBooking(event) {
    event.preventDefault();
    try {
      await api.post("/users/bookings", { serviceId: id, ...form });
      setMessage("Booking created successfully.");
      setForm({ bookingDate: "", timeSlot: "", notes: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  }

  if (!service) return <div className="container"><p>Loading service...</p></div>;

  return (
    <div className="container details-layout page-stack">
      <section className="card">
        {service.image && <img className="details-image" src={service.image} alt={service.title} />}
        <h2>{service.title}</h2>
        <p>{service.description}</p>
        <p className="muted">{service.vendor?.businessName} • {service.vendor?.location || service.vendor?.businessAddress}</p>
        <p><strong>Rs. {service.price}</strong></p>
      </section>

      <section className="card">
        <h3>Book This Service</h3>
        {message && <p className="info-banner">{message}</p>}
        {role !== "user" ? (
          <p className="muted">Login as a user to place a booking.</p>
        ) : (
          <form className="form" onSubmit={handleBooking}>
            <input type="date" value={form.bookingDate} onChange={(e) => setForm({ ...form, bookingDate: e.target.value })} />
            <input placeholder="Time slot" value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })} />
            <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="btn primary">Book Now</button>
          </form>
        )}
      </section>
    </div>
  );
}
