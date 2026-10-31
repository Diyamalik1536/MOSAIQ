import SidebarNavigation from "./SidebarNavigation";
import UpgradeCard from "./UpgradeCard";
import "./Sidebar.css";

function Sidebar({ sidebarOpen })
{
    return(
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>

            <SidebarNavigation />

            <UpgradeCard />


        </aside>
    );
}

export default Sidebar;