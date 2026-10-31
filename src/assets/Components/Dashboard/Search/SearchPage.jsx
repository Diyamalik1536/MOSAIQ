import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SearchResults from "./SearchResults";
import { getGlobalSearchResults } from "./searchUtils";
import { useTranslation } from "react-i18next";
import "./SearchPage.css";

function SearchPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const results = useMemo(() => getGlobalSearchResults(query), [query]);

    return (
        <div className="global-search-page">
            <div className="global-search-page-header">
                <p>{t("search.header", "Search Results")}</p>
                <h1>
                    {query
                        ? t("search.resultsFor", { query, defaultValue: `Results for "${query}"` })
                        : t("search.resultsForDefault", "Results for TalentForge")}
                </h1>
            </div>
            <SearchResults results={results} />
        </div>
    );
}

export default SearchPage;
