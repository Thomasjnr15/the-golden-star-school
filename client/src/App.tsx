import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Public pages
import Home from "./pages/Home";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import AdminLogin from "./pages/AdminLogin";

// Protected student pages
import StudentDashboard from "./pages/StudentDashboard";
import ExamPage from "./pages/ExamPage";
import Results from "./pages/Results";

// Protected admin pages
import AdminDashboard from "./pages/AdminDashboard";
import ManageStudents from "./admin/ManageStudents";
import ManageExams from "./admin/ManageExams";
import ManageNews from "./admin/ManageNews";
import ManagePayments from "./admin/ManagePayments";
import RegistrationRequests from "./admin/RegistrationRequests";
import ResultsManager from "./admin/ResultsManager";
import ReportCardManager from "./admin/ReportCardManager";
import Settings from "./admin/Settings";
import ManageSubjects from "./admin/ManageSubjects";
import PromoteStudents from "./admin/PromoteStudents";

// 404 page
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/student-login" component={StudentLogin} />
      <Route path="/student-register" component={StudentRegister} />
      <Route path="/admin/login" component={AdminLogin} />

      {/* Protected student routes */}
      <Route path="/student/dashboard" component={() => (
        <ProtectedRoute requiredRole="student">
          <StudentDashboard />
        </ProtectedRoute>
      )} />
      <Route path="/student/exam/:examId" component={() => (
        <ProtectedRoute requiredRole="student">
          <ExamPage />
        </ProtectedRoute>
      )} />
      <Route path="/student/results" component={() => (
        <ProtectedRoute requiredRole="student">
          <Results />
        </ProtectedRoute>
      )} />

      {/* Protected admin routes */}
      <Route path="/admin/dashboard" component={() => (
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      )} />
      <Route path="/admin/students" component={() => (
        <ProtectedRoute requiredRole="admin">
          <ManageStudents />
        </ProtectedRoute>
      )} />
      <Route path="/admin/exams" component={() => (
        <ProtectedRoute requiredRole="admin">
          <ManageExams />
        </ProtectedRoute>
      )} />
      <Route path="/admin/news" component={() => (
        <ProtectedRoute requiredRole="admin">
          <ManageNews />
        </ProtectedRoute>
      )} />
      <Route path="/admin/payments" component={() => (
        <ProtectedRoute requiredRole="admin">
          <ManagePayments />
        </ProtectedRoute>
      )} />
      <Route path="/admin/registrations" component={() => (
        <ProtectedRoute requiredRole="admin">
          <RegistrationRequests />
        </ProtectedRoute>
      )} />
      <Route path="/admin/results" component={() => (
        <ProtectedRoute requiredRole="admin">
          <ResultsManager />
        </ProtectedRoute>
      )} />
      <Route path="/admin/report-cards" component={() => (
        <ProtectedRoute requiredRole="admin">
          <ReportCardManager />
        </ProtectedRoute>
      )} />
      <Route path="/admin/settings" component={() => (
        <ProtectedRoute requiredRole="admin">
          <Settings />
        </ProtectedRoute>
      )} />
      <Route path="/admin/subjects" component={() => (
        <ProtectedRoute requiredRole="admin">
          <ManageSubjects />
        </ProtectedRoute>
      )} />
      <Route path="/admin/promotions" component={() => (
        <ProtectedRoute requiredRole="admin">
          <PromoteStudents />
        </ProtectedRoute>
      )} />

      {/* 404 fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
