import { useState } from 'react';
import { AppWindow } from './Desktop';
import { useAuth } from '@/hooks/useAuth';
import { Brain, Code, FileText, Folder, Calendar, Settings, Terminal, Monitor, LogOut, User } from 'lucide-react';

interface TaskbarProps {
  windows: AppWindow[];
  onWindowClick: (windowId: string) => void;
  onAppOpen: (appType: string, title: string) => void;
}

export const Taskbar = ({ windows, onWindowClick, onAppOpen }: TaskbarProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const getAppIcon = (component: string) => {
    const icons: Record<string, any> = {
      FileManager: Folder,
      NotesApp: FileText,
      CodeEditor: Code,
      AIAssistant: Brain,
      Calendar: Calendar,
      Terminal: Terminal,
      Settings: Settings,
      Browser: Monitor,
    };
    return icons[component] || FileText;
  };

  const quickLaunchApps = [
    { component: 'FileManager', title: 'File Manager', icon: Folder },
    { component: 'CodeEditor', title: 'Code Editor', icon: Code },
    { component: 'AIAssistant', title: 'AI Assistant', icon: Brain },
    { component: 'Terminal', title: 'Terminal', icon: Terminal },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 font-mono">
      <div className="mx-4 mb-4">
        <div className="bg-black/90 backdrop-blur-sm rounded-2xl border border-green-500/50 p-3 shadow-[0_0_15px_rgba(0,255,0,0.4)]">
          <div className="flex items-center justify-between">
            
            {/* HackerOS Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 p-2 rounded-xl border border-green-500/50 shadow-[0_0_10px_rgba(0,255,0,0.6)]">
                <Brain className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-green-400 font-bold text-sm tracking-wide">WebOS</span>
            </div>

            {/* Quick Launch */}
            <div className="flex items-center space-x-2">
              {quickLaunchApps.map((app) => {
                const Icon = app.icon;
                const isOpen = windows.some(w => w.component === app.component);
                return (
                  <button
                    key={app.component}
                    onClick={() => onAppOpen(app.component, app.title)}
                    className={`p-2 rounded-lg transition-all border ${
                      isOpen 
                        ? 'bg-green-500/20 border-green-400 shadow-[0_0_10px_rgba(0,255,0,0.7)]' 
                        : 'bg-black/40 border-green-500/30 hover:bg-green-500/10'
                    }`}
                    title={app.title}
                  >
                    <Icon className="h-4 w-4 text-green-400" />
                  </button>
                );
              })}
            </div>

            {/* Open Windows */}
            <div className="flex items-center space-x-2">
              {windows.filter(w => !w.isMinimized).map((window) => {
                const Icon = getAppIcon(window.component);
                return (
                  <button
                    key={window.id}
                    onClick={() => onWindowClick(window.id)}
                    className="flex items-center space-x-2 bg-black/40 hover:bg-green-500/10 px-3 py-2 rounded-lg transition-all border border-green-500/30 shadow-[0_0_6px_rgba(0,255,0,0.4)]"
                    title={window.title}
                  >
                    <Icon className="h-4 w-4 text-green-400" />
                    <span className="text-green-300 text-sm max-w-20 truncate">
                      {window.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 bg-black/40 hover:bg-green-500/10 rounded-lg transition-all border border-green-500/30"
              >
                <User className="h-4 w-4 text-green-400" />
              </button>

              {showUserMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg border border-green-500/50 p-2 min-w-40 shadow-[0_0_12px_rgba(0,255,0,0.4)]">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-green-300 hover:bg-green-500/10 rounded-lg transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
