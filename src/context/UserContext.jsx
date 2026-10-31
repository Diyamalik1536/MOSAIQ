
/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";

const UserContext = createContext(null);

const VALID_ROLES = ["student", "recruiter", "mentor"];

function readStoredProfile(user) {
    const userKey = user?.uid || user?.id || user?.email;
    if (!userKey) return {};

    try {
        const storedProfile = localStorage.getItem(
            `talentforge_profile_${userKey}`
        );
        const profile = storedProfile ? JSON.parse(storedProfile) : {};

        return profile && typeof profile === "object" ? profile : {};
    } catch {
        return {};
    }
}

export function normalizeUser(user) {
    if (!user || typeof user !== "object") return null;

    const userFields = { ...user };
    delete userFields.isPro;
    delete userFields.plan;

    const uid = userFields.uid || userFields.id || userFields.email;
    if (!uid) return null;

    const name = userFields.name || userFields.fullName || userFields.displayName || "";
    const avatar = userFields.avatar || userFields.profileImage || userFields.photoURL || "";

    const userRole = String(userFields.role || "student").toLowerCase();
    const role = VALID_ROLES.includes(userRole) ? userRole : "student";

    return {
        ...userFields,
        uid,
        role,
        id: user.id || uid,
        name,
        fullName: user.fullName || name,
        avatar,
        profileImage: user.profileImage || avatar,
    };
}

export function UserProvider({ children }) {
    const [currentUser, setCurrentUserState] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const authenticatedUser = normalizeUser(firebaseUser);
                const storedProfile = readStoredProfile(authenticatedUser);
                let role = "student";

                try {
                    const roleSnapshot = await getDoc(
                        doc(db, "users", firebaseUser.uid)
                    );

                    if (roleSnapshot.exists()) {
                        const savedRole = String(
                            roleSnapshot.data()?.role || ""
                        ).toLowerCase();

                        if (VALID_ROLES.includes(savedRole)) {
                            role = savedRole;
                        }
                    }
                } catch (error) {
                    console.error("Unable to load account role:", error);
                }

                const canonicalUser = normalizeUser({
                    ...authenticatedUser,
                    ...storedProfile,
                    role,
                    uid: firebaseUser.uid,
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL
                });

                setCurrentUserState(canonicalUser);
            } else {
                try {
                    const testUserStr = localStorage.getItem(
                        "talentforge_test_user"
                    );

                    if (testUserStr) {
                        const testUser = JSON.parse(testUserStr);

                        if (testUser && (testUser.uid || testUser.id)) {
                            setCurrentUserState(normalizeUser(testUser));
                            setLoading(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.error("Unable to restore the test session:", error);
                }

                setCurrentUserState(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const setCurrentUser = (user) => {
        if (!user) {
            setCurrentUserState(null);
            return;
        }

        const authenticatedUser = normalizeUser(user);
        const storedProfile = readStoredProfile(authenticatedUser);
        const canonicalUser = normalizeUser({
            ...authenticatedUser,
            ...storedProfile,
            uid: authenticatedUser.uid,
            id: authenticatedUser.id,
            email: authenticatedUser.email,
            displayName: authenticatedUser.displayName,
            photoURL: authenticatedUser.photoURL,
            role: authenticatedUser.role || "student"
        });

        setCurrentUserState(canonicalUser);
    };

    const updateCurrentUser = (changes) => {
        setCurrentUserState((previousUser) => {
            if (!previousUser) return null;

            const updatedUser = normalizeUser({
                ...previousUser,
                ...changes
            });

            const userKey =
                updatedUser?.uid ||
                updatedUser?.id ||
                updatedUser?.email;

            if (userKey) {
                try {
                    localStorage.setItem(
                        `talentforge_profile_${userKey}`,
                        JSON.stringify(updatedUser)
                    );
                } catch (e) {
                    console.error("Failed to save profile changes:", e);
                }
            }

            return updatedUser;
        });
    };

    const value = useMemo(
        () => ({
            currentUser,
            setCurrentUser,
            updateCurrentUser,
            loading
        }),
        [currentUser, loading]
    );

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error(
            "useUser must be used within a UserProvider"
        );
    }

    return context;
}
