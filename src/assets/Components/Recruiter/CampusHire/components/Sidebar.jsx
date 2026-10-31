import { Compass, Bookmark, GitCompareArrows, ChartNoAxesColumn, Settings, Landmark } from "lucide-react";
import { Link } from "react-router-dom";

const navItems = [
  { id: "Discovery", label: "Discovery", Icon: Compass },
  { id: "Shortlist", label: "Shortlist", Icon: Bookmark },
  { id: "Compare", label: "Compare", Icon: GitCompareArrows },
  { id: "Analytics", label: "Analytics", Icon: ChartNoAxesColumn },
  { id: "Settings", label: "Settings", Icon: Settings }
];

export default function Sidebar({ page, setPage, shortlistCount }) {
  return (
    <aside className="sidebar">
      <Link className="brand" to="/roles" aria-label="MOSAIQ roles portal">
        <div className="brand-icon"><Landmark size={25} /></div>
        <div><strong>MOSAIQ</strong><span>Recruiter Portal</span></div>
      </Link>
      <nav className="nav-list">
        {navItems.map(({ id, label, Icon }) => (
          <button key={id} className={`nav-item ${page === id ? "active" : ""}`} onClick={() => setPage(id)}>
            <Icon size={19} strokeWidth={1.9} />
            <span>{label}</span>
            {id === "Shortlist" && shortlistCount > 0 && <b className="nav-count">{shortlistCount}</b>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <Landmark size={21} />
        <div><strong>RVR College</strong><span>of Engineering</span></div>
      </div>
    </aside>
  );
}
