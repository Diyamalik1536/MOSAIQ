
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { useTranslation } from "react-i18next";
import "./UpgradeCard.css";

function UpgradeCard() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isPro, openUpgradeModal } = useUser();

    const renderAnimatedButton = (label, onClick) => (
        <button
            type="button"
            className="upgrade-button"
            onClick={onClick}
        >
            <span
                className="upgrade-button__spark"
                aria-hidden="true"
            />
            <span
                className="upgrade-button__backdrop"
                aria-hidden="true"
            />

            <svg
                className="upgrade-button__icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3z"
                    fill="currentColor"
                />
            </svg>

            <span className="upgrade-button__text">
                {label}
            </span>

            <i
                className="bi bi-arrow-right"
                aria-hidden="true"
            />

            <span
                className="upgrade-button__particles"
                aria-hidden="true"
            >
                {Array.from({ length: 8 }, (_, index) => (
                    <svg
                        key={index}
                        className={`upgrade-button__particle particle-${index + 1}`}
                        viewBox="0 0 15 15"
                    >
                        <path d="M7.5 0.8 9.2 5.8 14.2 7.5 9.2 9.2 7.5 14.2 5.8 9.2 0.8 7.5 5.8 5.8Z" />
                    </svg>
                ))}
            </span>
        </button>
    );

    if (isPro) {
        return (
            <div className="upgrade-card pro-active-card">
                <div className="upgrade-icon pro-active-icon">
                    <i className="bi bi-crown-fill" />
                </div>

                <div className="upgrade-content">
                    <div className="pro-card-title-row">
                        <h3>MOSAIQ Pro</h3>
                        <span className="pro-active-tag">
                            {t("nav.proActive", "ACTIVE")}
                        </span>
                    </div>

                    <p>
                        {t(
                            "nav.upgradeCardProDesc",
                            "Your Pro membership is active. Enjoy unlimited connections, advanced filters, and AI tools."
                        )}
                    </p>

                    {renderAnimatedButton(
                        t("nav.managePro", "Manage Pro"),
                        () => navigate("/manage-plan")
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="upgrade-card">
            <div className="upgrade-icon">
                <i className="bi bi-stars" />
            </div>

            <div className="upgrade-content">
                <h3>{t("nav.upgradeToPro", "Upgrade to Pro")}</h3>

                <p>
                    {t(
                        "nav.upgradeCardDesc",
                        "Unlock premium features and take your campus collaboration to the next level."
                    )}
                </p>

                {renderAnimatedButton(
                    t("nav.upgradeNow", "Upgrade Now"),
                    () => openUpgradeModal()
                )}
            </div>
        </div>
    );
}

export default UpgradeCard;
