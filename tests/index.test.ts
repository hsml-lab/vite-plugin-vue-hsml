import { describe, expect, it } from 'vitest';
import { transform } from '../src';

describe('vite-plugin-vue-hsml', () => {
  it('should replace hsml template with html template', () => {
    const input = `<template lang="hsml">
h1 Hello World
</template>`;

    const actual = transform(input, 'test.vue');

    const expected = {
      code: `<template><h1>Hello World</h1></template>`,
      map: null,
    };

    expect(actual).toEqual(expected);
  });
});
