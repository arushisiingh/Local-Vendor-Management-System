import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      setLoading(true);
      const { data } = await api.get("/services", { params: search ? { search } : {} });
      setServices(data.data);
      setLoading(false);
    }

    loadServices();
  }, [search]);

  return (
    <div className="container page-stack">
      <div className="section-header">
        <div>
          <h2>Available Services</h2>
          <p>Browse live services stored in MongoDB.</p>
        </div>
        <input className="search-input" placeholder="Search services" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p>Loading services...</p>
      ) : (
        <div className="grid services-grid">
          {services.map((service) => (
            <article className="card" key={service._id}>
              {(service.images?.[0] || service.image) && <img className="card-image" src={service.images?.[0] || service.image} alt={service.title} />}
              <p>{service.description}</p>
              <p className="muted">{service.vendor?.businessName} • {service.category}</p>
              <strong>Rs. {service.price}</strong>
              <Link className="btn primary" to={`/services/${service._id}`}>View Service</Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
