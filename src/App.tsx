import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Game from "./pages/Game";
import NotFound from "./pages/NotFound";
import { ExitIntentPopup } from './components/ExitIntentPopup';
import { Navbar } from './components/NavBar';

const queryClient = new QueryClient();

const ConditionalNavbar = () => {
  const location = useLocation();
  if (location.pathname === '/game') {
    return null;
  }
  return <Navbar />;
};

const App = () => {
  const [showExitIntentPopup, setShowExitIntentPopup] = useState(false);
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);

  useEffect(() => {
    const handleMouseOut = (e: MouseEvent) => {
      // Trigger only when the cursor moves upwards out of the viewport.
      if (e.clientY <= 0 && !exitIntentTriggered) {
        setShowExitIntentPopup(true);
        setExitIntentTriggered(true);
        console.log('🚪 Upward exit intent detected!');
      }
    };

    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [exitIntentTriggered]);

  const handleFormSubmit = async ({ name, email }: { name: string; email: string }) => {
    console.log('📝 Form submitted:', { name, email });

    try {
      const response = await fetch('/.netlify/functions/submit-to-airtable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        // Get more detailed error from the serverless function's response
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to subscribe. Check server logs.');
      }

      toast.success(`Thanks for subscribing, ${name}!`);
    } catch (error) {
      console.error('Submission Error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    }

    setShowExitIntentPopup(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="App bg-background text-foreground min-h-screen">
            <ConditionalNavbar />
            <main>
              {showExitIntentPopup && <ExitIntentPopup onClose={() => setShowExitIntentPopup(false)} onSubmit={handleFormSubmit} />}
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/game" element={<Game />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
