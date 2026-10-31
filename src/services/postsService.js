
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
// Ensure the user is authenticated and verified
function requireChitkaraUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in to continue.");
  }

  if (!user.email?.toLowerCase().endsWith("@chitkara.edu.in")) {
    throw new Error("Only Chitkara University email addresses can access community posts.");
  }

  return user;
}


// Firestore collection for community posts
const postsCollection = collection(db, "posts");

// Add a new community post

export async function createPost(postData) {
  const user = requireChitkaraUser();

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
}


// Listen for community posts in real time
export function subscribeToPosts(onPosts, onError) {
  requireChitkaraUser();

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
  requireChitkaraUser();

  await deleteDoc(doc(db, "posts", postId));
}

export async function togglePostVote(postId) {
  const user = requireChitkaraUser();
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
  const user = requireChitkaraUser();
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

