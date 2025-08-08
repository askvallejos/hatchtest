import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Copy, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { convertToCypress } from '@/lib/cypressConverter';
import { replaceVariablesInText } from '@/lib/variablesUtils';
import { variablesDB } from '@/lib/variablesDB';

type Suggestion = {
  type: 'keyword' | 'variable';
  value: string;
};

const KEYWORDS: string[] = [
  'it',
  'end',
  'go to',
  'reload',
  'go back',
  'go forward',
  'type',
  'clear',
  'click',
  'double click',
  'right click',
  'hover',
  'focus',
  'blur',
  'select',
  'check',
  'uncheck',
  'should be visible',
  'should not be visible',
  'should exist',
  'should not exist',
  'should be enabled',
  'should be disabled',
  'should be checked',
  'should not be checked',
  'should contain',
  'should not contain',
  'should have value',
  'should have text',
  'should include text',
  'url should include',
  'title should be',
  'wait',
  'pause',
  'scroll to top',
  'scroll to bottom',
  'scroll to',
  'set viewport',
  'trigger',
  'attach file',
  'alias as',
  'use alias',
  'intercept',
  'wait for',
  'cookie should exist',
  'cookie should not exist',
  'cookie should have value',
  'force click',
];

function getTokenBounds(text: string, cursor: number): { start: number; end: number } {
  let start = cursor;
  while (start > 0) {
    const ch = text[start - 1];
    if (/[A-Za-z0-9_-]/.test(ch)) start -= 1;
    else break;
  }
  return { start, end: cursor };
}

