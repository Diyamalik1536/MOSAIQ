
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "../../../../config/firebase";
import "./Signup.css";
import { useUser } from "../../../../context/UserContext";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../../../components/LanguageSelector";

function SignupForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate Chitkara student email in JavaScript, not HTML pattern.
  const isValidChitkaraEmail = (value) => {
    const cleanEmail = value.trim().toLowerCase();
    return /^[a-z]+[0-9]{4}\.[a-z]+(23|24|25|26)@chitkara\.edu\.in$/.test(
      cleanEmail
    );
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setEmailError("");

    if (!email.trim() || !password || !confirmPassword) {
      setError(t("auth.errorAllFields", "All fields are required."));
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidChitkaraEmail(cleanEmail)) {
      setEmailError(
        t(
          "auth.errorChitkaraEmail",
          "Please use your valid Chitkara University student email."
        )
      );
      return;
    }

    if (password.length < 6) {
      setError(
        t("auth.errorWeakPassword", "Password must be at least 6 characters.")
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        t("auth.errorPasswordsMismatch", "Passwords do not match.")
      );
      return;
    }

    try {
      setLoading(true);

      const result = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      await sendEmailVerification(result.user);

      setCurrentUser(null);
      await signOut(auth);

      navigate("/login", {
        replace: true,
        state: {
          message: t(
            "auth.accountCreatedNotice",
            "Account created! Check your college inbox and click the verification link before logging in."
          ),
        },
      });
    } catch (err) {
      const code = err?.code || "";

      if (code.includes("email-already-in-use")) {
        setError(
          t(
            "auth.errorEmailInUse",
            "This email is already registered. Try logging in instead."
          )
        );
      } else if (code.includes("weak-password")) {
        setError(
          t(
            "auth.errorWeakPassword",
            "Password is too weak. Use at least 6 characters."
          )
        );
      } else {
        setError(
          err?.message ||
            t("auth.errorGeneral", "Signup failed. Please try again.")
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "8px",
        }}
      >
        <LanguageSelector />
      </div>

      <h2>{t("auth.createAccount", "Create Account")}</h2>
      <p>{t("auth.signupSubtitle", "Sign up to get started with MOSAIQ")}</p>

      {error && (
        <div className="signup-error" role="alert">
          <i className="bi bi-exclamation-circle-fill"></i>
          <span>{error}</span>
        </div>
      )}

      <label htmlFor="signup-email">
        {t("auth.emailLabel", "Email Address")}
      </label>
      <input
        id="signup-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder={t("auth.emailPlaceholder", "Enter your college email")}
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setEmailError("");
          setError("");
        }}
        required
      />

      {emailError && (
        <div className="signup-error" role="alert">
          <i className="bi bi-exclamation-circle-fill"></i>
          <span>{emailError}</span>
        </div>
      )}

      <div className="form-field">
        <label htmlFor="password">
          {t("auth.passwordLabel", "Password")}
        </label>
        <div className="password-input-wrapper">
          <i className="bi bi-lock password-lock"></i>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t(
              "auth.createPasswordPlaceholder",
              "Create a password"
            )}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            required
            minLength={6}
          />
          <button
            type="button"
            className="password-eye"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i
              className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
            ></i>
          </button>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="confirmPassword">
          {t("auth.confirmPasswordLabel", "Confirm Password")}
        </label>
        <div className="password-input-wrapper">
          <i className="bi bi-lock password-lock"></i>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t(
              "auth.confirmPasswordPlaceholder",
              "Confirm your password"
            )}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setError("");
            }}
            required
            minLength={6}
          />
          <button
            type="button"
            className="password-eye"
            onClick={() =>
              setShowConfirmPassword((visible) => !visible)
            }
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            <i
              className={
                showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"
              }
            ></i>
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading}>
        {loading
          ? t("auth.creatingAccount", "Creating account...")
          : t("auth.signUpButton", "Sign Up")}
      </button>

      <p className="signup-login">
        {t("auth.alreadyHaveAccount", "Already have an account?")}{" "}
        <button type="button" onClick={() => navigate("/login")}>
          {t("auth.logInLink", "Log in")}
        </button>
      </p>
    </form>
  );
}

export default SignupForm;
