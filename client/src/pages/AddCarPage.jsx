import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createCar } from "../services/api";
 import { POPULAR_MAKES, getModelsByMakeAndYear } from "../services/catalogApi";

export default function AddCarPage() {
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const [formData, setFormData] = useState({
        make: "",
        model: "",
        year: String(currentYear),
        price: "",
    });
    const [catalogModels, setCatalogModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        async function loadModels() {
            if (!formData.make) {
                setCatalogModels([]);
                return;
            }
            setLoadingModels(true);
            try {
                const list = await getModelsByMakeAndYear(formData.make, formData.year);
                if (active) {
                    setCatalogModels(list);
                }
            } catch {
                if (active) {
                    setCatalogModels([]);
                }
            } finally {
                if (active) {
                    setLoadingModels(false);
                }
            }
        }
        loadModels();
        return () => {
            active = false;
        };
    }, [formData.make, formData.year]);

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

            await createCar(payload);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="form-panel">
            <h2>Add Car</h2>
            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit} className="garage-form">
                <div className="field">
                    <label htmlFor="year">Year</label>
                    <input
                        id="year"
                        name="year"
                        type="number"
                        min="1886"
                        max={currentYear + 1}
                        value={formData.year}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="make">Make</label>
                    <select
                        id="make"
                        name="make"
                        value={formData.make}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a make</option>
                        {POPULAR_MAKES.map((makeName) => (
                            <option key={makeName} value={makeName}>
                                {makeName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="field">
                    <label htmlFor="model">Model</label>
                    {catalogModels.length > 0 ? (
                        <select
                            id="model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            disabled={loadingModels}
                            required
                        >
                            <option value="">
                                {loadingModels ? "Loading models..." : "Select a model"}
                            </option>
                            {catalogModels.map((modelName) => (
                                <option key={modelName} value={modelName}>
                                    {modelName}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            id="model"
                            name="model"
                            type="text"
                            placeholder={
                                loadingModels ? "Loading models..." : "Enter model (e.g. Cherokee)"
                            }
                            value={formData.model}
                            onChange={handleChange}
                            required
                        />
                    )}
                </div>

                <div className="field">
                    <label htmlFor="price">Price ($)</label>
                    <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="any"
                        placeholder="e.g. 28500"
                        value={formData.price}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Car"}
                </button>
            </form>
        </section>
    );
}