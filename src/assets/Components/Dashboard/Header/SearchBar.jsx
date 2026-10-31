import { useEffect, useMemo, useRef, useState } from "react";
import SearchResults from "../Search/SearchResults";
import { getGlobalSearchResults } from "../Search/searchUtils";
import "../Search/SearchResults.css";
import { useTranslation } from "react-i18next";

function Searchbar(props) {
    const { t } = useTranslation();
    const [searchText, setSearchText] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const searchRef = useRef(null);
    const results = useMemo(() => getGlobalSearchResults(searchText), [searchText]);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (!searchRef.current?.contains(event.target)) setDropdownOpen(false);
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    function handlechange(event) {
        setSearchText(event.target.value);
        setDropdownOpen(event.target.value.trim() !== "");
    }

    function handlesubmit(event) {
        event.preventDefault();
        if (searchText.trim() === "") {
            setDropdownOpen(false);
            return;
        } else {
            props.onSearch(searchText.trim());
            setDropdownOpen(false);
        }
    }

    return (
        <form className="global-search-form" onSubmit={handlesubmit} ref={searchRef}>
            <div className="search_icons">
                <button type="submit" className="global-search-submit" aria-label={t("common.search", "Search")}>
                    <i className="bi bi-search"></i>
                </button>
                <input
                    type="text"
                    className="search_bar"
                    placeholder={props.placeholder}
                    onChange={handlechange}
                    value={searchText}
                    onFocus={() => searchText.trim() && setDropdownOpen(true)}
                    onKeyDown={(event) => event.key === "Escape" && setDropdownOpen(false)}
                />
            </div>
            {dropdownOpen && searchText.trim() && (
                <div className="global-search-dropdown">
                    <SearchResults results={results} compact onResultSelect={() => setDropdownOpen(false)} />
                    <button type="button" className="global-search-view-all" onClick={handlesubmit}>
                        {t("nav.searchViewAll", "View all results")} <i className="bi bi-arrow-right"></i>
                    </button>
                </div>
            )}
        </form>
    );
}

export default Searchbar;
