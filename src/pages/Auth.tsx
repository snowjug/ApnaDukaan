import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${import.meta.env.VITE_APP_URL || window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account created! Please check your email to verify.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-50 dark:from-gray-950 dark:via-emerald-950/30 dark:to-gray-950 p-4 relative overflow-hidden">
      {/* Animated Background Elements - Floating Squares */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 border-4 border-emerald-400/40 rounded-lg animate-float" />
        <div className="absolute top-40 right-32 w-24 h-24 border-4 border-teal-400/40 rounded-lg animate-float animation-delay-1000" />
        <div className="absolute bottom-32 left-40 w-28 h-28 border-4 border-cyan-400/40 rounded-lg animate-float animation-delay-2000" />
        <div className="absolute bottom-40 right-20 w-36 h-36 border-4 border-emerald-300/40 rounded-lg animate-float animation-delay-3000" />
        <div className="absolute top-1/2 left-10 w-20 h-20 border-4 border-teal-300/40 rounded-lg animate-float animation-delay-1500" />
        <div className="absolute top-1/3 right-10 w-24 h-24 border-4 border-cyan-300/40 rounded-lg animate-float animation-delay-2500" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-2">
        <CardHeader className="text-center space-y-3 pb-6">
          <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            ApnaDukaan
          </CardTitle>
          <CardDescription className="text-base">Inventory Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 mb-6">
              <TabsTrigger value="login" className="text-base font-semibold">Login</TabsTrigger>
              <TabsTrigger value="signup" className="text-base font-semibold">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-semibold">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-semibold">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 text-base"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>

                <div className="mt-5 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">Default Credentials:</p>
                  <div className="space-y-1">
                    <p className="text-sm font-mono font-semibold">Email: admin@gmail.com</p>
                    <p className="text-sm font-mono font-semibold">Password: admin123</p>
                  </div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-semibold">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-semibold">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 text-base"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-30px) rotate(5deg);
          }
          50% {
            transform: translateY(-15px) rotate(-3deg);
          }
          75% {
            transform: translateY(-25px) rotate(3deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-2500 {
          animation-delay: 2.5s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
}
