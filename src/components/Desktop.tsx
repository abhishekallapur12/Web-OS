import { useState, useEffect } from 'react';
import { Taskbar } from './Taskbar';
import { WindowManager } from './WindowManager';
import { DesktopIcon } from './DesktopIcon';
import { WalletConnection } from './WalletConnection';
import { useWallet } from '@/hooks/useWallet';
import { User } from '@supabase/supabase-js';
import { FileText, Code, Brain, Calendar, Settings, Terminal, Folder, Monitor } from 'lucide-react';

interface DesktopProps {
  user: User;
}

export interface AppWindow {
  id: string;
  title: string;
  component: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export const Desktop = ({ user }: DesktopProps) => {
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);
  const [showWalletConnection, setShowWalletConnection] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { walletAddress, isConnected } = useWallet();
  
  // Cursor glow
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  // NEW: Public IP state
  const [publicIP, setPublicIP] = useState<string>("Fetching...");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fetch real public IP once
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setPublicIP(data.ip))
      .catch(() => setPublicIP("Unavailable"));
  }, []);

  const openApp = (appType: string, title: string) => {
    const existingWindow = windows.find(w => w.component === appType);
    if (existingWindow) return focusWindow(existingWindow.id);
    const newWindow: AppWindow = {
      id: Date.now().toString(),
      title,
      component: appType,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + (windows.length * 30), y: 100 + (windows.length * 30) },
      size: { width: 800, height: 600 },
      zIndex: nextZIndex,
    };
    setWindows([...windows, newWindow]);
    setNextZIndex(nextZIndex + 1);
  };

  const closeWindow = (id: string) => setWindows(windows.filter(w => w.id !== id));
  const minimizeWindow = (id: string) => setWindows(windows.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  const maximizeWindow = (id: string) => setWindows(windows.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized, isMinimized: false } : w));
  const focusWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w));
    setNextZIndex(nextZIndex + 1);
  };
  const updateWindowPosition = (id: string, pos: { x: number; y: number }) => setWindows(windows.map(w => w.id === id ? { ...w, position: pos } : w));
  const updateWindowSize = (id: string, size: { width: number; height: number }) => setWindows(windows.map(w => w.id === id ? { ...w, size } : w));

  const desktopApps = [
    { id: 'file-manager', title: 'File Manager', icon: Folder, component: 'FileManager' },
    { id: 'notes', title: 'Notes', icon: FileText, component: 'NotesApp' },
    { id: 'code-editor', title: 'Code Editor', icon: Code, component: 'CodeEditor' },
    { id: 'ai-assistant', title: 'AI Assistant', icon: Brain, component: 'AIAssistant' },
    { id: 'calendar', title: 'Calendar', icon: Calendar, component: 'Calendar' },
    { id: 'terminal', title: 'Terminal', icon: Terminal, component: 'Terminal' },
    { id: 'settings', title: 'Settings', icon: Settings, component: 'Settings' },
    { id: 'browser', title: 'Browser', icon: Monitor, component: 'Browser' },
  ];

  return (
    <div className="h-screen relative overflow-hidden bg-black font-mono">
      {/* Main dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020202] via-[#050d0a] to-[#020202]"></div>

      {/* Cyberpunk radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0, 0, 0, 0.07),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0, 0, 0, 0.07),transparent_50%)] animate-pulse-slow"></div>

      {/* Faint green grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(251, 251, 251, 1)_1px,transparent_1px),linear-gradient(90deg,rgba(0, 0, 0, 1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0, 0, 0, 0.03)_1px,transparent_1px)] bg-[size:100%_2px] pointer-events-none"></div>

      {/* Matrix binary rain */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[0.05, 0.1].map((opacity, layer) => (
          <div key={layer} style={{ opacity }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={`${layer}-${i}`}
                className="absolute text-green-400 text-xs animate-matrix"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${5 + Math.random() * 5 + layer * 2}s`,
                }}
              >
                {Array.from({ length: 40 }).map(() => (Math.random() > 0.5 ? "1" : "0")).join("")}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Cursor glow */}
      <div
        className="pointer-events-none fixed w-40 h-40 rounded-full bg-green-400/10 blur-3xl"
        style={{ top: cursor.y - 80, left: cursor.x - 80 }}
      />

      {/* Desktop Icons */}
      <div className="absolute top-8 left-8 grid grid-cols-2 gap-6 z-10">
        {desktopApps.map((app, index) => (
          <DesktopIcon
            key={app.id}
            icon={app.icon}
            title={app.title}
            onClick={() => openApp(app.component, app.title)}
            delay={index * 100}
          />
        ))}
      </div>

      {/* Animated terminal status bar */}
      <div className="absolute top-0 left-0 w-full bg-black/60 border-b border-green-500/20 text-green-400 text-xs px-4 py-1 whitespace-nowrap overflow-hidden">
        <div className="animate-marquee inline-block">
          [SYS] Boot sequence OK | [NET] Connected to {publicIP} | [SEC] Firewall active | [LOG] {currentTime.toUTCString()}
        </div>
      </div>

      {/* System Info */}
      <div className="absolute top-8 right-8 z-10">
        <div className="bg-black/40 backdrop-blur-md rounded-lg p-4 border border-green-400/20 shadow-green-500/20 shadow-lg">
          <div className="text-green-300 text-sm font-mono mb-1">Welcome, {user.email}</div>
          <div className="text-green-500/80 text-xs font-mono mb-2">{currentTime.toLocaleString()}</div>
          {isConnected && (
            <div className="text-green-400 text-xs font-mono mb-2">
              Wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </div>
          )}
       
        </div>
      </div>

      {/* Window Manager */}
      <WindowManager
        windows={windows}
        onClose={closeWindow}
        onMinimize={minimizeWindow}
        onMaximize={maximizeWindow}
        onFocus={focusWindow}
        onUpdatePosition={updateWindowPosition}
        onUpdateSize={updateWindowSize}
      />

      {/* Taskbar */}
      <Taskbar windows={windows} onWindowClick={focusWindow} onAppOpen={openApp} />

      {/* Wallet Connection Modal */}
      {showWalletConnection && <WalletConnection onClose={() => setShowWalletConnection(false)} />}
    </div>
  );
};
