import { navigation } from "../data/dashboardData";

const navigationSections = ["Workspace", "Manage", "Insights", "More"];

function DashboardSidebar({ activePage, pendingCount, mobileNavOpen, onChangePage, onClose }) {
    return (
        <>
            {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={onClose} />}
            <aside className={`sidebar${mobileNavOpen ? " sidebar--open" : ""}`}>
                <button className="brand" onClick={() => onChangePage("Overview")} aria-label="TalentForge home"><span className="brand__mark">✦</span><span>Talent<span>Forge</span></span></button>
                <div className="sidebar__nav">
                    {navigationSections.map((section) => (
                        <div className="nav-section" key={section}>
                            <span className="nav-section__label">{section}</span>
                            {navigation.filter((item) => item.section === section).map((item) => (
                                <button key={item.label} className={`nav-link${activePage === item.label ? " nav-link--active" : ""}`} onClick={() => onChangePage(item.label)}>
                                    <span className="nav-link__icon" aria-hidden="true">{item.icon}</span>
                                    <span>{item.label}</span>
                                    {item.badge && <small>{pendingCount}</small>}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="sidebar__footer"><div className="university-mark">CU</div><div><strong>Chitkara University</strong><small>Mentor Console</small></div></div>
            </aside>
        </>
    );
}

export default DashboardSidebar;
