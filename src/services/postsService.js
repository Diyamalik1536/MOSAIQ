
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  runTransaction,
  getDoc,
} from "firebase/firestore";


import { db, auth } from "../config/firebase";
// Community posts are shared across the Firebase project, so any signed-in
// collaborator can create and read them.
function requireAuthenticatedUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in with your MOSAIQ account to access community posts.");
  }

  return user;
}


// Firestore collection for community posts
const postsCollection = collection(db, "posts");

// Add a new community post

export async function createPost(postData) {
  // Firebase restores persisted sessions asynchronously on page load. Wait
  // for that initial check so a valid official account is not treated as
  // signed out when the post form is submitted quickly.
  await auth.authStateReady();
  const user = requireAuthenticatedUser();

  try {
    return await addDoc(postsCollection, {
      ...postData,
      upvoteCount: 0,
      author: {
        ...postData.author,
        id: user.uid,
        uid: user.uid,
        email: user.email,
      },
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (error?.code === "permission-denied") {
      throw new Error(
        "Firestore denied this post. Check the Firebase project's Firestore rules for create access to the posts collection."
      );
    }
    if (error?.code === "unavailable") {
      throw new Error(
        "Firestore is currently unreachable. Check your connection and Firebase project configuration, then try again."
      );
    }
    throw error;
  }
}


// Listen for community posts in real time
export function subscribeToPosts(onPosts, onError) {
  requireAuthenticatedUser();

  const postsQuery = query(
    postsCollection,
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    postsQuery,
    (snapshot) => {
      const posts = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
        createdAt: document.data().createdAt?.toDate?.().toISOString() ?? null,
      }));

      onPosts(posts);
    },
    onError
  );
}

// Delete a post
export async function removePost(postId) {
  requireAuthenticatedUser();

  await deleteDoc(doc(db, "posts", postId));
}

export async function togglePostVote(postId) {
  const user = requireAuthenticatedUser();
  const postRef = doc(db, "posts", postId);
  const voteRef = doc(db, "posts", postId, "votes", user.uid);

  return await runTransaction(db, async (transaction) => {
    const postSnapshot = await transaction.get(postRef);
    const voteSnapshot = await transaction.get(voteRef);

    if (!postSnapshot.exists()) {
      throw new Error("This post no longer exists.");
    }

    const currentCount = postSnapshot.data().upvoteCount ?? 0;

    if (voteSnapshot.exists()) {
      if (currentCount > 0) {
        transaction.update(postRef, {
          upvoteCount: currentCount - 1,
        });
      }

      transaction.delete(voteRef);
      return false;
    }

    transaction.update(postRef, {
      upvoteCount: currentCount + 1,
    });

    transaction.set(voteRef, {
      uid: user.uid,
      createdAt: serverTimestamp(),
    });

    return true;
  });
}

export async function getUserVotes(postIds) {
  const user = requireAuthenticatedUser();
  const votes = new Set();

  await Promise.all(
    postIds.map(async (postId) => {
      const voteRef = doc(db, "posts", postId, "votes", user.uid);
      const voteSnapshot = await getDoc(voteRef);

      if (voteSnapshot.exists()) {
        votes.add(postId);
      }
    })
  );

  return votes;
}

