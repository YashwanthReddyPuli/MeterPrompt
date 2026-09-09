import { UserDropdown } from '../ui/user-dropdown';

export default function Navbar({ currentRoute, setCurrentRoute, onOpenSearch, setAuthMode }) {
  const { user, logout } = useAuth();

  const handleDropdownAction = (action) => {
    if (action === 'logout') {
      logout();
      setCurrentRoute('landing');
    } else if (action === 'docs') {
      setCurrentRoute('docs');
    } else {
      setCurrentRoute(`console-${action}`);
    }
  };

  return (
    <header className="border-b border-border bg-card px-6 py-3 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Section */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentRoute('landing')} 
            className="flex items-center gap-2.5 hover:opacity-90 transition text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-sm shadow-sm shadow-primary/30">
              MP
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-foreground">MeterPrompt</span>
            </div>
          </button>

          {/* Quick Search Bar Trigger (Ctrl+K) */}
          <button 
            onClick={onOpenSearch}
            className="hidden lg:flex items-center gap-3 bg-secondary text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl border border-border text-xs transition cursor-pointer"
          >
            <Search size={14} />
            <span>Search models, keys, docs...</span>
            <kbd className="bg-card text-foreground text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-border">Ctrl K</kbd>
          </button>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <button 
              onClick={() => setCurrentRoute('landing')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${currentRoute === 'landing' ? 'bg-secondary text-primary font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentRoute('pricing')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${currentRoute === 'pricing' ? 'bg-secondary text-primary font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              Models & Pricing
            </button>
            <button 
              onClick={() => setCurrentRoute('docs')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${currentRoute === 'docs' ? 'bg-secondary text-primary font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              Docs
            </button>
          </nav>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3">
          {/* User Profile Pill or Auth Buttons */}
          {user ? (
            <UserDropdown user={user} onAction={handleDropdownAction} />
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setAuthMode('login'); setCurrentRoute('auth'); }}
                className="inline-flex items-center justify-center text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 hover:border-zinc-400 px-3.5 py-1.5 rounded-[0.625rem] transition-all duration-200 ease-out hover:scale-[1.025] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthMode('register'); setCurrentRoute('auth'); }}
                className="inline-flex items-center justify-center text-xs font-bold bg-[#5865f2] text-white px-4 py-1.5 rounded-[0.625rem] shadow-sm transition-all duration-200 ease-out hover:scale-[1.025] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#5865f2]/25 active:scale-95 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}