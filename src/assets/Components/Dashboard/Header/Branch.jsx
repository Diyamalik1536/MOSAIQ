import { Link } from "react-router-dom";

function Branch({ toggleSidebar }) {
    return (
        <div className="branch">
            <Link to="/roles" className="branch-brand" aria-label="MOSAIQ roles portal">
                <img src={`${import.meta.env.BASE_URL}favicon-package/favicon.svg`} width={50} alt="" />
                <span>MOSAIQ</span>
            </Link>
            <button onClick={toggleSidebar} aria-label="menu_toggle" className="menu_toggle_icon"><i className="bi bi-list"></i></button>
        </div>
    );
}
export default Branch;
