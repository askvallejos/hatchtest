import { variablesDB } from './variablesDB';

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function replaceVariablesInText(text: string): Promise<string> {
  try {
    const variables = await variablesDB.getAllVariables();
    let result = text;

    // Sort by name length descending to replace longer names first and avoid partial overlaps
    const sorted = [...variables].sort((a, b) => b.name.length - a.name.length);

    for (const variable of sorted) {
      const escapedName = escapeRegExp(variable.name);
      // Treat letters, digits, underscore, and dash as part of the token, so we only replace when not surrounded by these
      // Use a capturing group for the leading non-token char (or start of string) so we can preserve it in replacement
      const regex = new RegExp(`(^|[^\\w-])(${escapedName})(?![\\w-])`, 'g');
      result = result.replace(regex, (_, leading: string) => `${leading}${variable.value}`);
    }

    return result;
  } catch (error) {
    console.error('Error replacing variables:', error);
    return text;
  }
}
