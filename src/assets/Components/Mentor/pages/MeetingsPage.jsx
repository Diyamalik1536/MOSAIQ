import { useEffect, useState } from "react";
import {
    collection,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import { useUser } from "../../../../context/UserContext";
import { db } from "../../../../config/firebase";
import "./MeetingsPage.css";

const getDate = (value) => {
    if (!value) return null;
    const date = value?.toDate ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
    const date = getDate(value);
    return date
        ? date.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        })
        : "Date not set";
};

const localDateTime = (date) =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

const isValidMeetLink = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === "https:" &&
            url.hostname === "meet.google.com" &&
            url.pathname.split("/").filter(Boolean).length > 0;
    } catch {
        return false;
    }
};

function MeetingsPage({ onNotify = () => { } }) {
    const { currentUser } = useUser();
    const [meetings, setMeetings] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState(null);
    const [rescheduleMeeting, setRescheduleMeeting] = useState(null);
    const [newDate, setNewDate] = useState("");
    const [rescheduleMessage, setRescheduleMessage] = useState("");
    const [meetingLinks, setMeetingLinks] = useState({});
    const [messageDrafts, setMessageDrafts] = useState({});
    const [minimumDateTime] = useState(() =>
        localDateTime(new Date(Date.now() + 60000))
    );

    useEffect(() => {
        const mentorId = currentUser?.uid;
        if (!mentorId) return undefined;

        return onSnapshot(
            query(
                collection(db, "meetings"),
                where("mentorId", "==", mentorId)
            ),
            (snapshot) => {
                const items = snapshot.docs.map((meetingDoc) => ({
                    id: meetingDoc.id,
                    ...meetingDoc.data()
                }));
                items.sort(
                    (a, b) => (getDate(a.startAt)?.getTime() || 0) -
                        (getDate(b.startAt)?.getTime() || 0)
                );
                setMeetings(items);
                setLoading(false);
                setError("");
            },
            (subscriptionError) => {
                console.error("Meetings subscription error:", subscriptionError);
                setError("Unable to load meetings. Check your Firestore rules and connection.");
                setLoading(false);
            }
        );
    }, [currentUser?.uid]);

    const now = new Date();
    const requestMeetings = meetings.filter((meeting) => meeting.status === "pending");
    const upcomingMeetings = meetings.filter((meeting) => {
            const start = getDate(meeting.startAt);
            return ["accepted", "rescheduled"].includes(meeting.status) &&
                start && start >= now;
        });
    const pastMeetings = meetings.filter((meeting) => {
            const start = getDate(meeting.startAt);
            return ["completed", "rejected"].includes(meeting.status) ||
                (["accepted", "rescheduled"].includes(meeting.status) && start && start < now);
        });
    const displayedMeetings = activeTab === "pending"
        ? requestMeetings
        : activeTab === "upcoming"
            ? upcomingMeetings
            : pastMeetings;

    const updateMeeting = async (meetingId, changes, successMessage) => {
        setError("");
        setBusyId(meetingId);
        try {
            await updateDoc(doc(db, "meetings", meetingId), {
                ...changes,
                updatedAt: serverTimestamp()
            });
            onNotify(successMessage);
            return true;
        } catch (updateError) {
            console.error("Meeting update error:", updateError);
            const message = updateError.code === "permission-denied"
                ? "Permission denied. Please check your Firestore security rules."
                : updateError.message || "Could not update the meeting.";
            setError(message);
            onNotify(message);
            return false;
        } finally {
            setBusyId(null);
        }
    };

    const acceptMeeting = (meeting) =>
        updateMeeting(meeting.id, { status: "accepted" }, "Meeting request accepted.");

    const rejectMeeting = async (meeting) => {
        const confirmed = window.confirm(
            `Are you sure you want to reject the meeting request from ${meeting.studentName || "this student"}?`
        );
        if (confirmed) {
            await updateMeeting(
                meeting.id,
                { status: "rejected" },
                "Meeting request rejected."
            );
        }
    };

    const saveReschedule = async () => {
        if (!rescheduleMeeting || !newDate) {
            setError("Please select a new meeting date and time.");
            return;
        }
        const selectedDate = new Date(newDate);
        if (Number.isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
            setError("Please select a future date and time.");
            return;
        }

        const changes = {
            status: "accepted",
            startAt: selectedDate
        };
        if (rescheduleMessage.trim()) {
            changes.mentorMessage = rescheduleMessage.trim();
        }
        const saved = await updateMeeting(
            rescheduleMeeting.id,
            changes,
            "Meeting rescheduled. The student can see the new time now."
        );
        if (saved) {
            setRescheduleMeeting(null);
            setNewDate("");
            setRescheduleMessage("");
        }
    };

    const saveMeetingLink = async (meeting) => {
        const link = (meetingLinks[meeting.id] ?? meeting.meetingLink ?? "").trim();
        if (!isValidMeetLink(link)) {
            setError("Paste a valid Google Meet link (https://meet.google.com/…).");
            return;
        }
        await updateMeeting(
            meeting.id,
            { meetingLink: link },
            "Google Meet link saved."
        );
    };

    const saveMentorMessage = async (meeting) => {
        const message = (messageDrafts[meeting.id] ?? meeting.mentorMessage ?? "").trim();
        if (!message) {
            setError("Enter a message for the student before saving.");
            return;
        }
        const saved = await updateMeeting(
            meeting.id,
            { mentorMessage: message },
            "Message sent to the student."
        );
        if (saved) {
            setMessageDrafts((current) => ({ ...current, [meeting.id]: message }));
        }
    };

    const tabs = [
        { id: "pending", label: "Pending Requests", count: requestMeetings.length },
        { id: "upcoming", label: "Upcoming Meetings", count: upcomingMeetings.length },
        { id: "past", label: "Past Meetings", count: pastMeetings.length }
    ];

    return (
        <div className="mentor-meetings">
            <div className="meetings-heading">
                <div>
                    <p className="meetings-eyebrow">STUDENT CONNECT</p>
                    <h1>Meetings</h1>
                    <p className="meetings-subtitle">
                        Manage student requests, schedules and Google Meet links.
                    </p>
                </div>
                <div className="meetings-total">
                    <span>{meetings.length}</span>
                    <small>Total meetings</small>
                </div>
            </div>

            <div className="meetings-stats">
                <div className="meeting-stat">
                    <span className="stat-icon">◷</span>
                    <div><strong>{requestMeetings.length}</strong><span>Pending requests</span></div>
                </div>
                <div className="meeting-stat">
                    <span className="stat-icon">✓</span>
                    <div><strong>{upcomingMeetings.length}</strong><span>Upcoming meetings</span></div>
                </div>
                <div className="meeting-stat">
                    <span className="stat-icon">▣</span>
                    <div><strong>{pastMeetings.length}</strong><span>Past meetings</span></div>
                </div>
            </div>

            <div className="meetings-tabs" role="tablist" aria-label="Meeting status">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        className={activeTab === tab.id ? "active" : ""}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}<span>{tab.count}</span>
                    </button>
                ))}
            </div>

            {(!currentUser?.uid || error) && (
                <div className="meetings-error" role="alert">
                    {error || "Please log in again to view your meetings."}
                </div>
            )}
            {currentUser?.uid && loading && <div className="meetings-message" role="status">Loading your meetings…</div>}
            {currentUser?.uid && !loading && !error && displayedMeetings.length === 0 && (
                <div className="meetings-empty">
                    <div className="empty-icon">◷</div>
                    <h3>
                        {activeTab === "pending" ? "No pending requests"
                            : activeTab === "upcoming" ? "No upcoming meetings"
                                : "No past meetings yet"}
                    </h3>
                    <p>Student meeting requests and updates will appear here.</p>
                </div>
            )}

            <div className="meetings-list">
                {displayedMeetings.map((meeting) => (
                    <article className="meeting-card" key={meeting.id}>
                        <div className="meeting-card-top">
                            <div className="student-avatar">
                                {(meeting.studentName || "S").trim().charAt(0).toUpperCase()}
                            </div>
                            <div className="meeting-student-info">
                                <h3>{meeting.studentName || "Student"}</h3>
                                <p>{meeting.studentEmail || "Student meeting request"}</p>
                            </div>
                            <span className={`meeting-status ${meeting.status || "pending"}`}>
                                {meeting.status || "pending"}
                            </span>
                        </div>

                        <div className="meeting-card-content">
                            <h4>{meeting.title || meeting.purpose || "Mentoring session"}</h4>
                            {meeting.description && <p className="meeting-description">{meeting.description}</p>}
                            <div className="meeting-detail"><span>◷</span><span>{formatDate(meeting.startAt)}</span></div>
                            {meeting.mentorMessage && (
                                <p className="meeting-mentor-message">
                                    <strong>Message to student:</strong> {meeting.mentorMessage}
                                </p>
                            )}
                            {meeting.status === "accepted" && isValidMeetLink(meeting.meetingLink) && (
                                <div className="meeting-actions">
                                    <a
                                        className="meeting-btn accept"
                                        href={meeting.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Join Meeting
                                    </a>
                                </div>
                            )}
                        </div>

                        {meeting.status === "pending" && (
                            <div className="meeting-actions">
                                <button
                                    type="button"
                                    className="meeting-btn accept"
                                    disabled={busyId === meeting.id}
                                    onClick={() => acceptMeeting(meeting)}
                                >
                                    Accept request
                                </button>
                                <button
                                    type="button"
                                    className="meeting-btn secondary"
                                    disabled={busyId === meeting.id}
                                    onClick={() => {
                                        setRescheduleMeeting(meeting);
                                        setNewDate("");
                                        setRescheduleMessage("");
                                    }}
                                >
                                    Reschedule
                                </button>
                                <button
                                    type="button"
                                    className="meeting-btn reject"
                                    disabled={busyId === meeting.id}
                                    onClick={() => rejectMeeting(meeting)}
                                >
                                    Reject
                                </button>
                            </div>
                        )}

                        {meeting.status === "accepted" && (
                            <div className="meeting-actions meeting-upcoming-actions">
                                <input
                                    type="url"
                                    aria-label="Google Meet link"
                                    placeholder="Paste actual Google Meet link"
                                    value={meetingLinks[meeting.id] ?? meeting.meetingLink ?? ""}
                                    onChange={(event) => setMeetingLinks((current) => ({
                                        ...current,
                                        [meeting.id]: event.target.value
                                    }))}
                                />
                                <button
                                    type="button"
                                    className="meeting-btn accept"
                                    disabled={busyId === meeting.id}
                                    onClick={() => saveMeetingLink(meeting)}
                                >
                                    Save link
                                </button>
                                <button
                                    type="button"
                                    className="meeting-btn secondary"
                                    disabled={busyId === meeting.id}
                                    onClick={() => {
                                        setRescheduleMeeting(meeting);
                                        setNewDate("");
                                        setRescheduleMessage("");
                                    }}
                                >
                                    Reschedule
                                </button>
                                <button
                                    type="button"
                                    className="meeting-btn secondary"
                                    disabled={busyId === meeting.id}
                                    onClick={() => updateMeeting(
                                        meeting.id,
                                        { status: "completed" },
                                        "Meeting marked as completed."
                                    )}
                                >
                                    Mark completed
                                </button>
                            </div>
                        )}

                        {!["rejected", "completed"].includes(meeting.status) && (
                            <div className="meeting-message-editor">
                                <label htmlFor={`mentor-message-${meeting.id}`}>Message for student</label>
                                <textarea
                                    id={`mentor-message-${meeting.id}`}
                                    rows="2"
                                    maxLength={1000}
                                    value={messageDrafts[meeting.id] ?? meeting.mentorMessage ?? ""}
                                    onChange={(event) => setMessageDrafts((current) => ({
                                        ...current,
                                        [meeting.id]: event.target.value
                                    }))}
                                    placeholder="Share an update or instructions..."
                                />
                                <button
                                    type="button"
                                    className="meeting-btn secondary"
                                    disabled={busyId === meeting.id}
                                    onClick={() => saveMentorMessage(meeting)}
                                >
                                    Save message
                                </button>
                            </div>
                        )}
                    </article>
                ))}
            </div>

            {rescheduleMeeting && (
                <div className="meeting-modal-backdrop">
                    <div className="meeting-modal" role="dialog" aria-modal="true" aria-labelledby="reschedule-title">
                        <button
                            type="button"
                            className="meeting-modal-close"
                            onClick={() => setRescheduleMeeting(null)}
                            aria-label="Close"
                        >
                            ×
                        </button>
                        <p className="meetings-eyebrow">CHANGE SCHEDULE</p>
                        <h2 id="reschedule-title">Reschedule meeting</h2>
                        <p>Select a new date and time for your meeting with {rescheduleMeeting.studentName || "the student"}.</p>
                        <label htmlFor="meeting-new-date">New date and time</label>
                        <input
                            id="meeting-new-date"
                            type="datetime-local"
                            min={minimumDateTime}
                            value={newDate}
                            onChange={(event) => setNewDate(event.target.value)}
                        />
                        <label htmlFor="meeting-reschedule-message">Message for student (optional)</label>
                        <textarea
                            id="meeting-reschedule-message"
                            rows="3"
                            maxLength={1000}
                            value={rescheduleMessage}
                            onChange={(event) => setRescheduleMessage(event.target.value)}
                            placeholder="Explain the proposed change..."
                        />
                        <div className="meeting-modal-actions">
                            <button
                                type="button"
                                className="meeting-btn secondary"
                                onClick={() => setRescheduleMeeting(null)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="meeting-btn accept"
                                disabled={busyId === rescheduleMeeting.id}
                                onClick={saveReschedule}
                            >
                                Confirm new time
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MeetingsPage;
