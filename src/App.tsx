import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as HotToaster, toast } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
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

// Define a type for the dataLayer
interface DataLayer {
  push(event: { event: string; page_path: string }): void;
}

// Extend the Window interface
declare global {
  interface Window {
    dataLayer: DataLayer;
  }
}

// Tracks page changes for GTM
const RouteChangeTracker = () => {
  const location = useLocation();
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'pageview',
      page_path: location.pathname + location.search,
    });
  }, [location]);
  return null;
};

const App = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const toastPosition = isDesktop ? 'bottom-right' : 'bottom-center';
  const toastMarginBottom = isDesktop ? '1rem' : '0px';
  const toastContainerClass = isDesktop ? '' : 'mobile-toast-container';

  const [showExitIntentPopup, setShowExitIntentPopup] = useState(false);
  const [showMobileWaitlistDrawer, setShowMobileWaitlistDrawer] = useState(false);
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);
  const [isDistractionFreeMode, setIsDistractionFreeMode] = useState(false);

  useEffect(() => {
    // This effect ensures that when the popup is shown, distraction-free mode is activated.
    if (showExitIntentPopup) {
      setIsDistractionFreeMode(true);
    } else {
      setIsDistractionFreeMode(false);
    }
  }, [showExitIntentPopup]);

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
              <HotToaster
                position={toastPosition}
                gutter={8}
                containerClassName={toastContainerClass}
                containerStyle={{
                  // Ensure the container is on top
                  zIndex: 9999,
                }}
                toastOptions={{
                  // Define default options
                  duration: 5000,
                  style: {
                    background: 'hsl(var(--secondary))',
                    color: 'hsl(var(--secondary-foreground))',
                    marginBottom: toastMarginBottom,
                    borderRadius: 'var(--radius)',
                    border: '1px solid hsl(var(--border))',
                    // Make toast wider to ensure content fits
                    minWidth: '350px',
                    // Ensure toast itself is on top
                    zIndex: 9999,
                  },

                  // Default options for specific types
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: 'hsl(142.1 76.2% 36.3%)',
                      secondary: 'hsl(var(--primary-foreground))',
                    },
                  },
                }}
              />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route
                  path="/game"
                  element={
                    <Game
                      isDistractionFreeMode={isDistractionFreeMode}
                      onJoinWaitlist={() => setShowExitIntentPopup(true)}
                    />
                  }
                />
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
