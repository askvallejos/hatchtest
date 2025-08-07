import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { convertToCypress } from '@/lib/cypressConverter';

const TestConverter = () => {
  const [input, setInput] = useState('');
  const [cypressCode, setCypressCode] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'success' | 'error'>('idle');
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
    <div className="h-full flex flex-col p-6">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Test Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert your test scripts to Cypress format
        </p>
      </div>

      <div className="flex w-full flex-1 gap-x-4 min-h-0">
        <Card className="w-1/2 flex flex-col p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-2xl rounded-xs">
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

        <Card className="w-1/2 flex flex-col p-6 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-2xl rounded-xs">
          <div className="flex flex-col flex-1 space-y-4 min-h-0">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                conversionStatus === 'success' ? 'bg-green-500' :
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
    </div>
  );
};

export default TestConverter; 