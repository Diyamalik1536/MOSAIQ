
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../../../../config/firebase";
import { useUser } from "../../../../context/UserContext";
import "./MentorSignup.css";

export default function MentorSignup() {
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const form = new FormData(event.currentTarget);

    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    setError("");

    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    let createdUser = null;

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      createdUser = result.user;

      await updateProfile(createdUser, {
        displayName: name
      });

      await setDoc(doc(db, "users", createdUser.uid), {
        uid: createdUser.uid,
  name,
  fullName: name,
  email,
  role: "mentor",
  status: "pending",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});
      setCurrentUser({
        ...createdUser,
        displayName: name,
        name,
        fullName: name,
        role: "mentor"
      });

      navigate("/mentor/dashboard", { replace: true });

    } catch (err) {
      console.error("Mentor registration error:", err);

      // If Firestore profile creation fails, remove the newly
      // created authentication account to avoid an incomplete account.
      if (createdUser) {
        try {
          await deleteUser(createdUser);
        } catch (deleteError) {
          console.error("Account cleanup error:", deleteError);
        }

        setCurrentUser(null);
      }

      const code = err?.code || "";

      if (code === "auth/email-already-in-use") {
        setError("An account with this email already exists. Please sign in.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/weak-password") {
        setError("Please choose a stronger password.");
      } else if (
        code === "permission-denied" ||
        code === "firestore/permission-denied"
      ) {
        setError(
          "Unable to save your mentor profile. Please contact the administrator."
        );
      } else {
        setError(err?.message || "Registration failed. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mentor-signup-page">
      <section className="mentor-signup-card">

        <div className="mentor-signup-brand">
          <div className="mentor-signup-logo">TF</div>
          <span>MOSAIQ</span>
        </div>

        <div className="mentor-signup-heading">
          <p className="mentor-signup-eyebrow">MENTOR PORTAL</p>
          <h1>Join as a Mentor</h1>
          <p>
            Create your account and start guiding the next generation
            of talent.
          </p>
        </div>

        <form className="mentor-signup-form" onSubmit={handleSubmit}>

          <div className="mentor-signup-field">
            <label htmlFor="mentor-name">Full name</label>
            <input
              id="mentor-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="mentor-signup-field">
            <label htmlFor="mentor-signup-email">Email address</label>
            <input
              id="mentor-signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="mentor-signup-field">
            <label htmlFor="mentor-signup-password">Password</label>
            <input
              id="mentor-signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              minLength={6}
              required
            />
          </div>

          <div className="mentor-signup-field">
            <label htmlFor="mentor-confirm-password">
              Confirm password
            </label>
            <input
              id="mentor-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="mentor-signup-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="mentor-signup-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Mentor Account"}
          </button>

        </form>

        <div className="mentor-signup-footer">
          <span>Already have an account?</span>
          <Link to="/mentor/login">Sign in</Link>
        </div>

        <p className="mentor-signup-bottom">
          MOSAIQ · EMPOWERING THE NEXT GENERATION
        </p>

      </section>
    </main>
  );
}
