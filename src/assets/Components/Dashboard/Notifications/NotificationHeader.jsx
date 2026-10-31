import { useNotifications } from '../../../../context/NotificationContext';
import { useTranslation } from 'react-i18next';

function NotificationHeader({ searchQuery, setSearchQuery }) {
    const { t } = useTranslation();
    const { unreadCount, markAllAsRead, clearReadNotifications, resetNotifications } = useNotifications();

    return (
        <div className="notifications-header-section">
            <div className="notifications-toolbar">
                <div className="search-wrapper">
                    <i className="bi bi-search search-icon"></i>
                    <input
                        type="text"
                        className="search-input"
                        placeholder={t("notifications.searchPlaceholder", "Search notifications by keyword or title...")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="search-clear"
                            onClick={() => setSearchQuery('')}
                            title={t("notifications.clearSearch", "Clear search")}
                        >
                            <i className="bi bi-x"></i>
                        </button>
                    )}
                </div>

                <div className="toolbar-actions">
                    <button
                        className="btn-secondary"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        title={t("notifications.markAllRead", "Mark all notifications as read")}
                    >
                        <i className="bi bi-check2-all"></i> {t("notifications.markAllRead", "Mark All Read")}
                    </button>
                    <button
                        className="btn-outline-danger"
                        onClick={clearReadNotifications}
                        title={t("notifications.clearRead", "Clear read notifications")}
                    >
                        <i className="bi bi-trash"></i> {t("notifications.clearRead", "Clear Read")}
                    </button>
                    <button
                        className="btn-ghost"
                        onClick={resetNotifications}
                        title={t("notifications.reload", "Reload notifications")}
                    >
                        <i className="bi bi-arrow-clockwise"></i> {t("notifications.reload", "Reload")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotificationHeader;
