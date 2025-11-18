/**
 * Header Component
 */
import { Moon, Sun, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-surface-dark shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-accent" />
            <div>
              <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                Verifiable Deepfake Notary
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Decentralized Community Notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-background dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
