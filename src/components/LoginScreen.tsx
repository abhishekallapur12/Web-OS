import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Brain, Code, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const { signIn, signUp } = useAuth();

  // Cursor tracking and time update
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link",
        });
      }
    } catch (error) {
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black font-mono flex items-center justify-center p-4">
      {/* Main dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020202] via-[#050d0a] to-[#020202]"></div>

      {/* Cyberpunk radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,0,0.07),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(0,255,0,0.07),transparent_50%)] animate-pulse"></div>

      {/* Faint green grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:100%_2px] pointer-events-none"></div>

      {/* Matrix binary rain */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {[0.05, 0.1].map((opacity, layer) => (
          <div key={layer} style={{ opacity }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={`${layer}-${i}`}
                className="absolute text-green-400 text-xs animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${5 + Math.random() * 5 + layer * 2}s`,
                }}
              >
                {Array.from({ length: 10 }).map(() => (Math.random() > 0.5 ? "1" : "0")).join("")}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Cursor glow */}
      <div
        className="pointer-events-none fixed w-40 h-40 rounded-full bg-green-400/10 blur-3xl z-0"
        style={{ top: cursor.y - 80, left: cursor.x - 80 }}
      />

      {/* Animated terminal status bar */}
      <div className="absolute top-0 left-0 w-full bg-black/60 border-b border-green-500/20 text-green-400 text-xs px-4 py-1 whitespace-nowrap overflow-hidden z-10">
        <div className="animate-pulse inline-block">
          [SYS] WebOS Authentication System | [TIME] {currentTime.toUTCString()} | [SEC] Secure connection established
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* NeuraOS Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full border border-green-400/30 shadow-green-500/50 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">WebOS</h1>
          <p className="text-green-300/80">Your Intelligent Web Operating System</p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-3 rounded-lg bg-black/40 backdrop-blur-sm border border-green-400/20 shadow-green-500/20 shadow-lg">
            <Monitor className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-xs text-green-300">Desktop OS</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-black/40 backdrop-blur-sm border border-blue-400/20 shadow-blue-500/20 shadow-lg">
            <Code className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-green-300">Code Editor</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-black/40 backdrop-blur-sm border border-green-400/20 shadow-green-500/20 shadow-lg">
            <Sparkles className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-xs text-green-300">AI Assistant</p>
          </div>
        </div>

        <Card className="backdrop-blur-md bg-black/40 border-green-400/30 shadow-green-500/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-green-300 font-mono">Welcome to WebOS</CardTitle>
            <CardDescription className="text-green-400/80 font-mono">
              Sign in to access your personalized desktop environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-green-400/20">
                <TabsTrigger 
                  value="login" 
                  className="text-green-300 font-mono data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-400/50"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="text-green-300 font-mono data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border-blue-400/50"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-green-400/30 text-green-300 placeholder:text-green-500/50 font-mono focus:border-green-400/60 focus:ring-green-400/20"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-green-400/30 text-green-300 placeholder:text-green-500/50 font-mono focus:border-green-400/60 focus:ring-green-400/20"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  required
                />
                <Button 
                  onClick={handleLogin} 
                  disabled={loading || !email || !password}
                  className="w-full bg-gradient-to-r from-green-500/80 to-blue-500/80 hover:from-green-600/90 hover:to-blue-600/90 border border-green-400/30 shadow-green-500/30 shadow-lg font-mono text-white"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </TabsContent>
              <TabsContent value="signup" className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-green-400/30 text-green-300 placeholder:text-green-500/50 font-mono focus:border-green-400/60 focus:ring-green-400/20"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-green-400/30 text-green-300 placeholder:text-green-500/50 font-mono focus:border-green-400/60 focus:ring-green-400/20"
                  onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                  required
                />
                <Button 
                  onClick={handleSignUp} 
                  disabled={loading || !email || !password}
                  className="w-full bg-gradient-to-r from-blue-500/80 to-green-500/80 hover:from-blue-600/90 hover:to-green-600/90 border border-blue-400/30 shadow-blue-500/30 shadow-lg font-mono text-white"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-green-400/80 text-sm mt-6 font-mono">
          Experience the future of computing in your browser
        </p>
      </div>
    </div>
  );
};