import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Copy, Play, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ThemeToggle } from '@/components/ThemeToggle';

function App() {
  const [customCode, setCustomCode] = useState(`it complete login test
  go to https://example.com/login
  type admin into username_input
  type password123 into password_input
  click login_button
  wait for dashboard_page
  assert text "Welcome" is visible`);
  
  const [cypressCode, setCypressCode] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const convertToCypress = async () => {
    setIsConverting(true);
    setConversionStatus('idle');
    
    // Simulate conversion process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Mock conversion logic
      const converted = `describe('Login Test', () => {
  it('complete login test', () => {
    cy.visit('https://example.com/login');
    cy.get('[data-testid="username_input"]').type('admin');
    cy.get('[data-testid="password_input"]').type('password123');
    cy.get('[data-testid="login_button"]').click();
    cy.get('[data-testid="dashboard_page"]').should('be.visible');
    cy.contains('Welcome').should('be.visible');
  });
});`;
      
      setCypressCode(converted);
      setConversionStatus('success');
      toast({
        title: "Conversion Successful",
        description: "Your test has been converted.",
        variant: "success",
      });
    } catch (error) {
      setConversionStatus('error');
      toast({
        title: "Conversion Failed", 
        description: "There was an error converting your test.",
        variant: "destructive",
      });
    }
    
    setIsConverting(false);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(cypressCode);
    toast({
      title: "Copied to Clipboard",
      description: "Code has been copied to your clipboard.",
      variant: "default",
    });
  };

  const resetOutput = () => {
    setCypressCode('');
    setConversionStatus('idle');
    toast({
      title: "Output Reset",
      description: "The output has been cleared.",
      variant: "default",
    });
  };

  return (
    <>
      {/* Toaster - positioned outside main layout for proper rendering in Electron */}
      <Toaster />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-0 flex items-center justify-center">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23FF6633%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
        
        <div className="flex w-[95vw] h-[90vh] gap-x-4">
          {/* Input Section */}
          <Card className="w-1/2 h-full p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-2xl rounded-none">
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Input</h2>
              </div>
              <Textarea
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Input your test here."
                className="flex-1 min-h-0 bg-gray-200/90 dark:bg-gray-950/60 backdrop-blur-sm border-white/40 dark:border-gray-600/40 resize-none font-mono text-sm leading-relaxed placeholder:text-gray-400 focus:bg-gray-200/90 dark:focus:bg-gray-950/70 rounded-none"
              />
              <Button 
                onClick={convertToCypress}
                disabled={isConverting || !customCode.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm border-0 py-6 text-lg font-medium rounded-none"
              >
                {isConverting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Converting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Convert
                  </div>
                )}
              </Button>
            </div>
          </Card>

          {/* Output Section */}
          <Card className="w-1/2 h-full p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-2xl rounded-none">
            <div className="flex flex-col h-full space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  conversionStatus === 'success' ? 'bg-green-500' :
                  conversionStatus === 'error' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}></div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Output</h2>
              </div>
              <div className="flex-1 min-h-0 relative">
                <Textarea
                  value={cypressCode}
                  readOnly
                  placeholder="Converted code will appear here."
                  className="w-full h-full bg-gray-200/90 dark:bg-gray-950/60 backdrop-blur-sm border-white/40 dark:border-gray-600/40 resize-none font-mono text-sm leading-relaxed placeholder:text-gray-400 pr-12 rounded-none"
                />
                {cypressCode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/40 dark:border-gray-600/40 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-none"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button
                onClick={resetOutput}
                disabled={!cypressCode.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm border-0 py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default App;