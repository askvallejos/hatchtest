interface Token {
  command: string;
  args: string[];
  line: string;
}

const mappingDictionary: Record<string, (...args: string[]) => string> = {
  "it": (desc) => `it(${desc}, () => {`,
  "end": () => `});`,
  "go to": (url) => `cy.visit(${url});`,
  "reload": () => `cy.reload();`,
  "go back": () => `cy.go('back');`,
  "go forward": () => `cy.go('forward');`,
  "type": (value, selector) => `cy.get(${selector}).type(${value});`,
  "clear": (selector) => `cy.get(${selector}).clear();`,
  "click": (selector) => `cy.get(${selector}).click();`,
  "double click": (selector) => `cy.get(${selector}).dblclick();`,
  "right click": (selector) => `cy.get(${selector}).rightclick();`,
  "hover": (selector) => `cy.get(${selector}).trigger('mouseover');`,
  "focus": (selector) => `cy.get(${selector}).focus();`,
  "blur": (selector) => `cy.get(${selector}).blur();`,
  "select": (value, selector) => `cy.get(${selector}).select(${value});`,
  "check": (selector) => `cy.get(${selector}).check();`,
  "uncheck": (selector) => `cy.get(${selector}).uncheck();`,
  "should be visible": (selector) => `cy.get(${selector}).should('be.visible');`,
  "should not be visible": (selector) => `cy.get(${selector}).should('not.be.visible');`,
  "should exist": (selector) => `cy.get(${selector}).should('exist');`,
  "should not exist": (selector) => `cy.get(${selector}).should('not.exist');`,
  "should be enabled": (selector) => `cy.get(${selector}).should('be.enabled');`,
  "should be disabled": (selector) => `cy.get(${selector}).should('be.disabled');`,
  "should be checked": (selector) => `cy.get(${selector}).should('be.checked');`,
  "should not be checked": (selector) => `cy.get(${selector}).should('not.be.checked');`,
  "should contain": (selector, text) => `cy.get(${selector}).should('contain', ${text});`,
  "should not contain": (selector, text) => `cy.get(${selector}).should('not.contain', ${text});`,
  "should have value": (selector, value) => `cy.get(${selector}).should('have.value', ${value});`,
  "should have text": (selector, text) => `cy.get(${selector}).should('have.text', ${text});`,
  "should include text": (selector, text) => `cy.get(${selector}).invoke('text').should('include', ${text});`,
  "url should include": (value) => `cy.url().should('include', ${value});`,
  "title should be": (value) => `cy.title().should('eq', ${value});`,
  "wait": (ms) => `cy.wait(${ms});`,
  "pause": () => `cy.pause();`,
  "scroll to top": () => `cy.scrollTo('top');`,
  "scroll to bottom": () => `cy.scrollTo('bottom');`,
  "scroll to": (x, y) => `cy.scrollTo(${x}, ${y});`,
  "set viewport": (width, height) => `cy.viewport(${width}, ${height});`,
  "trigger": (event, selector) => `cy.get(${selector}).trigger(${event});`,
  "attach file": (file, selector) => `cy.get(${selector}).attachFile(${file});`,
  "alias as": (selector, name) => `cy.get(${selector}).as(${name});`,
  "use alias": (name) => `cy.get('@${name.replace(/['"]/g, '')}');`,
  "intercept": (method, url, alias) => `cy.intercept({\n    method: ${method},\n    url: ${url},\n}).as(${alias});`,
  "wait for": (alias) => `cy.wait('@${alias.replace(/['"]/g, '')}');`,
  "cookie should exist": (name) => `cy.getCookie(${name}).should('exist');`,
  "cookie should not exist": (name) => `cy.getCookie(${name}).should('not.exist');`,
  "cookie should have value": (name, value) => `cy.getCookie(${name}).should('have.property', 'value', ${value});`,
  "force click": (selector) => `cy.get(${selector}).click({ force: true });`,
};

// Data-driven tokenizer rules for maintainability
type Rule = {
  id: string;
  regex: RegExp;
  toToken(match: RegExpMatchArray, line: string): Token;
};

