import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-amber-100 dark:from-slate-950 dark:via-orange-950/30 dark:to-rose-950/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-rose-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-amber-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      <div className="text-center space-y-8 p-8 max-w-4xl relative z-10">
        <div className="mx-auto w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-white/80 dark:bg-slate-900/70 backdrop-blur border border-orange-200/70 dark:border-orange-900/60 shadow-2xl flex items-center justify-center">
          <img src="/apnadukaan-logo.svg" alt="ApnaDukaan Logo" className="w-16 h-16 md:w-20 md:h-20" />
        </div>
        <h1 className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
          ApnaDukaan
        </h1>
        <p className="text-3xl font-medium text-muted-foreground">
          Advanced Inventory Management System
        </p>
        <Button 
          onClick={() => navigate("/auth")} 
          size="lg" 
          className="mt-8 text-lg px-8 py-6 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          Get Started <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Index;
