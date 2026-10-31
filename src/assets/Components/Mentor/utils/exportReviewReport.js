export function exportReviewReport(projects) {
    const rows = [["Project", "Student", "Category", "Status"], ...projects.map((project) => [project.title, project.student, project.category, project.status])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "mosaiq-review-report.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
