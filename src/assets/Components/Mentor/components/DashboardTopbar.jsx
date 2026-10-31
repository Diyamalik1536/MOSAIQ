import { useTheme } from "../../../../context/useTheme";

function DashboardTopbar({
    search,
    onSearchChange,
    notificationsOpen,
    profileOpen,
    onToggleNotifications,
    onToggleProfile,
    onMarkNotificationsRead,
    onOpenSettings,
    onOpenMobileNav,
    onLogout,
    loggingOut
}) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="topbar">
            <button className="mobile-menu-button" aria-label="Open navigation" onClick={onOpenMobileNav}>☰</button>
            <label className="global-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search students, projects, skills…" /><kbd>⌘ K</kbd></label>
            <div className="topbar__actions">
                <button className="icon-button topbar-icon" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={theme === "dark"} onClick={toggleTheme}>{theme === "dark" ? "☀" : "☾"}</button>
                <div className="popover-wrap">
                    <button className="icon-button topbar-icon" aria-label="Notifications" onClick={onToggleNotifications}>♧<i></i></button>
                    {notificationsOpen && <div className="popover notification-popover"><strong>Notifications</strong><p><span className="notification-dot"></span> Misha Rawal submitted a new project version.</p><p><span className="notification-dot notification-dot--green"></span> Your weekly review summary is ready.</p><button className="text-button" onClick={onMarkNotificationsRead}>Mark all as read</button></div>}
                </div>
                <div className="popover-wrap">
                    <button className="profile-trigger" onClick={onToggleProfile}><span className="profile-avatar">DS</span><span className="profile-trigger__text"><strong>Dr. Sharma</strong><small>Faculty · CSE</small></span><span className="profile-chevron">⌄</span></button>
                    {profileOpen && (
                        <div className="popover profile-popover">
                            <strong>Dr. R. Sharma</strong>
                            <p>Faculty Mentor · Computer Science</p>
                            <button className="text-button" onClick={onOpenSettings}>Account settings →</button>
                            <button
                                className="text-button text-button--logout"
                                onClick={onLogout}
                                disabled={loggingOut}
                            >
                                {loggingOut ? "Signing out..." : "Log out"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default DashboardTopbar;
