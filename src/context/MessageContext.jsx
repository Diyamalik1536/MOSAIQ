/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useUser } from './UserContext';
import { sendFirestoreMessage, subscribeToFirestoreMessages } from '../services/messagesService';

const MessageContext = createContext();
const STORAGE_PREFIX = 'talentforge_messages_v1';

function getUserKey(user) {
    return user?.uid || user?.id || user?.email || 'guest';
}

function getInitialSeedMessages(userKey) {
    return [
        {
            id: 'msg_seed_1',
            conversationId: 'stu_001',
            senderId: 'stu_001',
            senderName: 'Misthi Rawal',
            senderAvatar: 'https://img.magnific.com/premium-photo/memoji-emoji-handsome-smiling-man-white-background_826801-6987.jpg?semt=ais_hybrid&w=740&q=80',
            recipientId: userKey,
            recipientName: 'You',
            text: 'Hey! Loved connecting with you on MOSAIQ. Are you open to collaborating on a hackathon project this semester?',
            timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
            read: false
        },
        {
            id: 'msg_seed_2',
            conversationId: 'stu_002',
            senderId: 'stu_002',
            senderName: 'Aisha Khan',
            senderAvatar: 'https://img.magnific.com/free-psd/3d-illustration-human-avatar-profile_23-2150671140.jpg?semt=ais_hybrid&w=740&q=80',
            recipientId: userKey,
            recipientName: 'You',
            text: 'Hi! I just shared the updated design system Figma link. Take a look when you have a moment!',
            timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
            read: true
        }
    ];
}

function readMessages(storageKey, userKey) {
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved === null) {
            const initial = getInitialSeedMessages(userKey);
            localStorage.setItem(storageKey, JSON.stringify(initial));
            return initial;
        }
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function MessageStore({ storageKey, currentUser, children }) {
    const userKey = getUserKey(currentUser);
    const myId = currentUser?.uid || currentUser?.id || 'me';

    const [messages, setMessages] = useState(() => readMessages(storageKey, userKey));

    // Save to localStorage whenever messages change
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        } catch (error) {
            console.error('Failed to save messages to storage:', error);
        }
    }, [messages, storageKey]);

    // Connect to Firestore real-time listener if authenticated
    useEffect(() => {
        if (!currentUser?.uid) return;

        const unsubscribe = subscribeToFirestoreMessages((firestoreList) => {
            if (!Array.isArray(firestoreList) || firestoreList.length === 0) return;

            setMessages((previous) => {
                const existingMap = new Map(previous.map((m) => [m.id, m]));
                firestoreList.forEach((incoming) => {
                    // Only process messages involving current user
                    const isRelevant = incoming.senderId === currentUser.uid || incoming.recipientId === currentUser.uid;
                    if (isRelevant) {
                        existingMap.set(incoming.id, incoming);
                    }
                });
                return Array.from(existingMap.values());
            });
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [currentUser?.uid]);

    // Unread count: only incoming messages that are unread
    const unreadCount = useMemo(() => {
        return messages.filter((m) => !m.read && m.senderId !== myId).length;
    }, [messages, myId]);

    const markAllAsRead = useCallback(() => {
        setMessages((previous) => previous.map((message) => ({ ...message, read: true })));
    }, []);

    const markConversationAsRead = useCallback((conversationId) => {
        if (!conversationId) return;
        setMessages((previous) =>
            previous.map((m) => (m.conversationId === conversationId ? { ...m, read: true } : m))
        );
    }, []);

    const clearConversation = useCallback((conversationId) => {
        if (!conversationId) return;
        setMessages((previous) => previous.filter((m) => m.conversationId !== conversationId));
    }, []);

    const sendMessage = useCallback(
        async (newMessage) => {
            const conversationId = newMessage.conversationId || newMessage.recipientId || 'general';
            const entry = {
                id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                conversationId,
                senderId: myId,
                senderName: currentUser?.name || currentUser?.displayName || 'You',
                senderAvatar: currentUser?.avatar || currentUser?.photoURL || '',
                recipientId: newMessage.recipientId || '',
                recipientName: newMessage.recipientName || '',
                recipientAvatar: newMessage.recipientAvatar || '',
                text: newMessage.text || newMessage.content || '',
                timestamp: new Date().toISOString(),
                read: true
            };

            // Optimistically append locally
            setMessages((previous) => [...previous, entry]);

            // Attempt async Firestore delivery if user is online & authenticated
            sendFirestoreMessage({
                conversationId,
                recipientId: entry.recipientId,
                recipientName: entry.recipientName,
                recipientAvatar: entry.recipientAvatar,
                text: entry.text,
                senderAvatar: entry.senderAvatar,
                senderName: entry.senderName
            }).catch(() => {
                // Handled gracefully in messagesService
            });

            return entry;
        },
        [currentUser, myId]
    );

    return (
        <MessageContext.Provider
            value={{
                messages,
                unreadCount,
                markAllAsRead,
                markConversationAsRead,
                clearConversation,
                sendMessage
            }}
        >
            {children}
        </MessageContext.Provider>
    );
}

export function MessageProvider({ children }) {
    const { currentUser } = useUser();
    const userKey = getUserKey(currentUser);
    return (
        <MessageStore key={userKey} storageKey={`${STORAGE_PREFIX}_${userKey}`} currentUser={currentUser}>
            {children}
        </MessageStore>
    );
}

export function useMessages() {
    const context = useContext(MessageContext);
    if (!context) throw new Error('useMessages must be used within a MessageProvider');
    return context;
}
