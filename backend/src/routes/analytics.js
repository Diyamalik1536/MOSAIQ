import { Router } from "express";
import { discoverJobs, extractRequirements, getJobById, getRequirements, getStatus, matchJob, matchRequirements } from "../controllers/googleAnalyticsController.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";
import { rateLimitExtraction } from "../middleware/rateLimitExtraction.js";
import { rateLimitDiscovery } from "../middleware/rateLimitDiscovery.js";

const router = Router();
router.get("/google/status", getStatus);
router.get("/google/jobs", rateLimitDiscovery, discoverJobs);
router.get("/google/jobs/:jobId", verifyFirebaseToken, rateLimitExtraction, getJobById);
router.post("/google/jobs/:jobId/match", verifyFirebaseToken, matchJob);
router.get("/google/requirements", getRequirements);
router.post("/google/extract", verifyFirebaseToken, rateLimitExtraction, extractRequirements);
router.post("/google/match", verifyFirebaseToken, matchRequirements);
export default router;
