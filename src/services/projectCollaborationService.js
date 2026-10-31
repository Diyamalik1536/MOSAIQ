import {
    doc,
    getDoc,
    runTransaction,
    serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

const REQUESTS_COLLECTION = "projectCollaborationRequests";

export function getProjectCollaborationRequestId(projectId, studentId, role) {
    return encodeURIComponent(`${studentId}__${projectId}__${role}`);
}

export async function getStudentProjectRequests(project, studentId) {
    const roles = project.openRoles || [];
    const snapshots = await Promise.all(
        roles.map((role) => getDoc(doc(
            db,
            REQUESTS_COLLECTION,
            getProjectCollaborationRequestId(project.id, studentId, role.role)
        )))
    );

    return roles
        .filter((_, index) => snapshots[index].exists())
        .map((role) => role.role);
}

export async function submitProjectCollaborationRequest({
    project,
    roleName,
    message,
    student
}) {
    const user = auth.currentUser;
    if (!user || user.uid !== student?.uid) {
        throw new Error("Please sign in with your student account to apply.");
    }

    if (
        project.status !== "Looking for Collaborators" ||
        !project.openRoles?.some((role) => role.role === roleName)
    ) {
        throw new Error("This project is no longer accepting requests for that role.");
    }

    const role = project.openRoles.find((item) => item.role === roleName);
    const requestRef = doc(
        db,
        REQUESTS_COLLECTION,
        getProjectCollaborationRequestId(project.id, user.uid, roleName)
    );

    await runTransaction(db, async (transaction) => {
        const existingRequest = await transaction.get(requestRef);
        if (existingRequest.exists()) {
            throw new Error("You have already applied for this project role.");
        }

        transaction.set(requestRef, {
            projectId: project.id,
            projectSlug: project.slug || project.id,
            projectTitle: project.title,
            role: role.role,
            roleSkill: role.skill || "",
            message: message.trim(),
            studentId: user.uid,
            studentName: student.name || student.fullName || student.displayName || "Student",
            studentMajor: student.major || "",
            studentSkills: Array.isArray(student.skills) ? student.skills : [],
            status: "pending",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    });

    return requestRef.id;
}
