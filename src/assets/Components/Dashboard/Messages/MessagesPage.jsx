import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMessages } from "../../../../context/MessageContext";
import { useUser } from "../../../../context/UserContext";
import { studentData } from "../../../../data/students";
import { getActiveConnections, getUserKey } from "../../../../services/connectionsService";
import "./MessagesPage.css";

function formatRelativeTime(dateString) {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return "Just now";
    } catch {
        return "";
    }
}

function MessagesPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser } = useUser();
    const userKey = getUserKey(currentUser);
    const myId = currentUser?.uid || currentUser?.id || "me";

    const {
        messages,
        sendMessage,
        markConversationAsRead,
        clearConversation
    } = useMessages();

    const targetUserId = searchParams.get("user");

    const [activeConversationId, setActiveConversationId] = useState(targetUserId || "stu_001");
    const [searchQuery, setSearchQuery] = useState("");
    const [messageInput, setMessageInput] = useState("");
    const [showMobileChat, setShowMobileChat] = useState(Boolean(targetUserId));

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Read active connections to enrich peer profiles
    const connections = useMemo(() => getActiveConnections(userKey), [userKey]);

    // Build map of known peers (from connections & studentData)
    const peerDirectory = useMemo(() => {
        const map = new Map();
        studentData.forEach((s) => map.set(s.id, s));
        connections.forEach((c) => {
            const existing = map.get(c.id) || {};
            map.set(c.id, { ...existing, ...c });
        });
        return map;
    }, [connections]);

    // Group messages by conversationId
    const conversations = useMemo(() => {
        const convMap = new Map();

        // 1. Collect all conversations from existing messages
        messages.forEach((msg) => {
            const cId = msg.conversationId || msg.recipientId || "general";
            if (!convMap.has(cId)) {
                convMap.set(cId, []);
            }
            convMap.get(cId).push(msg);
        });

        // 2. Ensure targetUserId has an entry even if no messages yet
        if (targetUserId && !convMap.has(targetUserId)) {
            convMap.set(targetUserId, []);
        }

        // 3. Ensure connected peers have entries if user wants to see them
        connections.forEach((conn) => {
            if (!convMap.has(conn.id)) {
                convMap.set(conn.id, []);
            }
        });

        // Build sorted summaries
        const list = [];
        convMap.forEach((msgList, cId) => {
            const peer = peerDirectory.get(cId) || {
                id: cId,
                name: "Peer Member",
                role: "Student",
                avatar: "",
                availability: "open"
            };

            const sortedMsgs = [...msgList].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const lastMsg = sortedMsgs[sortedMsgs.length - 1] || null;
            const unreadCount = sortedMsgs.filter((m) => !m.read && m.senderId !== myId).length;

            list.push({
                conversationId: cId,
                peer,
                messages: sortedMsgs,
                lastMessage: lastMsg,
                unreadCount,
                lastTimestamp: lastMsg ? new Date(lastMsg.timestamp).getTime() : 0
            });
        });

        // Sort by latest message timestamp descending
        list.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
        return list;
    }, [messages, targetUserId, connections, peerDirectory, myId]);

    // Handle initial targetUserId from URL
    useEffect(() => {
        if (targetUserId) {
            setActiveConversationId(targetUserId);
            setShowMobileChat(true);
            markConversationAsRead(targetUserId);
            // Focus composer
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [targetUserId, markConversationAsRead]);

    // Automatically mark active conversation as read
    useEffect(() => {
        if (activeConversationId) {
            markConversationAsRead(activeConversationId);
        }
    }, [activeConversationId, markConversationAsRead]);

    // Auto-scroll to bottom of chat
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [activeConversationId, messages, scrollToBottom]);

    // Filter conversations by search term
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase().trim();
        return conversations.filter((c) => {
            const name = (c.peer.name || "").toLowerCase();
            const college = (c.peer.college || "").toLowerCase();
            const lastText = (c.lastMessage?.text || "").toLowerCase();
            return name.includes(q) || college.includes(q) || lastText.includes(q);
        });
    }, [conversations, searchQuery]);

    // Active conversation details
    const activeConversation = useMemo(() => {
        return conversations.find((c) => c.conversationId === activeConversationId) || null;
    }, [conversations, activeConversationId]);

    const activePeer = activeConversation?.peer || peerDirectory.get(activeConversationId) || {
        id: activeConversationId,
        name: "Student Collaborator",
        role: "Student",
        avatar: "",
        availability: "open"
    };

    const handleSelectConversation = (cId) => {
        setActiveConversationId(cId);
        setShowMobileChat(true);
        markConversationAsRead(cId);
    };

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        const text = messageInput.trim();
        if (!text || !activeConversationId) return;

        sendMessage({
            conversationId: activeConversationId,
            recipientId: activePeer.id,
            recipientName: activePeer.name,
            recipientAvatar: activePeer.avatar,
            text
        });

        setMessageInput("");
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSuggestionClick = (suggestionText) => {
        setMessageInput(suggestionText);
        inputRef.current?.focus();
    };

    const handleScheduleCollab = () => {
        const studentName = encodeURIComponent(activePeer.name || "");
        navigate(`/schedule?collabWith=${studentName}`);
    };

    return (
        <div className="messages-page-wrapper" data-testid="messages-page">
            <div className="messages-hub-container">
                {/* Left Panel: Conversations List */}
                <aside className={`conversations-sidebar ${showMobileChat ? "hidden-mobile" : ""}`}>
                    <div className="conversations-header">
                        <div className="conversations-title-row">
                            <h2>
                                <i className="bi bi-chat-dots"></i>
                                <span>Messaging</span>
                            </h2>
                        </div>

                        <div className="conversations-search-box">
                            <i className="bi bi-search"></i>
                            <input
                                type="search"
                                className="conversations-search-input"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search conversations"
                            />
                        </div>
                    </div>

                    <div className="conversations-list" data-testid="conversations-list">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map((conv) => {
                                const isActive = conv.conversationId === activeConversationId;
                                const avatar = conv.peer.avatar;
                                const avail = conv.peer.availability || "open";

                                return (
                                    <button
                                        key={conv.conversationId}
                                        type="button"
                                        className={`conversation-card-item ${isActive ? "active" : ""}`}
                                        onClick={() => handleSelectConversation(conv.conversationId)}
                                        data-testid={`conv-item-${conv.conversationId}`}
                                    >
                                        <div className="conversation-avatar-wrap">
                                            {avatar ? (
                                                <img
                                                    src={avatar}
                                                    alt={conv.peer.name}
                                                    className="conversation-avatar-img"
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                        if (e.target.nextSibling) {
                                                            e.target.nextSibling.style.display = "flex";
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="conversation-avatar-fallback"
                                                style={{ display: avatar ? "none" : "flex" }}
                                            >
                                                {(conv.peer.name || "U").charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`conversation-avail-dot ${avail}`} />
                                        </div>

                                        <div className="conversation-details">
                                            <div className="conversation-name-time">
                                                <h4 className="conversation-name">{conv.peer.name}</h4>
                                                {conv.lastMessage && (
                                                    <span className="conversation-time">
                                                        {formatRelativeTime(conv.lastMessage.timestamp)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="conversation-preview-row">
                                                <p className="conversation-last-msg">
                                                    {conv.lastMessage
                                                        ? (conv.lastMessage.senderId === myId ? "You: " : "") + conv.lastMessage.text
                                                        : "No messages yet — click to say hi!"}
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="conversation-unread-badge">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="conversations-empty-list">
                                {searchQuery ? "No matching conversations found." : "No conversations yet."}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Right Panel: Active Conversation View */}
                {activeConversationId ? (
                    <main className={`chat-window-panel ${!showMobileChat ? "hidden-mobile" : ""}`}>
                        {/* Header */}
                        <header className="chat-header">
                            <div className="chat-header-profile">
                                <button
                                    type="button"
                                    className="chat-back-btn"
                                    onClick={() => setShowMobileChat(false)}
                                    aria-label="Back to conversations list"
                                >
                                    <i className="bi bi-chevron-left"></i>
                                </button>

                                {activePeer.avatar ? (
                                    <img
                                        src={activePeer.avatar}
                                        alt={activePeer.name}
                                        className="chat-peer-avatar"
                                    />
                                ) : (
                                    <div className="conversation-avatar-fallback">
                                        {(activePeer.name || "U").charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <div className="chat-peer-info">
                                    <div className="chat-peer-name-row">
                                        <h3 className="chat-peer-name">{activePeer.name}</h3>
                                        <span className={`connection-avail-badge ${activePeer.availability || "open"}`}>
                                            {(activePeer.availability || "open").replace(/_/g, " ")}
                                        </span>
                                    </div>
                                    <p className="chat-peer-role">
                                        {activePeer.role || activePeer.major || "Peer Member"}
                                        {activePeer.college ? ` • ${activePeer.college}` : ""}
                                    </p>
                                </div>
                            </div>

                            <div className="chat-header-actions">
                                <button
                                    type="button"
                                    className="chat-action-btn"
                                    onClick={handleScheduleCollab}
                                    title="Schedule 1-on-1 collaboration in Planner"
                                >
                                    <i className="bi bi-calendar-event"></i>
                                    <span>Schedule Collab</span>
                                </button>
                                <button
                                    type="button"
                                    className="chat-action-btn"
                                    onClick={() => clearConversation(activeConversationId)}
                                    title="Clear conversation history"
                                >
                                    <i className="bi bi-trash3"></i>
                                </button>
                            </div>
                        </header>

                        {/* Stream */}
                        <div className="chat-messages-stream" data-testid="chat-messages-stream">
                            <div className="chat-intro-banner">
                                {activePeer.avatar && (
                                    <img
                                        src={activePeer.avatar}
                                        alt={activePeer.name}
                                        className="chat-intro-avatar"
                                    />
                                )}
                                <h3>{activePeer.name}</h3>
                                <p>This is the beginning of your direct conversation on MOSAIQ.</p>
                            </div>

                            {activeConversation?.messages?.map((msg) => {
                                const isMe = msg.senderId === myId;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`chat-bubble-row ${isMe ? "sent" : "received"}`}
                                    >
                                        <div className="chat-bubble">
                                            {msg.text}
                                        </div>
                                        <span className="chat-bubble-time">
                                            {formatRelativeTime(msg.timestamp)}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Composer */}
                        <footer className="chat-composer-section">
                            <div className="chat-suggestion-chips">
                                <button
                                    type="button"
                                    className="chat-suggestion-chip"
                                    onClick={() => handleSuggestionClick("Interested in collaborating on a project together!")}
                                >
                                    👋 Project Collaboration
                                </button>
                                <button
                                    type="button"
                                    className="chat-suggestion-chip"
                                    onClick={() => handleSuggestionClick("Let's schedule a quick call this week!")}
                                >
                                    ☕ Schedule Chat
                                </button>
                                <button
                                    type="button"
                                    className="chat-suggestion-chip"
                                    onClick={() => handleSuggestionClick("Thanks for connecting with me on MOSAIQ!")}
                                >
                                    ✨ Thanks for connecting!
                                </button>
                            </div>

                            <form onSubmit={handleSendMessage} className="chat-composer-form">
                                <textarea
                                    ref={inputRef}
                                    className="chat-textarea"
                                    rows={1}
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Write a message... (Press Enter to send)"
                                    aria-label="Message input"
                                    maxLength={800}
                                />
                                <button
                                    type="submit"
                                    className="chat-send-btn"
                                    disabled={!messageInput.trim()}
                                    aria-label="Send message"
                                    data-testid="chat-send-btn"
                                >
                                    <i className="bi bi-send-fill"></i>
                                </button>
                            </form>
                        </footer>
                    </main>
                ) : (
                    <div className="chat-empty-panel">
                        <div className="chat-empty-icon">
                            <i className="bi bi-chat-heart"></i>
                        </div>
                        <h3>Select a conversation</h3>
                        <p>Choose a colleague from the list on the left to start messaging and collaborating.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessagesPage;
