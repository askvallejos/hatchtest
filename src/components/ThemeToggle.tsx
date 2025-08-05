import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="default"
      onClick={toggleTheme}
      className="w-full justify-start bg-transparent hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 border-0 h-10 px-3"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 !min-w-[1rem] !min-h-[1rem]" />
      ) : (
        <Sun className="h-4 w-4 !min-w-[1rem] !min-h-[1rem]" />
      )}
      <span className="text-sm ml-2">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
    </Button>
  );
} 