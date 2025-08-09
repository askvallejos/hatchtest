import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/components/Dashboard';
import TestConverter from '@/components/TestConverter';
import CypressConverterAi from '@/components/cypressConverterAi';
import Preferences from '@/components/Preferences';
import Variables from '@/components/Variables';
import {
  Sidebar,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarToggle,
  SidebarNav,
  SidebarNavItem,
  SidebarNavLink,
  SidebarScrollArea,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTooltip } from '@/contexts/TooltipContext';
import { useState } from 'react';
import { Home, Settings, FlaskConical, Bot, Database } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { tooltipEnabled } = useTooltip();

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <Home className="h-4 w-4" />
    },
    {
      path: '/variables',
      label: 'Variables',
      icon: <Database className="h-4 w-4" />
    },
    {
      path: '/cypress-converter',
      label: 'Cypress Converter',
      icon: <FlaskConical className="h-4 w-4" />
    },
    {
      path: '/cypress-converter-ai',
      label: 'Cypress Converter AI',
      icon: <Bot className="h-4 w-4" />
    },
  ];

  return (
    <TooltipProvider>
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onCollapsedChange={setSidebarCollapsed}
        className="h-screen border-r u-border-soft bg-gray-100/90 dark:bg-gray-800 backdrop-blur-xl"
      >
        <SidebarHeader collapsed={sidebarCollapsed}>
          <SidebarHeaderTitle>
            {!sidebarCollapsed && (
              <img 
                src="/logo/logo.png" 
                alt="Hatchit Solutions Logo" 
                className="h-8 w-auto object-contain"
              />
            )}
          </SidebarHeaderTitle>
          <SidebarToggle 
            collapsed={sidebarCollapsed} 
            onCollapsedChange={setSidebarCollapsed} 
          />
        </SidebarHeader>
        
        <SidebarScrollArea>
          <SidebarNav>
            {navItems.map((item) => (
              <SidebarNavItem key={item.path}>
                <Link to={item.path} className="w-full">
                  {sidebarCollapsed && tooltipEnabled ? (
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <SidebarNavLink 
                          icon={item.icon} 
                          collapsed={sidebarCollapsed}
                          active={location.pathname === item.path}
                        >
                          {item.label}
                        </SidebarNavLink>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2 font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <SidebarNavLink 
                      icon={item.icon} 
                      collapsed={sidebarCollapsed}
                      active={location.pathname === item.path}
                    >
                      {item.label}
                    </SidebarNavLink>
                  )}
                </Link>
              </SidebarNavItem>
            ))}
          </SidebarNav>
        </SidebarScrollArea>
        
        <SidebarFooter>
          <SidebarNav>
            <SidebarNavItem>
              <Link to="/preferences" className="w-full">
                {sidebarCollapsed && tooltipEnabled ? (
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <SidebarNavLink 
                        icon={<Settings className="h-4 w-4" />} 
                        collapsed={sidebarCollapsed}
                        active={location.pathname === '/preferences'}
                      >
                        Preferences
                      </SidebarNavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2 font-medium">
                      Preferences
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <SidebarNavLink 
                    icon={<Settings className="h-4 w-4" />} 
                    collapsed={sidebarCollapsed}
                    active={location.pathname === '/preferences'}
                  >
                    Preferences
                  </SidebarNavLink>
                )}
              </Link>
            </SidebarNavItem>
          </SidebarNav>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
};

const MainContent = () => {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23FF6633%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cypress-converter" element={<TestConverter />} />
          <Route path="/cypress-converter-ai" element={<CypressConverterAi />} />
          <Route path="/variables" element={<Variables />} />
          <Route path="/preferences" element={<Preferences />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <>
      <Toaster />
      <Router>
        <div className="min-h-screen flex">
          <Navigation />
          <MainContent />
        </div>
      </Router>
    </>
  );
}

export default App;