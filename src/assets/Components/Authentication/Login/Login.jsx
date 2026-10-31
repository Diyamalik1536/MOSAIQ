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

import { auth } from "../../../../config/firebase";
import { useUser } from "../../../../context/UserContext";
import LoginPresentation from "./LoginPresentation";

function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const a = new GoogleAuthProvider();
    const [loading, setLoading] = useState(false);
    const { setCurrentUser } = useUser();

    async function applyPersistence(remember) {
        await setPersistence(
            auth,
            remember ? browserLocalPersistence : browserSessionPersistence,
        );
    }

    async function google(remember) {
        if (loading) {
            return;
        }

        try {
            setLoading(true);
            await applyPersistence(remember);

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

    async function handleSubmit(event, remember) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "");

        if (loading) return;

        try {
            setLoading(true);
            await applyPersistence(remember);

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
        <LoginPresentation
            role="student"
            heading={t("auth.welcomeBack", "Welcome Back!")}
            subtitle={t("auth.loginSubtitle", "Login to continue to MOSAIQ")}
            emailLabel={t("auth.emailLabel", "Email Address")}
            emailPlaceholder={t("auth.emailPlaceholder", "Enter your college email")}
            passwordLabel={t("auth.passwordLabel", "Password")}
            passwordPlaceholder={t("auth.passwordPlaceholder", "Enter your password")}
            submitLabel={t("auth.loginButton", "Login")}
            loadingLabel={t("auth.loggingIn", "Logging in...")}
            signupPrompt={t("auth.noAccount", "Don't have an account?")}
            signupLabel={t("auth.signUpLink", "Sign up")}
            signupPath="/signup"
            loading={loading}
            onSubmit={handleSubmit}
            onGoogleLogin={google}
        />
    );
}

export default Login;
