function Branch({ toggleSidebar })
{
    return(
        <div className="branch">
            <img src={`${import.meta.env.BASE_URL}favicon-package/favicon.svg`} width={50} alt="CampusSwap Logo"/>
            <button aria-label="Search">TalentForge</button>
            <button onClick={toggleSidebar} aria-label="menu_toggle" className="menu_toggle_icon"><i className="bi bi-list"></i></button>
        </div>
    );
}
export default Branch;
