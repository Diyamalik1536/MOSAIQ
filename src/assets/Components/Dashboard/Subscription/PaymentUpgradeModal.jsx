import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../../context/UserContext";
import { useNavigate } from "react-router-dom";
import "./PaymentUpgradeModal.css";

function PaymentUpgradeModal() {
    const { upgradeModalOpen } = useUser();

    return upgradeModalOpen ? <UpgradeCheckout /> : null;
}

function UpgradeCheckout() {
    const { t } = useTranslation();
    const {
        upgradeModalFeature,
        upgradeModalPlan,
        closeUpgradeModal,
        upgradeToPro,
        currentUser
    } = useUser();

    const navigate = useNavigate();

    const [step, setStep] = useState("payment");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [confirmedDemo, setConfirmedDemo] = useState(false);
    const processingTimeout = useRef(null);

    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [cardName, setCardName] = useState(currentUser?.name || "");
    const [upiId, setUpiId] = useState("");
    const [selectedBank, setSelectedBank] = useState("HDFC Bank");
    const isYearlyPlan = upgradeModalPlan?.billingCycle === "yearly";
    const planPrice = upgradeModalPlan?.price || (isYearlyPlan ? "₹1,910" : "₹199");
    const planPeriod = isYearlyPlan ? "year" : "month";

    // Close on Escape key and prevent background scrolling
    const handleKeyDown = useCallback((e) => {
        if (e.key === "Escape") {
            closeUpgradeModal();
        }
    }, [closeUpgradeModal]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            window.clearTimeout(processingTimeout.current);
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [handleKeyDown]);

    // Card formatting helpers
    const handleCardNumberChange = (e) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
        const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
        if (raw.length >= 3) {
            raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
        }
        setExpiryDate(raw);
    };

    const handleCvvChange = (e) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
        setCvv(raw);
    };

    const handlePay = (e) => {
        e.preventDefault();
        if (!confirmedDemo) {
            setPaymentError("Please confirm this is a demo checkout.");
            return;
        }

        setPaymentError("");
        setIsProcessing(true);

        processingTimeout.current = window.setTimeout(() => {
            processingTimeout.current = null;
            setIsProcessing(false);
            try {
                upgradeToPro();
                setStep("success");
            } catch (error) {
                console.error("Failed to activate the Pro demo plan:", error);
                setPaymentError("We couldn't activate Pro. Please try again.");
            }
        }, 900);
    };

    const handleExplorePro = () => {
        closeUpgradeModal();
        navigate("/dashboard");
    };

    return (
        <div className="payment-modal-overlay" onClick={closeUpgradeModal}>
            <div
                className={`payment-modal-container ${step === "success" ? "success-mode" : ""}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* Close Button */}
                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={closeUpgradeModal}
                    aria-label="Close modal"
                >
                    <i className="bi bi-x-lg"></i>
                </button>

                {step === "payment" ? (
                    <div className="payment-modal-grid">
                        {/* Plan overview */}
                        <div className="payment-modal-left">
                            <div className="brand-header">
                                <div className="brand-logo">
                                    <i className="bi bi-stars"></i>
                                    <span>TalentForge</span>
                                </div>
                            </div>

                            <div className="left-hero">
                                <h2>More room to grow</h2>
                                <p>Everything in Free, with fewer limits and more ways to show your work.</p>
                            </div>

                            {upgradeModalFeature && (
                                <div className="feature-trigger-notice">
                                    <i className="bi bi-lock-fill"></i>
                                    <span>Feature: <strong>{upgradeModalFeature}</strong></span>
                                </div>
                            )}

                            <div className="pro-benefits-list">
                                <span className="benefits-title">Included with Pro</span>
                                <ul>
                                    <li>
                                        <div className="benefit-icon"><i className="bi bi-people-fill"></i></div>
                                        <span>Unlimited connections</span>
                                    </li>
                                    <li>
                                        <div className="benefit-icon"><i className="bi bi-funnel-fill"></i></div>
                                        <span>Advanced filters</span>
                                    </li>
                                    <li>
                                        <div className="benefit-icon"><i className="bi bi-cpu-fill"></i></div>
                                        <span>AI recommendations</span>
                                    </li>
                                    <li>
                                        <div className="benefit-icon"><i className="bi bi-patch-check-fill"></i></div>
                                        <span>Verified skill badges</span>
                                    </li>
                                    <li>
                                        <div className="benefit-icon"><i className="bi bi-lightning-charge-fill"></i></div>
                                        <span>Priority mentor visibility</span>
                                    </li>
                                    <li>
                                        <div className="benefit-icon"><i className="bi bi-file-earmark-pdf-fill"></i></div>
                                        <span>Portfolio export</span>
                                    </li>
                                </ul>
                            </div>

                        </div>

                        {/* Right Column (Complete Your Upgrade Form) */}
                        <div className="payment-modal-right">
                            {/* Stepper */}
                            <div className="checkout-stepper">
                                <div className="step-item completed">
                                    <span className="step-number">1</span>
                                    <span className="step-label">Plan</span>
                                </div>
                                <div className="step-line active"></div>
                                <div className="step-item active">
                                    <span className="step-number">2</span>
                                    <span className="step-label">Payment</span>
                                </div>
                                <div className="step-line"></div>
                                <div className="step-item">
                                    <span className="step-number">3</span>
                                    <span className="step-label">Done</span>
                                </div>
                            </div>

                            <h3 className="checkout-title">{t("subscription.paymentDetails", "Payment details")}</h3>

                            {/* Plan Card */}
                            <div className="checkout-plan-card">
                                <div className="plan-badge-icon">
                                    <i className="bi bi-crown-fill"></i>
                                </div>
                                <div className="plan-summary-info">
                                    <div className="plan-name-row">
                                        <h4>{t("subscription.proTitle", "Pro Plan")}</h4>
                                        <span className="plan-cost">{planPrice} / {planPeriod}</span>
                                    </div>
                                    <p className="plan-billing-note">
                                        {isYearlyPlan ? "Annual plan" : "Monthly plan"} • Demo checkout
                                    </p>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="payment-methods-section">
                                <label className="input-group-label">{t("subscription.selectMethod", "Select Payment Method")}</label>
                                <div className="payment-method-tabs">
                                    <button
                                        type="button"
                                        className={`method-tab ${paymentMethod === "card" ? "active" : ""}`}
                                        onClick={() => setPaymentMethod("card")}
                                    >
                                        <i className="bi bi-credit-card-2-front"></i>
                                        <span>{t("subscription.card", "Card")}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`method-tab ${paymentMethod === "upi" ? "active" : ""}`}
                                        onClick={() => setPaymentMethod("upi")}
                                    >
                                        <i className="bi bi-qr-code-scan"></i>
                                        <span>{t("subscription.upi", "UPI")}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`method-tab ${paymentMethod === "netbanking" ? "active" : ""}`}
                                        onClick={() => setPaymentMethod("netbanking")}
                                    >
                                        <i className="bi bi-bank"></i>
                                        <span>{t("subscription.netbanking", "Net Banking")}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <form onSubmit={handlePay} className="payment-form">
                                {paymentMethod === "card" && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="card-number">{t("subscription.cardNumber", "Card Number")}</label>
                                            <div className="card-input-wrapper">
                                                <input
                                                    id="card-number"
                                                    type="text"
                                                    value={cardNumber}
                                                    onChange={handleCardNumberChange}
                                                    placeholder="1234 5678 9012 3456"
                                                    inputMode="numeric"
                                                    autoComplete="cc-number"
                                                    maxLength={19}
                                                    pattern="[0-9 ]{16,19}"
                                                    title="Enter a 16-digit card number"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="expiry-date">{t("subscription.expiryDate", "Expiry Date")}</label>
                                                <input
                                                    id="expiry-date"
                                                    type="text"
                                                    value={expiryDate}
                                                    onChange={handleExpiryChange}
                                                    placeholder="MM/YY"
                                                    inputMode="numeric"
                                                    autoComplete="cc-exp"
                                                    maxLength={5}
                                                    pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                                                    title="Enter expiry as MM/YY"
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="card-cvv">{t("subscription.cvv", "CVV")}</label>
                                                <input
                                                    id="card-cvv"
                                                    type="password"
                                                    maxLength={4}
                                                    value={cvv}
                                                    onChange={handleCvvChange}
                                                    placeholder="123"
                                                    inputMode="numeric"
                                                    autoComplete="cc-csc"
                                                    pattern="[0-9]{3,4}"
                                                    title="Enter a 3- or 4-digit security code"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="card-name">{t("subscription.nameOnCard", "Name on Card")}</label>
                                            <input
                                                id="card-name"
                                                type="text"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value)}
                                                placeholder="Full Name"
                                                autoComplete="cc-name"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {paymentMethod === "upi" && (
                                    <div className="form-group">
                                        <label htmlFor="upi-id">{t("subscription.upiId", "UPI ID / VPA")}</label>
                                        <input
                                            id="upi-id"
                                            type="text"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                            placeholder="username@okhdfcbank"
                                            pattern="[^@ ]+@[^@ ]+"
                                            title="Enter a valid UPI ID"
                                            required
                                        />
                                        <div className="upi-quick-pills">
                                            <button type="button" onClick={() => setUpiId("student@okaxis")}>@okaxis</button>
                                            <button type="button" onClick={() => setUpiId("student@okhdfcbank")}>@okhdfcbank</button>
                                            <button type="button" onClick={() => setUpiId("student@ybl")}>@ybl</button>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === "netbanking" && (
                                    <div className="form-group">
                                        <label htmlFor="select-bank">{t("subscription.selectBank", "Select Your Bank")}</label>
                                        <select
                                            id="select-bank"
                                            value={selectedBank}
                                            onChange={(e) => setSelectedBank(e.target.value)}
                                        >
                                            <option value="HDFC Bank">HDFC Bank</option>
                                            <option value="ICICI Bank">ICICI Bank</option>
                                            <option value="State Bank of India">State Bank of India (SBI)</option>
                                            <option value="Axis Bank">Axis Bank</option>
                                            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                                        </select>
                                    </div>
                                )}

                                <div className="terms-checkbox-row">
                                    <label className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            checked={confirmedDemo}
                                            onChange={(e) => setConfirmedDemo(e.target.checked)}
                                        />
                                        <span className="checkbox-label">
                                            {t("subscription.demoTerms", "I understand this is a demo. No payment will be taken.")}
                                        </span>
                                    </label>
                                </div>

                                {paymentError && (
                                    <p className="payment-error" role="alert">{paymentError}</p>
                                )}

                                <button
                                    type="submit"
                                    className="pay-submit-btn"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="spinner-border" />
                                            {t("subscription.applyingDemo", "Applying your demo upgrade...")}
                                        </>
                                    ) : (
                                        <>{t("subscription.confirmDemo", "Confirm demo upgrade")} — {planPrice} / {planPeriod}</>
                                    )}
                                </button>

                                <p className="demo-notice-text">
                                    {t("subscription.demoNotice", "Demo only — don't enter real payment details. No payment is processed or charged.")}
                                </p>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* 3. Successful Upgrade Experience (Panel 3 in Mockup) */
                    <div className="upgrade-success-view">
                        <div className="success-header">
                            <div className="success-check-circle">
                                <i className="bi bi-check-lg"></i>
                            </div>

                            <h2>{t("subscription.youreOnPro", "You're on Pro")}</h2>
                            <p className="success-subtitle">
                                {t("subscription.proFeaturesEnabled", "Pro features are now enabled for your account.")}
                            </p>

                            <button
                                type="button"
                                className="explore-pro-btn"
                                onClick={handleExplorePro}
                            >
                                {t("subscription.explorePro", "Explore Pro Features")}
                                <i className="bi bi-arrow-right"></i>
                            </button>
                        </div>

                        <div className="quick-start-guide">
                            <h3>{t("subscription.quickStartGuide", "Quick Start Guide")}</h3>
                            <div className="guide-steps-list">
                                <div className="guide-step-card">
                                    <div className="step-badge">1</div>
                                    <div className="step-content">
                                        <strong>Complete your enhanced profile</strong>
                                        <p>Add skills, links, and showcase your best work</p>
                                    </div>
                                </div>

                                <div className="guide-step-card">
                                    <div className="step-badge">2</div>
                                    <div className="step-content">
                                        <strong>Explore premium opportunities</strong>
                                        <p>Get AI-powered project and mentor recommendations</p>
                                    </div>
                                </div>

                                <div className="guide-step-card">
                                    <div className="step-badge">3</div>
                                    <div className="step-content">
                                        <strong>Connect with mentors</strong>
                                        <p>Send unlimited requests and start meaningful conversations</p>
                                    </div>
                                </div>

                                <div className="guide-step-card">
                                    <div className="step-badge">4</div>
                                    <div className="step-content">
                                        <strong>Track your progress</strong>
                                        <p>Use advanced analytics to monitor your growth</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentUpgradeModal;
