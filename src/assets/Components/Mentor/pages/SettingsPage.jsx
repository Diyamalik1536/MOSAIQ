import { notificationSettings } from "../data/dashboardData";
import { ActionButton, SectionHeading } from "../components/shared";

function SettingsPage({ preferences, onPreferencesChange, onNotify }) {
    return (
        <>
            <SectionHeading eyebrow="PREFERENCES" title="Settings" description="Manage your mentor account and notification preferences." action={<ActionButton onClick={() => onNotify("Your preferences have been saved.")}>Save changes</ActionButton>} />
            <section className="surface-card feature-card settings-card">
                <div className="card-heading"><div><h2>Notifications</h2><p>Choose which updates you’d like to receive</p></div></div>
                {notificationSettings.map(([key, title, description]) => (
                    <label className="setting-row" key={key}>
                        <span><strong>{title}</strong><small>{description}</small></span>
                        <input type="checkbox" checked={preferences[key]} onChange={(event) => onPreferencesChange((current) => ({ ...current, [key]: event.target.checked }))} />
                    </label>
                ))}
            </section>
        </>
    );
}

export default SettingsPage;
