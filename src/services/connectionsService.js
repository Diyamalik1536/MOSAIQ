/**
 * Central Connections Service
 * Manages active connections, outgoing connection requests, and incoming invitations
 * with per-user localStorage isolation, weekly request quotas, and window event sync.
 */

import { studentData } from "../data/students";

export const CONNECTIONS_STORAGE_PREFIX = "talentforge_connections";
export const REQUESTS_STORAGE_PREFIX = "talentforge_connection_requests";
export const INCOMING_STORAGE_PREFIX = "talentforge_incoming_requests";

/**
 * Derives a consistent, unique user key for scoped storage.
 * Defaults to "guest" if no user identifier exists.
 */
export function getUserKey(user) {
    if (!user) return "guest";
    return user.uid || user.id || user.email || "guest";
}

/**
 * Calculates the ISO string (YYYY-MM-DD) for Monday of the current calendar week.
 */
export function getWeekStart(inputDate = new Date()) {
    const date = new Date(inputDate);
    const day = date.getUTCDay();
    // In UTC, Sunday is 0. If Sunday, 6 days back; otherwise day - 1 days back.
    const daysSinceMonday = (day + 6) % 7;
    date.setUTCDate(date.getUTCDate() - daysSinceMonday);
    return date.toISOString().slice(0, 10);
}

/**
 * Dispatches a custom window event to synchronize all open components and tabs.
 */
export function dispatchConnectionsUpdated(detail = {}) {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("connectionsUpdated", { detail }));
    }
}

/**
 * Default seed connections for a fresh user account.
 */
function getInitialSeedConnections() {
    const seedStudents = studentData.slice(0, 2);
    return seedStudents.map((student, index) => ({
        id: student.id,
        name: student.name,
        role: `${student.major} (${student.year || "Student"})`,
        email: student.email,
        avatar: student.avatar,
        college: student.college,
        major: student.major,
        year: student.year,
        skills: student.skills || [],
        availability: student.availability || "open_to_collaborate",
        connectedAt: new Date(Date.now() - (index + 1) * 86400000 * 2).toISOString(),
        notes: index === 0 ? "Met during campus hackathon collaboration." : "Collaborated on design system."
    }));
}

/**
 * Default incoming requests for a fresh user account.
 */
function getInitialSeedIncoming() {
    const student = studentData[2]; // Rahul Verma
    if (!student) return [];
    return [
        {
            id: `inc_${Date.now()}_1`,
            studentId: student.id,
            student: {
                id: student.id,
                name: student.name,
                role: `${student.major} (${student.year})`,
                email: student.email,
                avatar: student.avatar,
                college: student.college,
                major: student.major,
                year: student.year,
                skills: student.skills || [],
                availability: student.availability || "open"
            },
            message: "Hey! Saw your profile and would love to connect for ML & open-source projects.",
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
        }
    ];
}

/**
 * Default outgoing requests for a fresh user account.
 */
function getInitialSeedRequests() {
    const currentWeek = getWeekStart();
    const student = studentData[3]; // Priya Sharma
    const studentId = student ? student.id : "stu_004";
    return {
        connectedIds: [studentId],
        weekStart: currentWeek,
        weeklyIds: [studentId]
    };
}

/**
 * Retrieves active connections for the given user key.
 * Seeds default data on first access.
 */
export function getActiveConnections(userKey) {
    if (typeof window === "undefined") return [];
    const key = `${CONNECTIONS_STORAGE_PREFIX}_${userKey}`;
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) {
            const initial = getInitialSeedConnections();
            localStorage.setItem(key, JSON.stringify(initial));
            return initial;
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Failed to read active connections:", error);
        return [];
    }
}

/**
 * Saves active connections for the given user key and dispatches sync event.
 */
