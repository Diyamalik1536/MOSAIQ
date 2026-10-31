import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./Login.css";
import background from "../../../Background_image.png";
import LanguageSelector from "../../../../components/LanguageSelector";

function LoginPresentation({
    role,
    heading,
    subtitle,
    emailLabel,
    emailPlaceholder,
    passwordLabel,
    passwordPlaceholder,
    submitLabel,
    loadingLabel,
    signupPrompt,
    signupLabel,
    signupPath,
    rememberDefault = false,
    loading,
    error,
    onSubmit,
    onGoogleLogin
}) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(rememberDefault);

    return (
        <div className="data">
            <div className="card">
                <img src={background} alt="" />
                <div className="card-content">
                    <h1>{t("auth.brandHero1", "Your Campus.")}</h1>
                    <h1>{t("auth.brandHero2", "Your People.")}</h1>
                    <h1>{t("auth.brandHero3", "Your Opportunities.")}</h1>

                    <div className="card-description">
                        <p><i>{t("auth.brandHeroSubtitle1", "Connect, collaborate and create")}</i></p>
                        <p><i>{t("auth.brandHeroSubtitle2", "amazing things together.")}</i></p>
                    </div>

                    <div className="feature">
                        <div className="feature-title">
                            <i className="bi bi-people-fill"></i>
                            <span>{t("auth.featureConnect", "Connect with students")}</span>
                        </div>
                    </div>

                    <div className="feature">
                        <div className="feature-title">
                            <i className="bi bi-suitcase-lg-fill"></i>
                            <span>{t("auth.featureBuild", "Build & share projects")}</span>
                        </div>
                    </div>

                    <div className="feature">
                        <div className="feature-title">
                            <i className="bi bi-search"></i>
                            <span>{t("auth.featureExplore", "Explore Opportunities")}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-box">
                <div className="mobile-brand-header">
                    <Link to="/roles" className="mobile-brand-logo" aria-label="MOSAIQ roles portal">
                        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="MOSAIQ logo" />
                        <span>MOSAIQ</span>
                    </Link>
                    <LanguageSelector />
                </div>

                <div className="desktop-lang-wrapper">
                    <LanguageSelector />
                </div>

                <div className="head">
                    <h1>{heading}</h1>
                    <p><b>{subtitle}</b></p>
                </div>

                <div className="input">
                    <form
                        className="form-sign"
                        onSubmit={(event) => onSubmit(event, remember)}
                    >
                        <div className="form-group">
                            <label htmlFor={`${role}-login-email`}>{emailLabel}</label>
                            <div className="input-wrapper">
                                <i className="bi bi-envelope input-icon" aria-hidden="true"></i>
                                <input
                                    id={`${role}-login-email`}
                                    name="email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder={emailPlaceholder}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor={`${role}-login-password`}>{passwordLabel}</label>
                            <div className="input-wrapper">
                                <i className="bi bi-lock input-icon" aria-hidden="true"></i>
                                <input
                                    id={`${role}-login-password`}
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder={passwordPlaceholder}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={() => setShowPassword((shown) => !shown)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <i className={showPassword ? "bi bi-eye" : "bi bi-eye-slash"}></i>
                                </button>
                            </div>
                        </div>

                        <div className="form-options-row">
                            <label className="remember-label">
                                <input
                                    type="checkbox"
                                    className="checkbox-input"
                                    checked={remember}
                                    onChange={(event) => setRemember(event.target.checked)}
                                />
                                <span>{t("auth.rememberMe", "Remember me")}</span>
                            </label>

                            <button type="button" className="forgot-password-btn">
                                {t("auth.forgotPassword", "Forgot Password?")}
                            </button>
                        </div>

                        {error && <p className="login-error" role="alert">{error}</p>}

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? loadingLabel : submitLabel}
                        </button>

                        <div className="divider">
                            <span>{t("auth.orContinueWith", "or continue with")}</span>
                        </div>

                        <button
                            type="button"
                            className="google"
                            onClick={() => onGoogleLogin(remember)}
                            disabled={loading}
                        >
                            <i className="bi bi-google"></i>
                            {loading
                                ? t("auth.signingIn", "Signing in...")
                                : t("auth.continueWithGoogle", "Continue with Google")}
                        </button>

                        <p className="signup">
                            {signupPrompt}{" "}
                            <Link to={signupPath}>{signupLabel}</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPresentation;
