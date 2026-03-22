import { compileContentWithDiagnostics } from 'hsml';
import type { Plugin } from 'vite';

const fileRegex = /\.vue$/;
const templateRegex = /<template\s+lang=(?:"hsml"|'hsml')>([\s\S]*?)<\/template>/m;

/** @internal */
export function transform(code: string, id: string) {
  if (!fileRegex.test(id)) {
    return;
  }

  const match = templateRegex.exec(code);
  if (!match) {
    return {
      code,
      map: null,
    };
  }

  const hsml = match[1]!.trimStart();
  const result = compileContentWithDiagnostics(hsml);

  for (const diagnostic of result.diagnostics) {
    const loc = diagnostic.location
      ? `:${diagnostic.location.line}:${diagnostic.location.column}`
      : '';
    const prefix = diagnostic.severity === 'error' ? '[hsml error]' : '[hsml warning]';
    const code = diagnostic.code ? ` ${diagnostic.code}:` : '';
    console.warn(`${prefix}${code} ${diagnostic.message} (${id}${loc})`);
  }

  if (!result.success) {
    const errors = result.diagnostics
      .filter((d) => d.severity === 'error')
      .map((d) => d.message)
      .join('; ');
    throw new Error(`Failed to compile HSML template in ${id}: ${errors}`);
  }

  return {
    code: code.replace(match[0], `<template>${result.html}</template>`),
    map: null,
  };
}

export default function VueHsml(): Plugin {
  return {
    name: 'vite-plugin-vue-hsml',
    transform(code, id) {
      return transform(code, id);
    },
  };
}
