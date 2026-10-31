import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../context/UserContext";
import "./NotFound.css";

function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const homePath = currentUser ? "/dashboard" : "/";
  const homeLabel = currentUser
    ? t("notFound.goToDashboard", "Go to Dashboard")
    : t("notFound.backToHome", "Back to Home");

  return (
    <div className="tf-not-found-page">
      <div className="tf-not-found-container">
        {/* Glow backdrop decorative halo */}
        <div className="tf-not-found-glow" aria-hidden="true" />

        <div className="tf-not-found-content">
          {/* Status Chip */}
          <div className="tf-not-found-chip">
            <span className="tf-not-found-chip-dot" />
            <span>{t("notFound.status", "Error 404 • Page Not Found")}</span>
          </div>

          {/* Big Hero Number */}
          <div className="tf-not-found-hero">
            <span className="tf-not-found-digit">4</span>
            <div className="tf-not-found-orb">
              <i className="bi bi-compass" aria-hidden="true" />
            </div>
            <span className="tf-not-found-digit">4</span>
          </div>

          {/* Message */}
          <h1 className="tf-not-found-title">
            {t("notFound.heading", "Lost in the Talent Universe?")}
          </h1>
          <p className="tf-not-found-subtitle">
            {t(
              "notFound.description",
              "The page you're searching for might have been moved, deleted, or doesn't exist in our galaxy. Let's get you back on track."
            )}
          </p>

          {/* Actions */}
          <div className="tf-not-found-actions">
            <Link to={homePath} className="tf-not-found-btn primary">
              <i className={currentUser ? "bi bi-grid-fill" : "bi bi-house-door-fill"} />
              <span>{homeLabel}</span>
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="tf-not-found-btn secondary"
            >
              <i className="bi bi-arrow-left" />
              <span>{t("notFound.goBack", "Go Back")}</span>
            </button>
          </div>

          {/* Helpful Navigation Links */}
          <div className="tf-not-found-footer-links">
            <p className="tf-not-found-links-title">
              {t("notFound.helpfulLinks", "Helpful destinations:")}
            </p>
            <div className="tf-not-found-links-group">
              <Link to="/students" className="tf-not-found-link">
                <i className="bi bi-people" /> {t("notFound.students", "Students")}
              </Link>
              <span className="tf-not-found-divider">•</span>
              <Link to="/projects" className="tf-not-found-link">
                <i className="bi bi-folder" /> {t("notFound.projects", "Projects")}
              </Link>
              <span className="tf-not-found-divider">•</span>
              <Link to="/about" className="tf-not-found-link">
                <i className="bi bi-info-circle" /> {t("notFound.about", "About")}
              </Link>
              <span className="tf-not-found-divider">•</span>
              <Link to="/contact" className="tf-not-found-link">
                <i className="bi bi-envelope" /> {t("notFound.contact", "Contact")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
