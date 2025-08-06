import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  collapsed?: boolean;
}

export function ThemeToggle({ collapsed = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="default"
      onClick={toggleTheme}
      className={`w-full justify-start bg-transparent hover:bg-gray-200/80 dark:hover:bg-gray-700/80 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 border-0 h-10 px-3 rounded-md ${
        collapsed ? 'justify-center' : ''
      }`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 !min-w-[1rem] !min-h-[1rem]" />
      ) : (
        <Sun className="h-4 w-4 !min-w-[1rem] !min-h-[1rem]" />
      )}
      {!collapsed && <span className="text-sm ml-3">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
    </Button>
  );
} 