export function saveActiveConnections(userKey, connections) {
    if (typeof window === "undefined") return;
    const key = `${CONNECTIONS_STORAGE_PREFIX}_${userKey}`;
    const safeList = Array.isArray(connections) ? connections : [];
    try {
        localStorage.setItem(key, JSON.stringify(safeList));
        dispatchConnectionsUpdated({ userKey, type: "active", connections: safeList });
    } catch (error) {
        console.error("Failed to save active connections:", error);
    }
}

/**
 * Retrieves outgoing connection requests metadata.
 */
export function getConnectionRequests(userKey) {
    if (typeof window === "undefined") return { connectedIds: [], weekStart: getWeekStart(), weeklyIds: [] };
    const key = `${REQUESTS_STORAGE_PREFIX}_${encodeURIComponent(userKey)}`;
    const currentWeek = getWeekStart();
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) {
            const initial = getInitialSeedRequests();
            localStorage.setItem(key, JSON.stringify(initial));
            return initial;
        }
        const parsed = JSON.parse(raw);
        const connectedIds = Array.isArray(parsed?.connectedIds) ? parsed.connectedIds : [];
        const weekStart = typeof parsed?.weekStart === "string" ? parsed.weekStart : currentWeek;
        const weeklyIds = weekStart === currentWeek && Array.isArray(parsed?.weeklyIds) ? parsed.weeklyIds : [];
        return { connectedIds, weekStart, weeklyIds };
    } catch (error) {
        console.error("Failed to read connection requests:", error);
        return { connectedIds: [], weekStart: currentWeek, weeklyIds: [] };
    }
}

/**
 * Saves outgoing connection requests metadata.
 */
export function saveConnectionRequests(userKey, requests) {
    if (typeof window === "undefined") return;
    const key = `${REQUESTS_STORAGE_PREFIX}_${encodeURIComponent(userKey)}`;
    try {
        localStorage.setItem(key, JSON.stringify(requests));
        dispatchConnectionsUpdated({ userKey, type: "requests", requests });
    } catch (error) {
        console.error("Failed to save connection requests:", error);
    }
}

/**
 * Retrieves incoming invitations for the user key.
 */
export function getIncomingRequests(userKey) {
    if (typeof window === "undefined") return [];
    const key = `${INCOMING_STORAGE_PREFIX}_${encodeURIComponent(userKey)}`;
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) {
            const initial = getInitialSeedIncoming();
            localStorage.setItem(key, JSON.stringify(initial));
            return initial;
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Failed to read incoming requests:", error);
        return [];
    }
}

/**
 * Saves incoming invitations for the user key.
 */
export function saveIncomingRequests(userKey, requests) {
    if (typeof window === "undefined") return;
    const key = `${INCOMING_STORAGE_PREFIX}_${encodeURIComponent(userKey)}`;
    const safeList = Array.isArray(requests) ? requests : [];
    try {
        localStorage.setItem(key, JSON.stringify(safeList));
        dispatchConnectionsUpdated({ userKey, type: "incoming", requests: safeList });
    } catch (error) {
        console.error("Failed to save incoming requests:", error);
    }
}

/**
 * Accepts an incoming invitation: adds student to active connections, removes request.
 */
export function acceptIncomingRequest(userKey, requestId) {
    const incoming = getIncomingRequests(userKey);
    const target = incoming.find((item) => item.id === requestId);
    if (!target) return { success: false, reason: "NOT_FOUND" };

    const remainingIncoming = incoming.filter((item) => item.id !== requestId);
    saveIncomingRequests(userKey, remainingIncoming);

    const active = getActiveConnections(userKey);
    const student = target.student || {};
    const alreadyConnected = active.some((c) => c.id === (target.studentId || student.id));

    if (!alreadyConnected) {
        const newConnection = {
            id: target.studentId || student.id || `stu_${Date.now()}`,
            name: student.name || "Student",
            role: student.role || `${student.major || "Student"} (${student.year || "Colleague"})`,
            email: student.email || "",
            avatar: student.avatar || "",
            college: student.college || "",
            major: student.major || "",
            year: student.year || "",
            skills: student.skills || [],
            availability: student.availability || "open_to_collaborate",
            connectedAt: new Date().toISOString(),
            notes: target.message ? `Accepted invite: "${target.message}"` : "Accepted connection request."
        };
        saveActiveConnections(userKey, [newConnection, ...active]);
    }

    return { success: true };
}