const tokenizerRules: Rule[] = [
  // Test structure
  { id: 'it', regex: /^it\s+(.+)$/i, toToken: (m, line) => ({ command: 'it', args: [m[1].trim()], line }) },
  { id: 'end', regex: /^end$/i, toToken: (_m, line) => ({ command: 'end', args: [], line }) },

  // Navigation
  { id: 'go to', regex: /^go to\s+(.+)$/i, toToken: (m, line) => ({ command: 'go to', args: [m[1].trim()], line }) },
  { id: 'reload', regex: /^reload$/i, toToken: (_m, line) => ({ command: 'reload', args: [], line }) },
  { id: 'go back', regex: /^go back$/i, toToken: (_m, line) => ({ command: 'go back', args: [], line }) },
  { id: 'go forward', regex: /^go forward$/i, toToken: (_m, line) => ({ command: 'go forward', args: [], line }) },

  // Element interaction (single arg)
  { id: 'click', regex: /^click\s+(.+)$/i, toToken: (m, line) => ({ command: 'click', args: [m[1].trim()], line }) },
  { id: 'double click', regex: /^double click\s+(.+)$/i, toToken: (m, line) => ({ command: 'double click', args: [m[1].trim()], line }) },
  { id: 'right click', regex: /^right click\s+(.+)$/i, toToken: (m, line) => ({ command: 'right click', args: [m[1].trim()], line }) },
  { id: 'clear', regex: /^clear\s+(.+)$/i, toToken: (m, line) => ({ command: 'clear', args: [m[1].trim()], line }) },
  { id: 'hover', regex: /^hover\s+(.+)$/i, toToken: (m, line) => ({ command: 'hover', args: [m[1].trim()], line }) },
  { id: 'focus', regex: /^focus\s+(.+)$/i, toToken: (m, line) => ({ command: 'focus', args: [m[1].trim()], line }) },
  { id: 'blur', regex: /^blur\s+(.+)$/i, toToken: (m, line) => ({ command: 'blur', args: [m[1].trim()], line }) },
  { id: 'check', regex: /^check\s+(.+)$/i, toToken: (m, line) => ({ command: 'check', args: [m[1].trim()], line }) },
  { id: 'uncheck', regex: /^uncheck\s+(.+)$/i, toToken: (m, line) => ({ command: 'uncheck', args: [m[1].trim()], line }) },

  // Element interaction (two args)
  { id: 'type into', regex: /^type\s+(.+?)\s+into\s+(.+)$/i, toToken: (m, line) => ({ command: 'type', args: [m[1].trim(), m[2].trim()], line }) },
  { id: 'select', regex: /^select\s+(.+?)\s+(.+)$/i, toToken: (m, line) => ({ command: 'select', args: [m[1].trim(), m[2].trim()], line }) },

  // Assertions - contain variants
  { id: 'should not contain', regex: /^(.+?)\s+should\s+not\s+contain\s+(.+)$/i, toToken: (m, line) => ({ command: 'should not contain', args: [m[1].trim(), m[2].trim()], line }) },
  { id: 'should contain', regex: /^(.+?)\s+should\s+contain\s+(.+)$/i, toToken: (m, line) => ({ command: 'should contain', args: [m[1].trim(), m[2].trim()], line }) },

  // URL/title assertions
  { id: 'url should include', regex: /^url\s+should\s+include\s+(.+)$/i, toToken: (m, line) => ({ command: 'url should include', args: [m[1].trim()], line }) },
  { id: 'title should be', regex: /^title\s+should\s+be\s+(.+)$/i, toToken: (m, line) => ({ command: 'title should be', args: [m[1].trim()], line }) },

  // Assertions - specific common variants
  { id: 'should be X', regex: /^(.+?)\s+should\s+be\s+(.+)$/i, toToken: (m, line) => ({ command: `should be ${m[2].trim()}`, args: [m[1].trim()], line }) },
  { id: 'should not be visible', regex: /^(.+?)\s+should\s+not\s+be\s+visible$/i, toToken: (m, line) => ({ command: 'should not be visible', args: [m[1].trim()], line }) },
  { id: 'should not be checked', regex: /^(.+?)\s+should\s+not\s+be\s+checked$/i, toToken: (m, line) => ({ command: 'should not be checked', args: [m[1].trim()], line }) },
  { id: 'should exist', regex: /^(.+?)\s+should\s+exist$/i, toToken: (m, line) => ({ command: 'should exist', args: [m[1].trim()], line }) },
  { id: 'should not exist', regex: /^(.+?)\s+should\s+not\s+exist$/i, toToken: (m, line) => ({ command: 'should not exist', args: [m[1].trim()], line }) },
  { id: 'should have value', regex: /^(.+?)\s+should\s+have\s+value\s+(.+)$/i, toToken: (m, line) => ({ command: 'should have value', args: [m[1].trim(), m[2].trim()], line }) },
  { id: 'should have text', regex: /^(.+?)\s+should\s+have\s+text\s+(.+)$/i, toToken: (m, line) => ({ command: 'should have text', args: [m[1].trim(), m[2].trim()], line }) },
  { id: 'should include text', regex: /^(.+?)\s+should\s+include\s+text\s+(.+)$/i, toToken: (m, line) => ({ command: 'should include text', args: [m[1].trim(), m[2].trim()], line }) },

  // Timing and control
  { id: 'wait', regex: /^wait\s+(.+)$/i, toToken: (m, line) => ({ command: 'wait', args: [m[1].trim()], line }) },
  { id: 'pause', regex: /^pause$/i, toToken: (_m, line) => ({ command: 'pause', args: [], line }) },

  // Scrolling & viewport (text variants)
  { id: 'scroll to top', regex: /^scroll to top$/i, toToken: (_m, line) => ({ command: 'scroll to top', args: [], line }) },
  { id: 'scroll to bottom', regex: /^scroll to bottom$/i, toToken: (_m, line) => ({ command: 'scroll to bottom', args: [], line }) },
  { id: 'scroll to x y', regex: /^scroll to\s+([^\s]+)\s+([^\s]+)$/i, toToken: (m, line) => ({ command: 'scroll to', args: [m[1].trim(), m[2].trim()], line }) },
  { id: 'set viewport w h', regex: /^set viewport\s+([^\s]+)\s+([^\s]+)$/i, toToken: (m, line) => ({ command: 'set viewport', args: [m[1].trim(), m[2].trim()], line }) },

  // Wait for (alias)
  { id: 'wait for', regex: /^wait for\s+(.+)$/i, toToken: (m, line) => ({ command: 'wait for', args: [m[1].trim()], line }) },
];

