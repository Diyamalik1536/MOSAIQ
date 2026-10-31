import { useTranslation } from "react-i18next";

function NotificationTabs({ activeTab, setActiveTab, counts }) {
    const { t } = useTranslation();

    const tabs = [
        { id: 'all', label: t('notifications.tabs.all', 'All'), icon: 'bi-grid', count: counts.all },
        { id: 'unread', label: t('notifications.tabs.unread', 'Unread'), icon: 'bi-bell', count: counts.unread },
        {
            id: 'applications',
            label: t('notifications.tabs.applications', 'Applications'),
            icon: 'bi-person-badge',
            count: counts.applications,
        },
        {
            id: 'connections',
            label: t('notifications.tabs.connections', 'Connections'),
            icon: 'bi-people',
            count: counts.connections,
        },
        {
            id: 'posts',
            label: t('notifications.tabs.posts', 'Posts'),
            icon: 'bi-chat-square-text',
            count: counts.posts,
        },
    ];

    return (
        <div className="notification-tabs-bar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <i className={`bi ${tab.icon}`}></i>
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                        <span className="tab-count">{tab.count}</span>
                    )}
                </button>
            ))}
        </div>
    );
}

export default NotificationTabs;
