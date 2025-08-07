import { Card } from '@/components/ui/card';
import { BarChart3, Zap, Code, Users, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = [
    {
      title: "Total Conversions",
      value: "1,234",
      change: "+12%",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "bg-blue-500"
    },
    {
      title: "Success Rate",
      value: "98.5%",
      change: "+2.1%",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-green-500"
    },
    {
      title: "Active Users",
      value: "456",
      change: "+8%",
      icon: <Users className="h-5 w-5" />,
      color: "bg-purple-500"
    },
    {
      title: "System Status",
      value: "Online",
      change: "100%",
      icon: <Activity className="h-5 w-5" />,
      color: "bg-green-500"
    }
  ];

  const quickActions = [
    {
      title: "Test Converter",
      description: "Convert your test scripts to Cypress format",
      icon: <Code className="h-6 w-6" />,
      href: "/converter",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Quick Start",
      description: "Get started with your first conversion",
      icon: <Zap className="h-6 w-6" />,
      href: "/converter",
      color: "bg-blue-500 hover:bg-blue-600"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to Hatchit Solutions
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your comprehensive test conversion platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-white/30 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href} className="block">
              <Card className="p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-white/30 dark:border-gray-700/30 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
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

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <Card className="p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-white/30 dark:border-gray-700/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
      </div>
    </div>
  );
};

export default Dashboard; 