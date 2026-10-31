import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  signOut
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../../config/firebase";
import { useUser } from "../../../../context/UserContext";
import "./RecruiterSignup.css";

export default function RecruiterSignup() {
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

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    let createdUser = null;

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      createdUser = result.user;

      await updateProfile(createdUser, { displayName: name });

      await setDoc(doc(db, "users", createdUser.uid), {
        uid: createdUser.uid,
        name,
        fullName: name,
        email,
        role: "recruiter",
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await signOut(auth);
      setCurrentUser(null);

      navigate("/recruiter/login", {
        replace: true,
        state: {
          message: "Account created successfully. Your recruiter account is pending approval."
        }
      });
    } catch (err) {
      if (createdUser && auth.currentUser?.uid === createdUser.uid) {
        try {
          await deleteUser(createdUser);
        } catch (deleteError) {
          console.error("Could not remove incomplete account:", deleteError);
        }
      }

      setError(
        err.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : err.message || "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="recruiter-signup-page">
      <section className="recruiter-signup-card">
        <div className="recruiter-signup-logo">TF</div>
        <p className="recruiter-signup-eyebrow">TALENTFORGE · RECRUITER PORTAL</p>
        <h1>Create Recruiter Account</h1>
        <p className="recruiter-signup-intro">
          Join TalentForge to discover and connect with talented students.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="recruiter-name">Full name</label>
          <input
            id="recruiter-name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />

          <label htmlFor="recruiter-signup-email">Work email</label>
          <input
            id="recruiter-signup-email"
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            required
          />

          <label htmlFor="recruiter-signup-password">Password</label>
          <input
            id="recruiter-signup-password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            required
            minLength={6}
          />

          <label htmlFor="recruiter-confirm-password">Confirm password</label>
          <input
            id="recruiter-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />

          {error && (
            <p className="recruiter-signup-error" role="alert">{error}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Recruiter Account"}
          </button>
        </form>

        <p className="recruiter-signup-footer">
          Already registered? <Link to="/recruiter/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}