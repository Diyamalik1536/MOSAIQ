import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMessages } from "../../../../context/MessageContext";
import "./ContactModal.css";

const PRESET_TEMPLATES = [
    {
        id: "collab",
        label: "Project Collaboration",
        subject: "Interested in collaborating on a project",
        body: (name, major) =>
            `Hi ${name}, I saw your background in ${major || "tech"} and would love to collaborate on a project with you!`
    },
    {
        id: "chat",
        label: "Coffee Chat",
        subject: "Quick coffee & networking chat",
        body: (name, college) =>
            `Hi ${name}, would love to connect for a quick 15-minute chat to hear about your experience at ${college || "campus"}!`
    },
    {
        id: "feedback",
        label: "Feedback & Advice",
        subject: "Seeking advice / peer feedback",
        body: (name) =>
            `Hi ${name}, I really admire your profile and projects. Would love to get your thoughts or advice whenever you have a few minutes.`
    },
    {
        id: "intro",
        label: "Quick Intro",
        subject: "Great to connect on MOSAIQ!",
        body: (name) =>
            `Hey ${name}, thank you for connecting! Looking forward to following each other's progress and collaborating.`
    }
];

function ContactModal({ connection, isOpen, onClose }) {
    const navigate = useNavigate();
    const { sendMessage } = useMessages();

    const [subject, setSubject] = useState("Networking & Collaboration on MOSAIQ");
    const [message, setMessage] = useState("");
    const [selectedPreset, setSelectedPreset] = useState("");
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [sentStatus, setSentStatus] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when connection changes or modal opens
    useEffect(() => {
        if (connection && isOpen) {
            setSubject("Networking & Collaboration on MOSAIQ");
            setMessage(
                `Hi ${connection.name || "there"}, great to connect with you on MOSAIQ! Would love to chat about potential collaboration opportunities.`
            );
            setSelectedPreset("");
            setCopiedEmail(false);
            setSentStatus(false);
            setIsSubmitting(false);
        }
    }, [connection, isOpen]);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const handlePresetClick = (preset) => {
        setSelectedPreset(preset.id);
        setSubject(preset.subject);
        setMessage(preset.body(connection?.name || "there", connection?.major || connection?.college));
    };

    const handleCopyEmail = useCallback(() => {
        if (!connection?.email) return;
        navigator.clipboard.writeText(connection.email).then(() => {
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2000);
        }).catch(() => {
            setCopiedEmail(false);
        });
    }, [connection?.email]);

    const handleScheduleRedirect = () => {
        onClose();
        const studentName = encodeURIComponent(connection?.name || "");
        navigate(`/schedule?collabWith=${studentName}`);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || isSubmitting) return;

        setIsSubmitting(true);

        const newMsg = {
            sender: "You",
            recipientId: connection?.id,
            recipientName: connection?.name,
            recipientAvatar: connection?.avatar,
            subject: subject.trim(),
            content: message.trim(),
            preview: message.trim().slice(0, 80)
        };

        if (typeof sendMessage === "function") {
            sendMessage(newMsg);
        }

        setSentStatus(true);
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
        }, 1200);
    };

    if (!isOpen || !connection) return null;

    const emailSubject = encodeURIComponent(subject || "MOSAIQ Networking");
    const emailBody = encodeURIComponent(message || "");
    const mailtoUrl = connection.email ? `mailto:${connection.email}?subject=${emailSubject}&body=${emailBody}` : null;

    return (
        <div className="contact-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
            <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
                <header className="contact-modal-header">
                    <div className="contact-recipient-info">
                        {connection.avatar ? (
                            <img
                                src={connection.avatar}
                                alt={connection.name}
                                className="contact-recipient-avatar"
                            />
                        ) : (
                            <div className="contact-recipient-avatar-fallback">
                                {(connection.name || "U").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="contact-recipient-details">
                            <h2 id="contact-modal-title">Contact {connection.name}</h2>
                            <p className="contact-recipient-role">{connection.role || connection.major || "Peer"}</p>
                            {connection.college && <p className="contact-recipient-college">{connection.college}</p>}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="contact-modal-close"
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </header>

                <div className="contact-modal-body">
                    {/* Quick external actions */}
                    <div className="contact-quick-actions">
                        {mailtoUrl && (
                            <a
                                href={mailtoUrl}
                                className="contact-action-btn"
                                title="Open in your default email client"
                            >
                                <i className="bi bi-envelope-fill"></i>
                                <span>Email Directly</span>
                            </a>
                        )}

                        {connection.email && (
                            <button
                                type="button"
                                className={`contact-action-btn ${copiedEmail ? "copied" : ""}`}
                                onClick={handleCopyEmail}
                                title="Copy email address"
                            >
                                <i className={`bi ${copiedEmail ? "bi-check2" : "bi-clipboard"}`}></i>
                                <span>{copiedEmail ? "Email Copied!" : "Copy Email"}</span>
                            </button>
                        )}

                        <button
                            type="button"
                            className="contact-action-btn"
                            onClick={handleScheduleRedirect}
                            title="Schedule 1-on-1 collaboration in Collaboration Planner"
                        >
                            <i className="bi bi-calendar-event"></i>
                            <span>Schedule Collab</span>
                        </button>
                    </div>

                    {/* Quick message presets */}
                    <div className="contact-presets">
                        <label>Message Presets:</label>
                        <div className="contact-preset-chips">
                            {PRESET_TEMPLATES.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    className={`contact-preset-chip ${selectedPreset === preset.id ? "active" : ""}`}
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message composer */}
                    <form onSubmit={handleSendMessage} className="contact-form-group">
                        <label htmlFor="contact-subject-input">Subject</label>
                        <input
                            id="contact-subject-input"
                            type="text"
                            className="contact-input"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Subject of your message..."
                            required
                        />

                        <label htmlFor="contact-message-input">Message</label>
                        <textarea
                            id="contact-message-input"
                            className="contact-textarea"
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            maxLength={800}
                            required
                        />
                        <div className="contact-char-count">{message.length} / 800</div>

                        {sentStatus && (
                            <div className="contact-toast success">
                                <i className="bi bi-check-circle-fill"></i>
                                <span>Message successfully sent to {connection.name}!</span>
                            </div>
                        )}

                        <footer className="contact-modal-footer">
                            <button
                                type="button"
                                className="contact-btn-cancel"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="contact-btn-send"
                                disabled={isSubmitting || !message.trim()}
                            >
                                <i className="bi bi-send-fill"></i>
                                <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                            </button>
                        </footer>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ContactModal;
