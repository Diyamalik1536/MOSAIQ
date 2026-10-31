
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../../config/firebase";
import { useUser } from "../../../../context/UserContext";
import "./MentorLogin.css";

export default function MentorLogin() {
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();

  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    setError("");
    setLoading(true);

    try {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );

      const result = await signInWithEmailAndPassword(auth, email, password);
      const roleDoc = await getDoc(doc(db, "users", result.user.uid));

      if (!roleDoc.exists() || roleDoc.data()?.role !== "mentor") {
        await signOut(auth);
        setCurrentUser(null);
        setError(
          "This account is not registered as a mentor. Please contact your administrator."
        );
        return;
      }

      setCurrentUser({ ...result.user, role: "mentor" });
      navigate("/mentor/dashboard", { replace: true });

    } catch (err) {
      const code = err?.code || "";

      setError(
        code.includes("invalid-credential") ||
        code.includes("user-not-found") ||
        code.includes("wrong-password")
          ? "Invalid email or password."
          : err?.message || "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mentor-login-page">
      <section className="mentor-login-card">

        <div className="mentor-login-brand">
          <div className="mentor-login-logo">TF</div>
          <span>TalentForge</span>
        </div>

        <div className="mentor-login-heading">
          <p className="mentor-login-eyebrow">MENTOR PORTAL</p>
          <h1>Welcome back, Mentor</h1>
          <p>
            Sign in to guide students, review projects and track their progress.
          </p>
        </div>

        <form className="mentor-login-form" onSubmit={handleSubmit}>
          <div className="mentor-login-field">
            <label htmlFor="mentor-email">Email address</label>
            <input
              id="mentor-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="mentor-login-field">
            <label htmlFor="mentor-password">Password</label>
            <input
              id="mentor-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
          </div>

          <label className="mentor-login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Keep me signed in</span>
          </label>

          {error && (
            <p className="mentor-login-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="mentor-login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in to Mentor Portal"}
          </button>
        </form>

        <div className="mentor-login-footer">
            <span>New to TalentForge?</span>
            <Link to="/mentor/signup">Create a Mentor Account</Link>
        </div>

        <p className="mentor-login-bottom">
          TALENTFORGE · EMPOWERING THE NEXT GENERATION
        </p>

      </section>
    </main>
  );
}
