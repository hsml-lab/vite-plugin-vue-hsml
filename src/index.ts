import { compile_content } from 'hsml';
import type { Plugin } from 'vite';

const fileRegex = /\.vue$/;

/** @internal */
export function transform(code: string, id: string) {
  if (fileRegex.test(id)) {
    // grep content between <template lang="hsml"> and </template>
    if (code.includes('<template lang="hsml">')) {
      const regex = /<template lang="hsml">([\s\S]*)<\/template>/m;
      const template = regex.exec(code);

      if (!template) {
        return;
      }

      const hsml = template[1]!.trimStart();

      const content = compile_content(hsml);

      code = code.replace(regex, `<template>${content}</template>`);
    }

    return {
      code,
      map: null,
    };
  }
}

export default function VueHsml(): Plugin {
  return {
    name: 'vite-plugin-vue-hsml',
    transform(code, id) {
      return transform(code, id);
    },
  };
}
