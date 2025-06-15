import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="w-full border-t border-border/50 bg-background/80 backdrop-blur-sm text-center py-4 mt-10 text-sm text-foreground/70">
    <div className="max-w-7xl mx-auto px-4">
      <span className="mr-3">© {new Date().getFullYear()} ADHD Wordle</span>
      <Link to="/privacy" className="hover:underline mr-3">
        Privacy
      </Link>
      <Link to="/terms" className="hover:underline">
        Terms
      </Link>
    </div>
  </footer>
);
