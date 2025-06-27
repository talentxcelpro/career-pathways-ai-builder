
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { navItems, NavItem } from "./nav-items";
import { Navbar } from "./components/navigation/Navbar";
import { Footer } from "./components/layout/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {navItems.map((item: NavItem) => (
                <Route 
                  key={item.to} 
                  path={item.to} 
                  element={item.page} 
                  {...(item.exact && { index: item.to === "/" })}
                />
              ))}
            </Routes>
          </main>
          <Footer />
        </div>
        <Analytics />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
