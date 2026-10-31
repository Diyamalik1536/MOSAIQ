
import Profile from './assets/Components/Profile/Profile';
import Dashboard from './assets/Components/Dashboard/Dashboard';
import './App.css';
import LandingPage from './pages/LandingPage';
import Header from './components/Header';
import Footer from './components/Footer';
import BrowseStudents from './assets/Components/Dashboard/BrowseStudents/BrowseStudents';
import NotificationsPage from './assets/Components/Dashboard/Notifications/NotificationsPage';
import Login from './assets/Components/Authentication/Login/Login';
import Signup from './assets/Components/Authentication/Signup/Signup';
import RecruiterLogin from './assets/Components/Authentication/RecruiterLogin/RecruiterLogin';
import RecruiterDashboard from './assets/Components/Recruiter/RecruiterDashboard';
import MentorLogin from "./assets/Components/Authentication/RecruiterLogin/MentorLogin";
import MentorSignup from "./assets/Components/Authentication/Signup/MentorSignup";
import MentorDashboard from "./assets/Components/Mentor/Mentordashboard";
import "./RoleSelection.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';

import RecruiterSignup from "./assets/Components/Authentication/Signup/RecruiterSignup";
import DashboardLayout from './assets/Components/Dashboard/DashboardLayout/DashboardLayout';

import { NotificationProvider } from './context/NotificationContext';
import { ApplicationProvider } from './context/ApplicationContext';

import SearchPage from './assets/Components/Dashboard/Search/SearchPage';
import Saved from './assets/Components/Saved/Saved';
import CollaborationPlanner from './assets/Components/Dashboard/CollaborationPlanner/CollaborationPlanner';
import ResumeBuilder from './assets/Components/Dashboard/ResumeBuilder/ResumeBuilder';
import ConnectionsPage from './assets/Components/Dashboard/Connections/ConnectionsPage';
import MessagesPage from './assets/Components/Dashboard/Messages/MessagesPage';
import MeetingsPage from './assets/Components/Dashboard/Meetings/MeetingsPage';
import NotFound from './pages/NotFound';
import CareerAnalytics from './assets/Components/Dashboard/Analytics/CareerAnalytics';
import BrowseProjects from './pages/BrowseProjects';
import ProjectCaseStudy from './pages/ProjectCaseStudy';

import { UserProvider, useUser } from './context/UserContext';
import { MessageProvider } from './context/MessageContext';
import ThemeProvider from './context/ThemeContext';
import { useTranslation } from 'react-i18next';

// Role Selection Portal
function RoleSelection() {
  const roles = [
    {
      title: "Student",
      description: "Explore opportunities, build your profile and connect with recruiters.",
      path: "/login",
      icon: "🎓"
    },
    {
      title: "Recruiter",
      description: "Discover talented students and manage your hiring process.",
      path: "/recruiter/login",
      icon: "💼"
    },
    {
      title: "Mentor",
      description: "Guide students, review projects and support their growth.",
      path: "/mentor/login",
      icon: "👨‍🏫"
    }
  ];

  return (
    <div className="role-selection-page">
      <div className="role-selection-container">
        <h1>Welcome to MOSAIQ</h1>
        <p>Select your portal to continue</p>

        <div className="role-selection-grid">
          {roles.map((role) => (
            <Link
              to={role.path}
              className="role-selection-card"
              key={role.title}
            >
              <span className="role-selection-icon">{role.icon}</span>
              <h2>{role.title}</h2>
              <p>{role.description}</p>
              <span className="role-selection-action">
                Sign in →
              </span>
            </Link>
          ))}
        </div>

        <Link to="/" className="role-selection-back">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

// Protected Route
function ProtectedRoute({ children, requiredRole = "student" }) {
  const { t } = useTranslation();
  const { currentUser, loading } = useUser();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh"
        }}
      >
        <div style={{ fontSize: "1.2rem", color: "#4f46e5" }}>
          {t('common.loading', 'Loading MOSAIQ...')}
        </div>
      </div>
    );
  }

  if (currentUser) {
    if (currentUser.role !== requiredRole) {
      const roleRoutes = {
        student: "/dashboard",
        recruiter: "/recruiter/dashboard",
        mentor: "/mentor/dashboard"
      };

      return (
        <Navigate
          to={roleRoutes[currentUser.role] || "/roles"}
          replace
        />
      );
    }

    return children;
  }

  const loginRoutes = {
    student: "/login",
    recruiter: "/recruiter/login",
    mentor: "/mentor/login"
  };

  return (
    <Navigate
      to={loginRoutes[requiredRole] || "/roles"}
      replace
    />
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ApplicationProvider>
        <Routes>
          {/* Landing Page */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <LandingPage />
                <Footer />
              </>
            }
          />

          {/* Three-role Selection Portal */}
          <Route path="/roles" element={<RoleSelection />} />

          {/* Student Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Recruiter Authentication */}
          <Route
            path="/recruiter/login"
            element={<RecruiterLogin />}
          />
          <Route path="/recruiter/signup" element={<RecruiterSignup />} />

          {/* Mentor Authentication */}
          <Route
            path="/mentor/login"
            element={<MentorLogin />}
          />

          <Route
            path="/mentor/signup"
            element={<MentorSignup />}
          />

          {/* Recruiter Dashboard */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />

          {/* Mentor Dashboard */}
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute requiredRole="mentor">
                <MentorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Student Project Directory and Details */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute requiredRole="student">
                <DashboardLayout>
                  <BrowseProjects />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute requiredRole="student">
                <DashboardLayout>
                  <ProjectCaseStudy />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Student Meetings */}
          <Route
            path="/meetings"
            element={
              <ProtectedRoute requiredRole="student">
                <DashboardLayout>
                  <MeetingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Browse Students */}
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BrowseStudents />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Connections */}
          <Route
            path="/connections"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ConnectionsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Messages */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MessagesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Saved */}
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Saved />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <NotificationsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Search */}
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SearchPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Collaboration Planner */}
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CollaborationPlanner />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Resume Builder */}
          <Route
            path="/resume-builder"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ResumeBuilder />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Career Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CareerAnalytics />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </ApplicationProvider>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          <MessageProvider>
            <AppRoutes />
          </MessageProvider>
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
