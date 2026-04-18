import React, { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RouteSuspense from './components/RouteSuspense';
import HomePage from './pages/HomePage';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfessorListPage = lazy(() => import('./pages/ProfessorListPage'));
const ProfessorDetailPage = lazy(() => import('./pages/ProfessorDetailPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const UploadNotesPage = lazy(() => import('./pages/UploadNotesPage'));
const StudyPackPage = lazy(() => import('./pages/StudyPackPage'));
const MockExamGeneratePage = lazy(() => import('./pages/MockExamGeneratePage'));
const MockExamSessionPage = lazy(() => import('./pages/MockExamSessionPage'));
const MockExamResultPage = lazy(() => import('./pages/MockExamResultPage'));
const PanicModePage = lazy(() => import('./pages/PanicModePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CreditsPage = lazy(() => import('./pages/CreditsPage'));
const ExamApprovalPage = lazy(() => import('./pages/ExamApprovalPage'));
const PostExamReportFormPage = lazy(
  () => import('./pages/PostExamReportFormPage')
);
const StudyGroupsPage = lazy(() => import('./pages/StudyGroupsPage'));
const DNAProfilePage = lazy(() => import('./pages/DNAProfilePage'));
const ConfidencePage = lazy(() => import('./pages/ConfidencePage'));
const GradesPage = lazy(() => import('./pages/GradesPage'));
const CourseAdvisorPage = lazy(() => import('./pages/CourseAdvisorPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const VoiceTutorPage = lazy(() => import('./pages/VoiceTutorPage'));
const OCRPage = lazy(() => import('./pages/OCRPage'));
const LecturesPage = lazy(() => import('./pages/LecturesPage'));
const MultimodalSearchPage = lazy(
  () => import('./pages/MultimodalSearchPage')
);
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TutorListPage = lazy(() => import('./pages/TutorListPage'));
const TutorDetailPage = lazy(() => import('./pages/TutorDetailPage'));
const TutoringSessionPage = lazy(
  () => import('./pages/TutoringSessionPage')
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1">
              <RouteSuspense>
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
                    path="/mock-exam/session/:sessionId/result"
                    element={
                      <ProtectedRoute>
                        <MockExamResultPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/panic"
                    element={
                      <ProtectedRoute>
                        <PanicModePage />
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
                  <Route
                    path="/credits"
                    element={
                      <ProtectedRoute>
                        <CreditsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/approve-exams"
                    element={
                      <ProtectedRoute>
                        <ExamApprovalPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/post-exam-reports/new"
                    element={
                      <ProtectedRoute>
                        <PostExamReportFormPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/study-groups"
                    element={
                      <ProtectedRoute>
                        <StudyGroupsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/me/profile"
                    element={
                      <ProtectedRoute>
                        <DNAProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/me/confidence"
                    element={
                      <ProtectedRoute>
                        <ConfidencePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/me/grades"
                    element={
                      <ProtectedRoute>
                        <GradesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/me/course-advisor"
                    element={
                      <ProtectedRoute>
                        <CourseAdvisorPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/me/reviews"
                    element={
                      <ProtectedRoute>
                        <ReviewsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tutor"
                    element={
                      <ProtectedRoute>
                        <VoiceTutorPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/me/ocr"
                    element={
                      <ProtectedRoute>
                        <OCRPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/me/lectures"
                    element={
                      <ProtectedRoute>
                        <LecturesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/search/multimodal"
                    element={
                      <ProtectedRoute>
                        <MultimodalSearchPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/tutors" element={<TutorListPage />} />
                  <Route path="/tutors/:id" element={<TutorDetailPage />} />
                  <Route
                    path="/tutoring/sessions/:id"
                    element={
                      <ProtectedRoute>
                        <TutoringSessionPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </RouteSuspense>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
