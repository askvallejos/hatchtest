import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Copy, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { replaceVariablesInText } from '@/lib/variablesUtils';

const CypressConverterAi = () => {
  const [input, setInput] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showKeywordGuide, setShowKeywordGuide] = useState(false);
  const { toast } = useToast();

  const processWithAI = async () => {
    setIsProcessing(true);
    setShowProcessing(true);
    setProcessingStatus('idle');

    try {
      if (!input.trim()) {
        throw new Error('Input is empty. Please enter a test description to convert.');
      }

      // Basic validation to check if input makes sense for test automation
      const testKeywords = [
        'test', 'check', 'verify', 'validate', 'assert', 'expect', 'should',
        'login', 'logout', 'click', 'type', 'fill', 'submit', 'form',
        'button', 'link', 'input', 'field', 'page', 'element', 'component',
        'navigation', 'menu', 'dropdown', 'select', 'radio', 'checkbox',
        'table', 'list', 'grid', 'modal', 'dialog', 'popup', 'alert',
        'error', 'success', 'warning', 'message', 'notification',
        'search', 'filter', 'sort', 'pagination', 'scrolling',
        'upload', 'download', 'file', 'image', 'video', 'audio',
        'responsive', 'mobile', 'desktop', 'tablet', 'screen',
        'api', 'request', 'response', 'status', 'data', 'json',
        'database', 'db', 'query', 'mutation', 'subscription'
      ];

      const inputLower = input.toLowerCase();
      const hasTestKeywords = testKeywords.some(keyword => inputLower.includes(keyword));
      
      // Check for obviously nonsensical inputs
      const nonsensicalPatterns = [
        /^[^\w\s]+$/, // Only special characters
        /^\d+$/, // Only numbers
        /^[a-z]{1,3}$/i, // Very short random letters
        /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, // Only symbols
      ];

      const isNonsensical = nonsensicalPatterns.some(pattern => pattern.test(input.trim()));

      if (isNonsensical) {
        throw new Error('The input appears to be nonsensical or contains only special characters. Please provide a meaningful test description.');
      }

      // If no test-related keywords found, warn but still proceed
      const prompt = hasTestKeywords 
        ? `You are a test automation expert. Convert English descriptions into Cypress test code. Respond with ONLY the Cypress test code - nothing more, nothing less. No explanations, no markdown formatting, no comments, no additional text. Just the pure Cypress code with proper syntax, describe/it blocks, selectors, and assertions.

Convert this English description into Cypress test code: ${input}`
        : `You are a test automation expert. The following input may not be clearly related to test automation. If the input doesn't make sense for creating a test, respond with: "ERROR: The input doesn't make sense for test automation. Please provide a clear description of what you want to test (e.g., 'test login functionality', 'verify form validation', 'check button click behavior')."

If the input can be reasonably converted to a test, respond with ONLY the Cypress test code - nothing more, nothing less. No explanations, no markdown formatting, no comments, no additional text. Just the pure Cypress code with proper syntax, describe/it blocks, selectors, and assertions.

Input: ${input}`;

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY
        },
        body: JSON.stringify({
          "contents": [
            {
              "parts": [
                {
                  "text": prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error('Invalid response from AI service');
      }

      let aiResponse = data.candidates[0].content.parts[0].text;
      
      // Check if AI returned an error message
      if (aiResponse.startsWith('ERROR:')) {
        throw new Error(aiResponse.substring(6).trim());
      }
      
      // Remove markdown code block formatting
      aiResponse = aiResponse.replace(/^```javascript\s*/i, '').replace(/```\s*$/i, '');
      
      // Replace variables in the AI response
      const aiResponseWithVariables = await replaceVariablesInText(aiResponse);
      
      setAiOutput(aiResponseWithVariables);
      setProcessingStatus('success');

      toast({
        title: "Processing Completed",
        description: "Your test description has been converted to Cypress code.",
        variant: "success",
      });
    } catch (error) {
      setProcessingStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during processing.';

      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }

    setTimeout(() => {
      setIsProcessing(false);
      setShowProcessing(false);
    }, 500);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(aiOutput);
    toast({
      title: "Copied to Clipboard",
      description: "Code has been copied to your clipboard.",
      variant: "default",
    });
  };

  const clearOutput = () => {
    setAiOutput('');
    setProcessingStatus('idle');
    toast({
      title: "Output Cleared",
      description: "The output has been cleared.",
      variant: "default",
    });
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6 flex-shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold u-heading">
          Cypress Converter AI
        </h1>
        <HelpCircle className="w-6 h-6 cursor-pointer u-heading transition-all duration-200 hover:scale-110 hover:drop-shadow-lg" onClick={() => setShowKeywordGuide(true)} />
      </div>

      <div className="flex w-full flex-1 gap-x-4 min-h-0">
        <Card className="w-1/2 flex flex-col p-6 u-panel backdrop-blur-xl u-border-faint shadow-2xl rounded-xs">
          <div className="flex flex-col flex-1 space-y-4 min-h-0">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${input.trim() ? 'u-dot-success' : 'u-dot-idle'}`}></div>
              <h2 className="text-xl font-semibold u-subheading tracking-wide">Input</h2>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input your test description here."
              className="flex-1 min-h-0 u-editor backdrop-blur-sm border u-border-soft resize-none font-mono text-sm leading-relaxed placeholder:text-gray-400 rounded-xs"
            />
            <Button
              onClick={processWithAI}
              disabled={isProcessing || !input.trim()}
              className="w-full flex-shrink-0 u-btn-cta shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm border-0 py-6 text-lg font-medium rounded-xs"
            >
              {showProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Convert
                </div>
              )}
            </Button>
          </div>
        </Card>

        <Card className="w-1/2 flex flex-col p-6 u-panel backdrop-blur-xl u-border-faint shadow-2xl rounded-xs">
          <div className="flex flex-col flex-1 space-y-4 min-h-0">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${processingStatus === 'success' ? 'u-dot-success' : processingStatus === 'error' ? 'u-dot-error' : 'u-dot-idle'}`}></div>
              <h2 className="text-xl font-semibold u-subheading tracking-wide">Output</h2>
            </div>
            <div className="flex-1 min-h-0 relative">
              <Textarea
                value={aiOutput}
                readOnly
                placeholder="Generated test code will appear here."
                className="w-full h-full u-editor backdrop-blur-sm border u-border-soft resize-none font-mono text-sm leading-relaxed placeholder:text-gray-400 pr-12 rounded-xs"
              />
              {aiOutput && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm u-border-soft hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-xs"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={clearOutput}
              disabled={!aiOutput.trim()}
              className="w-full flex-shrink-0 u-btn-neutral shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm border-0 py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed rounded-xs"
            >
              Clear
            </Button>
          </div>
        </Card>
      </div>

      <Dialog
        isOpen={showKeywordGuide}
        onClose={() => setShowKeywordGuide(false)}
        title="Processing Guide"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold u-heading">AI Test Generation</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium u-subheading">How to Use</h4>
                <div className="u-note p-4 rounded-xs space-y-3 border u-border-soft">
                  <div>
                    <code className="text-sm u-code-emphasis font-semibold">English Description</code>
                    <p className="text-sm u-text-muted mt-1">Describe your test scenario in plain English</p>
                  </div>
                  <div>
                    <code className="text-sm u-code-emphasis font-semibold">AI Conversion</code>
                    <p className="text-sm u-text-muted mt-1">AI converts your description into Cypress test code</p>
                  </div>
                  <div>
                    <code className="text-sm u-code-emphasis font-semibold">Ready-to-Use Code</code>
                    <p className="text-sm u-text-muted mt-1">Get properly formatted Cypress tests with assertions</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium u-subheading">Example Descriptions</h4>
                <div className="u-note p-4 rounded-xs space-y-3 border u-border-soft">
                  <div>
                    <code className="text-sm u-code-emphasis font-semibold">"Test login with valid credentials"</code>
                    <p className="text-sm u-text-muted mt-1">Generates login test with form filling and validation</p>
                  </div>
                  <div>
                    <code className="text-sm u-code-emphasis font-semibold">"Verify user can add item to cart"</code>
                    <p className="text-sm u-text-muted mt-1">Creates e-commerce cart functionality test</p>
                  </div>
                  <div>
                    <code className="text-sm u-code-emphasis font-semibold">"Check form validation shows errors"</code>
                    <p className="text-sm u-text-muted mt-1">Tests form validation and error messages</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm u-text-muted u-note p-3 rounded-xs border u-border-soft">
            <p><strong>Note:</strong> The AI uses Google's Gemini 2.0 Flash model to generate high-quality Cypress test code from your English descriptions.</p>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CypressConverterAi; 