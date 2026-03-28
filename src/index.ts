import { compileContentWithDiagnostics } from 'hsml';
import type { Logger, Plugin } from 'vite';

const fileRegex = /\.vue$/;
const templateRegex = /<template\b(?=[^>]*\blang\s*=\s*["']hsml["'])[^>]*>([\s\S]*?)<\/template>/m;

/** Compute the line offset of the template block within the full SFC. */
function getTemplateLineOffset(code: string, matchIndex: number): number {
  let lines = 0;
  for (let i = 0; i < matchIndex; i++) {
    if (code[i] === '\n') lines++;
  }
  return lines;
}

/** @internal */
export function transform(code: string, id: string, logger?: Logger) {
  if (!fileRegex.test(id)) {
    return;
  }

  const match = templateRegex.exec(code);
  if (!match) {
    return;
  }

  const templateLineOffset = getTemplateLineOffset(code, match.index) + 1;
  const hsml = match[1]!.replaceAll('\r\n', '\n').trimStart();
  const result = compileContentWithDiagnostics(hsml);

  for (const diagnostic of result.diagnostics) {
    const loc = diagnostic.location
      ? `:${diagnostic.location.start.line}:${diagnostic.location.start.column}`
      : '';
    const code = diagnostic.code ? ` ${diagnostic.code}:` : '';
    const msg = `${code} ${diagnostic.message} (${id}${loc})`;

    const log = logger ?? console;
    switch (diagnostic.severity) {
      case 'error':
        log.warn(`[hsml error]${msg}`);
        break;
      case 'warning':
        log.warn(`[hsml warning]${msg}`);
        break;
      default:
        diagnostic.severity satisfies never;
    }
  }

  if (!result.success) {
    const firstError = result.diagnostics.find((d) => d.severity === 'error');
    const errors = result.diagnostics
      .filter((d) => d.severity === 'error')
      .map((d) => d.message)
      .join('; ');

    const err: any = new Error(`Failed to compile HSML template: ${errors}`);
    err.id = id;
    err.plugin = 'vite-plugin-vue-hsml';
    if (firstError?.location) {
      err.loc = {
        file: id,
        line: firstError.location.start.line + templateLineOffset,
        column: firstError.location.start.column,
      };
    }
    throw err;
  }

  return {
    code: code.replace(match[0], `<template>${result.html}</template>`),
    map: null,
  };
}

/** Vite plugin that compiles `<template lang="hsml">` blocks in Vue SFCs to HTML. */
export default function VueHsml(): Plugin {
  let logger: Logger;

  return {
    name: 'vite-plugin-vue-hsml',
    enforce: 'pre',
    configResolved(config) {
      logger = config.logger;
    },
    transform(code, id) {
      return transform(code, id, logger);
    },
  };
}
