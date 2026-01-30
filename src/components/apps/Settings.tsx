import { useState } from 'react';
import { Monitor, Palette, User, Shield, Wifi, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [settings, setSettings] = useState({
    theme: 'dark',
    wallpaper: 'gradient',
    fontSize: 14,
    notifications: true,
    autoSave: true,
    aiAssistance: true,
  });

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'system', label: 'System', icon: Monitor },
    { id: 'account', label: 'Account', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-400 font-mono">Theme</h3>
              <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                <SelectTrigger className="bg-black/40 border-green-400/30 text-green-300 font-mono backdrop-blur-md hover:border-green-400/50 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-green-400/30 backdrop-blur-md">
                  <SelectItem value="dark" className="text-green-300 font-mono focus:bg-green-500/20">Dark</SelectItem>
                  <SelectItem value="light" className="text-green-300 font-mono focus:bg-green-500/20">Light</SelectItem>
                  <SelectItem value="auto" className="text-green-300 font-mono focus:bg-green-500/20">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-400 font-mono">Wallpaper</h3>
              <div className="grid grid-cols-3 gap-3">
                {['gradient', 'space', 'abstract'].map((wallpaper) => (
                  <button
                    key={wallpaper}
                    onClick={() => updateSetting('wallpaper', wallpaper)}
                    className={`aspect-video rounded-lg border-2 transition-all backdrop-blur-sm ${
                      settings.wallpaper === wallpaper 
                        ? 'border-green-500 ring-2 ring-green-500/30 shadow-green-500/50 shadow-lg' 
                        : 'border-green-400/30 hover:border-green-400/60 hover:shadow-green-500/30 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-full h-full rounded-md ${
                      wallpaper === 'gradient' 
                        ? 'bg-gradient-to-br from-green-500/60 to-emerald-600/60'
                        : wallpaper === 'space'
                        ? 'bg-gradient-to-br from-green-900/60 to-black/60'
                        : 'bg-gradient-to-br from-green-500/40 to-cyan-500/40'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-400 font-mono">Font Size</h3>
              <div className="space-y-3">
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={(value) => updateSetting('fontSize', value[0])}
                  min={12}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-green-300/70 font-mono">Current size: {settings.fontSize}px</p>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-green-400/20 backdrop-blur-sm">
              <div>
                <h3 className="font-semibold text-green-300 font-mono">Auto-save files</h3>
                <p className="text-sm text-green-300/60 font-mono">Automatically save changes to files</p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-green-400/20 backdrop-blur-sm">
              <div>
                <h3 className="font-semibold text-green-300 font-mono">AI Assistance</h3>
                <p className="text-sm text-green-300/60 font-mono">Enable AI features throughout the system</p>
              </div>
              <Switch
                checked={settings.aiAssistance}
                onCheckedChange={(checked) => updateSetting('aiAssistance', checked)}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-400 font-mono">System Information</h3>
              <div className="bg-black/40 backdrop-blur-md rounded-lg p-4 space-y-2 border border-green-400/20">
                <div className="flex justify-between">
                  <span className="text-green-300/70 font-mono">Version:</span>
                  <span className="text-green-300 font-mono">WebOS v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300/70 font-mono">Browser:</span>
                  <span className="text-green-300 font-mono">{navigator.userAgent.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-300/70 font-mono">Memory:</span>
                  <span className="text-green-300 font-mono">Available</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-green-400/20 backdrop-blur-sm">
              <div>
                <h3 className="font-semibold text-green-300 font-mono">Enable Notifications</h3>
                <p className="text-sm text-green-300/60 font-mono">Receive system and app notifications</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSetting('notifications', checked)}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400 font-mono">Notification Types</h3>
              {[
                'File operations',
                'AI responses',
                'System updates',
                'App notifications'
              ].map((type) => (
                <div key={type} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-green-400/20 backdrop-blur-sm">
                  <span className="text-green-300 font-mono">{type}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-green-300/60 py-12">
            <p className="font-mono">Settings for {activeTab} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-[#020202] via-[#050d0a] to-[#020202] text-green-300 font-mono relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,0,0.03),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0,255,0,0.03),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Sidebar */}
      <div className="w-64 border-r border-green-400/20 p-4 backdrop-blur-sm bg-black/20 relative z-10">
        <h2 className="text-xl font-semibold mb-6 text-green-400 font-mono tracking-wider">SETTINGS</h2>
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all font-mono ${
                  activeTab === tab.id
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30 shadow-green-500/30 shadow-lg'
                    : 'text-green-300/70 hover:bg-green-500/10 hover:text-green-300 border border-transparent hover:border-green-400/20'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="tracking-wide">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold mb-8 capitalize text-green-400 font-mono tracking-wider">
            {activeTab.toUpperCase()}
          </h1>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};