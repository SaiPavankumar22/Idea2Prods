import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import InvestorDashboard from './components/InvestorDashboard';
import TechDiscovery from './components/TechDiscovery';
import TechNews from './components/TechNews';
import AIAssistant from './components/AIAssistant';
import ProjectHub from './components/ProjectHub';
import InvestorNetwork from './components/InvestorNetwork';
import InvestorChat from './components/InvestorChat';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import { Technology } from './types';
import { initializeSampleData } from './services/firestore';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [selectedTech, setSelectedTech] = useState<Technology | undefined>();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    // Initialize sample data when app loads
    initializeSampleData();
  }, []);

  const handleTechSelect = (tech: Technology) => {
    setSelectedTech(tech);
  };

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const isHomePage = location.pathname === '/';
  const showSidebar = user && !isHomePage;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Idea2Prod...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Conditional Header/Sidebar */}
      {isHomePage && !user && (
        <Header onAuthClick={handleAuthClick} />
      )}
      
      {showSidebar && <Sidebar />}
      
      {/* Main Content */}
      <main className={`${showSidebar ? 'ml-64' : ''} ${isHomePage ? '' : 'pt-0'}`}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Home Route */}
            <Route 
              path="/" 
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Hero onGetStarted={handleAuthClick} onAuthClick={handleAuthClick} />
                  </motion.div>
                )
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {user?.role === 'investor' ? <InvestorDashboard /> : <Dashboard />}
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/discover" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="discover"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TechDiscovery onTechSelect={handleTechSelect} />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/tech-news" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="tech-news"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TechNews />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="projects"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProjectHub />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/assistant" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="assistant"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AIAssistant selectedTech={selectedTech} />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/investors" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="investors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InvestorNetwork />
                  </motion.div>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InvestorChat />
                  </motion.div>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;