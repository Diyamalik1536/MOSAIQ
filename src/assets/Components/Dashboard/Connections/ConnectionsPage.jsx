import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { studentData } from "../../../../data/students";
import {
    getUserKey,
    getActiveConnections,
    getConnectionRequests,
    getIncomingRequests,
    acceptIncomingRequest,
    declineIncomingRequest,
    sendOutgoingRequest,
    cancelOutgoingRequest,
    removeConnection,
    exportConnectionsToCSV,
    exportConnectionsToJSON,
    getWeekStart
} from "../../../../services/connectionsService";
import ConnectionCard from "./ConnectionCard";
import ContactModal from "./ContactModal";
import "./ConnectionsPage.css";

function ConnectionsPage() {
    const navigate = useNavigate();
    const { currentUser, isPro, openUpgradeModal } = useUser();
    const userKey = getUserKey(currentUser);
    const [activeConnections, setActiveConnections] = useState(() => getActiveConnections(userKey));
    const [connectionRequests, setConnectionRequests] = useState(() => getConnectionRequests(userKey));
    const [incomingRequests, setIncomingRequests] = useState(() => getIncomingRequests(userKey));

    const [activeTab, setActiveTab] = useState("connected");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterAvailability, setFilterAvailability] = useState("all");
    const [sortOrder, setSortOrder] = useState("recent");

    const [contactModalConnection, setContactModalConnection] = useState(null);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [connectingStudentId, setConnectingStudentId] = useState(null);

    // Refresh state from storage when userKey changes or on external updates
    const refreshAllState = useCallback(() => {
        setActiveConnections(getActiveConnections(userKey));
        setConnectionRequests(getConnectionRequests(userKey));
        setIncomingRequests(getIncomingRequests(userKey));
    }, [userKey]);

    useEffect(() => {
        refreshAllState();
    }, [refreshAllState]);

    // Cross-tab and inter-component sync via window events
    useEffect(() => {
        const handleSync = () => {
            refreshAllState();
        };

        window.addEventListener("connectionsUpdated", handleSync);
        window.addEventListener("storage", handleSync);

        return () => {
            window.removeEventListener("connectionsUpdated", handleSync);
            window.removeEventListener("storage", handleSync);
        };
    }, [refreshAllState]);

    // Quota statistics
    const currentWeek = getWeekStart();
    const weeklyCount = connectionRequests.weekStart === currentWeek
        ? (connectionRequests.weeklyIds?.length || 0)
        : 0;
    const freeQuotaRemaining = Math.max(0, 5 - weeklyCount);

    // Contact handlers: navigate directly to Messages tab with recipient preselected
    const handleOpenContact = useCallback((connection) => {
        if (connection?.id) {
            navigate(`/messages?user=${encodeURIComponent(connection.id)}`);
        }
    }, [navigate]);

    const handleCloseContact = useCallback(() => {
        setIsContactOpen(false);
        setContactModalConnection(null);
    }, []);

    // Connection actions
    const handleRemoveConnection = useCallback((connectionId) => {
        removeConnection(userKey, connectionId);
        setActiveConnections(getActiveConnections(userKey));
    }, [userKey]);

    const handleAcceptIncoming = useCallback((requestId) => {
        acceptIncomingRequest(userKey, requestId);
        refreshAllState();
    }, [userKey, refreshAllState]);

    const handleDeclineIncoming = useCallback((requestId) => {
        declineIncomingRequest(userKey, requestId);
        setIncomingRequests(getIncomingRequests(userKey));
    }, [userKey]);

    const handleCancelOutgoing = useCallback((studentId) => {
        cancelOutgoingRequest(userKey, studentId);
        setConnectionRequests(getConnectionRequests(userKey));
    }, [userKey]);

    const handleConnectStudent = useCallback((student) => {
        setConnectingStudentId(student.id);

        const result = sendOutgoingRequest(userKey, student, isPro);
        setConnectingStudentId(null);

        if (!result.success) {
            if (result.reason === "QUOTA_EXCEEDED") {
                if (typeof openUpgradeModal === "function") {
                    openUpgradeModal("Unlimited Connect Requests (Weekly Free limit of 5 reached)");
                } else {
                    alert("You have reached your weekly limit of 5 connection requests. Upgrade to Pro for unlimited requests!");
                }
            } else if (result.reason === "ALREADY_CONNECTED") {
                alert(`You are already connected with ${student.name}.`);
            } else if (result.reason === "ALREADY_REQUESTED") {
                alert(`You have already sent a connection request to ${student.name}.`);
            }
            return;
        }

        refreshAllState();
    }, [userKey, isPro, openUpgradeModal, refreshAllState]);

    // Export actions
    const handleExportCSV = () => {
        const csvContent = exportConnectionsToCSV(activeConnections);
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `talentforge_connections_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportJSON = () => {
        const jsonContent = exportConnectionsToJSON(activeConnections);
        const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `talentforge_connections_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Filtered & sorted active connections
    const filteredActiveConnections = useMemo(() => {
        let list = [...activeConnections];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            list = list.filter((c) => {
                const name = (c.name || "").toLowerCase();
                const role = (c.role || "").toLowerCase();
                const college = (c.college || "").toLowerCase();
                const major = (c.major || "").toLowerCase();
                const skills = Array.isArray(c.skills) ? c.skills.map((s) => s.toLowerCase()).join(" ") : "";
                return (
                    name.includes(query) ||
                    role.includes(query) ||
                    college.includes(query) ||
                    major.includes(query) ||
                    skills.includes(query)
                );
            });
        }

        if (filterAvailability !== "all") {
            list = list.filter((c) => (c.availability || "open") === filterAvailability);
        }

        if (sortOrder === "name_asc") {
            list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        } else if (sortOrder === "name_desc") {
            list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        } else {
            // "recent" by connectedAt
            list.sort((a, b) => new Date(b.connectedAt || 0) - new Date(a.connectedAt || 0));
        }

        return list;
    }, [activeConnections, searchQuery, filterAvailability, sortOrder]);

    // Pending requests with resolved student data
    const pendingStudents = useMemo(() => {
        const ids = connectionRequests.connectedIds || [];
        return ids.map((id) => {
            const found = studentData.find((s) => s.id === id);
            return found || {
                id,
                name: "Student",
                role: "Peer Collaborator",
                college: "Campus Member",
                availability: "open"
            };
        });
    }, [connectionRequests.connectedIds]);

    // Discover peer suggestions (not connected & not requested)
    const suggestedStudents = useMemo(() => {
        const connectedIdSet = new Set(activeConnections.map((c) => c.id));
        const requestedIdSet = new Set(connectionRequests.connectedIds || []);
        const incomingIdSet = new Set(incomingRequests.map((i) => i.studentId));

        return studentData.filter((student) => {
            const isUser = student.id === currentUser?.uid || student.id === currentUser?.id;
            if (isUser) return false;
            if (connectedIdSet.has(student.id)) return false;
            if (requestedIdSet.has(student.id)) return false;
            if (incomingIdSet.has(student.id)) return false;
            return true;
        });
    }, [activeConnections, connectionRequests.connectedIds, incomingRequests, currentUser]);

    return (
        <div className="connections-page" data-testid="connections-page">
            {/* Header */}
            <header className="connections-header-wrapper">
                <div className="connections-header-titles">
                    <h1>
                        Connections & <span className="highlight">Networking</span>
                    </h1>
                    <p>Manage your professional campus network, incoming invites, and active collaborators.</p>
                </div>

                <div className="connections-header-actions">
                    <button
                        type="button"
                        className="connections-export-btn"
                        onClick={handleExportCSV}
                        title="Download connections list as CSV spreadsheet"
                    >
                        <i className="bi bi-file-earmark-spreadsheet"></i>
                        <span>Export CSV</span>
                    </button>
                    <button
                        type="button"
                        className="connections-export-btn"
                        onClick={handleExportJSON}
                        title="Download connections as JSON backup"
                    >
                        <i className="bi bi-code-square"></i>
                        <span>Export JSON</span>
                    </button>
                </div>
            </header>

            {/* Quota Banner */}
            <section className="connections-quota-banner" aria-label="Networking Plan Status">
                <div className="connections-quota-info">
                    <div className="connections-quota-icon">
                        <i className={isPro ? "bi bi-patch-check-fill" : "bi bi-lightning-charge-fill"}></i>
                    </div>
                    <div className="connections-quota-text">
                        <strong>
                            {isPro ? "Pro Membership Active" : `${freeQuotaRemaining} of 5 Weekly Free Requests Remaining`}
                        </strong>
                        <span>
                            {isPro
                                ? "You enjoy unlimited connection requests and direct peer networking."
                                : "Free users can send up to 5 connection requests per calendar week."}
                        </span>
                    </div>
                </div>

                {!isPro && (
                    <button
                        type="button"
                        className="connections-upgrade-link"
                        onClick={() => openUpgradeModal && openUpgradeModal("Unlimited Connections (Pro Member)")}
                    >
                        <i className="bi bi-stars"></i>
                        <span>Upgrade to Pro</span>
                    </button>
                )}
            </section>

            {/* Navigation Tabs */}
            <nav className="connections-tabs" aria-label="Connection Tabs">
                <button
                    type="button"
                    className={`connections-tab-btn ${activeTab === "connected" ? "active" : ""}`}
                    onClick={() => setActiveTab("connected")}
                >
                    <i className="bi bi-people-fill"></i>
                    <span>My Connections</span>
                    <span className="connections-tab-badge">{activeConnections.length}</span>
                </button>

                <button
                    type="button"
                    className={`connections-tab-btn ${activeTab === "incoming" ? "active" : ""}`}
                    onClick={() => setActiveTab("incoming")}
                >
                    <i className="bi bi-envelope-open-fill"></i>
                    <span>Invitations</span>
                    {incomingRequests.length > 0 && (
                        <span className="connections-tab-badge">{incomingRequests.length}</span>
                    )}
                </button>

                <button
                    type="button"
                    className={`connections-tab-btn ${activeTab === "pending" ? "active" : ""}`}
                    onClick={() => setActiveTab("pending")}
                >
                    <i className="bi bi-send-fill"></i>
                    <span>Pending Requests</span>
                    {connectionRequests.connectedIds?.length > 0 && (
                        <span className="connections-tab-badge">{connectionRequests.connectedIds.length}</span>
                    )}
                </button>

                <button
                    type="button"
                    className={`connections-tab-btn ${activeTab === "discover" ? "active" : ""}`}
                    onClick={() => setActiveTab("discover")}
                >
                    <i className="bi bi-compass-fill"></i>
                    <span>Find Peers</span>
                    <span className="connections-tab-badge">{suggestedStudents.length}</span>
                </button>
            </nav>

            {/* Search and Filters Toolbar (visible on 'connected' tab) */}
            {activeTab === "connected" && (
                <div className="connections-toolbar">
                    <div className="connections-search-box">
                        <i className="bi bi-search"></i>
                        <input
                            type="search"
                            className="connections-search-input"
                            placeholder="Search by name, college, major, skill..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search connections"
                        />
                    </div>

                    <div className="connections-filters-group">
                        <select
                            className="connections-filter-select"
                            value={filterAvailability}
                            onChange={(e) => setFilterAvailability(e.target.value)}
                            aria-label="Filter by availability"
                        >
                            <option value="all">All Availability</option>
                            <option value="open_to_collaborate">Open to collaborate</option>
                            <option value="open">Open</option>
                            <option value="busy">Busy</option>
                        </select>

                        <select
                            className="connections-sort-select"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            aria-label="Sort connections"
                        >
                            <option value="recent">Recently Connected</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Tab 1: My Active Connections */}
            {activeTab === "connected" && (
                <div className="connections-grid" data-testid="active-connections-grid">
                    {filteredActiveConnections.length > 0 ? (
                        filteredActiveConnections.map((connection) => (
                            <ConnectionCard
                                key={connection.id}
                                variant="active"
                                data={connection}
                                onContact={handleOpenContact}
                                onRemove={handleRemoveConnection}
                            />
                        ))
                    ) : (
                        <div className="connections-empty-state">
                            <div className="connections-empty-icon">
                                <i className="bi bi-people"></i>
                            </div>
                            <h3>
                                {searchQuery || filterAvailability !== "all"
                                    ? "No connections match your filters"
                                    : "You haven't added any connections yet"}
                            </h3>
                            <p>
                                {searchQuery || filterAvailability !== "all"
                                    ? "Try adjusting your search keywords or resetting the availability filter."
                                    : "Start exploring campus students and project partners in the Find Peers tab!"}
                            </p>
                            {!searchQuery && filterAvailability === "all" && (
                                <button
                                    type="button"
                                    className="connections-empty-action"
                                    onClick={() => setActiveTab("discover")}
                                >
                                    <i className="bi bi-person-plus-fill"></i>
                                    <span>Discover Students</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Tab 2: Incoming Invitations */}
            {activeTab === "incoming" && (
                <div className="connections-grid" data-testid="incoming-requests-grid">
                    {incomingRequests.length > 0 ? (
                        incomingRequests.map((req) => (
                            <ConnectionCard
                                key={req.id}
                                variant="incoming"
                                data={req}
                                onAccept={handleAcceptIncoming}
                                onDecline={handleDeclineIncoming}
                            />
                        ))
                    ) : (
                        <div className="connections-empty-state">
                            <div className="connections-empty-icon">
                                <i className="bi bi-inbox"></i>
                            </div>
                            <h3>No pending invitations</h3>
                            <p>When someone invites you to connect, their invitation will appear right here.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Tab 3: Outgoing Pending Requests */}
            {activeTab === "pending" && (
                <div className="connections-grid" data-testid="pending-requests-grid">
                    {pendingStudents.length > 0 ? (
                        pendingStudents.map((student) => (
                            <ConnectionCard
                                key={student.id}
                                variant="pending"
                                data={student}
                                onCancel={handleCancelOutgoing}
                            />
                        ))
                    ) : (
                        <div className="connections-empty-state">
                            <div className="connections-empty-icon">
                                <i className="bi bi-send-check"></i>
                            </div>
                            <h3>No pending requests</h3>
                            <p>You don't have any outgoing connection requests waiting for response.</p>
                            <button
                                type="button"
                                className="connections-empty-action"
                                onClick={() => setActiveTab("discover")}
                            >
                                <i className="bi bi-compass"></i>
                                <span>Find People to Connect</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Tab 4: Discover / Suggested Peers */}
            {activeTab === "discover" && (
                <div className="connections-grid" data-testid="discover-grid">
                    {suggestedStudents.length > 0 ? (
                        suggestedStudents.map((student) => (
                            <ConnectionCard
                                key={student.id}
                                variant="suggested"
                                data={student}
                                onConnect={handleConnectStudent}
                                isConnecting={connectingStudentId === student.id}
                            />
                        ))
                    ) : (
                        <div className="connections-empty-state">
                            <div className="connections-empty-icon">
                                <i className="bi bi-check-all"></i>
                            </div>
                            <h3>You are connected with everyone!</h3>
                            <p>All available students are already in your network or have pending requests.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Contact Modal */}
            <ContactModal
                connection={contactModalConnection}
                isOpen={isContactOpen}
                onClose={handleCloseContact}
            />
        </div>
    );
}

export default ConnectionsPage;
