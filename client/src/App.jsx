import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import SearchModal from './components/layout/SearchModal';
import CreateKeyModal from './components/common/CreateKeyModal';
import AddCreditsModal from './components/common/AddCreditsModal';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import LandingPage from './pages/public/LandingPage';
import ModelsCatalog from './pages/public/ModelsCatalog';
import DocsPage from './pages/public/DocsPage';
import AuthPage from './pages/auth/AuthPage';
import NotFound from './pages/errors/NotFound';

// Console Pages
import Overview from './pages/console/Overview';
import ApiKeys from './pages/console/ApiKeys';
import Profile from './pages/console/Profile';
import Activity from './pages/console/Activity';
import Logs from './pages/console/Logs';
import Credits from './pages/console/Credits';
import Notifications from './pages/console/Notifications';
import Preferences from './pages/console/Preferences';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPlans from './pages/admin/AdminPlans';
import AdminDunning from './pages/admin/AdminDunning';
import AdminEvents from './pages/admin/AdminEvents';

import apiClient from './services/apiClient';


function AppContent() {
  const { user, showNotification } = useAuth();
  const [currentRoute, setCurrentRoute] = useState(
    window.location.pathname === '/' ? 'landing' : 'not-found'
  );
  
  React.useEffect(() => {
    if (currentRoute === 'landing') {
      window.history.pushState({}, '', '/');
    }
  }, [currentRoute]);
  
  const [docsTab, setDocsTab] = useState('overview');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  const navigateToDocs = (tabName = 'overview') => {
    setDocsTab(tabName);
    setCurrentRoute('docs');
  };
  
  // Modals State
  const [searchOpen, setSearchOpen] = useState(false);
  const [createKeyModalOpen, setCreateKeyModalOpen] = useState(false);
  const [addCreditsModalOpen, setAddCreditsModalOpen] = useState(false);
  const [newRawKey, setNewRawKey] = useState('');
  const [userCredits, setUserCredits] = useState(2500);

  const isConsoleRoute = currentRoute.startsWith('console-');

  // Automatic Admin Route Redirection
  React.useEffect(() => {
    if (user?.role === 'admin' && isConsoleRoute && !currentRoute.startsWith('console-admin-')) {
      setCurrentRoute('console-admin-overview');
    }
  }, [user, currentRoute, isConsoleRoute]);

  const navigateToConsole = (subRoute) => {
    if (!user) {
      setAuthMode('login');
      setCurrentRoute('auth');
      showNotification('info', 'Authentication required to access Developer Console.');
      return;
    }
    if (user.role === 'admin') {
      setCurrentRoute('console-admin-overview');
    } else {
      setCurrentRoute(`console-${subRoute}`);
    }
  };

  const handleCreateApiKeyAction = async (keyName) => {
    try {
      const data = await apiClient.post('/auth/api-keys', { name: keyName });
      if (data.success) {
        setNewRawKey(data.data.apiKey);
        setCreateKeyModalOpen(false);
        showNotification('success', 'Secret key generated! Copy it now.');
      }
    } catch (err) {
      showNotification('error', err.message || 'Error generating key');
    }
  };

  const handleAddCreditsAction = (amount) => {
    setUserCredits(prev => prev + amount);
    setAddCreditsModalOpen(false);
    showNotification('success', `Added ${amount} credits to your account!`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* GLOBAL NAVBAR */}
      <Navbar 
        currentRoute={currentRoute}
        setCurrentRoute={setCurrentRoute}
        onOpenSearch={() => setSearchOpen(true)}
        setAuthMode={setAuthMode}
      />

      {/* CONSOLE LAYOUT WITH LEFT HOVER DRAWER SIDEBAR */}
      {isConsoleRoute ? (
        <div className="min-h-screen bg-[#fbfbfb] flex flex-col flex-1">
          <Sidebar currentRoute={currentRoute} setCurrentRoute={setCurrentRoute} />
          
          <main className="flex-1 ml-16 p-8 max-w-6xl w-full mx-auto space-y-6">
            {/* Customer Routes */}
            {currentRoute === 'console-overview' && (
              <Overview setCurrentRoute={setCurrentRoute} setCreateKeyModalOpen={setCreateKeyModalOpen} />
            )}
            {currentRoute === 'console-keys' && (
              <ApiKeys newRawKey={newRawKey} setCreateKeyModalOpen={setCreateKeyModalOpen} />
            )}
            {currentRoute === 'console-profile' && (
              <Profile setCurrentRoute={setCurrentRoute} />
            )}
            {currentRoute === 'console-activity' && <Activity />}
            {currentRoute === 'console-logs' && <Logs />}
            {currentRoute === 'console-credits' && (
              <Credits userCredits={userCredits} setUserCredits={setUserCredits} setAddCreditsModalOpen={setAddCreditsModalOpen} setCurrentRoute={setCurrentRoute} />
            )}
            {currentRoute === 'console-notifications' && <Notifications />}
            {currentRoute === 'console-preferences' && <Preferences />}

            {/* Admin Dedicated Control Center Routes */}
            {currentRoute === 'console-admin-overview' && <AdminOverview />}
            {currentRoute === 'console-admin-events' && <AdminEvents />}
            {currentRoute === 'console-admin-users' && <AdminUsers />}
            {currentRoute === 'console-admin-plans' && <AdminPlans />}
            {currentRoute === 'console-admin-dunning' && <AdminDunning />}
          </main>

        </div>
      ) : (
        /* PUBLIC VIEWS */
        <main className="flex-1 max-w-7xl w-full mx-auto p-6">
          {currentRoute === 'landing' && (
            <LandingPage setCurrentRoute={setCurrentRoute} setAuthMode={setAuthMode} navigateToDocs={navigateToDocs} />
          )}
          {currentRoute === 'pricing' && (
            <ModelsCatalog setCurrentRoute={setCurrentRoute} setAuthMode={setAuthMode} />
          )}
          {currentRoute === 'docs' && <DocsPage docsTab={docsTab} setDocsTab={setDocsTab} />}
          {currentRoute === 'auth' && (
            <AuthPage authMode={authMode} setAuthMode={setAuthMode} setCurrentRoute={setCurrentRoute} />
          )}
          {!['landing', 'pricing', 'docs', 'auth'].includes(currentRoute) && (
            <NotFound setCurrentRoute={setCurrentRoute} />
          )}
        </main>
      )}

      {/* FOOTER */}
      <Footer />

      {/* MODALS */}
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        setCurrentRoute={setCurrentRoute}
        navigateToConsole={navigateToConsole}
      />

      <CreateKeyModal 
        isOpen={createKeyModalOpen}
        onClose={() => setCreateKeyModalOpen(false)}
        onCreateKey={handleCreateApiKeyAction}
      />

      <AddCreditsModal 
        isOpen={addCreditsModalOpen}
        onClose={() => setAddCreditsModalOpen(false)}
        onAddCredits={handleAddCreditsAction}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}