# TalentForge recruiter login setup

## Routes

- Student login remains at `/login`.
- Recruiter login is at `/recruiter/login`.
- Recruiter dashboard is at `/recruiter/dashboard`.

## Provision a recruiter account

1. Create the recruiter's account in Firebase Authentication (email/password).
2. In Firestore, create `users/{firebaseAuthUid}` where the document ID is the exact Firebase Auth UID.
3. Set the document field `role` to the string `recruiter`.
4. Student accounts may have `role: "student"`; for backwards compatibility, accounts without a role document are treated as students by the client.

Recruiter login explicitly checks the Firestore role document. The role is loaded again when Firebase restores a session, so a page refresh preserves the role-based route decision.

## Security requirement

React route guards improve navigation but are not a security boundary. Configure Firestore Security Rules and any future backend/API to validate roles using trusted server-side authorization (ideally Firebase custom claims for privileged operations). Do not let users write their own `role` field. The app must not permit clients to create or edit recruiter role documents. The exact production rules depend on the rest of your application's existing Firestore access model; do not replace existing rules wholesale with a sample rule.

## Recruiter dashboard data

The recruiter dashboard imports `studentData` directly from `src/assets/Components/Dashboard/BrowseStudents/studentData.js`. No duplicate student dataset was introduced. The source does not contain mentor ratings, certifications, CGPA, or a graduation year, so those fields are not fabricated. The discovery score is a heuristic based on skill breadth, listed projects, and optional search-term matches. It should not be used as a validated hiring recommendation.

## Local run

```bash
npm install
npm run dev
```

The existing `.env` Firebase configuration must be set for authentication and Firestore role lookups to work.

## Example authorization pattern (adapt to your existing rules)

The rules for the `users` collection should allow a signed-in user to read their own role document but should not allow clients to create or change the `role` field. A trusted administrator process should provision recruiter roles. If your existing Firestore rules are available, merge this policy into them rather than replacing them without review.
