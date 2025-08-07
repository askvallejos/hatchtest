import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Copy, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { convertToCypress } from '@/lib/cypressConverter';

const TestConverter = () => {
  const [input, setInput] = useState('');
  const [cypressCode, setCypressCode] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showKeywordGuide, setShowKeywordGuide] = useState(false);
  const { toast } = useToast();

  const convertToCypressHandler = async () => {
    setIsConverting(true);
    setShowProcessing(true);
    setConversionStatus('idle');

    setTimeout(async () => {
      try {
        if (!input.trim()) {
          throw new Error('Input is empty. Please enter some test code to convert.');
        }

        const lines = input.split('\n');
        const syntaxErrors: string[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line && !line.startsWith('//') && !line.startsWith('#')) {
            if (line.includes('(') && !line.includes(')')) {
              syntaxErrors.push(`Line ${i + 1}: Unclosed parentheses`);
            }
            if (line.includes('"') && (line.match(/"/g) || []).length % 2 !== 0) {
              syntaxErrors.push(`Line ${i + 1}: Unclosed quotes`);
            }
            if (line.includes("'") && (line.match(/'/g) || []).length % 2 !== 0) {
              syntaxErrors.push(`Line ${i + 1}: Unclosed single quotes`);
            }
            if (line.startsWith('type ') && !line.includes(' into ')) {
              syntaxErrors.push(`Line ${i + 1}: "type" command requires "into" (e.g., "type hello into #input")`);
            }
            if (line.startsWith('click ') && line.trim().split(' ').length < 2) {
              syntaxErrors.push(`Line ${i + 1}: "click" command requires a selector`);
            }
            if (line.startsWith('go to ') && line.trim().split(' ').length < 3) {
              syntaxErrors.push(`Line ${i + 1}: "go to" command requires a URL`);
            }
          }
        }

        if (syntaxErrors.length > 0) {
          throw new Error(`Syntax errors found:\n${syntaxErrors.join('\n')}`);
        }

        const converted = convertToCypress(input);

        if (!converted.trim()) {
          throw new Error('Conversion failed. No valid commands found in the input.');
        }

        setCypressCode(converted);
        setConversionStatus('success');

        const hasWarnings = converted.includes('❌ Warning: The following commands were not recognized:');

        if (hasWarnings) {
          toast({
            title: "Conversion Completed with Warnings",
            description: "Some commands were not recognized.",
            variant: "warning",
          });
        } else {
          toast({
            title: "Conversion Successful",
            description: "Your test has been converted to Cypress format.",
            variant: "success",
          });
        }
      } catch (error) {
        setConversionStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during conversion.';

        toast({
          title: "Conversion Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }

      setTimeout(() => {
        setIsConverting(false);
        setShowProcessing(false);
      }, 500);
    }, 1000);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(cypressCode);
    toast({
      title: "Copied to Clipboard",
      description: "Code has been copied to your clipboard.",
      variant: "default",
    });
  };

  const clearOutput = () => {
    setCypressCode('');
    setConversionStatus('idle');
    toast({
      title: "Output Cleared",
      description: "The output has been cleared.",
      variant: "default",
    });
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6 flex-shrink-0 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Test Converter
        </h1>
        <HelpCircle className="w-6 h-6 cursor-pointer text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 hover:drop-shadow-lg" onClick={() => setShowKeywordGuide(true)} />
      </div>

      <div className="flex w-full flex-1 gap-x-4 min-h-0">
        <Card className="w-1/2 flex flex-col p-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-2xl rounded-xs">
          <div className="flex flex-col flex-1 space-y-4 min-h-0">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white tracking-wide">Input</h2>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input your test here."
              className="flex-1 min-h-0 bg-gray-200/90 dark:bg-gray-950/60 backdrop-blur-sm border-white/40 dark:border-gray-600/40 resize-none font-mono text-sm leading-relaxed placeholder:text-gray-400 focus:bg-gray-200/90 dark:focus:bg-gray-950/70 rounded-xs"
            />
            <Button
              onClick={convertToCypressHandler}
              disabled={isConverting || !input.trim()}
              className="w-full flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm border-0 py-6 text-lg font-medium rounded-xs"
            >
              {showProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Converting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Convert
                </div>
              )}
            </Button>
          </div>
        </Card>

        <Card className="w-1/2 flex flex-col p-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-2xl rounded-xs">
          <div className="flex flex-col flex-1 space-y-4 min-h-0">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${conversionStatus === 'success' ? 'bg-green-500' :
                  conversionStatus === 'error' ? 'bg-red-500' :
                    'bg-gray-500'
                }`}></div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white tracking-wide">Output</h2>
            </div>
            <div className="flex-1 min-h-0 relative">
              <Textarea
                value={cypressCode}
                readOnly
                placeholder="Converted code will appear here."
                className="w-full h-full bg-gray-200/90 dark:bg-gray-950/60 backdrop-blur-sm border-white/40 dark:border-gray-600/40 resize-none font-mono text-sm leading-relaxed placeholder:text-gray-400 pr-12 rounded-xs"
              />
              {cypressCode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/40 dark:border-gray-600/40 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xs"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={clearOutput}
              disabled={!cypressCode.trim()}
              className="w-full flex-shrink-0 bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm border-0 py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed rounded-xs"
            >
              Clear
            </Button>
          </div>
        </Card>
      </div>

      <Dialog
        isOpen={showKeywordGuide}
        onClose={() => setShowKeywordGuide(false)}
        title="Keyword Guide"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Commands</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Navigation</h4>
                <div className="bg-gray-200/80 dark:bg-gray-700/50 p-4 rounded-xs space-y-3 border border-gray-300/50 dark:border-gray-600/50">
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">go to [url]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Navigate to a specific URL</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">reload</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Reload the current page</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">go back</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Go back in browser history</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">go forward</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Go forward in browser history</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Element Interaction</h4>
                <div className="bg-gray-200/80 dark:bg-gray-700/50 p-4 rounded-xs space-y-3 border border-gray-300/50 dark:border-gray-600/50">
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">click [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Click on an element</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">double click [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Double click on an element</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">right click [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Right click on an element</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">type [text] [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Type text into an input field</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">clear [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Clear the value of an input field</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">select [option] [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Select an option from a dropdown</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">check [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Check a checkbox or radio button</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">uncheck [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Uncheck a checkbox</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">hover [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Hover over an element</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">focus [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Focus on an element</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">blur [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Remove focus from an element</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Assertions</h4>
                <div className="bg-gray-200/80 dark:bg-gray-700/50 p-4 rounded-xs space-y-3 border border-gray-300/50 dark:border-gray-600/50">
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should be visible [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert element is visible</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should not be visible [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert element is not visible</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should exist [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert element exists in DOM</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should not exist [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert element does not exist in DOM</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should be enabled [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert element is enabled</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should be disabled [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert element is disabled</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should be checked [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert checkbox/radio is checked</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should not be checked [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert checkbox/radio is not checked</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should contain [selector] [text]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert element contains text</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should not contain [selector] [text]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert element does not contain text</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should have value [selector] [value]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert input has specific value</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should have text [selector] [text]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert element has exact text</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">should include text [selector] [text]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert element text includes substring</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">url should include [text]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert URL contains text</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">title should be [text]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert page title</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Wait & Control</h4>
                <div className="bg-gray-200/80 dark:bg-gray-700/50 p-4 rounded-xs space-y-3 border border-gray-300/50 dark:border-gray-600/50">
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">wait [milliseconds]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Wait for specified milliseconds</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">pause</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Pause test execution for debugging</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Scrolling & Viewport</h4>
                <div className="bg-gray-200/80 dark:bg-gray-700/50 p-4 rounded-xs space-y-3 border border-gray-300/50 dark:border-gray-600/50">
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">scroll to top</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Scroll to top of page</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">scroll to bottom</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Scroll to bottom of page</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">scroll to [x] [y]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Scroll to specific coordinates</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">set viewport [width] [height]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Set browser viewport size</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Advanced</h4>
                <div className="bg-gray-200/80 dark:bg-gray-700/50 p-4 rounded-xs space-y-3 border border-gray-300/50 dark:border-gray-600/50">
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">trigger [event] [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Trigger custom event on element</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">attach file [file] [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Attach file to file input</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">alias as [selector] [name]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Create alias for element</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">use alias [name]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Use previously created alias</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Examples</h3>
            <div className="bg-gray-300/80 dark:bg-gray-800/50 p-4 rounded-xs border border-gray-400/50 dark:border-gray-600/50">
              <pre className="text-sm text-gray-900 dark:text-gray-300 font-mono whitespace-pre-wrap">
                {
                `it complete login test
  go to login
  type admin into username_input
  type password123 into password_input
  click login_button
  dashboard should be visible

it invalid login test
  go to login
  type wrong_user into username_input
  type wrong_pass into password_input
  click login_button
  error_message should contain invalid credentials

it page navigation test
  go to home_page
  click profile_link
  profile_page should be visible
  go back
  home_page should be visible`
                }
              </pre>
            </div>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-700/50 p-3 rounded-xs border border-gray-300/50 dark:border-gray-600/50">
            <p><strong>Note:</strong> Selectors can be CSS selectors like <code className="text-blue-700 dark:text-blue-400 font-semibold">#id</code>, <code className="text-blue-700 dark:text-blue-400 font-semibold">.class</code>, or <code className="text-blue-700 dark:text-blue-400 font-semibold">[attribute=value]</code></p>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default TestConverter; 