import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useEffect } from "react";
import { useAppDispatch } from "./store/hooks";
import { setSession } from "./store/slices/authSlice";
import { isSupabaseConfigured, supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import POS from "./pages/POS";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import UserManagement from "./pages/UserManagement";
import AuditLogs from "./pages/AuditLogs";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/Layout/AppLayout";

const queryClient = new QueryClient();

function MissingConfigScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-50 p-6">
      <div className="max-w-2xl w-full rounded-xl border bg-white p-8 shadow-xl space-y-4">
        <h1 className="text-3xl font-bold">ApnaDukaan Setup Required</h1>
        <p className="text-muted-foreground">
          App loaded, but Supabase environment variables are missing. Create a <code>.env</code> file in project root.
        </p>
        <pre className="rounded-md bg-slate-950 text-slate-100 p-4 overflow-x-auto text-sm">
{`VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_APP_URL=http://127.0.0.1:5173`}
        </pre>
        <p className="text-sm text-muted-foreground">After saving .env, restart the dev server.</p>
      </div>
    </div>
  );
}

function AuthHandler({ children }: Readonly<{ children: React.ReactNode }>) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        dispatch(setSession(session));
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}

const App = () => {
  if (!isSupabaseConfigured) {
    return <MissingConfigScreen />;
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthHandler>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Products />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Inventory />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Categories />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pos"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <POS />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sales"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Sales />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Reports />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/suppliers"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Suppliers />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Customers />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <UserManagement />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audit-logs"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AuditLogs />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Profile />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthHandler>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
