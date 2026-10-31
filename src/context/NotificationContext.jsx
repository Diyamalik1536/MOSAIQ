
/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useUser } from './UserContext';

const NotificationContext = createContext();
const STORAGE_PREFIX = 'talentforge_notifications_v1';

function getUserKey(user) {
    return user?.uid || user?.id || user?.email || 'guest';
}

function normalizeNotifications(value) {
    if (!Array.isArray(value)) return [];

    return value.map((notification) =>
        notification.id === 'n1' && !notification.applicationId
            ? {
                  ...notification,
                  applicationId: 'app_001',
                  actionUrl: undefined,
              }
            : notification
    );
}

function readNotifications(storageKey) {
    try {
        const saved = localStorage.getItem(storageKey);
        return saved ? normalizeNotifications(JSON.parse(saved)) : [];
    } catch (error) {
        console.error('Failed to read notifications from localStorage:', error);
        return [];
    }
}

function createPostNotification(post) {
    const authorName =
        post.author?.name ||
        post.author?.fullName ||
        post.authorName ||
        'A MOSAIQ student';

    return {
        id: `post_${post.id}`,
        type: 'posts',
        category: 'posts',
        title: 'New community post',
        message: `${authorName} shared a post with the community.`,
        postId: post.id,
        read: false,
        createdAt: post.createdAt || new Date().toISOString(),
        actionUrl: '/dashboard',
    };
}

function NotificationStore({ storageKey, currentUser, children }) {
    const [notifications, setNotifications] = useState(() =>
        readNotifications(storageKey)
    );

    const posts = useSelector((state) => state.posts.items);
    const postStatus = useSelector((state) => state.posts.status);

    // Persist notifications for this user.
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(notifications));
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    }, [notifications, storageKey]);

    // Generate notifications for newly detected community posts.
    useEffect(() => {
        if (postStatus !== 'succeeded' || !currentUser?.uid) return;

        const seenPostsKey =
            `${STORAGE_PREFIX}_seen_posts_${getUserKey(currentUser)}`;

        const currentPostIds = posts
            .map((post) => post.id)
            .filter(Boolean);

        try {
            const savedIds = localStorage.getItem(seenPostsKey);

            // First successful load: record existing posts without flooding notifications.
            if (savedIds === null) {
                localStorage.setItem(
                    seenPostsKey,
                    JSON.stringify(currentPostIds)
                );
                return;
            }

            const parsedIds = JSON.parse(savedIds);

            if (!Array.isArray(parsedIds)) {
                localStorage.setItem(
                    seenPostsKey,
                    JSON.stringify(currentPostIds)
                );
                return;
            }

            const seenIds = new Set(parsedIds);

            const newPosts = posts.filter((post) => {
                if (!post.id || seenIds.has(post.id)) return false;

                const authorId =
                    post.author?.uid ||
                    post.author?.id ||
                    post.authorId ||
                    post.userId;

                const authorEmail =
                    post.author?.email ||
                    post.authorEmail;

                // Never notify users about their own posts.
                if (authorId && authorId === currentUser.uid) return false;

                if (
                    authorEmail &&
                    currentUser.email &&
                    authorEmail.toLowerCase() === currentUser.email.toLowerCase()
                ) {
                    return false;
                }

                return true;
            });

            // Record all current IDs, including the user's own posts.
            const updatedIds = new Set([...seenIds, ...currentPostIds]);

            localStorage.setItem(
                seenPostsKey,
                JSON.stringify([...updatedIds])
            );

            if (newPosts.length > 0) {
    const additions = newPosts
        .map(createPostNotification);

    // Defer the state update until after the effect finishes.
    queueMicrotask(() => {
        setNotifications((previous) => {
            const existingIds = new Set(
                previous.map((item) => item.id)
            );

            const uniqueAdditions = additions.filter(
                (item) => !existingIds.has(item.id)
            );

            return uniqueAdditions.length > 0
                ? [...uniqueAdditions, ...previous]
                : previous;
        });
    });
}
        } catch (error) {
            console.error('Failed to process post notifications:', error);
        }
    }, [posts, postStatus, currentUser]);

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    const markAsRead = (id) => {
        setNotifications((previous) =>
            previous.map((item) =>
                item.id === id ? { ...item, read: true } : item
            )
        );
    };

    const toggleReadStatus = (id) => {
        setNotifications((previous) =>
            previous.map((item) =>
                item.id === id ? { ...item, read: !item.read } : item
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications((previous) =>
            previous.map((item) => ({ ...item, read: true }))
        );
    };

    const deleteNotification = (id) => {
        setNotifications((previous) =>
            previous.filter((item) => item.id !== id)
        );
    };

    const clearReadNotifications = () => {
        setNotifications((previous) =>
            previous.filter((item) => !item.read)
        );
    };

    const resetNotifications = () => {
        setNotifications([]);
    };

    const addNotification = (notification) => {
        setNotifications((previous) =>
            previous.some((item) => item.id === notification.id)
                ? previous
                : [notification, ...previous]
        );
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                toggleReadStatus,
                markAllAsRead,
                deleteNotification,
                clearReadNotifications,
                resetNotifications,
                addNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function NotificationProvider({ children }) {
    const { currentUser } = useUser();
    const userKey = getUserKey(currentUser);

    return (
        <NotificationStore
            key={userKey}
            storageKey={`${STORAGE_PREFIX}_${userKey}`}
            currentUser={currentUser}
        >
            {children}
        </NotificationStore>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            'useNotifications must be used within a NotificationProvider'
        );
    }

    return context;
}

export default NotificationContext;
