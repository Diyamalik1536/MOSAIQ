import { useTranslation } from "react-i18next";

function StudentSort({ sort, onSortChange }) {
    const { t } = useTranslation();

    const sortOptions = [
        { label: t("students.sortDefault", "Default"), value: "default" },
        { label: t("students.sortNameAsc", "Name: A → Z"), value: "name_asc" },
        { label: t("students.sortNameDesc", "Name: Z → A"), value: "name_desc" }
    ];

    return (
        <div className="student-sort">
            <label htmlFor="sort-select">{t("students.sortLabel", "Sort")}</label>
            <select
                id="sort-select"
                value={sort}
                onChange={(event) => onSortChange(event.target.value)}
            >
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default StudentSort;
