
/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useCallback,
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

function proStorageKey(user) {
    const userKey = user?.uid || user?.id || user?.email;
    return userKey
        ? `talentforge_pro_active_${encodeURIComponent(userKey)}`
        : null;
}

function readProStatus(user) {
    const key = proStorageKey(user);
    return key ? localStorage.getItem(key) === "true" : false;
}

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

    const uid = user.uid || user.id || user.email;
    if (!uid) return null;

    const name = user.name || user.fullName || user.displayName || "";
    const avatar = user.avatar || user.profileImage || user.photoURL || "";
    const isProStored = readProStatus(user);
    const isPro = Boolean(
        user.isPro || user.plan === "pro" || isProStored
    );

    const userRole = String(user.role || "student").toLowerCase();
    const role = VALID_ROLES.includes(userRole) ? userRole : "student";

    return {
        ...user,
        uid,
        role,
        id: user.id || uid,
        name,
        fullName: user.fullName || name,
        avatar,
        profileImage: user.profileImage || avatar,
        isPro,
        plan: isPro ? "pro" : (user.plan || "free")
    };
}

export function UserProvider({ children }) {
    const [currentUser, setCurrentUserState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [upgradeModalFeature, setUpgradeModalFeature] = useState(null);
    const [upgradeModalPlan, setUpgradeModalPlan] = useState({
        billingCycle: "monthly"
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const authenticatedUser = normalizeUser(firebaseUser);
                const storedProfile = readStoredProfile(authenticatedUser);
                const isProStored = readProStatus(firebaseUser);

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
                    isPro: Boolean(
                        storedProfile?.isPro || isProStored
                    ),
                    plan: (storedProfile?.isPro || isProStored)
                        ? "pro"
                        : "free",
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
                } catch {}

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
        const isProStored = readProStatus(authenticatedUser);

        const canonicalUser = normalizeUser({
            ...authenticatedUser,
            ...storedProfile,
            isPro: Boolean(
                storedProfile?.isPro ||
                authenticatedUser?.isPro ||
                isProStored
            ),
            plan: (
                storedProfile?.isPro ||
                authenticatedUser?.isPro ||
                isProStored
            ) ? "pro" : "free",
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

    const isPro = Boolean(
        currentUser?.isPro ||
        currentUser?.plan === "pro"
    );

    const upgradeToPro = useCallback(() => {
        if (!currentUser) {
            throw new Error(
                "A signed-in user is required to activate Pro."
            );
        }

        const proKey = proStorageKey(currentUser);

        if (!proKey) {
            throw new Error(
                "The signed-in user is missing an account identifier."
            );
        }

        localStorage.setItem(proKey, "true");

        setCurrentUserState((prev) => {
            const base = prev;
            const updated = normalizeUser({
                ...base,
                isPro: true,
                plan: "pro"
            });

            const userKey =
                updated?.uid ||
                updated?.id ||
                updated?.email;

            if (userKey) {
                try {
                    localStorage.setItem(
                        `talentforge_profile_${userKey}`,
                        JSON.stringify(updated)
                    );
                } catch (e) {
                    console.error("Failed to save profile changes:", e);
                }
            }

            return updated;
        });

        window.dispatchEvent(new Event("proStatusChanged"));
    }, [currentUser]);

    const downgradeToFree = useCallback(() => {
        const proKey = proStorageKey(currentUser);

        if (proKey) localStorage.removeItem(proKey);

        setCurrentUserState((prev) => {
            if (!prev) return null;

            const updated = normalizeUser({
                ...prev,
                isPro: false,
                plan: "free"
            });

            const userKey =
                updated?.uid ||
                updated?.id ||
                updated?.email;

            if (userKey) {
                try {
                    localStorage.setItem(
                        `talentforge_profile_${userKey}`,
                        JSON.stringify(updated)
                    );
                } catch (e) {
                    console.error("Failed to save profile changes:", e);
                }
            }

            return updated;
        });

        window.dispatchEvent(new Event("proStatusChanged"));
    }, [currentUser]);

    const openUpgradeModal = useCallback(
        (featureName = null, plan = null) => {
            setUpgradeModalFeature(featureName);
            setUpgradeModalPlan(
                plan || { billingCycle: "monthly" }
            );
            setUpgradeModalOpen(true);
        },
        []
    );

    const closeUpgradeModal = useCallback(() => {
        setUpgradeModalOpen(false);
        setUpgradeModalFeature(null);
        setUpgradeModalPlan({ billingCycle: "monthly" });
    }, []);

    const value = useMemo(
        () => ({
            currentUser,
            setCurrentUser,
            updateCurrentUser,
            loading,
            isPro,
            upgradeToPro,
            downgradeToFree,
            upgradeModalOpen,
            upgradeModalFeature,
            upgradeModalPlan,
            openUpgradeModal,
            closeUpgradeModal
        }),
        [
            currentUser,
            loading,
            isPro,
            upgradeModalOpen,
            upgradeModalFeature,
            upgradeModalPlan,
            upgradeToPro,
            downgradeToFree,
            openUpgradeModal,
            closeUpgradeModal
        ]
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
