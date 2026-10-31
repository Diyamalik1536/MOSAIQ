import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../../context/UserContext";
import "./ManagePlan.css";

const freePlanFeatures = [
    { name: "Basic profile", included: true },
    { name: "Browse projects", included: true },
    { name: "Limited connect requests (5/week)", included: true },
    { name: "Standard search", included: true },
    { name: "Basic analytics", included: true },
    { name: "Advanced filters", included: false },
    { name: "Priority visibility", included: false },
    { name: "AI recommendations", included: false },
    { name: "Mentor chat", included: false },
    { name: "Verified skill badges", included: false },
    { name: "Portfolio export", included: false },
    { name: "Early access features", included: false },
];

const proPlanFeatures = [
    "Enhanced profile with badges",
    "Unlimited connect requests",
    "Advanced search & filters",
    "AI project & mentor recommendations",
    "Direct mentor messaging",
    "Verified skill showcase",
    "Advanced analytics & insights",
    "Portfolio export (PDF/Link)",
    "Priority visibility to mentors",
    "Early access to new features",
];

function HeroChest3D() {
    return (
        <div className="hero-3d-element hero-3d-chest" aria-hidden="true">
            <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="chestGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="chestFrontLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6d28d9" />
                    </linearGradient>
                    <linearGradient id="chestFrontRight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#581c87" />
                    </linearGradient>
                    <linearGradient id="chestLidTop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#7e22ce" />
                    </linearGradient>
                    <linearGradient id="crystalCore" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="45%" stopColor="#f3e8ff" />
                        <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                </defs>
                <ellipse cx="80" cy="80" rx="55" ry="42" fill="url(#chestGlow)" />
                <ellipse cx="80" cy="122" rx="42" ry="12" fill="#581c87" opacity="0.3" />
                <polygon points="35,66 80,92 80,118 35,92" fill="url(#chestFrontLeft)" />
                <polygon points="80,92 125,66 125,92 80,118" fill="url(#chestFrontRight)" />
                <polygon points="35,66 80,44 125,66 80,92" fill="#3b0764" />
                <polygon points="28,40 73,18 118,40 73,62" fill="url(#chestLidTop)" />
                <polygon points="28,40 73,62 73,70 28,48" fill="#6b21a8" />
                <polygon points="73,62 118,40 118,48 73,70" fill="#4c1d95" />
                <polygon points="80,46 94,68 80,88 66,68" fill="url(#crystalCore)" />
                <polygon points="80,46 80,88 94,68" fill="#c084fc" opacity="0.75" />
                <polygon points="100,42 103,36 106,42 112,45 106,48 103,54 100,48 94,45" fill="#ffffff" opacity="0.95" />
                <circle cx="54" cy="74" r="2.5" fill="#ffffff" opacity="0.8" />
            </svg>
        </div>
    );
}

function HeroStar3D() {
    return (
        <div className="hero-3d-element hero-3d-star" aria-hidden="true">
            <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="starAmbient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="facetTop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                    <linearGradient id="facetRight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9333ea" />
                        <stop offset="100%" stopColor="#6b21a8" />
                    </linearGradient>
                </defs>
                <ellipse cx="45" cy="75" rx="22" ry="7" fill="#581c87" opacity="0.25" />
                <ellipse cx="45" cy="45" rx="36" ry="36" fill="url(#starAmbient)" />
                <polygon points="45,14 74,31 45,46" fill="url(#facetTop)" />
                <polygon points="74,31 74,65 45,46" fill="url(#facetRight)" />
                <polygon points="74,65 45,78 45,46" fill="#581c87" />
                <polygon points="45,78 16,65 45,46" fill="#7e22ce" />
                <polygon points="16,65 16,31 45,46" fill="#9333ea" />
                <polygon points="16,31 45,14 45,46" fill="#a855f7" />
                <path d="M45 28 L47.5 36.5 L56 37 L49.5 42 L52 50 L45 45 L38 50 L40.5 42 L34 37 L42.5 36.5 Z" fill="#ffffff" opacity="0.95" />
            </svg>
        </div>
    );
}

