import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../../config/firebase";
import { useUser } from "../../../../context/UserContext";
import "./RecruiterLogin.css";

export default function RecruiterLogin() {
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
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const roleDoc = await getDoc(doc(db, "users", result.user.uid));
      if (!roleDoc.exists() || roleDoc.data()?.role !== "recruiter") {
        await signOut(auth);
        setCurrentUser(null);
        setError("This account is not authorized as a recruiter. Contact your administrator.");
        return;
      }
      setCurrentUser({ ...result.user, role: "recruiter" });
      navigate("/recruiter/dashboard", { replace: true });
    } catch (err) {
      const code = err?.code || "";
      setError(code.includes("invalid-credential") || code.includes("user-not-found") || code.includes("wrong-password")
        ? "Invalid email or password."
        : (err?.message || "Unable to sign in. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return <main className="recruiter-login-page">
    <section className="recruiter-login-card">
      <div className="recruiter-login-mark" aria-hidden="true">TF</div>
      <p className="recruiter-eyebrow">TALENTFORGE · RECRUITER PORTAL</p>
      <h1>Welcome back</h1>
      <p className="recruiter-login-intro">Sign in to discover and shortlist student talent.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="recruiter-email">Work email</label>
        <input id="recruiter-email" name="email" type="email" autoComplete="username" placeholder="you@company.com" required />
        <label htmlFor="recruiter-password">Password</label>
        <input id="recruiter-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
        <label className="recruiter-remember"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Keep me signed in</label>
        {error && <p className="recruiter-login-error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in as recruiter"}</button>
      </form>
      <p className="recruiter-login-footer">
  New to TalentForge?{" "}
  <Link to="/recruiter/signup">Create a Recruiter Account</Link>
</p>
    </section>
  </main>;
}
