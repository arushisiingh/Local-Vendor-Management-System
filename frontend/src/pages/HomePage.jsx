import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="container hero">
      <div>
        <p className="eyebrow">React + Express + MongoDB</p>
        <h1>Book trusted services and manage vendors in one platform.</h1>
        <p className="lead">
          Users can browse services and place bookings. Vendors can publish services and manage incoming bookings.
        </p>
        <div className="hero-actions">
          <Link className="btn primary" to="/services">Browse Services</Link>
          <Link className="btn secondary" to="/auth">Get Started</Link>
        </div>
      </div>
      <div className="hero-card">
        <div className="metric"><strong>JWT</strong><span>Authentication</span></div>
        <div className="metric"><strong>MVC</strong><span>Backend structure</span></div>
        <div className="metric"><strong>MongoDB</strong><span>Persistent storage</span></div>
      </div>
    </div>
  );
}
