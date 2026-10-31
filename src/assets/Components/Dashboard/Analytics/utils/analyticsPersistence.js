export function analyticsStorageKey(uid) { return `talentforge_career_analytics_${uid}`; }
export function readAnalytics(uid) {
  try { return JSON.parse(localStorage.getItem(analyticsStorageKey(uid))) ?? {}; } catch { return {}; }
}
export function writeAnalytics(uid, value) {
  try {
    localStorage.setItem(analyticsStorageKey(uid), JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("careerAnalyticsUpdated", { detail: { uid } }));
    return true;
  } catch (error) {
    console.error("Unable to save career analytics:", error);
    return false;
  }
}