function tokenizeWithFallbacks(trimmedLine: string): Token | null {
  // Parentheses form: command(arg1, arg2, ...)
  const parenMatch = trimmedLine.match(/^([^(]+)\(([^)]*)\)$/);
  if (parenMatch) {
    const command = parenMatch[1].trim();
    const argsStr = parenMatch[2].trim();
    const args = argsStr ? argsStr.split(',').map(arg => arg.trim()) : [];
    return { command, args, line: trimmedLine };
  }

  // scroll to(x, y)
  const scrollToMatch = trimmedLine.match(/^scroll to\(([^,]+),\s*([^)]+)\)$/);
  if (scrollToMatch) {
    return { command: 'scroll to', args: [scrollToMatch[1].trim(), scrollToMatch[2].trim()], line: trimmedLine };
  }

  // set viewport(w, h)
  const viewportMatch = trimmedLine.match(/^set viewport\(([^,]+),\s*([^)]+)\)$/);
  if (viewportMatch) {
    return { command: 'set viewport', args: [viewportMatch[1].trim(), viewportMatch[2].trim()], line: trimmedLine };
  }

  // trigger(event, selector)
  const triggerMatch = trimmedLine.match(/^trigger\(([^,]+),\s*([^)]+)\)$/);
  if (triggerMatch) {
    return { command: 'trigger', args: [triggerMatch[1].trim(), triggerMatch[2].trim()], line: trimmedLine };
  }

  // attach file(file, selector)
  const attachFileMatch = trimmedLine.match(/^attach file\(([^,]+),\s*([^)]+)\)$/);
  if (attachFileMatch) {
    return { command: 'attach file', args: [attachFileMatch[1].trim(), attachFileMatch[2].trim()], line: trimmedLine };
  }

  // alias as(selector, name)
  const aliasAsMatch = trimmedLine.match(/^alias as\(([^,]+),\s*([^)]+)\)$/);
  if (aliasAsMatch) {
    return { command: 'alias as', args: [aliasAsMatch[1].trim(), aliasAsMatch[2].trim()], line: trimmedLine };
  }

  // use alias(name)
  const useAliasMatch = trimmedLine.match(/^use alias\(([^)]+)\)$/);
  if (useAliasMatch) {
    return { command: 'use alias', args: [useAliasMatch[1].trim()], line: trimmedLine };
  }

  // intercept(method, url, alias)
  const interceptMatch = trimmedLine.match(/^intercept\(([^,]+),\s*([^,]+),\s*([^)]+)\)$/);
  if (interceptMatch) {
    return { command: 'intercept', args: [interceptMatch[1].trim(), interceptMatch[2].trim(), interceptMatch[3].trim()], line: trimmedLine };
  }

  // force click [selector]
  const forceClickMatch = trimmedLine.match(/^force click\s+(.+)$/i);
  if (forceClickMatch) {
    return { command: 'force click', args: [forceClickMatch[1].trim()], line: trimmedLine };
  }

  // cookie [name] should (exist|not exist|have value <v>)
  const cookieShouldMatch = trimmedLine.match(/^cookie\s+(.+?)\s+should\s+(exist|not exist|have value)\s*(.+)?$/i);
  if (cookieShouldMatch) {
    const name = cookieShouldMatch[1].trim();
    const assertion = cookieShouldMatch[2];
    const value = cookieShouldMatch[3]?.trim();
    if (assertion === 'have value' && value) {
      return { command: 'cookie should have value', args: [name, value], line: trimmedLine };
    }
    return { command: `cookie should ${assertion}`, args: [name], line: trimmedLine };
  }

  return null;
}

