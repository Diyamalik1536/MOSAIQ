import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../../context/UserContext";
import "./CollaborationPlanner.css";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const STATUS_COLORS = {
  available: "#6d5dfc",
  busy: "#64748b",
  tentative: "#d97706"
};

function formatDateOnly(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatWeekday(date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function toDateOnly(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function cloneDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getDateInputValue(date) {
  const local = new Date(date);
  const offset = local.getTimezoneOffset();
  const adjusted = new Date(local.getTime() - offset * 60000);
  return adjusted.toISOString().slice(0, 10);
}

function getTimeInputValue(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function parseLocalDateTime(input) {
  if (!input) return null;
  const value = new Date(input);
  return Number.isNaN(value.getTime()) ? null : value;
}

function matchesFilters(entry, filters) {
  const term = filters.search.trim().toLowerCase();
  const matchesSearch = !term || [entry.ownerName, entry.title, entry.project]
    .some((value) => String(value || "").toLowerCase().includes(term));
  return matchesSearch &&
    (filters.type === "all" || entry.type === filters.type) &&
    (filters.status === "all" || entry.status === filters.status) &&
    (filters.project === "all" || entry.project === filters.project);
}

function getPlannerStorageKey(userId) {
  return `talentforge-collab-planner-${encodeURIComponent(userId)}`;
}

function isValidEntry(entry, userId) {
  return Boolean(
    entry &&
    typeof entry === "object" &&
    entry.ownerId === userId &&
    typeof entry.id === "string" &&
    typeof entry.title === "string" &&
    ["availability", "event"].includes(entry.type) &&
    !Number.isNaN(new Date(entry.start).getTime()) &&
    !Number.isNaN(new Date(entry.end).getTime()) &&
    new Date(entry.end) > new Date(entry.start)
  );
}

function loadEntriesFromStorage(userId) {
  try {
    const raw = localStorage.getItem(getPlannerStorageKey(userId));
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((entry) => isValidEntry(entry, userId)) : [];
  } catch (error) {
    console.error("Unable to read planner data:", error);
  }
  return [];
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    const startA = new Date(a.start || a.dateTime || 0).getTime();
    const startB = new Date(b.start || b.dateTime || 0).getTime();
    return startA - startB;
  });
}

function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekDays(currentDate) {
  const start = startOfWeek(currentDate);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function getCalendarWindow(currentDate, view) {
  if (view === "day") {
    return { start: cloneDate(currentDate), end: addDays(cloneDate(currentDate), 1) };
  }

  if (view === "month") {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(new Date(monthStart.getFullYear(), monthStart.getMonth(), 1));
    const calendarEnd = addDays(startOfWeek(monthEnd), 7);
    return { start: calendarStart, end: calendarEnd };
  }

  const weekStart = startOfWeek(currentDate);
  return { start: weekStart, end: addDays(weekStart, 7) };
}

function buildOccurrence(entry, date) {
  const start = new Date(entry.start);
  const end = new Date(entry.end);
  const day = new Date(date);
  const startClone = new Date(day.getFullYear(), day.getMonth(), day.getDate(), start.getHours(), start.getMinutes(), 0, 0);
  const endClone = new Date(startClone.getTime() + (end.getTime() - start.getTime()));

  return {
    ...entry,
    id: `${entry.id}-${getDateString(day)}`,
    seriesId: entry.id,
    start: startClone.toISOString(),
    end: endClone.toISOString(),
    occurrenceDate: day
  };
}

function getVisibleEntries(entries, currentDate, view) {
  const { start, end } = getCalendarWindow(currentDate, view);
  const rangeStart = new Date(start);
  const rangeEnd = new Date(end);
  rangeEnd.setMilliseconds(rangeEnd.getMilliseconds() - 1);
  const occurrences = [];

  entries.forEach((entry) => {
    if (!entry.recurring || entry.recurring === "none") {
      const entryStart = new Date(entry.start);
      const entryEnd = new Date(entry.end);
      if (entryStart < rangeEnd && entryEnd > rangeStart) {
        occurrences.push({ ...entry, occurrenceDate: new Date(entryStart) });
      }
      return;
    }

    const repeatDays = entry.recurringDays || [];
    const seriesStart = toDateOnly(new Date(entry.start));
    const seriesEnd = entry.repeatUntil
      ? toDateOnly(parseLocalDateTime(`${entry.repeatUntil}T00:00`) || new Date(entry.repeatUntil))
      : null;
    const cursor = addDays(rangeStart, -1);
    while (cursor <= rangeEnd) {
      const weekday = cursor.getDay();
      if (
        cursor >= seriesStart &&
        (!seriesEnd || cursor <= seriesEnd) &&
        repeatDays.includes(weekday)
      ) {
        occurrences.push(buildOccurrence(entry, new Date(cursor)));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return sortEntries(occurrences).filter((entry) => {
    const startValue = new Date(entry.start);
    const endValue = new Date(entry.end);
    return startValue <= rangeEnd && endValue > rangeStart;
  });
}

function getEntriesForDay(entries, date) {
  const start = toDateOnly(date);
  const end = addDays(start, 1);
  return getVisibleEntries(entries, date, "day").filter((entry) => {
    const entryStart = new Date(entry.start);
    const entryEnd = new Date(entry.end);
    return entryStart < end && entryEnd > start;
  });
}

function getEntryDayLayout(entries, date, endHour = 20) {
  const dayStart = new Date(date);
  dayStart.setHours(8, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, 0, 0, 0);
  const sorted = entries
    .map((entry) => ({
      entry,
      start: Math.max(new Date(entry.start).getTime(), dayStart.getTime()),
      end: Math.min(new Date(entry.end).getTime(), dayEnd.getTime())
    }))
    .filter((item) => item.end > item.start)
    .sort((a, b) => a.start - b.start || a.end - b.end);
  const lanes = [];

  sorted.forEach((item) => {
    let lane = lanes.findIndex((laneEnd) => laneEnd <= item.start);
    if (lane === -1) lane = lanes.length;
    lanes[lane] = item.end;
    item.lane = lane;
  });

  const laneCount = Math.max(1, lanes.length);
  return sorted.map((item) => ({
    ...item,
    top: ((item.start - dayStart.getTime()) / 3600000) * 54,
    height: ((item.end - item.start) / 3600000) * 54,
    left: `calc(${(item.lane / laneCount) * 100}% + 4px)`,
    width: `calc(${100 / laneCount}% - 8px)`
  }));
}

function CollaborationPlanner() {
  const { t } = useTranslation();
  const { currentUser } = useUser();
  const userId = currentUser?.uid || currentUser?.id || currentUser?.email || "guest";
  const [entries, setEntries] = useState(() => loadEntriesFromStorage(userId));
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  const [view, setView] = useState(() => window.matchMedia("(max-width: 720px)").matches ? "day" : "week");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [conflictWarning, setConflictWarning] = useState("");
  const [editor, setEditor] = useState({
    title: "",
    description: "",
    type: "availability",
    status: "available",
    allDay: false,
    project: "MOSAIQ",
    visibility: "private",
    recurring: "none",
    recurringDays: [1, 3, 5],
    startDate: getDateInputValue(new Date()),
    startTime: "09:00",
    endDate: getDateInputValue(new Date()),
    endTime: "10:00",
    repeatUntil: ""
  });
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    status: "all",
    project: "all"
  });
  useEffect(() => {
    try {
      localStorage.setItem(getPlannerStorageKey(userId), JSON.stringify(entries));
    } catch (error) {
      console.error("Unable to save planner data:", error);
    }
  }, [entries, userId]);

  useEffect(() => {
    if (!isEditorOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") closeEditor();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditorOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const [connectionsVersion, setConnectionsVersion] = useState(0);

  useEffect(() => {
    const handleSync = () => setConnectionsVersion((v) => v + 1);
    window.addEventListener("connectionsUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("connectionsUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);


  const connections = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`talentforge_connections_${userId}`) || "[]");
      return Array.isArray(stored)
        ? stored.filter((connection) => connection && connection.id && typeof connection.name === "string" && connection.name.trim())
        : [];
    } catch (error) {
      console.error("Unable to read planner connections:", error);
      return [];
    }
  }, [userId, connectionsVersion]);
  const filteredConnections = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    return connections.filter((connection) =>
      !term || `${connection.name} ${connection.role || ""}`.toLowerCase().includes(term)
    );
  }, [connections, filters.search]);

  const visibleEntries = useMemo(() => {
    return getVisibleEntries(entries.filter((entry) => entry.ownerId === userId), currentDate, view)
      .filter((entry) => matchesFilters(entry, filters));
  }, [entries, currentDate, view, filters, userId]);

  const rangeDays = useMemo(() => {
    if (view === "day") return [new Date(currentDate)];
    if (view === "month") {
      const { start, end } = getCalendarWindow(currentDate, view);
      const totalDays = Math.round((end - start) / 86400000);
      return Array.from({ length: totalDays }, (_, index) => addDays(start, index));
    }
    return getWeekDays(currentDate);
  }, [currentDate, view]);

  const projectOptions = useMemo(() => {
    const unique = new Set(entries.filter((entry) => entry.ownerId === userId).map((entry) => entry.project).filter(Boolean));
    return [...unique].sort();
  }, [entries, userId]);

  const currentRangeLabel = useMemo(() => {
    if (view === "day") {
      return formatDateOnly(currentDate);
    }
    if (view === "month") {
      return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    const weekStart = startOfWeek(currentDate);
    const weekEnd = addDays(weekStart, 6);
    return `${formatDateOnly(weekStart)} – ${formatDateOnly(weekEnd)}`;
  }, [currentDate, view]);

  function updateView(direction) {
    const next = new Date(currentDate);
    if (view === "day") next.setDate(next.getDate() + direction);
    if (view === "week") next.setDate(next.getDate() + direction * 7);
    if (view === "month") {
      const targetMonth = next.getMonth() + direction;
      const lastDay = new Date(next.getFullYear(), targetMonth + 1, 0).getDate();
      next.setDate(1);
      next.setMonth(targetMonth);
      next.setDate(Math.min(currentDate.getDate(), lastDay));
    }
    if (view === "list") next.setDate(next.getDate() + direction * 7);
    setCurrentDate(next);
  }

  function openCreateSlot(date, startTimeValue = "09:00", type = "availability") {
    const selectedDate = date ? new Date(date) : new Date(currentDate);
    const startDate = getDateInputValue(selectedDate);
    const [startHour, startMinute] = startTimeValue.split(":").map(Number);
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    setEditor({
      title: "",
      description: "",
      type,
      status: type === "event" ? "busy" : "available",
      allDay: false,
      project: "MOSAIQ",
      visibility: "private",
      recurring: "none",
      recurringDays: [selectedDate.getDay()],
      startDate,
      startTime: startTimeValue,
      endDate: getDateInputValue(endDateTime),
      endTime: getTimeInputValue(endDateTime),
      repeatUntil: ""
    });
    setValidationError("");
    setConflictWarning("");
    setSelectedEntryId(null);
    setIsEditorOpen(true);
  }

  function openEditEntry(entry) {
    const originalEntry = entries.find((item) => item.id === (entry.seriesId || entry.id)) || entry;
    const start = new Date(originalEntry.start);
    const end = new Date(originalEntry.end);
    setEditor({
      title: originalEntry.title || "",
      description: originalEntry.description || "",
      type: originalEntry.type || "availability",
      status: originalEntry.status || "available",
      allDay: Boolean(originalEntry.allDay),
      project: originalEntry.project || "MOSAIQ",
      visibility: "private",
      recurring: originalEntry.recurring || "none",
      recurringDays: originalEntry.recurringDays || [1, 3, 5],
      startDate: getDateInputValue(start),
      startTime: originalEntry.allDay ? "00:00" : `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
      endDate: getDateInputValue(originalEntry.allDay ? new Date(end.getTime() - 1) : end),
      endTime: originalEntry.allDay ? "23:59" : `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
      repeatUntil: originalEntry.repeatUntil || ""
    });
    setSelectedEntryId(originalEntry.id);
    setValidationError("");
    setConflictWarning("");
    setIsEditorOpen(true);
  }

  function closeEditor() {
    setIsEditorOpen(false);
    setSelectedEntryId(null);
    setValidationError("");
    setConflictWarning("");
  }

  function handleEditorField(key, value) {
    setEditor((previous) => ({ ...previous, [key]: value }));
    setValidationError("");
    setConflictWarning("");
  }

  function formatEntryTime(entry) {
    if (entry.allDay) return "All day";
    return `${formatTime(new Date(entry.start))}–${formatTime(new Date(entry.end))}`;
  }

  function saveEditor() {
    const startDate = parseLocalDateTime(`${editor.startDate}T${editor.allDay ? "00:00" : editor.startTime}`);
    const selectedEndDate = parseLocalDateTime(`${editor.endDate}T00:00`);
    let endDate = parseLocalDateTime(`${editor.endDate}T${editor.endTime}`);
    if (editor.allDay && selectedEndDate) {
      endDate = new Date(selectedEndDate);
      endDate.setDate(endDate.getDate() + 1);
    }

    if (!startDate || !endDate || endDate <= startDate) {
      setValidationError("Choose an end date and time that is after the start.");
      return;
    }
    if (editor.recurring === "weekly" && editor.recurringDays.length === 0) {
      setValidationError("Choose at least one day for this weekly schedule.");
      return;
    }
    if (editor.repeatUntil && new Date(`${editor.repeatUntil}T23:59`) < startDate) {
      setValidationError("Repeat until must be on or after the start date.");
      return;
    }
    const conflict = editor.type === "event" && entries.find((entry) =>
      entry.ownerId === userId &&
      entry.id !== selectedEntryId &&
      (entry.type === "event" || entry.status === "busy") &&
      new Date(entry.start) < endDate &&
      new Date(entry.end) > startDate
    );
    if (conflict && !conflictWarning) {
      setConflictWarning(`This time overlaps with “${conflict.title}”. Save again to continue anyway.`);
      return;
    }
    setValidationError("");

    const nextEntry = {
      id: selectedEntryId || globalThis.crypto?.randomUUID?.() || `planner-${Date.now()}`,
      ownerId: userId,
      ownerName: currentUser?.name || "You",
      title: editor.title.trim() || (editor.type === "event" ? "New event" : "Available"),
      description: editor.description || "",
      type: editor.type,
      status: editor.status,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      allDay: Boolean(editor.allDay),
      project: editor.project,
      visibility: "private",
      recurring: editor.recurring,
      recurringDays: editor.recurring === "weekly" ? editor.recurringDays : [],
      repeatUntil: editor.recurring === "weekly" && editor.repeatUntil ? editor.repeatUntil : "",
      color: editor.type === "event" ? "#7968e8" : STATUS_COLORS[editor.status] || "#6d5dfc"
    };

    setEntries((previous) => {
      if (selectedEntryId) {
        return previous.map((entry) => (entry.id === selectedEntryId && entry.ownerId === userId ? nextEntry : entry));
      }
      return [...previous, nextEntry];
    });

    closeEditor();
  }

  function deleteSelectedEntry() {
    if (!selectedEntryId) return;
    setEntries((previous) => previous.filter((entry) => entry.id !== selectedEntryId || entry.ownerId !== userId));
    closeEditor();
  }

  const dayEvents = useMemo(() => {
    const dayEntries = getEntriesForDay(entries.filter((entry) => entry.ownerId === userId), currentDate);
    return dayEntries.filter((entry) => matchesFilters(entry, filters));
  }, [currentDate, entries, filters, userId]);

  const dayEntryLayout = useMemo(() => getEntryDayLayout(dayEvents, currentDate, 24), [dayEvents, currentDate]);

  function getClickedTime(event, hour) {
    const rect = event.currentTarget.getBoundingClientRect();
    const minuteOffset = event.detail === 0 ? 0 : (event.clientY - rect.top) / rect.height * 60;
    const minutes = Math.min(45, Math.floor(minuteOffset / 15) * 15);
    return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  function getCurrentTimeOffset(date, endHour, pixelsPerHour) {
    if (getDateString(date) !== getDateString(now)) return null;
    const hour = now.getHours() + now.getMinutes() / 60;
    if (hour < 8 || hour >= endHour) return null;
    return `${(hour - 8) * pixelsPerHour}px`;
  }

  function getDayEvents(date) {
    return getEntriesForDay(entries.filter((entry) => entry.ownerId === userId), date)
      .filter((entry) => matchesFilters(entry, filters));
  }

  return (
    <div className="planner-page">
      <div className="planner-header-row">
        <div>
          <p className="planner-eyebrow">{t("planner.eyebrow", "Your schedule")}</p>
          <h1>{t("planner.title", "Collaboration Planner")}</h1>
          <p className="planner-subtitle">{t("planner.subtitle", "Find time to build something together.")}</p>
        </div>
        <div className="planner-header-actions">
            <button className="secondary-button" onClick={() => openCreateSlot(currentDate, "09:00", "availability")}>{t("planner.setAvailability", "Set Availability")}</button>
            <button className="primary-button" onClick={() => openCreateSlot(currentDate, "13:00", "event")}>{t("planner.createEvent", "Create Event")}</button>
        </div>
      </div>

      <div className="planner-toolbar">
        <div className="toolbar-group toolbar-nav">
          <button aria-label="Previous period" className="icon-button" onClick={() => updateView(-1)}><i className="bi bi-chevron-left" /></button>
          <button aria-label="Next period" className="icon-button" onClick={() => updateView(1)}><i className="bi bi-chevron-right" /></button>
          <button className="today-button" onClick={() => setCurrentDate(new Date())}>{t("planner.today", "Today")}</button>
        </div>

        <div className="toolbar-range">{currentRangeLabel}</div>

        <div className="toolbar-group toolbar-view-switch">
          {[
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
            { value: "day", label: "Day" },
            { value: "list", label: "List" }
          ].map((option) => (
            <button
              key={option.value}
              className={view === option.value ? "view-button active" : "view-button"}
              onClick={() => setView(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="planner-filters">
        <div className="planner-search-wrap">
          <i className="bi bi-search" />
          <input
            value={filters.search}
            onChange={(event) => setFilters((previous) => ({ ...previous, search: event.target.value }))}
            placeholder={t("planner.searchPlaceholder", "Search schedule or connections")}
            aria-label={t("planner.searchPlaceholder", "Search schedule or connections")}
          />
        </div>

        <select aria-label="Filter by type" value={filters.type} onChange={(event) => setFilters((previous) => ({ ...previous, type: event.target.value }))}>
          <option value="all">All types</option>
          <option value="availability">Availability</option>
          <option value="event">Event</option>
        </select>

        <select aria-label="Filter by availability status" value={filters.status} onChange={(event) => setFilters((previous) => ({ ...previous, status: event.target.value }))}>
          <option value="all">All status</option>
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="tentative">Tentative</option>
        </select>

        <select aria-label="Filter by project" value={filters.project} onChange={(event) => setFilters((previous) => ({ ...previous, project: event.target.value }))}>
          <option value="all">All projects</option>
          {projectOptions.map((project) => (
            <option key={project} value={project}>{project}</option>
          ))}
        </select>

        <button className="clear-filter-button" onClick={() => setFilters({ search: "", type: "all", status: "all", project: "all" })}>Clear filters</button>
      </div>

      <div className="scheduler-shell">
        <aside className="planner-people-panel">
          <div className="panel-header">
            <h3>Connections</h3>
            <span>{connections.length}</span>
          </div>
          <p className="connection-note">Personal schedules are saved privately in this browser. Shared availability is not connected to a backend yet.</p>
          {filteredConnections.length ? filteredConnections.map((connection) => (
            <div key={connection.id} className="person-card">
              <div className="person-meta">
                <span className="connection-avatar" aria-hidden="true">{connection.name.trim().charAt(0).toUpperCase()}</span>
                <div>
                  <strong>{connection.name}</strong>
                  <small>{connection.role || "MOSAIQ connection"}</small>
                </div>
              </div>
              <div className="person-slot-row">
                <span>Schedule not shared</span>
              </div>
            </div>
          )) : (
            <div className="connection-empty">
              {connections.length ? "No connections match your search." : "Your saved connections will appear here."}
            </div>
          )}
        </aside>

        <main className="planner-calendar-panel">
          <div className="planner-legend">
            <span><i className="legend-chip available" /> Available</span>
            <span><i className="legend-chip tentative" /> Tentative</span>
            <span><i className="legend-chip busy" /> Busy</span>
          </div>

          {view === "month" && (
            <div className="month-calendar-scroll">
            <div className="month-grid">
              {DAY_NAMES.map((day) => (
                <div key={day} className="month-weekday">{day}</div>
              ))}

              {rangeDays.map((date) => {
                const cellEntries = getDayEvents(date).slice(0, 3);
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                return (
                  <button
                    key={date.toISOString()}
                    className={isCurrentMonth ? "month-day" : "month-day muted"}
                    onClick={() => {
                      setCurrentDate(date);
                      setView("day");
                    }}
                  >
                    <span className="month-day-number">{date.getDate()}</span>
                    <div className="month-day-events">
                      {cellEntries.map((entry) => (
                        <span key={entry.id} className={`month-pill ${entry.type} ${entry.status}`}>{entry.title}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            </div>
          )}

          {view === "week" && (
            <div className="calendar-scroll">
            <div className="week-grid">
              <div className="time-column">
                <div className="time-header">All day</div>
                {Array.from({ length: 12 }, (_, index) => (
                  <div key={index} className="time-slot">{`${index + 8}:00`}</div>
                ))}
              </div>

              {rangeDays.map((date) => {
                const dayEntries = getDayEvents(date);
                const layout = getEntryDayLayout(dayEntries, date);
                return (
                  <div key={date.toISOString()} className="day-column">
                    <div className="day-header">
                      <span>{formatWeekday(date)}</span>
                      <strong>{date.getDate()}</strong>
                    </div>
                    <div className="day-grid">
                      {Array.from({ length: 12 }, (_, index) => (
                        <button
                          key={`${date.toISOString()}-${index}`}
                          className="slot-button"
                          aria-label={`Add availability on ${formatDateOnly(date)} at ${index + 8}:00`}
                          onClick={(event) => openCreateSlot(date, getClickedTime(event, index + 8))}
                        />
                      ))}

                      {getCurrentTimeOffset(date, 20, 54) !== null && (
                        <div className="current-time-indicator" style={{ top: getCurrentTimeOffset(date, 20, 54) }} aria-hidden="true" />
                      )}

                      {layout.map(({ entry, top, height, left, width }) => {
                        return (
                          <button
                            key={entry.id}
                            className={`calendar-event ${entry.type} ${entry.status}`}
                            style={{ top: `${top}px`, height: `${Math.max(28, height)}px`, left, width, background: entry.type === "event" ? "#7968e8" : STATUS_COLORS[entry.status] }}
                            onClick={() => openEditEntry(entry)}
                          >
                            <span>{entry.title}</span>
                            <small>{formatEntryTime(entry)}</small>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          )}

          {view === "day" && (
            <div className="day-view">
              <div className="day-view-header">
                <h3>{formatDateOnly(currentDate)}</h3>
              </div>
              <div className="day-view-grid">
                {Array.from({ length: 16 }, (_, hour) => {
                  const value = hour + 8;
                  return (
                    <div key={value} className="day-view-row" style={{ display: "grid", gridTemplateColumns: "80px 1fr" }}>
                      <div className="time-label">{`${String(value % 12 || 12)}:00 ${value >= 12 ? "PM" : "AM"}`}</div>
                      <button
                        className="day-row-slot"
                        aria-label={`Add availability at ${String(value).padStart(2, "0")}:00`}
                        onClick={(event) => openCreateSlot(currentDate, getClickedTime(event, value))}
                      />
                    </div>
                  );
                })}

                {getCurrentTimeOffset(currentDate, 24, 72) !== null && (
                  <div className="current-time-indicator" style={{ top: getCurrentTimeOffset(currentDate, 24, 72) }} aria-hidden="true" />
                )}

                {dayEntryLayout.map(({ entry, top, height, left, width }) => {
                  return (
                    <button
                      key={entry.id}
                      className={`calendar-event ${entry.type} ${entry.status}`}
                      style={{ top: `${top * (72 / 54) + 4}px`, height: `${Math.max(30, height * (72 / 54) - 4)}px`, left, width, background: entry.type === "event" ? "#7968e8" : STATUS_COLORS[entry.status] }}
                      onClick={() => openEditEntry(entry)}
                    >
                      <span>{entry.title}</span>
                      <small>{formatEntryTime(entry)}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {view === "list" && (
            <div className="agenda-list">
              {visibleEntries.length ? visibleEntries.map((entry) => (
                <button key={entry.id} className="agenda-item" onClick={() => openEditEntry(entry)}>
                  <span className={`agenda-status ${entry.status ? `planner-status-${entry.status}` : "planner-status-available"}`} />
                  <div>
                    <strong>{entry.title}</strong>
                    <small>{entry.ownerName}</small>
                  </div>
                  <div className="agenda-time">
                    <span>{formatDateOnly(new Date(entry.start))}</span>
                    <span>{formatEntryTime(entry)}</span>
                  </div>
                </button>
              )) : (
                <div className="empty-state">No scheduled items match these filters.</div>
              )}
            </div>
          )}

          {(view === "week" || view === "day" || view === "month") && visibleEntries.length === 0 && (
            <div className="empty-state">No availability or events for this period. Use “Set Availability” to add a time.</div>
          )}
        </main>
      </div>

      {isEditorOpen && (
        <div className="planner-modal-backdrop" onClick={closeEditor}>
          <div className="planner-modal" role="dialog" aria-modal="true" aria-labelledby="planner-editor-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p>{selectedEntryId ? `Edit ${editor.type}` : `Create ${editor.type}`}</p>
                <h3 id="planner-editor-title">{selectedEntryId ? "Update your schedule" : "Add to your schedule"}</h3>
              </div>
              <button className="icon-button" aria-label="Close schedule editor" onClick={closeEditor}><i className="bi bi-x-lg" /></button>
            </div>

            <div className="modal-form-grid">
              <label>
                Title
                <input value={editor.title} onChange={(event) => handleEditorField("title", event.target.value)} placeholder="Project check-in" />
              </label>
              <label>
                Type
                <select value={editor.type} onChange={(event) => handleEditorField("type", event.target.value)}>
                  <option value="availability">Availability</option>
                  <option value="event">Event</option>
                </select>
              </label>
              <label>
                Status
                <select value={editor.status} onChange={(event) => handleEditorField("status", event.target.value)}>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="tentative">Tentative</option>
                </select>
              </label>
              <label>
                Project
                <input value={editor.project} onChange={(event) => handleEditorField("project", event.target.value)} />
              </label>
              <label>
                Start date
                <input type="date" required value={editor.startDate} onChange={(event) => handleEditorField("startDate", event.target.value)} />
              </label>
              <label>
                End date
                <input type="date" required value={editor.endDate} onChange={(event) => handleEditorField("endDate", event.target.value)} />
              </label>
              <label>
                Start time
                <input type="time" value={editor.startTime} step="900" disabled={editor.allDay} onChange={(event) => handleEditorField("startTime", event.target.value)} />
              </label>
              <label>
                End time
                <input type="time" value={editor.endTime} step="900" disabled={editor.allDay} onChange={(event) => handleEditorField("endTime", event.target.value)} />
              </label>
              <label className="checkbox-field">
                <input type="checkbox" checked={editor.allDay} onChange={(event) => handleEditorField("allDay", event.target.checked)} />
                All-day
              </label>
              <label className="timezone-field">
                Time zone
                <input value={Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time"} readOnly />
              </label>
              <label>
                Repeat
                <select value={editor.recurring} onChange={(event) => handleEditorField("recurring", event.target.value)}>
                  <option value="none">Does not repeat</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
            </div>

            <label className="notes-field">
              Notes
            <textarea value={editor.description} onChange={(event) => handleEditorField("description", event.target.value)} rows={3} placeholder="Optional private notes." />
            </label>

            {editor.recurring === "weekly" && (
              <div className="repeat-settings">
              <div className="repeat-days" aria-label="Repeat on weekdays">
                {DAY_NAMES.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    className={editor.recurringDays.includes(index) ? "repeat-day active" : "repeat-day"}
                    onClick={() => {
                      handleEditorField("recurringDays", editor.recurringDays.includes(index)
                        ? editor.recurringDays.filter((dayIndex) => dayIndex !== index)
                        : [...editor.recurringDays, index]);
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <label className="repeat-until-field">
                Repeat until (optional)
                <input type="date" value={editor.repeatUntil} min={editor.startDate} onChange={(event) => handleEditorField("repeatUntil", event.target.value)} />
              </label>
              </div>
            )}

            <div className="validation-row">
              {validationError && <span className="validation-message" role="alert">{validationError}</span>}
              {conflictWarning && <span className="conflict-message" role="status">{conflictWarning}</span>}
            </div>

            <div className="modal-actions">
              {selectedEntryId && (
                <button className="danger-button" onClick={deleteSelectedEntry}>Delete</button>
              )}
              <div className="modal-primary-actions">
                <button className="secondary-button" onClick={closeEditor}>Cancel</button>
                <button className="primary-button" onClick={saveEditor}>{conflictWarning ? "Save anyway" : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CollaborationPlanner;
