import { Link } from "react-router-dom";

function SidebarItem({ label, href, icon, active, badge }) {
    return (
        <Link
            to={href}
            reloadDocument={href === "/projects"}
            className={active ? "sidebar-item active" : "sidebar-item"}
        >
            <i className={icon}></i>
            <span style={{ flex: 1 }}>{label}</span>
            {badge > 0 && (
                <span className="sidebar-badge" style={{
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700
                }}>
                    {badge}
                </span>
            )}
        </Link>
    );
}

export default SidebarItem;