import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfessorListPage from './pages/ProfessorListPage';
import ProfessorDetailPage from './pages/ProfessorDetailPage';
import UploadPage from './pages/UploadPage';
import UploadNotesPage from './pages/UploadNotesPage';
import StudyPackPage from './pages/StudyPackPage';
import MockExamGeneratePage from './pages/MockExamGeneratePage';
import MockExamSessionPage from './pages/MockExamSessionPage';
import DashboardPage from './pages/DashboardPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/professors" element={<ProfessorListPage />} />
              <Route path="/professors/:id" element={<ProfessorDetailPage />} />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload-notes"
                element={
                  <ProtectedRoute>
                    <UploadNotesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/study-pack/:id"
                element={
                  <ProtectedRoute>
                    <StudyPackPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mock-exam/generate"
                element={
                  <ProtectedRoute>
                    <MockExamGeneratePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mock-exam/:id/session"
                element={
                  <ProtectedRoute>
                    <MockExamSessionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
