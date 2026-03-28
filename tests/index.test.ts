import { describe, expect, it } from 'vitest';
import VueHsml, { transform } from '../src';

describe('vite-plugin-vue-hsml', () => {
  describe('plugin', () => {
    it('should enforce pre to run before @vitejs/plugin-vue', () => {
      const plugin = VueHsml();
      expect(plugin.enforce).toBe('pre');
    });
  });

  describe('file filtering', () => {
    it('should ignore non-vue files', () => {
      expect(transform('<template lang="hsml">\nh1 Hello\n</template>', 'test.ts')).toBeUndefined();
      expect(
        transform('<template lang="hsml">\nh1 Hello\n</template>', 'test.html'),
      ).toBeUndefined();
      expect(
        transform('<template lang="hsml">\nh1 Hello\n</template>', 'test.jsx'),
      ).toBeUndefined();
    });

    it('should pass through vue files without hsml template', () => {
      const code = '<template><div>Hello</div></template>';
      expect(transform(code, 'test.vue')).toBeUndefined();
    });

    it('should pass through vue files with other template langs', () => {
      const code = '<template lang="pug">\nh1 Hello\n</template>';
      expect(transform(code, 'test.vue')).toBeUndefined();
    });
  });

  describe('template detection', () => {
    it('should match double-quoted lang attribute', () => {
      const result = transform('<template lang="hsml">\nh1 Hello\n</template>', 'test.vue');
      expect(result?.code).toBe('<template><h1>Hello</h1></template>');
    });

    it('should match single-quoted lang attribute', () => {
      const result = transform("<template lang='hsml'>\nh1 Hello\n</template>", 'test.vue');
      expect(result?.code).toBe('<template><h1>Hello</h1></template>');
    });

    it('should match when lang is not the only attribute', () => {
      const result = transform(
        '<template data-test="x" lang="hsml">\nh1 Hello\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe('<template><h1>Hello</h1></template>');
    });

    it('should handle CRLF line endings', () => {
      const result = transform(
        '<template lang="hsml">\r\nh1 Hello\r\np World\r\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe('<template><h1>Hello</h1><p>World</p></template>');
    });
  });

  describe('tags', () => {
    it('should compile a simple tag', () => {
      const result = transform('<template lang="hsml">\nh1 Hello World\n</template>', 'test.vue');
      expect(result?.code).toBe('<template><h1>Hello World</h1></template>');
    });

    it('should compile implicit div with class', () => {
      const result = transform('<template lang="hsml">\n.container Hello\n</template>', 'test.vue');
      expect(result?.code).toBe('<template><div class="container">Hello</div></template>');
    });

    it('should compile implicit div with id', () => {
      const result = transform('<template lang="hsml">\n#app\n</template>', 'test.vue');
      expect(result?.code).toBe('<template><div id="app"/></template>');
    });

    it('should compile self-closing tags', () => {
      const result = transform(
        '<template lang="hsml">\nimg(src="/photo.jpg")\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe('<template><img src="/photo.jpg"/></template>');
    });

    it('should compile nested tags', () => {
      const input = `<template lang="hsml">
div
  h1 Title
  p Content
</template>`;
      const result = transform(input, 'test.vue');
      expect(result?.code).toBe('<template><div><h1>Title</h1><p>Content</p></div></template>');
    });

    it('should compile deeply nested tags', () => {
      const input = `<template lang="hsml">
div
  ul
    li
      a(href="/") Home
</template>`;
      const result = transform(input, 'test.vue');
      expect(result?.code).toBe(
        '<template><div><ul><li><a href="/">Home</a></li></ul></div></template>',
      );
    });

    it('should compile multiple root tags', () => {
      const input = `<template lang="hsml">
h1 Title
p Content
</template>`;
      const result = transform(input, 'test.vue');
      expect(result?.code).toBe('<template><h1>Title</h1><p>Content</p></template>');
    });
  });

  describe('classes', () => {
    it('should compile single class', () => {
      const result = transform('<template lang="hsml">\nh1.title Hello\n</template>', 'test.vue');
      expect(result?.code).toBe('<template><h1 class="title">Hello</h1></template>');
    });

    it('should compile multiple classes', () => {
      const result = transform(
        '<template lang="hsml">\nh1.text-xl.font-bold Hello\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe('<template><h1 class="text-xl font-bold">Hello</h1></template>');
    });

    it('should compile Tailwind variant classes', () => {
      const result = transform(
        '<template lang="hsml">\ndiv.hover:text-red.focus:outline-none\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe(
        '<template><div class="hover:text-red focus:outline-none"/></template>',
      );
    });

    it('should compile Tailwind arbitrary value classes', () => {
      const result = transform('<template lang="hsml">\ndiv.bg-[#1da1f2]\n</template>', 'test.vue');
      expect(result?.code).toBe('<template><div class="bg-[#1da1f2]"/></template>');
    });
  });

  describe('ids', () => {
    it('should compile an id', () => {
      const result = transform('<template lang="hsml">\ndiv#app\n</template>', 'test.vue');
      expect(result?.code).toBe('<template><div id="app"/></template>');
    });

    it('should compile id with classes', () => {
      const result = transform(
        '<template lang="hsml">\nh1#title.text-xl Hello\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe('<template><h1 id="title" class="text-xl">Hello</h1></template>');
    });
  });

  describe('attributes', () => {
    it('should compile simple attributes', () => {
      const result = transform(
        '<template lang="hsml">\nimg(src="/photo.jpg" alt="A photo")\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe('<template><img src="/photo.jpg" alt="A photo"/></template>');
    });

    it('should compile boolean attributes', () => {
      const result = transform(
        '<template lang="hsml">\nbutton(disabled) Click\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe('<template><button disabled>Click</button></template>');
    });

    it('should compile multiline attributes', () => {
      const input = `<template lang="hsml">
img(
  src="/photo.jpg"
  alt="A photo"
  width="300"
)
</template>`;
      const result = transform(input, 'test.vue');
      expect(result?.code).toBe(
        '<template><img src="/photo.jpg" alt="A photo" width="300"/></template>',
      );
    });
  });

  describe('Vue directives', () => {
    it('should compile v-if', () => {
      const result = transform(
        '<template lang="hsml">\ndiv(v-if="show") Content\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe('<template><div v-if="show">Content</div></template>');
    });

    it('should compile v-for with :key', () => {
      const result = transform(
        '<template lang="hsml">\nli(v-for="item in items" :key="item.id") {{ item.name }}\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe(
        '<template><li v-for="item in items" :key="item.id">{{ item.name }}</li></template>',
      );
    });

    it('should compile @event handlers', () => {
      const result = transform(
        '<template lang="hsml">\nbutton(@click="handle") Click\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe('<template><button @click="handle">Click</button></template>');
    });

    it('should compile :bindings', () => {
      const result = transform(
        '<template lang="hsml">\ndiv(:class="{ active: isActive }") Content\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe(
        '<template><div :class="{ active: isActive }">Content</div></template>',
      );
    });

    it('should compile #slot shorthand', () => {
      const result = transform(
        '<template lang="hsml">\ntemplate(#default)\n  p Slot content\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe(
        '<template><template #default><p>Slot content</p></template></template>',
      );
    });

    it('should compile slot tags', () => {
      const result = transform(
        '<template lang="hsml">\nslot(name="header")\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe('<template><slot name="header"/></template>');
    });

    it('should compile v-model', () => {
      const result = transform(
        '<template lang="hsml">\ninput(v-model="name")\n</template>',
        'test.vue',
      );
      expect(result?.code).toBe('<template><input v-model="name"/></template>');
    });
  });

  describe('text', () => {
    it('should compile inline text', () => {
      const result = transform('<template lang="hsml">\np Hello World\n</template>', 'test.vue');
      expect(result?.code).toBe('<template><p>Hello World</p></template>');
    });

    it('should compile text block', () => {
      const input = `<template lang="hsml">
p.
  Line 1
  Line 2
</template>`;
      const result = transform(input, 'test.vue');
      expect(result?.code).toBe('<template><p>Line 1\nLine 2</p></template>');
    });
  });

  describe('comments', () => {
    it('should exclude dev comments from output', () => {
      const input = `<template lang="hsml">
// This is a dev comment
h1 Hello
</template>`;
      const result = transform(input, 'test.vue');
      expect(result?.code).toBe('<template><h1>Hello</h1></template>');
    });

    it('should render native comments', () => {
      const input = `<template lang="hsml">
//! This is a native comment
h1 Hello
</template>`;
      const result = transform(input, 'test.vue');
      expect(result?.code).toBe(
        '<template><!-- This is a native comment --><h1>Hello</h1></template>',
      );
    });
  });

  describe('doctype', () => {
    it('should compile doctype', () => {
      const input = `<template lang="hsml">
doctype html
html
  head
    title Test
</template>`;
      const result = transform(input, 'test.vue');
      expect(result?.code).toBe(
        '<template><!DOCTYPE html><html><head><title>Test</title></head></html></template>',
      );
    });
  });

  describe('SFC integration', () => {
    it('should preserve script and style blocks', () => {
      const input = `<script setup lang="ts">
const msg = 'Hello';
</script>

<template lang="hsml">
h1 {{ msg }}
</template>

<style scoped>
h1 { color: red; }
</style>`;
      const result = transform(input, 'test.vue');
      expect(result?.code).toContain('<script setup lang="ts">\nconst msg = \'Hello\';\n</script>');
      expect(result?.code).toContain('<template><h1>{{ msg }}</h1></template>');
      expect(result?.code).toContain('<style scoped>\nh1 { color: red; }\n</style>');
    });

    it('should not transform regular template blocks', () => {
      const input = `<script setup lang="ts">
const msg = 'Hello';
</script>

<template>
<div>{{ msg }}</div>
</template>`;
      expect(transform(input, 'test.vue')).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw on invalid HSML with error details', () => {
      const input = '<template lang="hsml">\n42invalid\n</template>';
      expect(() => transform(input, 'test.vue')).toThrow(
        /Failed to compile HSML template:/,
      );
    });

    it('should include file id and location on error', () => {
      const input = '<template lang="hsml">\n42invalid\n</template>';
      try {
        transform(input, 'test.vue');
        expect.unreachable('should have thrown');
      } catch (err: any) {
        expect(err.id).toBe('test.vue');
        expect(err.plugin).toBe('vite-plugin-vue-hsml');
        expect(err.loc).toEqual({
          file: 'test.vue',
          line: 2,
          column: 1,
        });
      }
    });

    it('should compute correct line offset with script block', () => {
      const input = `<script setup lang="ts">
const msg = 'Hello';
</script>

<template lang="hsml">
42invalid
</template>`;
      try {
        transform(input, 'test.vue');
        expect.unreachable('should have thrown');
      } catch (err: any) {
        expect(err.loc).toEqual({
          file: 'test.vue',
          line: 6,
          column: 1,
        });
      }
    });
  });

  describe('real-world example', () => {
    it('should compile a complex Vue component template', () => {
      const input = `<template lang="hsml">
div.container
  header.flex.items-center.justify-between.p-4
    h1.text-2xl.font-bold {{ title }}
    nav
      ul.flex.gap-4
        li(v-for="link in links" :key="link.href")
          a.text-blue-500.hover:underline(:href="link.href") {{ link.label }}
  main.p-4
    slot
  footer.p-4.text-gray-500.text-sm
    p &copy; 2025
</template>`;
      const result = transform(input, 'test.vue');
      expect(result?.code).toBe(
        '<template>' +
          '<div class="container">' +
          '<header class="flex items-center justify-between p-4">' +
          '<h1 class="text-2xl font-bold">{{ title }}</h1>' +
          '<nav><ul class="flex gap-4">' +
          '<li v-for="link in links" :key="link.href">' +
          '<a class="text-blue-500 hover:underline" :href="link.href">{{ link.label }}</a>' +
          '</li></ul></nav>' +
          '</header>' +
          '<main class="p-4"><slot/></main>' +
          '<footer class="p-4 text-gray-500 text-sm"><p>&copy; 2025</p></footer>' +
          '</div>' +
          '</template>',
      );
    });
  });
});
