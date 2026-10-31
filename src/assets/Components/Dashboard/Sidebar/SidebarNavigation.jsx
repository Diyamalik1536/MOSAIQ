import { useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { useNotifications } from "../../../../context/NotificationContext";
import { useTranslation } from "react-i18next";
import { useMessages } from "../../../../context/MessageContext";

function SidebarNavigation() {
    const { t } = useTranslation();
    const location = useLocation();
    const { notifications, unreadCount } = useNotifications();
    const { unreadCount: unreadMessages } = useMessages();
    const currentPath = location.pathname;

    const connectionsUnread = notifications.filter(n => n.type === 'connections' && !n.read).length;
    const applicationsUnread = notifications.filter(n => n.type === 'applications' && !n.read).length;

    return (
        <nav>
            <SidebarItem
                label={t("nav.dashboard", "Dashboard")}
                href="/dashboard"
                icon="bi bi-house"
                active={currentPath === "/dashboard"}
            />

            <SidebarItem
                label={t("nav.browseStudents", "Browse Students")}
                href="/students"
                icon="bi bi-search"
                active={currentPath === "/students"}
                badge={applicationsUnread}
            />

            <SidebarItem
                label={t("nav.browseProjects", "Browse Projects")}
                href="/projects"
                icon="bi bi-folder2-open"
                active={currentPath === "/projects" || currentPath.startsWith("/projects/")}
            />

            <SidebarItem
                label={t("nav.myListings", "My Listings")}
                href="/listings"
                icon="bi bi-card-list"
                active={currentPath === "/listings"}
            />

            <SidebarItem
                label={t("nav.connections", "Connections")}
                href="/connections"
                icon="bi bi-people"
                active={currentPath === "/connections"}
                badge={connectionsUnread}
            />

            <SidebarItem
                label={t("nav.messages", "Messages")}
                href="/messages"
                icon="bi bi-chat"
                active={currentPath === "/messages"}
                badge={unreadMessages > 0 ? unreadMessages : undefined}
            />

            <SidebarItem
                label="Meetings"
                href="/meetings"
                icon="bi bi-calendar-check"
                active={currentPath === "/meetings"}
            />

            <SidebarItem
                label={t("nav.collaborationPlanner", "Collaboration Planner")}
                href="/schedule"
                icon="bi bi-calendar3"
                active={currentPath === "/schedule"}
            />

            <SidebarItem
                label={t("nav.saved", "Saved")}
                href="/saved"
                icon="bi bi-bookmark"
                active={currentPath === "/saved"}
            />

            <SidebarItem
                label={t("nav.notifications", "Notifications")}
                href="/notifications"
                icon="bi bi-bell"
                active={currentPath === "/notifications"}
                badge={unreadCount}
            />

            <SidebarItem
                label={t("nav.profile", "Profile")}
                href="/profile"
                icon="bi bi-person"
                active={currentPath === "/profile"}
            />

            <SidebarItem
                label={t("nav.analytics", "Analytics")}
                href="/analytics"
                icon="bi bi-graph-up"
                active={currentPath === "/analytics"}
            />

            <SidebarItem
                label={t("nav.settings", "Settings")}
                href="/settings"
                icon="bi bi-gear"
                active={currentPath === "/settings"}
            />
        </nav>
    );
}

export default SidebarNavigation;
