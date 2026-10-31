import SidebarNavigation from "./SidebarNavigation";
import "./Sidebar.css";

function Sidebar({ sidebarOpen }) {
    return (
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
            <SidebarNavigation />

        </aside>
    );
}

export default Sidebar;
