/**
 * Service de génération de texte automatique — cœur métier de TextGen Hub.
 *
 * Un modèle (template) contient des variables entre accolades doubles,
 * ex: "Bonjour {{prenom}}, votre commande {{ref}} est prête."
 * generate() remplace chaque variable par sa valeur dans le contexte fourni.
 */

export interface TemplateContext {
  [key: string]: string | number;
}

export interface RenderResult {
  text: string;
  missingVariables: string[];
}

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function extractVariables(template: string): string[] {
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  const pattern = new RegExp(VARIABLE_PATTERN);
  while ((match = pattern.exec(template)) !== null) {
    found.add(match[1]);
  }
  return Array.from(found);
}

export function generate(template: string, context: TemplateContext): RenderResult {
  const missingVariables: string[] = [];

  const text = template.replace(VARIABLE_PATTERN, (_full, varName: string) => {
    if (!(varName in context)) {
      missingVariables.push(varName);
      return `{{${varName}}}`;
    }
    return String(context[varName]);
  });

  return { text, missingVariables };
}
