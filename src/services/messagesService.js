import {
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

const MESSAGES_COLLECTION_NAME = "messages";

/**
 * Sends a message document to Firebase Firestore if the user is authenticated.
 * Returns { success, id } on success, or { success: false, error } on failure/offline.
 */
export async function sendFirestoreMessage(messageData) {
    const user = auth.currentUser;
    if (!user || !db) {
        return { success: false, reason: "NOT_AUTHENTICATED" };
    }

    try {
        const messagesCollection = collection(db, MESSAGES_COLLECTION_NAME);
        const docRef = await addDoc(messagesCollection, {
            ...messageData,
            senderId: user.uid,
            senderEmail: user.email || "",
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.warn("Firestore message delivery failed (offline or permission):", error?.message || error);
        return { success: false, error: error?.message || error };
    }
}

/**
 * Listens for real-time messages from Firebase Firestore when the user is authenticated.
 * Returns an unsubscribe callback.
 */
export function subscribeToFirestoreMessages(onMessages, onError) {
    const user = auth.currentUser;
    if (!user || !db) {
        return () => {};
    }

    try {
        const messagesCollection = collection(db, MESSAGES_COLLECTION_NAME);
        const q = query(messagesCollection, orderBy("createdAt", "asc"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const list = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    list.push({
                        id: doc.id,
                        ...data,
                        timestamp: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.timestamp || new Date().toISOString())
                    });
                });
                if (typeof onMessages === "function") {
                    onMessages(list);
                }
            },
            (error) => {
                console.warn("Firestore messages subscription warning:", error?.message || error);
                if (typeof onError === "function") {
                    onError(error);
                }
            }
        );

        return unsubscribe;
    } catch (error) {
        console.warn("Failed to subscribe to Firestore messages:", error);
        return () => {};
    }
}
