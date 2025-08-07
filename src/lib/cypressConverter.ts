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
  "use alias": (name) => `cy.get(@${name});`,
};

function tokenizeLine(line: string): Token | null {
  const trimmedLine = line.trim();
  if (!trimmedLine) return null;

  // Handle "it" command with description
  if (trimmedLine.startsWith('it ')) {
    const description = trimmedLine.substring(3).trim();
    return {
      command: 'it',
      args: [description],
      line: trimmedLine
    };
  }

  // Handle "end" command
  if (trimmedLine === 'end') {
    return {
      command: 'end',
      args: [],
      line: trimmedLine
    };
  }

  // Handle "type X into Y" pattern
  const typeIntoMatch = trimmedLine.match(/^type\s+(.+?)\s+into\s+(.+)$/);
  if (typeIntoMatch) {
    const value = typeIntoMatch[1].trim();
    const selector = typeIntoMatch[2].trim();
    return {
      command: 'type',
      args: [value, selector],
      line: trimmedLine
    };
  }

  // Handle "should contain" with text
  const shouldContainMatch = trimmedLine.match(/^(.+?)\s+should\s+contain\s+(.+)$/);
  if (shouldContainMatch) {
    const selector = shouldContainMatch[1].trim();
    const text = shouldContainMatch[2].trim();
    return {
      command: 'should contain',
      args: [selector, text],
      line: trimmedLine
    };
  }

  // Handle "should be visible" and similar assertions
  const shouldBeMatch = trimmedLine.match(/^(.+?)\s+should\s+be\s+(.+)$/);
  if (shouldBeMatch) {
    const selector = shouldBeMatch[1].trim();
    const assertion = shouldBeMatch[2].trim();
    return {
      command: `should be ${assertion}`,
      args: [selector],
      line: trimmedLine
    };
  }

  // Handle "go to" command
  if (trimmedLine.startsWith('go to ')) {
    const url = trimmedLine.substring(6).trim();
    return {
      command: 'go to',
      args: [url],
      line: trimmedLine
    };
  }

  // Handle "go back" command
  if (trimmedLine === 'go back') {
    return {
      command: 'go back',
      args: [],
      line: trimmedLine
    };
  }

  // Handle "click" command
  if (trimmedLine.startsWith('click ')) {
    const selector = trimmedLine.substring(6).trim();
    return {
      command: 'click',
      args: [selector],
      line: trimmedLine
    };
  }

  // Handle commands with parentheses
  const parenMatch = trimmedLine.match(/^([^(]+)\(([^)]*)\)$/);
  if (parenMatch) {
    const command = parenMatch[1].trim();
    const argsStr = parenMatch[2].trim();
    const args = argsStr ? argsStr.split(',').map(arg => arg.trim()) : [];
    return {
      command,
      args,
      line: trimmedLine
    };
  }

  // Handle "url should include" and "title should be"
  const urlTitleMatch = trimmedLine.match(/^(url|title)\s+should\s+(.+)$/);
  if (urlTitleMatch) {
    const type = urlTitleMatch[1];
    const assertion = urlTitleMatch[2].trim();
    return {
      command: `${type} should ${assertion}`,
      args: [],
      line: trimmedLine
    };
  }

  // Handle "scroll to" with coordinates
  const scrollToMatch = trimmedLine.match(/^scroll to\(([^,]+),\s*([^)]+)\)$/);
  if (scrollToMatch) {
    return {
      command: 'scroll to',
      args: [scrollToMatch[1].trim(), scrollToMatch[2].trim()],
      line: trimmedLine
    };
  }

  // Handle "set viewport"
  const viewportMatch = trimmedLine.match(/^set viewport\(([^,]+),\s*([^)]+)\)$/);
  if (viewportMatch) {
    return {
      command: 'set viewport',
      args: [viewportMatch[1].trim(), viewportMatch[2].trim()],
      line: trimmedLine
    };
  }

  // Handle "trigger" with event and selector
  const triggerMatch = trimmedLine.match(/^trigger\(([^,]+),\s*([^)]+)\)$/);
  if (triggerMatch) {
    return {
      command: 'trigger',
      args: [triggerMatch[1].trim(), triggerMatch[2].trim()],
      line: trimmedLine
    };
  }

  // Handle "attach file"
  const attachFileMatch = trimmedLine.match(/^attach file\(([^,]+),\s*([^)]+)\)$/);
  if (attachFileMatch) {
    return {
      command: 'attach file',
      args: [attachFileMatch[1].trim(), attachFileMatch[2].trim()],
      line: trimmedLine
    };
  }

  // Handle "alias as"
  const aliasAsMatch = trimmedLine.match(/^alias as\(([^,]+),\s*([^)]+)\)$/);
  if (aliasAsMatch) {
    return {
      command: 'alias as',
      args: [aliasAsMatch[1].trim(), aliasAsMatch[2].trim()],
      line: trimmedLine
    };
  }

  // Handle "use alias"
  const useAliasMatch = trimmedLine.match(/^use alias\(([^)]+)\)$/);
  if (useAliasMatch) {
    return {
      command: 'use alias',
      args: [useAliasMatch[1].trim()],
      line: trimmedLine
    };
  }

  return null;
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
    output += '\n------------------------------------------------------------------\n';
    output += '❌ Warning: The following commands were not recognized:\n';
    unrecognizedCommands.forEach(cmd => {
      output += `❌ ${cmd}\n`;
    });
  }
  
  return output.trim();
} 