# TalentForge Google Careers Analytics API

This is a separate Node.js/Express service used by the existing React + Vite app. It discovers Software Engineer listings only from Google's official Careers search page. Students choose a result in Analytics; they do not paste job URLs.

## How the request flows

1. When Analytics opens, the frontend asks the backend for Google Careers Software Engineer results. It starts with India as the location filter, which students can change or clear. “Load more” follows the next-page URL returned by Google.
2. The backend builds the search request itself with Google's official Careers URL and parses only job cards present in Google's response. It returns each verified title, ID, location, experience label when present, listing preview when present, and official link. Empty, blocked, or unrecognized pages return a clear error; no sample listings are used.
3. When the student selects a result, the frontend sends that listing's job ID and official link with the current Firebase ID token. Express verifies the token with Firebase Admin. The URL must be HTTPS, on `www.google.com`, under the Careers job-results path, and contain the same ID. Redirects are checked at every hop.
4. The existing Cheerio extractor retrieves the selected official job page. It extracts the available title, location, full description where Google publishes a separate description, minimum and preferred qualifications, responsibilities, and directly supported skill mentions. The page may publish qualifications and responsibilities without a separate overview description; those sections are still shown. CAPTCHA, anti-bot responses, incomplete pages, and changed markup are not bypassed.
5. Valid extracted requirements are saved separately for each job ID as JSON and readable TXT under `backend/data/google_jobs/<jobId>/`. A failed refresh returns an explicit error and leaves that job's last successful extraction in place. Existing legacy `google_requirements.json` data can only be used for its own matching job ID; a different job cannot overwrite it.
6. The frontend reads the current user's profile from the existing per-UID browser localStorage records and sends a limited snapshot with the Firebase token. The backend binds the match to the UID verified from that token and rejects a snapshot tagged with a different UID. The current project does not persist these profile records in Firestore, so the backend cannot independently attest to client-edited values or fetch another student's server-side profile. The snapshot is not stored with job requirements.
7. Matching compares distinct extracted required skills against the student's explicitly listed skills. The percentage is `matched distinct required profile skills / distinct required skills × 100`. Project and experience text are surfaced as supporting evidence but do not count as direct matches. Preferred skills are separate. No proficiency, verified status, weights, or employer decision is inferred.

## Local setup

Use two terminals.

Terminal 1 (backend):

```powershell
cd backend
npm install
Copy-Item .env.example .env
# Configure Firebase Admin Application Default Credentials as described below.
npm run dev
```

Terminal 2 (frontend, from the repository root):

```powershell
npm install
npm run dev
```

The root `.env.example` documents the optional `VITE_ANALYTICS_API_URL`. The default local API address is `http://localhost:4000`.

## Backend environment

- `PORT`: optional; defaults to `4000`.
- `HOST`: optional; defaults to `localhost` for local-only development. Set it to `0.0.0.0` only when a deployment platform requires a container interface bind.
- `FRONTEND_ORIGIN`: exact allowed frontend origin; comma-separated origins are supported.
- `FIREBASE_PROJECT_ID`: Firebase project ID used by Firebase Admin.
- `GOOGLE_APPLICATION_CREDENTIALS`: path to a private Firebase Admin service-account JSON file outside source control, or use Google Application Default Credentials in the deployment environment.
- `GOOGLE_REQUIREMENTS_TTL_DAYS`: age after which saved data is reported stale; defaults to 7 days.

Never put the service-account JSON in the repository or a `VITE_` variable. Firebase Admin must verify tokens from the same Firebase project as the frontend.

The existing editable TalentForge profile, projects, education, and experience are stored in per-UID `localStorage`, not Firestore. The profile editor currently has no explicit verified-skill or certification workflow; Analytics passes certification values only if present in that user's stored profile and does not invent them. Profile snapshots remain separate from the saved Google requirements.

## API

- `GET /health`: process health.
- `GET /api/analytics/google/status`: API health plus saved extraction availability and per-job staleness.
- `GET /api/analytics/google/jobs?location=India&page=1`: live official search results and the next page number when Google provides it. Omit or clear `location` to search all locations.
- `GET /api/analytics/google/jobs/:jobId?url=<official-link>`: authenticated live extraction for a selected official listing. If refresh fails but that exact ID has a saved success, it returns that saved result marked stale and includes `refreshError`.
- `POST /api/analytics/google/jobs/:jobId/match`: authenticated `{ "profile": { ... } }`; the job ID selects only that job's requirements.
- Legacy `GET /api/analytics/google/requirements`, `POST /api/analytics/google/extract`, and `POST /api/analytics/google/match` remain for compatibility with the earlier single-job client. The current Analytics UI uses the job-discovery endpoints above.

Run backend tests with `npm test` from `backend/`. Start the backend with `npm run dev` and the frontend with `npm run dev` from the repository root.

## Storage and deployment

Each selected job's files live at `backend/data/google_jobs/<jobId>/google_requirements.json` and `google_requirements.txt`. The earlier one-job files in `backend/data/` are read-only migration fallback for their matching ID. Files persist only if the backend filesystem persists. Serverless deployments need a persistent mounted volume or a durable storage implementation.
