# TalentForge recruiter portal integration

This project keeps the existing student login and student routes. Recruiters use a separate page at `/recruiter/login`; after successful role verification they are sent to `/recruiter/dashboard`.

## Files added
- `src/assets/Components/Authentication/RecruiterLogin/RecruiterLogin.jsx`
- `src/assets/Components/Authentication/RecruiterLogin/RecruiterLogin.css`
- `src/assets/Components/Recruiter/RecruiterDashboard.jsx`
- `src/assets/Components/Recruiter/RecruiterDashboard.css`

## Files updated
- `src/App.jsx` — adds the recruiter routes and role-aware route guard.
- `src/context/UserContext.jsx` — loads the role from Firestore while preserving existing profile and subscription fields.
- `src/assets/Components/Authentication/Login/Login.jsx` — adds a link to the separate recruiter login.

## Firebase setup required
The recruiter login uses the existing Firebase Authentication email/password provider and checks this Firestore document:

`users/{firebaseAuthUid}`

The document must contain:

```json
{ "role": "recruiter" }
```

To mark a student account, use `{ "role": "student" }`. Create/assign recruiter roles only through a trusted administrator or Firebase Console; do not let users self-assign their role from the client. If the document is missing or has another role, recruiter login is denied.

## Student data
The recruiter dashboard imports the existing `src/assets/Components/Dashboard/BrowseStudents/studentData.js`. It does not replace that file or change the student browsing page. Its match score is a simple heuristic over fields available in that local dataset, not a validated hiring recommendation. Shortlists/comparison selections are currently in-memory for the active page session.

## Run
Use the existing project's `.env.local` Firebase values and normal project commands (`npm install`, then `npm run dev`). This integration archive has not been build-verified in this environment because dependency installation did not finish before the execution timeout.


## Required Firebase setup for recruiter sign-in

The Firebase Authentication user and the Firestore role document are separate records. For each recruiter, create the account in **Authentication → Users**, then copy its exact **User UID**. In **Firestore Database → Data**, create collection `users`, use that UID as the document ID, and add the field `role` with string value `recruiter`. Do not use the email address as the document ID.

For a minimal role lookup, the Firestore rules must allow an authenticated user to read only their own `users/{uid}` document. Keep client writes to role documents disabled so users cannot promote themselves. Example rules for this role collection (merge with rules needed by the rest of the existing student app before publishing):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow get: if request.auth != null && request.auth.uid == userId;
      allow list: if false;
      allow create, update, delete: if false;
    }
  }
}
```

**Important:** These rules are only a minimal example for role-document reads. The existing TalentForge student features also use Firestore services such as posts and messages; their required access rules need to be reviewed and merged before replacing all existing rules. Never publish `allow read, write: if true`.

## Environment file

Create `.env.local` in the same folder as `package.json`, based on `.env.example`. Populate the six `VITE_FIREBASE_*` variables using the web app config from Firebase Project settings. Restart Vite after changing environment variables. Never commit `.env.local`.
