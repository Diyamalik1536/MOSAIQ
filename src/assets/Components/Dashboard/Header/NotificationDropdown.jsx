import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../../context/NotificationContext';
import { useApplications } from '../../../../context/ApplicationContext';
import { useTranslation } from 'react-i18next';

function NotificationDropdown({ isOpen, onClose }) {
    const { t } = useTranslation();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { openApplication } = useApplications();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const recentNotifications = notifications.slice(0, 4);

    const handleViewAll = () => {
        onClose();
        navigate('/notifications');
    };

    const handleItemClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        onClose();
        if (notification.applicationId) {
            openApplication(notification.applicationId);
        } else if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'applications':
                return 'bi-person-badge-fill text-indigo';
            case 'connections':
            default:
                return 'bi-people-fill text-emerald';
        }
    };

    return (
        <div className="notification-dropdown shadow-lg" ref={dropdownRef}>
            <div className="dropdown-header">
                <div className="dropdown-title-row">
                    <h3>{t("nav.notificationsAria", "Notifications")}</h3>
                    {unreadCount > 0 && (
                        <span className="unread-badge">
                            {t("nav.newBadge", { count: unreadCount, defaultValue: `${unreadCount} new` })}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button 
                        className="btn-mark-all" 
                        onClick={markAllAsRead}
                        title={t("nav.markAllRead", "Mark all notifications as read")}
                    >
                        <i className="bi bi-check2-all"></i> {t("nav.markAllRead", "Mark all read")}
                    </button>
                )}
            </div>

            <div className="dropdown-body">
                {recentNotifications.length === 0 ? (
                    <div className="dropdown-empty">
                        <i className="bi bi-bell-slash"></i>
                        <p>{t("nav.noNotificationsYet", "No notifications yet")}</p>
                    </div>
                ) : (
                    recentNotifications.map((item) => (
                        <div
                            key={item.id}
                            className={`dropdown-item ${!item.read ? 'unread' : ''}`}
                            onClick={() => handleItemClick(item)}
                        >
                            <div className="item-icon">
                                <i className={`bi ${getTypeIcon(item.type)}`}></i>
                            </div>
                            <div className="item-content">
                                <div className="item-title-row">
                                    <h4 className="item-title">{item.title}</h4>
                                    {!item.read && <span className="unread-dot"></span>}
                                </div>
                                <p className="item-message">{item.message}</p>
                                <span className="item-time">{item.timestamp}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="dropdown-footer">
                <button className="btn-view-all" onClick={handleViewAll}>
                    {t("nav.searchViewAll", "View all")} <i className="bi bi-arrow-right"></i>
                </button>
            </div>
        </div>
    );
}

export default NotificationDropdown;