const TestConverter = () => {
  const [input, setInput] = useState('');
  const [cypressCode, setCypressCode] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasWarnings, setHasWarnings] = useState(false);
  const [showKeywordGuide, setShowKeywordGuide] = useState(false);
  const { toast } = useToast();

  // Autocomplete state
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [cursorPos, setCursorPos] = useState(0);
  const [variableNames, setVariableNames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [popupTop, setPopupTop] = useState(0);
  const [popupLeft, setPopupLeft] = useState(0);

  useEffect(() => {
    variablesDB
      .getAllVariables()
      .then((vars) => setVariableNames(vars.map((v) => v.name)))
      .catch(() => {
      });
  }, []);

  const updateSuggestions = (text: string, caret: number) => {
    const { start, end } = getTokenBounds(text, caret);
    const prefix = text.slice(start, end);
    const trimmed = prefix.trim();

    if (!trimmed) {
      setSuggestions([]);
      setIsOpen(false);
      setHighlightIndex(0);
      updatePopupPosition();
      return;
    }

    const lower = trimmed.toLowerCase();

    const keywordMatches: Suggestion[] = KEYWORDS.filter((k) => k.toLowerCase().startsWith(lower)).map((k) => ({
      type: 'keyword',
      value: k,
    }));

    const variableMatches: Suggestion[] = variableNames
      .filter((v) => v.toLowerCase().startsWith(lower))
      .map((v) => ({ type: 'variable', value: v }));

    const merged = [...keywordMatches, ...variableMatches].slice(0, 12);
    setSuggestions(merged);
    setIsOpen(merged.length > 0 && isFocused);
    setHighlightIndex(0);
    updatePopupPosition();
  };

  const insertSuggestionAtCaret = (s: Suggestion) => {
    const el = textareaRef.current;
    if (!el) return;

    const caret = el.selectionStart ?? cursorPos;
    const { start, end } = getTokenBounds(input, caret);

    const before = input.slice(0, start);
    const after = input.slice(end);
    const replacement = s.value;

    const next = before + replacement + after;
    const nextCaret = before.length + replacement.length;

    setInput(next);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(nextCaret, nextCaret);
      }
    });

    setIsOpen(false);
  };

  const updatePopupPosition = () => {
    const ta = textareaRef.current;
    const wrapper = wrapperRef.current;
    if (!ta || !wrapper) return;

    const caret = ta.selectionStart ?? 0;
    // Build a mirror element to calculate caret position
    const computed = window.getComputedStyle(ta);
    const mirror = document.createElement('div');
    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';
    mirror.style.overflow = 'hidden';
    mirror.style.boxSizing = computed.boxSizing;
    mirror.style.width = ta.clientWidth + 'px';
    mirror.style.fontFamily = computed.fontFamily;
    mirror.style.fontSize = computed.fontSize;
    mirror.style.lineHeight = computed.lineHeight;
    mirror.style.padding = computed.padding;
    mirror.style.border = computed.border;

    // Content up to caret
    const before = (ta.value || '').substring(0, caret);
    const after = (ta.value || '').substring(caret);
    const marker = document.createElement('span');
    marker.textContent = '\u200b'; // zero-width space

    mirror.textContent = before;
    mirror.appendChild(marker);
    const tail = document.createTextNode(after);
    mirror.appendChild(tail);

    wrapper.appendChild(mirror);
    // Position relative to wrapper/textarea, accounting for scroll
    const markerRect = marker.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const top = markerRect.top - wrapperRect.top - ta.scrollTop + 20; // slight offset below caret
    const left = markerRect.left - wrapperRect.left - ta.scrollLeft + 4;

    setPopupTop(Math.max(0, top));
    setPopupLeft(Math.max(0, left));

    wrapper.removeChild(mirror);
  };

  const handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setInput(e.target.value);
    const pos = e.target.selectionStart ?? 0;
    setCursorPos(pos);
    updateSuggestions(e.target.value, pos);
    updatePopupPosition();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % suggestions.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertSuggestionAtCaret(suggestions[highlightIndex]);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }
  };

  const handleFocus: React.FocusEventHandler<HTMLTextAreaElement> = (e) => {
    setIsFocused(true);
    const pos = e.currentTarget.selectionStart ?? 0;
    setCursorPos(pos);
    updateSuggestions(input, pos);
    updatePopupPosition();
  };

  const handleBlur: React.FocusEventHandler<HTMLTextAreaElement> = () => {
    setTimeout(() => setIsOpen(false), 120);
    setIsFocused(false);
  };

  const handleClickSuggestion = (s: Suggestion) => {
    insertSuggestionAtCaret(s);
  };

  const convertToCypressHandler = async () => {
    setIsConverting(true);
    setShowProcessing(true);
    setConversionStatus('idle');
    setHasWarnings(false);

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

        // Replace variables in the converted code
        const convertedWithVariables = await replaceVariablesInText(converted);

        setCypressCode(convertedWithVariables);
        setConversionStatus('success');

        const warningsDetected = converted.includes('❌ Warning: The following commands were not recognized:');
        setHasWarnings(warningsDetected);

        if (warningsDetected) {
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
        setHasWarnings(false);
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
    setHasWarnings(false);
    toast({
      title: "Output Cleared",
      description: "The output has been cleared.",
      variant: "default",
    });
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-6 flex-shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cypress Converter
        </h1>
        <HelpCircle className="w-6 h-6 cursor-pointer text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 hover:drop-shadow-lg" onClick={() => setShowKeywordGuide(true)} />
      </div>

      <div className="flex w-full flex-1 gap-x-4 min-h-0">
        <Card className="w-1/2 flex flex-col p-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-2xl rounded-xs">
          <div className="flex flex-col flex-1 space-y-4 min-h-0">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${input.trim() ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white tracking-wide">Input</h2>
            </div>
            <div ref={wrapperRef} className="relative flex flex-col flex-1 min-h-0">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onScroll={updatePopupPosition}
                placeholder="Input your test here."
                className="flex-1 h-full min-h-0 bg-gray-200/90 dark:bg-gray-950/60 backdrop-blur-sm border-white/40 dark:border-gray-600/40 resize-none font-mono text-sm leading-relaxed placeholder:text-gray-400 rounded-xs"
              />
              {isOpen && suggestions.length > 0 && (
                <div
                  className="absolute z-10 max-h-64 w-[min(28rem,calc(100%-1rem))] overflow-auto rounded-xs border border-gray-300/60 dark:border-gray-600/60 bg-white dark:bg-gray-900 shadow-xl"
                  style={{ top: popupTop, left: popupLeft }}
                >
                  <ul className="py-1">
                    {suggestions.map((s, idx) => (
                      <li
                        key={`${s.type}-${s.value}-${idx}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleClickSuggestion(s)}
                        className={`px-3 py-1.5 cursor-pointer text-sm flex items-center gap-2 ${
                          idx === highlightIndex ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                      >
                        <span
                          className={`inline-flex min-w-[2.2rem] justify-center rounded-xs px-1 py-0.5 text-[10px] font-semibold ${
                            s.type === 'keyword'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {s.type === 'keyword' ? 'KW' : 'VAR'}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100">{s.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${conversionStatus === 'success' ? (hasWarnings ? 'bg-yellow-500' : 'bg-green-500') :
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
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Cookies & Network</h4>
                <div className="bg-gray-200/80 dark:bg-gray-700/50 p-4 rounded-xs space-y-3 border border-gray-300/50 dark:border-gray-600/50">
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">cookie [name] should exist</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert cookie exists</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">cookie [name] should not exist</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert cookie does not exist</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">cookie [name] should have value [value]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Assert cookie has specific value</p>
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
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">intercept [method] [url] [alias]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Intercept network requests</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">wait for [alias]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Wait for intercepted request</p>
                  </div>
                  <div>
                    <code className="text-sm text-blue-700 dark:text-blue-400 font-semibold">force click [selector]</code>
                    <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">Force click on element</p>
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
  home_page should be visible

it login with intercept test
  intercept(POST, /api/login, login)
  go to http://localhost:3000/?isManual=true
  type kpxResourceIdNum into input[data-testid=login-input]
  force click button[data-testid=login-button]
  wait for login
  url should include /selection
  cookie token should exist`
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