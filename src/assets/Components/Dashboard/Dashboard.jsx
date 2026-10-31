import DashboardLayout from "./DashboardLayout/DashboardLayout";
import Hero from "./Hero/Hero";
import DashboardContent from "./Dashboard_content";
function Dashboard() {
    return (
        <DashboardLayout>
            <Hero />
            <DashboardContent />
        </DashboardLayout>
    );
}

export default Dashboard;
