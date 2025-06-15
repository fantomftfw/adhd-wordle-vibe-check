import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner, toast } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import Landing from './pages/Landing';
import Game from './pages/Game';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { ExitIntentPopup } from './components/ExitIntentPopup';
import { Navbar } from './components/Navbar';
import { WaitlistBar } from './components/WaitlistBar';
import { WaitlistDrawer } from './components/WaitlistDrawer';
import { Footer } from './components/Footer';

const queryClient = new QueryClient();

const ConditionalNavbar = () => {
  const location = useLocation();
  if (location.pathname === '/game') {
    return null;
  }
  return <Navbar />;
};

const ConditionalWaitlistBar = ({ onJoinClick }: { onJoinClick: () => void }) => {
  const location = useLocation();
  if (location.pathname !== '/game') {
    return null;
  }
  return <WaitlistBar onJoinClick={onJoinClick} />;
};

const ConditionalFooter = () => {
  const location = useLocation();
  if (location.pathname === '/game') {
    return null;
  }
  return <Footer />;
};

// Tracks page changes for GTM
const RouteChangeTracker = () => {
  const location = useLocation();
  useEffect(() => {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: 'pageview',
      page_path: location.pathname + location.search,
    });
  }, [location]);
  return null;
};

const App = () => {
  
  const [showExitIntentPopup, setShowExitIntentPopup] = useState(false);
  const [showMobileWaitlistDrawer, setShowMobileWaitlistDrawer] = useState(false);
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);

  useEffect(() => {
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitIntentTriggered) {
        setShowExitIntentPopup(true);
        setExitIntentTriggered(true);
      }
    };

    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [exitIntentTriggered]);

  const handleFormSubmit = async ({ email }: { email: string }) => {
    console.log('📝 Form submitted:', { email });

    try {
      const response = await fetch('/.netlify/functions/submit-to-airtable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to subscribe. Check server logs.');
      }

      toast.success(`Thanks for subscribing! You're on the list.`);
    } catch (error) {
      console.error('Submission Error:', error);
      const err = error as Error;
      toast.error(err.message || 'Something went wrong. Please try again.');
    }

    setShowExitIntentPopup(false);
    setShowMobileWaitlistDrawer(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="App bg-background text-foreground min-h-screen">
            <ConditionalNavbar />
            <Seo />
            <RouteChangeTracker />
            <main className="pb-24 md:pb-0">
              {/* Desktop Exit Intent Popup */}
              {showExitIntentPopup && (
                <ExitIntentPopup
                  onClose={() => setShowExitIntentPopup(false)}
                  onSubmit={handleFormSubmit}
                />
              )}

              {/* Mobile Waitlist Drawer */}
              <WaitlistDrawer
                isOpen={showMobileWaitlistDrawer}
                onClose={() => setShowMobileWaitlistDrawer(false)}
                onSubmit={handleFormSubmit}
              />

              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/game" element={<Game />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </main>
            <ConditionalFooter />
            <ConditionalWaitlistBar onJoinClick={() => setShowExitIntentPopup(true)} />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
