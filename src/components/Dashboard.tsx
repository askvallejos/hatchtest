import { Card } from '@/components/ui/card';
import { Code } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const quickActions = [
    {
      title: "Test Converter",
      description: "Convert your test scripts to Cypress format",
      icon: <Code className="h-6 w-6" />,
      href: "/converter",
      color: "bg-orange-500 hover:bg-orange-600"
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hatchit DevTools
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href} className="block">
              <Card className="p-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border-gray-300/50 dark:border-gray-700/30 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xs ${action.color} text-white`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <Card className="p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-white/30 dark:border-gray-700/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xs">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Test conversion completed successfully
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                2 minutes ago
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xs">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  New user registered
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                5 minutes ago
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xs">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  System update completed
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                10 minutes ago
              </span>
            </div>
          </div>
        </Card>
      </div> */}
    </div>
  );
};

export default Dashboard; 