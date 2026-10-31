import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";
import { useUser } from "../../../../context/UserContext";
import { db } from "../../../../config/firebase";
import "./MeetingsPage.css";

const localDateTime = (date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

const getDate = (value) => {
  if (!value) return null;
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) =>
  getDate(value)?.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }) || "To be scheduled";

const getMentorId = (mentor) => mentor.uid || mentor.userId || mentor.id;

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

export default function MeetingsPage() {
  const { currentUser } = useUser();
  const uid = currentUser?.uid;
  const [mentors, setMentors] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [mentorId, setMentorId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState(() =>
    localDateTime(new Date(Date.now() + 86400000))
  );
  const [minimumDateTime] = useState(() =>
    localDateTime(new Date(Date.now() + 60000))
  );
  const [mentorsLoading, setMentorsLoading] = useState(true);
  const [meetingsLoading, setMeetingsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!uid) return undefined;

    return onSnapshot(
      query(collection(db, "mentorProfiles"), where("approved", "==", true)),
      (snapshot) => {
        const rows = snapshot.docs.map((mentorDoc) => ({
          id: mentorDoc.id,
          ...mentorDoc.data()
        }));
        setMentors(rows);
        setMentorId((current) =>
          rows.some((mentor) => getMentorId(mentor) === current)
            ? current
            : getMentorId(rows[0] || {})
        );
        setMentorsLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message || "Unable to load approved mentors.");
        setMentorsLoading(false);
      }
    );
  }, [uid]);

  useEffect(() => {
    if (!uid) return undefined;

    return onSnapshot(
      query(collection(db, "meetings"), where("studentId", "==", uid)),
      (snapshot) => {
        const rows = snapshot.docs.map((meetingDoc) => ({
          id: meetingDoc.id,
          ...meetingDoc.data()
        }));
        rows.sort(
          (a, b) => (getDate(a.startAt)?.getTime() || 0) -
            (getDate(b.startAt)?.getTime() || 0)
        );
        setMeetings(rows);
        setMeetingsLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message || "Unable to load your meetings.");
        setMeetingsLoading(false);
      }
    );
  }, [uid]);

  const activeCount = useMemo(
    () => meetings.filter((meeting) =>
      ["pending", "accepted", "rescheduled"].includes(meeting.status)
    ).length,
    [meetings]
  );
  const isMentorsLoading = Boolean(uid) && mentorsLoading;
  const isMeetingsLoading = Boolean(uid) && meetingsLoading;

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const date = new Date(startAt);
    const mentor = mentors.find((item) => getMentorId(item) === mentorId);
    if (
      !uid ||
      !mentor ||
      !title.trim() ||
      Number.isNaN(date.getTime()) ||
      date <= new Date()
    ) {
      setError("Choose an approved mentor, enter a topic and select a future date and time.");
      return;
    }

    setBusy(true);
    try {
      await addDoc(collection(db, "meetings"), {
        studentId: uid,
        mentorId,
        studentName: currentUser?.name || currentUser?.displayName || "Student",
        studentEmail: currentUser?.email || "",
        mentorName: mentor.name || mentor.fullName || mentor.displayName || "Mentor",
        title: title.trim(),
        description: description.trim(),
        startAt: date,
        status: "pending",
        meetingLink: "",
        mentorMessage: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setTitle("");
      setDescription("");
      setSuccess("Meeting request sent successfully.");
    } catch (submitError) {
      setError(submitError.message || "Could not send request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="meetings-page">
      <header className="meetings-heading">
        <div>
          <span className="meetings-eyebrow">CONNECT &amp; GROW</span>
          <h1>Mentor Meetings</h1>
          <p>Request a one-to-one session and manage your meetings.</p>
        </div>
      </header>

      <section className="meetings-panel">
        <h2>Request a meeting</h2>
        {isMentorsLoading ? (
          <p className="meetings-loading" role="status">Loading approved mentors…</p>
        ) : !mentors.length ? (
          <p className="meetings-empty">No approved mentors are available yet.</p>
        ) : (
          <form className="meeting-form" onSubmit={submit}>
            <label>
              Choose mentor
              <select
                value={mentorId}
                onChange={(event) => setMentorId(event.target.value)}
                required
              >
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={getMentorId(mentor)}>
                    {mentor.name || mentor.fullName || mentor.displayName || "Mentor"}
                    {mentor.expertise ? ` — ${mentor.expertise}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Meeting topic
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Career guidance"
                required
                maxLength={100}
              />
            </label>
            <label>
              Preferred date &amp; time
              <input
                type="datetime-local"
                min={minimumDateTime}
                value={startAt}
                onChange={(event) => setStartAt(event.target.value)}
                required
              />
            </label>
            <label className="meeting-form-wide">
              What would you like to discuss?
              <textarea
                rows="3"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add some context for your mentor..."
                maxLength={1000}
              />
            </label>
            {error && <p className="meeting-alert meeting-alert-error" role="alert">{error}</p>}
            {success && <p className="meeting-alert meeting-alert-success" role="status">{success}</p>}
            <button className="meeting-primary" disabled={busy}>
              {busy ? "Sending…" : "Send meeting request"}
            </button>
          </form>
        )}
        {!isMentorsLoading && !mentors.length && error && (
          <p className="meeting-alert meeting-alert-error" role="alert">{error}</p>
        )}
      </section>

      <section className="meetings-panel">
        <div className="meetings-section-title">
          <h2>Your meetings</h2>
          <span>{activeCount} active</span>
        </div>
        {isMeetingsLoading ? (
          <p className="meetings-loading" role="status">Loading your meetings…</p>
        ) : !meetings.length ? (
          <p className="meetings-empty">You haven’t requested any meetings yet.</p>
        ) : (
          <div className="meeting-list">
            {meetings.map((meeting) => (
              <article className="meeting-card" key={meeting.id}>
                <div className="meeting-card-top">
                  <div>
                    <h3>{meeting.title || "Mentor session"}</h3>
                    <p>With {meeting.mentorName || "your mentor"}</p>
                  </div>
                  <span className={`meeting-status status-${meeting.status || "pending"}`}>
                    {meeting.status || "pending"}
                  </span>
                </div>
                <p className="meeting-date">{formatDate(meeting.startAt)}</p>
                {meeting.description && (
                  <p className="meeting-description">{meeting.description}</p>
                )}
                {meeting.mentorMessage && (
                  <p className="meeting-mentor-message">
                    <strong>Message from your mentor:</strong> {meeting.mentorMessage}
                  </p>
                )}
                {meeting.status === "rejected" && (
                  <p className="meetings-muted">This request was declined. You can request another session.</p>
                )}
                {meeting.status === "rescheduled" && (
                  <p className="meetings-muted">Your mentor proposed this new time. The meeting link will be available when it is confirmed.</p>
                )}
                {meeting.status === "accepted" && isValidMeetLink(meeting.meetingLink) && (
                  <a
                    className="meeting-primary meeting-link"
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join meeting
                  </a>
                )}
                {meeting.status === "accepted" && !isValidMeetLink(meeting.meetingLink) && (
                  <p className="meetings-muted">Accepted — your mentor will add the Google Meet link.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
