import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
              🧩 ADHD Wordle
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
