import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Send, BarChart2, Settings, Bell, ShoppingCart, BotMessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Segments', path: '/segments', icon: UserPlus },
    { name: 'Campaigns', path: '/campaigns', icon: Send },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'AI Assistant', path: '/assistant', icon: BotMessageSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs leading-none">P</span>
            </div>
            PulseCRM AI
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div 
            onClick={logout}
            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-primary font-medium text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs truncate">{user?.email || 'Admin'}</p>
              </div>
            </div>
            <LogOut className="w-4 h-4" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-8">
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="px-2 py-1 rounded bg-muted border text-xs mr-2 border-border shadow-sm">Cmd K</span>
            Search anywhere...
          </div>
          <div className="flex items-center gap-4">
            <button 
              className="text-muted-foreground hover:text-foreground relative"
              onClick={() => alert('You have no new notifications.')}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Main */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
