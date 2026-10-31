import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./ConnectionsSection.css";

function ConnectionsSection({ connections, onAdd, onDelete }) {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        name: "",
        role: "",
        email: ""
    });

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (!form.name || !form.role) {
            return;
        }

        onAdd({
            id: Date.now(),
            name: form.name,
            role: form.role,
            email: form.email
        });

        setForm({
            name: "",
            role: "",
            email: ""
        });
    }

    return (
        <section className="connections-section">
            <div className="connections-header">
                <div>
                    <h2>{t("profile.connectionsSection.title", "Connections")}</h2>
                    <p>{t("profile.connectionsSection.subtitle", "People you're connected with")}</p>
                </div>

                <div className="connections-header-icon">
                    <i className="bi bi-people-fill"></i>
                </div>
            </div>

            <form
                className="connections-form"
                onSubmit={handleSubmit}
            >
                <div className="connections-form-row">
                    <div className="connections-field">
                        <label>{t("profile.connectionsSection.nameLabel", "Name")}</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            placeholder={t("profile.connectionsSection.namePlaceholder", "Student name")}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="connections-field">
                        <label>{t("profile.connectionsSection.roleLabel", "Role")}</label>
                        <input
                            type="text"
                            name="role"
                            value={form.role}
                            placeholder={t("profile.connectionsSection.rolePlaceholder", "Frontend Developer")}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="connections-field">
                    <label>{t("profile.connectionsSection.emailLabel", "Email (optional)")}</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        placeholder={t("profile.connectionsSection.emailPlaceholder", "student@chitkara.edu.in")}
                        onChange={handleChange}
                    />
                </div>

                <button
                    className="connections-add-button"
                    type="submit"
                >
                    <i className="bi bi-person-plus"></i>
                    {t("profile.connectionsSection.addButton", "Add Connection")}
                </button>
            </form>

            <div className="connections-list">
                {connections.length > 0 ? (
                    connections.map(connection => (
                        <article
                            className="connection-card"
                            key={connection.id}
                        >
                            <div className="connection-avatar">
                                {(connection.name || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div className="connection-content">
                                <div className="connection-top">
                                    <div>
                                        <h3>{connection.name}</h3>
                                        <p>{connection.role}</p>
                                    </div>

                                    <button
                                        className="connection-delete"
                                        onClick={() =>
                                            onDelete(connection.id)
                                        }
                                        aria-label="Delete connection"
                                    >
                                        <i className="bi bi-trash3"></i>
                                    </button>
                                </div>

                                {connection.email && (
                                    <span className="connection-email">
                                        <i className="bi bi-envelope"></i>
                                        {connection.email}
                                    </span>
                                )}
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="connections-empty">
                        <i className="bi bi-people"></i>
                        <h3>{t("profile.connectionsSection.emptyTitle", "No connections yet")}</h3>
                        <p>
                            {t("profile.connectionsSection.emptySubtitle", "Connect with other students across campus to collaborate.")}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default ConnectionsSection;
