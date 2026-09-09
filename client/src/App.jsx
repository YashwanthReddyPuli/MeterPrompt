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
import AdminCoupons from './pages/admin/AdminCoupons';

// Error Pages
import NotFoundPage from './pages/errors/NotFoundPage';
import ForbiddenPage from './pages/errors/ForbiddenPage';
import ServerErrorPage from './pages/errors/ServerErrorPage';
import QuotaExceededPage from './pages/errors/QuotaExceededPage';

import apiClient from './services/apiClient';



function getInitialRoute() {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const tab = searchParams.get('tab');

  if (tab) {
    return `console-${tab}`;
  }

  if (path === '/' || path === '') return 'landing';
  if (path === '/pricing') return 'pricing';
  if (path === '/docs') return 'docs';
  if (path === '/auth') return 'auth';
  if (path === '/403') return 'error-403';
  if (path === '/500') return 'error-500';
  if (path === '/quota-exceeded') return 'error-429';
  if (path.startsWith('/console')) {
    return 'console-overview';
  }
  return 'not-found';
}

function AppContent() {
  const { user, showNotification } = useAuth();
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  
  React.useEffect(() => {
    if (currentRoute.startsWith('console-')) {
      const tabName = currentRoute.replace('console-', '');
      const newUrl = `${window.location.pathname}?tab=${tabName}`;
      if (window.location.search !== `?tab=${tabName}`) {
        window.history.pushState({}, '', newUrl);
      }
    } else if (currentRoute === 'landing') {
      if (window.location.pathname !== '/' || window.location.search !== '') {
        window.history.pushState({}, '', '/');
      }
    } else if (['pricing', 'docs', 'auth'].includes(currentRoute)) {
      if (window.location.pathname !== `/${currentRoute}`) {
        window.history.pushState({}, '', `/${currentRoute}`);
      }
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

  // Automatic Admin Route Redirection & Access Guarding
  React.useEffect(() => {
    if (!user && isConsoleRoute) {
      setCurrentRoute('auth');
      showNotification('info', 'Authentication required to access Console.');
      return;
    }

    if (user) {
      if (user.role !== 'admin' && currentRoute.startsWith('console-admin-')) {
        setCurrentRoute('console-overview');
      }
    }
  }, [user, isConsoleRoute]);

  const navigateToConsole = (subRoute) => {
    if (!user) {
      setAuthMode('login');
      setCurrentRoute('auth');
      showNotification('info', 'Authentication required to access Developer Console.');
      return;
    }
    
    // Allow admins to navigate to any console route (both admin-specific and general developer routes)
    const targetRoute = subRoute.startsWith('console-') ? subRoute : `console-${subRoute}`;
    if (user.role === 'admin') {
      setCurrentRoute(targetRoute);
    } else {
      if (targetRoute.startsWith('console-admin-')) {
        setCurrentRoute('console-overview');
      } else {
        setCurrentRoute(targetRoute);
      }
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
    <div className={`min-h-screen bg-background text-foreground flex flex-col font-sans ${isConsoleRoute ? 'h-screen overflow-hidden' : ''}`}>
      {/* GLOBAL NAVBAR */}
      <Navbar 
        currentRoute={currentRoute}
        setCurrentRoute={setCurrentRoute}
        onOpenSearch={() => setSearchOpen(true)}
        setAuthMode={setAuthMode}
      />

      {/* CONSOLE LAYOUT WITH INDEPENDENTLY SCROLLING CANVAS */}
      {isConsoleRoute ? (
        <div className="flex-1 flex w-full relative overflow-hidden bg-[#fbfbfb]">
          <Sidebar currentRoute={currentRoute} setCurrentRoute={setCurrentRoute} />
          
          <main className="flex-1 min-w-0 h-full overflow-y-auto p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6 pb-16">
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
              {currentRoute === 'console-admin-coupons' && <AdminCoupons />}
              {currentRoute === 'console-admin-events' && <AdminEvents />}
              {currentRoute === 'console-admin-users' && <AdminUsers />}
              {currentRoute === 'console-admin-plans' && <AdminPlans />}
              {currentRoute === 'console-admin-dunning' && <AdminDunning />}
            </div>
          </main>
        </div>
      ) : (
        /* PUBLIC VIEWS & ERROR SCREENS */
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
          {currentRoute === 'error-403' && <ForbiddenPage />}
          {currentRoute === 'error-500' && <ServerErrorPage />}
          {currentRoute === 'error-429' && <QuotaExceededPage />}
          {!['landing', 'pricing', 'docs', 'auth', 'error-403', 'error-500', 'error-429'].includes(currentRoute) && (
            <NotFoundPage />
          )}
        </main>
      )}

      {/* FOOTER (rendered for public routes) */}
      {!isConsoleRoute && <Footer />}

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