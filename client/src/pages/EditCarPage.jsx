import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCarById, updateCar } from "../services/api";

export default function EditCarPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        make: "",
        model: "",
        year: "",
        price: "",
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        async function loadCar() {
            try {
                const car = await getCarById(id);
                if (active) {
                    setFormData({
                        make: car.make || "",
                        model: car.model || "",
                        year: car.year ?? "",
                        price: car.price ?? "",
                    });
                }
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        }
        loadCar();
        return () => {
            active = false;
        };
    }, [id]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                make: formData.make.trim(),
                model: formData.model.trim(),
                year: Number(formData.year),
            };
            if (formData.price !== "") {
                payload.price = Number(formData.price);
            }

            await updateCar(id, payload);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <p className="status-msg">Loading vehicle...</p>;
    if (error) return <div className="error-box">{error}</div>;

    return (
        <section className="form-panel">
            <h2>Edit Car</h2>
            <form onSubmit={handleSubmit} className="garage-form">
                <div className="field">
                    <label htmlFor="make">Make</label>
                    <input
                        id="make"
                        name="make"
                        type="text"
                        value={formData.make}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="model">Model</label>
                    <input
                        id="model"
                        name="model"
                        type="text"
                        value={formData.model}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="year">Year</label>
                    <input
                        id="year"
                        name="year"
                        type="number"
                        min="1886"
                        max={new Date().getFullYear() + 1}
                        value={formData.year}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="price">Price ($)</label>
                    <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="any"
                        value={formData.price}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Updating..." : "Update Car"}
                </button>
            </form>
        </section>
    );
}