import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TooltipToggle } from '@/components/TooltipToggle';
import { Settings, Palette, HelpCircle, SquareMousePointer } from 'lucide-react';

const Preferences = () => {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold u-heading">
          Preferences
        </h1>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5 u-text-muted" />
          <h2 className="text-xl font-semibold u-heading">
            Appearance
          </h2>
        </div>
        
        <Card className="p-6 u-panel backdrop-blur-xl u-border-faint">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium u-heading mb-2">
                Theme
              </h3>
              <p className="text-sm u-text-muted mb-4">
                Choose between light and dark mode for the application interface.
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 u-note rounded-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-xs">
                  <Settings className="h-4 w-4 u-text-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium u-heading">
                    Theme Toggle
                  </p>
                  <p className="text-xs u-text-extra-muted">
                    Switch between light and dark mode
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <SquareMousePointer className="h-5 w-5 u-text-muted" />
          <h2 className="text-xl font-semibold u-heading">
            Interface
          </h2>
        </div>
        
        <Card className="p-6 u-panel backdrop-blur-xl u-border-faint">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium u-heading mb-2">
                Tooltips
              </h3>
              <p className="text-sm u-text-muted mb-4">
                Enable or disable tooltip hints throughout the application interface.
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 u-note rounded-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-xs">
                  <HelpCircle className="h-4 w-4 u-text-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium u-heading">
                    Show Tooltips
                  </p>
                  <p className="text-xs u-text-extra-muted">
                    Display helpful hints and information
                  </p>
                </div>
              </div>
              <TooltipToggle />
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Settings Sections
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            General Settings
          </h2>
        </div>
        
        <Card className="p-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border-gray-300/50 dark:border-gray-700/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-xs">
                  <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Auto-save
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically save your work
                  </p>
                </div>
              </div>
              <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-xs">
                  <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Notifications
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive notifications for updates
                  </p>
                </div>
              </div>
              <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform"></div>
              </div>
            </div>
          </div>
        </Card>
      </div> */}

    </div>
  );
};

export default Preferences; 