function HeroGem3D() {
    return (
        <div className="hero-3d-element hero-3d-gem" aria-hidden="true">
            <svg viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="gemGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </radialGradient>
                </defs>
                <ellipse cx="42" cy="72" rx="20" ry="6" fill="#b45309" opacity="0.25" />
                <ellipse cx="42" cy="42" rx="32" ry="32" fill="url(#gemGlow)" />
                <polygon points="42,12 68,28 42,40" fill="#fef08a" />
                <polygon points="42,12 16,28 42,40" fill="#fde047" />
                <polygon points="68,28 62,62 42,40" fill="#f59e0b" />
                <polygon points="16,28 22,62 42,40" fill="#fbbf24" />
                <polygon points="62,62 42,72 42,40" fill="#d97706" />
                <polygon points="22,62 42,72 42,40" fill="#b45309" />
                <polygon points="42,15 45,28 42,38 39,28" fill="#ffffff" opacity="0.6" />
            </svg>
        </div>
    );
}

function HeroMiniDeco() {
    return (
        <>
            <div className="hero-3d-element hero-mini-crystal-1" aria-hidden="true">
                <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="15,4 26,11 15,17" fill="#e9d5ff" />
                    <polygon points="26,11 23,24 15,17" fill="#c084fc" />
                    <polygon points="23,24 15,28 15,17" fill="#9333ea" />
                    <polygon points="15,28 7,24 15,17" fill="#7e22ce" />
                    <polygon points="7,24 4,11 15,17" fill="#a855f7" />
                    <polygon points="4,11 15,4 15,17" fill="#d8b4fe" />
                </svg>
            </div>
            <div className="hero-3d-element hero-mini-crystal-2" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="12,2 22,8 12,13" fill="#fef3c7" />
                    <polygon points="22,8 19,19 12,13" fill="#fbbf24" />
                    <polygon points="19,19 12,22 12,13" fill="#d97706" />
                    <polygon points="12,22 5,19 12,13" fill="#b45309" />
                    <polygon points="5,19 2,8 12,13" fill="#f59e0b" />
                    <polygon points="2,8 12,2 12,13" fill="#fde047" />
                </svg>
            </div>
        </>
    );
}

function CardsBackdrop() {
    return (
        <div className="cards-backdrop-wrapper" aria-hidden="true">
            {/* Luminous aurora glow orbs */}
            <div className="cards-glow-orb glow-orb-purple" />
            <div className="cards-glow-orb glow-orb-indigo" />
            <div className="cards-glow-orb glow-orb-amber" />

            {/* Subtle high-tech geometric dot grid */}
            <div className="cards-grid-pattern" />

            {/* 3D Crystalline polygon floating behind top-left of Free card (from image) */}
            <div className="backdrop-crystal backdrop-crystal-left">
                <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="cardPolyGlow1" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#e9d5ff" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="45" cy="45" r="36" fill="url(#cardPolyGlow1)" />
                    <polygon points="45,10 78,30 45,50" fill="#f8fafc" opacity="0.95" />
                    <polygon points="78,30 72,72 45,50" fill="#e2e8f0" opacity="0.9" />
                    <polygon points="72,72 45,84 45,50" fill="#cbd5e1" opacity="0.85" />
                    <polygon points="45,84 18,72 45,50" fill="#c4b5fd" opacity="0.8" />
                    <polygon points="18,72 12,30 45,50" fill="#e9d5ff" opacity="0.9" />
                    <polygon points="12,30 45,10 45,50" fill="#ffffff" opacity="0.98" />
                </svg>
            </div>

            {/* 3D Crystalline facet floating behind top-right of Pro card */}
            <div className="backdrop-crystal backdrop-crystal-right">
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <radialGradient id="cardPolyGlow2" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#fed7aa" stopOpacity="0.75" />
                            <stop offset="100%" stopColor="#fed7aa" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="40" cy="40" r="32" fill="url(#cardPolyGlow2)" />
                    <polygon points="40,8 68,25 40,42" fill="#fffbeb" opacity="0.95" />
                    <polygon points="68,25 62,64 40,42" fill="#fef3c7" opacity="0.9" />
                    <polygon points="62,64 40,74 40,42" fill="#fde68a" opacity="0.85" />
                    <polygon points="40,74 18,64 40,42" fill="#fbbf24" opacity="0.7" />
                    <polygon points="18,64 12,25 40,42" fill="#fef08a" opacity="0.9" />
                    <polygon points="12,25 40,8 40,42" fill="#ffffff" opacity="0.98" />
                </svg>
            </div>

            {/* Ambient twinkling sparkles */}
            <div className="cards-sparkle-dot sparkle-1" />
            <div className="cards-sparkle-dot sparkle-2" />
            <div className="cards-sparkle-dot sparkle-3" />
            <div className="cards-sparkle-dot sparkle-4" />
        </div>
    );
}

