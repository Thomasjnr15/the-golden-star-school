import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import StudentDashboard from './pages/StudentDashboard';
import ExamPage from './pages/ExamPage';
import Results from './pages/Results';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import ManageStudents from './admin/ManageStudents';
import ManageExams from './admin/ManageExams';
import ManageNews from './admin/ManageNews';
import ManagePayments from './admin/ManagePayments';
import Settings from './admin/Settings';
import RegistrationRequests from './admin/RegistrationRequests';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/register" element={<StudentRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Student Protected */}
          <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/exam/:examId" element={<ProtectedRoute role="student"><ExamPage /></ProtectedRoute>} />
          <Route path="/results/:examId" element={<ProtectedRoute role="student"><Results /></ProtectedRoute>} />

          {/* Admin Protected */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute role="admin"><ManageStudents /></ProtectedRoute>} />
          <Route path="/admin/exams" element={<ProtectedRoute role="admin"><ManageExams /></ProtectedRoute>} />
          <Route path="/admin/news" element={<ProtectedRoute role="admin"><ManageNews /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute role="admin"><ManagePayments /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><Settings /></ProtectedRoute>} />
          <Route path="/admin/registrations" element={<ProtectedRoute role="admin"><RegistrationRequests /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
