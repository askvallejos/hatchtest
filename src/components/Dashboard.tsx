import { Card } from '@/components/ui/card';
import { FlaskConical, Bot, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const quickActions = [
    {
      title: "Variables",
      description: "Manage your test variables.",
      icon: <Database className="h-5 w-5" />,
      href: "/variables",
      color: "bg-emerald-500 hover:bg-emerald-600"
    },
    {
      title: "Cypress Converter",
      description: "Convert your test scripts to Cypress format.",
      icon: <FlaskConical className="h-5 w-5" />,
      href: "/cypress-converter",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Cypress Converter AI",
      description: "Convert English descriptions to Cypress tests using AI.",
      icon: <Bot className="h-5 w-5" />,
      href: "/cypress-converter-ai",
      color: "bg-blue-500 hover:bg-blue-600"
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold u-heading">
          Dashboard
        </h1>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold u-heading">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href} className="block">
              <Card className="hover:border-primary h-[82px] p-4 u-panel backdrop-blur-xl u-border-faint shadow-lg transition-all duration-200 cursor-pointer">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`p-2 rounded-xs ${action.color} text-white shrink-0`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold u-heading">
                      {action.title}
                    </h3>
                    <p className="u-text-muted text-sm truncate">
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