/**
 * Declines an incoming invitation: removes from incoming list.
 */
export function declineIncomingRequest(userKey, requestId) {
    const incoming = getIncomingRequests(userKey);
    const remaining = incoming.filter((item) => item.id !== requestId);
    saveIncomingRequests(userKey, remaining);
    return { success: true };
}

/**
 * Sends an outgoing connection request to a student.
 * Enforces a maximum of 5 requests per calendar week on the free tier.
 */
export function sendOutgoingRequest(userKey, student, isPro = false) {
    if (!student || !student.id) return { success: false, reason: "INVALID_STUDENT" };

    const active = getActiveConnections(userKey);
    if (active.some((c) => c.id === student.id)) {
        return { success: false, reason: "ALREADY_CONNECTED" };
    }

    const currentWeek = getWeekStart();
    const reqs = getConnectionRequests(userKey);
    const weeklyIds = reqs.weekStart === currentWeek ? reqs.weeklyIds : [];

    if (reqs.connectedIds.includes(student.id)) {
        return { success: false, reason: "ALREADY_REQUESTED" };
    }

    // Weekly limit: 5 requests for non-Pro users
    if (!isPro && weeklyIds.length >= 5) {
        return {
            success: false,
            reason: "QUOTA_EXCEEDED",
            remaining: 0,
            limit: 5
        };
    }

    const updated = {
        connectedIds: [...reqs.connectedIds, student.id],
        weekStart: currentWeek,
        weeklyIds: [...weeklyIds, student.id]
    };

    saveConnectionRequests(userKey, updated);
    return {
        success: true,
        remaining: isPro ? Infinity : Math.max(0, 5 - updated.weeklyIds.length)
    };
}

/**
 * Cancels / withdraws a previously sent outgoing connection request.
 */
export function cancelOutgoingRequest(userKey, studentId) {
    const reqs = getConnectionRequests(userKey);
    const updated = {
        ...reqs,
        connectedIds: reqs.connectedIds.filter((id) => id !== studentId),
        weeklyIds: reqs.weeklyIds.filter((id) => id !== studentId)
    };
    saveConnectionRequests(userKey, updated);
    return { success: true };
}

/**
 * Removes an active connection.
 */
export function removeConnection(userKey, connectionId) {
    const active = getActiveConnections(userKey);
    const filtered = active.filter((c) => c.id !== connectionId);
    saveActiveConnections(userKey, filtered);
    return { success: true };
}

/**
 * Exports connections to CSV string.
 */
export function exportConnectionsToCSV(connections = []) {
    const headers = ["ID", "Name", "Role", "Email", "College", "Major", "Year", "Availability", "ConnectedAt", "Skills"];
    const rows = connections.map((c) => [
        `"${c.id || ""}"`,
        `"${(c.name || "").replace(/"/g, '""')}"`,
        `"${(c.role || "").replace(/"/g, '""')}"`,
        `"${(c.email || "").replace(/"/g, '""')}"`,
        `"${(c.college || "").replace(/"/g, '""')}"`,
        `"${(c.major || "").replace(/"/g, '""')}"`,
        `"${(c.year || "").replace(/"/g, '""')}"`,
        `"${(c.availability || "").replace(/"/g, '""')}"`,
        `"${(c.connectedAt || "").replace(/"/g, '""')}"`,
        `"${(Array.isArray(c.skills) ? c.skills.join("; ") : "").replace(/"/g, '""')}"`
    ]);

    const content = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    return content;
}

/**
 * Exports connections to formatted JSON string.
 */
export function exportConnectionsToJSON(connections = []) {
    return JSON.stringify(connections, null, 2);
}