function tokenizeLine(line: string): Token | null {
  const trimmedLine = line.trim();
  if (!trimmedLine) return null;

  for (const rule of tokenizerRules) {
    const match = trimmedLine.match(rule.regex);
    if (match) {
      return rule.toToken(match, trimmedLine);
    }
  }

  return tokenizeWithFallbacks(trimmedLine);
}

function wrapValue(value: string): string {
  // If already wrapped in quotes, return as is
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value;
  }
  
  // If it's a number, return as is
  if (!isNaN(Number(value))) {
    return value;
  }
  
  // If it's a boolean, return as is
  if (value === 'true' || value === 'false') {
    return value;
  }
  
  // If it's a selector (starts with #, ., or contains @), wrap in quotes
  if (value.startsWith('#') || value.startsWith('.') || value.includes('@')) {
    return `'${value}'`;
  }
  
  // Otherwise, wrap in single quotes
  return `'${value}'`;
}

export function convertToCypress(input: string): string {
  const lines = input.split('\n');
  const tokens: Token[] = [];
  const unrecognizedCommands: string[] = [];
  
  // Tokenize all lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const token = tokenizeLine(line);
    if (token) {
      tokens.push(token);
    } else if (line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('#')) {
      // Track unrecognized commands
      unrecognizedCommands.push(`Line ${i + 1}: "${line.trim()}"`);
    }
  }
  
  // If no valid tokens found, throw error
  if (tokens.length === 0) {
    throw new Error('No valid commands found in the input. Please check your syntax.');
  }
  
  // If there are unrecognized commands, include them in the output as comments
  let output = '';
  let currentItBlock = false;
  let indentLevel = 0;
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Handle "it" command - start new test block
    if (token.command === 'it') {
      // Close previous it block if exists
      if (currentItBlock) {
        output += '  '.repeat(indentLevel) + '});\n\n';
      }
      
      const description = wrapValue(token.args[0]);
      output += `it(${description}, () => {\n`;
      currentItBlock = true;
      indentLevel = 1;
      continue;
    }
    
    // Handle "end" command - close current test block
    if (token.command === 'end') {
      if (currentItBlock) {
        output += '  '.repeat(indentLevel) + '});\n\n';
        currentItBlock = false;
        indentLevel = 0;
      }
      continue;
    }
    
    // Handle other commands
    const mapper = mappingDictionary[token.command];
    if (mapper) {
      const args = token.args.map(wrapValue);
      const cypressCode = mapper(...args);
      output += '  '.repeat(indentLevel) + cypressCode + '\n';
    } else {
      // Unknown command - add as comment
      output += '  '.repeat(indentLevel) + `// Unknown command: ${token.line}\n`;
    }
  }
  
  // Close any remaining it block
  if (currentItBlock) {
    output += '  '.repeat(indentLevel) + '});\n';
  }
  
  // Add warning about unrecognized commands if any
  if (unrecognizedCommands.length > 0) {
    output += '\n❌ Warning: The following commands were not recognized:\n';
    unrecognizedCommands.forEach(cmd => {
      output += `❌ ${cmd}\n`;
    });
  }
  
  return output.trim();
} 