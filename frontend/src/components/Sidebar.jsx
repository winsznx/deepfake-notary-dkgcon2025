/**
 * Sidebar Component
 */
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, FileCheck, Coins, Star } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: FileCheck },
  { path: '/upload', label: 'Upload Media', icon: Upload },
  { path: '/staking', label: 'Staking', icon: Coins },
  { path: '/high-confidence', label: 'Premium Notes', icon: Star }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-surface-dark shadow-lg hidden md:block">
      <nav className="p-4 space-y-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? 'bg-royal-blue text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-pale-blue dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
