import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  signOut,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./Login.css";
import { auth } from "../../../../config/firebase";
import background from "../../../Background_image.png";
import { useUser } from "../../../../context/UserContext";
import LanguageSelector from "../../../../components/LanguageSelector";

function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [show, setshow] = useState(false);
    const a = new GoogleAuthProvider();
    const [check, setcheck] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setCurrentUser } = useUser();

    async function applyPersistence() {
        await setPersistence(
            auth,
            check ? browserLocalPersistence : browserSessionPersistence,
        );
    }

    async function google() {
        if (loading) {
            return;
        }

        try {
            setLoading(true);
            await applyPersistence();

            const pop = await signInWithPopup(auth, a);
            const user = pop.user;

            const email = user?.email ? user.email.trim().toLowerCase() : "";
            if (!email || !email.endsWith("@chitkara.edu.in")) {
                await signOut(auth);
                setCurrentUser(null);
                window.alert(t("auth.errorChitkaraEmail", "Access denied. Please sign in with your Chitkara University student email (@chitkara.edu.in)."));
                return;
            }

            setCurrentUser(user);
            window.alert(t("auth.googleLoginSuccess", "Successfully logged in with Google"));
            navigate("/dashboard", { replace: true });
        }
        catch (error) {
            console.log(error);
            window.alert(error.message || t("auth.errorGeneral", "Something went wrong. Please try again."));
        }
        finally {
            setLoading(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "");

        if (loading) return;

        try {
            setLoading(true);
            await applyPersistence();

            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = result.user;
            if (!user.email?.toLowerCase().endsWith("@chitkara.edu.in")) {
                await signOut(auth);
                setCurrentUser(null);
                window.alert(t("auth.errorChitkaraEmail", "Please use your Chitkara University student email."));
                return;
            }
            setCurrentUser(user);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            const code = error?.code || "";

            if (
                code.includes("user-not-found") ||
                code.includes("wrong-password") ||
                code.includes("invalid-credential")
            ) {
                window.alert(t("auth.errorInvalidCredentials", "Invalid email or password."));
            } else {
                console.error("Login failed:", error);
                window.alert(error.message || t("auth.errorGeneral", "Login failed. Please try again."));
            }
        } finally {
            setLoading(false);
        }
    }

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
                    <div className="mobile-brand-logo">
                        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="TalentForge Logo" />
                        <span>TalentForge</span>
                    </div>
                    <LanguageSelector />
                </div>

                <div className="desktop-lang-wrapper">
                    <LanguageSelector />
                </div>

                <div className="head">
                    <h1>{t("auth.welcomeBack", "Welcome Back!")}</h1>
                    <p><b>{t("auth.loginSubtitle", "Login to continue to TalentForge")}</b></p>
                </div>



                <div className="input">
                    <form className="form-sign" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="login-email">{t("auth.emailLabel", "Email Address")}</label>
                            <div className="input-wrapper">
                                <i className="bi bi-envelope input-icon" aria-hidden="true"></i>
                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    placeholder={t("auth.emailPlaceholder", "Enter your college email")}
                                    required
                                    
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="login-password">{t("auth.passwordLabel", "Password")}</label>
                            <div className="input-wrapper">
                                <i className="bi bi-lock input-icon" aria-hidden="true"></i>
                                <input
                                    id="login-password"
                                    name="password"
                                    type={show ? "text" : "password"}
                                    placeholder={t("auth.passwordPlaceholder", "Enter your password")}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={() => setshow(!show)}
                                    aria-label={show ? "Hide password" : "Show password"}
                                >
                                    <i className={show ? "bi bi-eye" : "bi bi-eye-slash"}></i>
                                </button>
                            </div>
                        </div>

                        <div className="form-options-row">
                            <label className="remember-label">
                                <input
                                    type="checkbox"
                                    className="checkbox-input"
                                    checked={check}
                                    onChange={() => setcheck(!check)}
                                />
                                <span>{t("auth.rememberMe", "Remember me")}</span>
                            </label>

                            <button type="button" className="forgot-password-btn">
                                {t("auth.forgotPassword", "Forgot Password?")}
                            </button>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? t("auth.loggingIn", "Logging in...") : t("auth.loginButton", "Login")}
                        </button>

                        <div className="divider">
                            <span>{t("auth.orContinueWith", "or continue with")}</span>
                        </div>

                        <button
                            type="button"
                            className="google"
                            onClick={google}
                            disabled={loading}
                        >
                            <i className="bi bi-google"></i>
                            {loading ? t("auth.signingIn", "Signing in...") : t("auth.continueWithGoogle", "Continue with Google")}
                        </button>

                        <p className="signup">
                            {t("auth.noAccount", "Don't have an account?")}{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/signup")}
                            >
                                {t("auth.signUpLink", "Sign up")}
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
