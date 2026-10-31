import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../../config/firebase";
import { useUser } from "../../../../context/UserContext";
import LoginPresentation from "../Login/LoginPresentation";

export default function RecruiterLogin() {
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function authenticateWithGoogle(remember) {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
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
      setError(err?.message || "Unable to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event, remember) {
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

  return (
    <LoginPresentation
      role="recruiter"
      heading="Welcome Back!"
      subtitle="Sign in to discover and shortlist student talent."
      emailLabel="Work email"
      emailPlaceholder="you@company.com"
      passwordLabel="Password"
      passwordPlaceholder="Enter your password"
      submitLabel="Sign in as recruiter"
      loadingLabel="Signing in..."
      signupPrompt="New to MOSAIQ?"
      signupLabel="Create a Recruiter Account"
      signupPath="/recruiter/signup"
      rememberDefault
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      onGoogleLogin={authenticateWithGoogle}
    />
  );
}
