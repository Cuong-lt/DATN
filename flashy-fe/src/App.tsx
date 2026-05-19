import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Library from './pages/Library';
import Explore from './pages/Explore';
import CreateFolder from './pages/CreateFolder';
import CreateSet from './pages/CreateSet';
import FolderDetail from './pages/FolderDetail';
import EditSet from './pages/EditSet';
import StudySetDetail from './pages/StudySetDetail';
import StudyMode from './pages/StudyMode';
import SRSMode from './pages/SRSMode';
import Statistics from './pages/Statistics';
import Quiz from './pages/Quiz';
import Match from './pages/Match';
import QuizResults from './pages/QuizResults';
import FillBlank from './pages/FillBlank';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminNotifications from './pages/AdminNotifications';
import AdminSets from './pages/AdminSets';
import AdminRoute from './components/AdminRoute';
import PublicSearch from './pages/PublicSearch';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/search" element={<PublicSearch />} />

          {/* Authenticated routes with sidebar */}
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/create-folder" element={<CreateFolder />} />
            <Route path="/create-set" element={<CreateSet />} />
            <Route path="/folder-detail" element={<FolderDetail />} />
            <Route path="/edit-set" element={<EditSet />} />
            <Route path="/study-set" element={<StudySetDetail />} />
            <Route path="/study-mode" element={<StudyMode />} />
            <Route path="/srs-mode" element={<SRSMode />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/match" element={<Match />} />
            <Route path="/quiz-results" element={<QuizResults />} />
            <Route path="/fill-blank" element={<FillBlank />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/statistics" element={<Statistics />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/sets" element={<AdminSets />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
