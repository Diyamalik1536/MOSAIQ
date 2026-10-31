import "./BrowseStudents.css";
import { useTranslation } from "react-i18next";

function StudentSearch({ search, onSearchChange }) {
    const { t } = useTranslation();

    return (
        <div className="search-wrapper">
            <i className="bi bi-search search-icon"></i>
            <input
                type="text"
                placeholder={t("students.searchPlaceholder", "Search by name, skills, projects, or interests...")}
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                className="search-input"
            />
            {search && (
                <button
                    type="button"
                    className="search-clear"
                    onClick={() => onSearchChange("")}
                    aria-label="Clear search"
                >
                    <i className="bi bi-x"></i>
                </button>
            )}
        </div>
    );
}

export default StudentSearch;
