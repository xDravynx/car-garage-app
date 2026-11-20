import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCars, deleteCar } from "../services/api";

export default function GaragePage() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function loadInventory() {
        setLoading(true);
        setError(null);
        try {
            const data = await getCars();
            setCars(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadInventory();
    }, []);

    async function handleDelete(id) {
        try {
            await deleteCar(id);
            setCars((prev) => prev.filter((car) => car._id !== id));
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) {
        return <p className="status-msg">Loading garage inventory...</p>;
    }

    if (error) {
        return (
            <div className="error-box">
                <p>Error: {error}</p>
                <button type="button" onClick={loadInventory} className="btn-secondary">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <section>
            <div className="section-header">
                <h2>Garage Inventory</h2>
                <span className="count-pill">{cars.length} Vehicles</span>
            </div>

            {cars.length === 0 ? (
                <div className="empty-box">
                    <p>No vehicles in the garage yet.</p>
                    <Link to="/add" className="btn-primary">
                        Add Car
                    </Link>
                </div>
            ) : (
                <div className="car-grid">
                    {cars.map((car) => (
                        <article key={car._id} className="car-card">
                            <div>
                                <span className="car-year">{car.year}</span>
                                <h3>
                                    {car.make} {car.model}
                                </h3>
                                {typeof car.price === "number" && (
                                    <p className="car-price">
                                        ${car.price.toLocaleString()}
                                    </p>
                                )}
                                <p className="car-date">
                                    Added {new Date(car.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="card-actions">
                                <Link to={`/edit/${car._id}`} className="btn-secondary">
                                    Edit
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(car._id)}
                                    className="btn-danger"
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}