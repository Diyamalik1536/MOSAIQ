import { useNavigate } from "react-router-dom";
import { hasSearchResults } from "./searchUtils";
import { useTranslation } from "react-i18next";
import "./SearchResults.css";

function SearchResultGroup({ icon, title, items, onSelect }) {
    if (!items.length) return null;

    return (
        <section className="global-search-group">
            <h2>{title}</h2>
            <div className="global-search-items">
                {items.map((item) => (
                    <button type="button" className="global-search-result" key={item.id} onClick={() => onSelect(item)}>
                        <span className="global-search-result-icon"><i className={`bi ${icon}`}></i></span>
                        <span className="global-search-result-copy">
                            <strong>{item.name}</strong>
                            <span>{item.subtitle}</span>
                            {item.details && <small>{item.details}</small>}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}

function SearchResults({ results, compact = false, onResultSelect }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const selectResult = (item, type) => {
        if (type === "student") {
            navigate("/students", { state: { search: item.name } });
        } else if (type === "project") {
            navigate(item.project?.ownerId === "guest" ? "/profile" : "/students", {
                state: { search: item.name }
            });
        } else {
            navigate("/students", { state: { search: item.name } });
        }
        onResultSelect?.();
    };

    if (!hasSearchResults(results)) {
        return (
            <div className={`global-search-empty ${compact ? "compact" : ""}`}>
                <i className="bi bi-search"></i>
                <strong>{t("search.noResults", "No results found")}</strong>
                <span>{t("search.tryDifferent", "Try searching for a different skill, project, or student.")}</span>
            </div>
        );
    }

    return (
        <div className={`global-search-results ${compact ? "compact" : ""}`}>
            <SearchResultGroup icon="bi-person" title={t("search.studentsGroup", "Students")} items={results.students} onSelect={(item) => selectResult(item, "student")} />
            <SearchResultGroup icon="bi-folder2-open" title={t("search.projectsGroup", "Projects")} items={results.projects} onSelect={(item) => selectResult(item, "project")} />
            <SearchResultGroup icon="bi-lightning-charge" title={t("search.skillsGroup", "Skills")} items={results.skills} onSelect={(item) => selectResult(item, "skill")} />
        </div>
    );
}

export default SearchResults;