function ManagePlan() {
    const { t } = useTranslation();
    const { isPro, openUpgradeModal, downgradeToFree } = useUser();
    const [billingCycle, setBillingCycle] = useState("monthly");
    const [selectedPlan, setSelectedPlan] = useState(isPro ? "pro" : "free");

    const proPrice = billingCycle === "monthly" ? "₹199" : "₹1,910";
    const pricePeriod = billingCycle === "monthly" ? "/ month" : "/ year";

    return (
        <main className="manage-plan-page">
            {/* Hero Visuals Section */}
            <header className="manage-plan-hero">
                <div className="hero-ambient-glow" aria-hidden="true" />

                {/* 3D Floating Elements */}
                <HeroChest3D />
                <HeroStar3D />
                <HeroGem3D />
                <HeroMiniDeco />

                <div className="hero-content">
                    <h1 className="hero-title">
                        Unlock Your Full Potential with <br />
                        <span className="hero-title-highlight">TalentForge Pro</span>
                    </h1>

                    <p className="hero-subtitle">
                        Get access to powerful tools, personalized opportunities, advanced analytics
                        and direct mentor connections to accelerate your growth.
                    </p>

                    {/* Toggle Style */}
                    <div className="billing-pill-container">
                        <button
                            type="button"
                            className={`billing-cycle-btn ${billingCycle === "monthly" ? "active" : ""}`}
                            onClick={() => setBillingCycle("monthly")}
                        >
                            Monthly
                        </button>

                        <button
                            type="button"
                            className={`billing-switch-btn ${billingCycle === "yearly" ? "yearly" : "monthly"}`}
                            role="switch"
                            aria-checked={billingCycle === "yearly"}
                            aria-label="Toggle between monthly and yearly billing"
                            onClick={() =>
                                setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
                            }
                        >
                            <span className="billing-switch-knob" />
                        </button>

                        <button
                            type="button"
                            className={`billing-cycle-btn ${billingCycle === "yearly" ? "active" : ""}`}
                            onClick={() => setBillingCycle("yearly")}
                        >
                            Yearly
                        </button>

                        <span
                            className="billing-save-pill"
                            onClick={() => setBillingCycle("yearly")}
                        >
                            Save 20%
                        </span>
                    </div>
                </div>
            </header>

            {/* Plans Section with Enhanced Ambient Visual Backdrop */}
            <section className="plans-cards-section" aria-label="Available subscription plans">
                {/* Decorative Visual Backdrop behind Free & Pro Cards */}
                <CardsBackdrop />

                <div className="plans-cards-grid">
                    {/* Free Card */}
                    <article
                        className={`plan-card free-card ${selectedPlan === "free" && !isPro ? "plan-selected" : ""}`}
                        onClick={() => setSelectedPlan("free")}
                        tabIndex={0}
                        role="button"
                        aria-pressed={selectedPlan === "free"}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedPlan("free");
                            }
                        }}
                    >
                        <div className="plan-card-header">
                            <div className="plan-icon-wrapper free-icon-bg">
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#7c3aed"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className="plan-info">
                                <h2 className="plan-title">{t("subscription.freeTitle", "Free")}</h2>
                                <p className="plan-subtitle">{t("subscription.freeSubtitle", "Start your journey")}</p>
                            </div>
                        </div>

                        <div className="plan-price-block">
                            <span className="plan-price-currency">{t("subscription.freePrice", "₹0")}</span>
                            <span className="plan-price-unit">{t("subscription.perMonth", "/ month")}</span>
                        </div>

                        <ul className="plan-features-list">
                            {freePlanFeatures.map((feat) => (
                                <li
                                    key={feat.name}
                                    className={`plan-feature-item ${feat.included ? "is-included" : "is-excluded"}`}
                                >
                                    {feat.included ? (
                                        <i className="bi bi-check-lg feature-check-icon" aria-hidden="true" />
                                    ) : (
                                        <i className="bi bi-x-lg feature-cross-icon" aria-hidden="true" />
                                    )}
                                    <span>{feat.name}</span>
                                </li>
                            ))}
                        </ul>

                        {isPro ? (
                            <button
                                type="button"
                                className="plan-card-btn btn-downgrade-plan"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm("Switch back to the Free plan?")) {
                                        downgradeToFree();
                                        setSelectedPlan("free");
                                    }
                                }}
                            >
                                Switch to Free
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="plan-card-btn btn-current-plan"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                            >
                                <i className="bi bi-check-circle-fill"></i> {t("subscription.currentPlan", "Current Plan")}
                            </button>
                        )}
                    </article>

                    {/* Pro Card */}
                    <article
                        className={`plan-card pro-card ${selectedPlan === "pro" || isPro ? "plan-selected" : ""}`}
                        onClick={() => setSelectedPlan("pro")}
                        tabIndex={0}
                        role="button"
                        aria-pressed={selectedPlan === "pro" || isPro}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedPlan("pro");
                            }
                        }}
                    >
                        <div className="pro-popular-badge">
                            {isPro ? t("subscription.activePlan", "Active Plan") : t("subscription.mostPopular", "Most Popular")}
                        </div>

                        <div className="plan-card-header">
                            <div className="plan-icon-wrapper pro-icon-bg">
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#6d28d9"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                                    <rect x="3" y="6" width="18" height="15" rx="3" />
                                    <path d="M3 11h18" />
                                    <path d="M10 11v2a2 2 0 0 0 4 0v-2" />
                                </svg>
                            </div>
                            <div className="plan-info">
                                <h2 className="plan-title">{t("subscription.proTitle", "Pro")}</h2>
                                <p className="plan-subtitle">{t("subscription.proSubtitle", "For serious builders")}</p>
                            </div>
                        </div>

                        <div className="plan-price-block">
                            <span className="plan-price-currency">{proPrice}</span>
                            <span className="plan-price-unit">{pricePeriod}</span>
                        </div>

                        <ul className="plan-features-list">
                            {proPlanFeatures.map((feat) => (
                                <li key={feat} className="plan-feature-item is-included">
                                    <i className="bi bi-check-lg feature-check-icon" aria-hidden="true" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>

                        {isPro ? (
                            <button
                                type="button"
                                className="plan-card-btn btn-active-pro"
                                disabled
                                onClick={(e) => e.stopPropagation()}
                            >
                                <i className="bi bi-crown-fill"></i> {t("subscription.currentPlanActive", "Current Plan (Active)")}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="plan-card-btn btn-upgrade-pro"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openUpgradeModal(null, { billingCycle, price: proPrice });
                                }}
                            >
                                Upgrade to Pro
                            </button>
                        )}
                    </article>
                </div>
            </section>
        </main>
    );
}

export default ManagePlan;
