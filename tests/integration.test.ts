import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { build, type Plugin } from 'vite';
import { describe, expect, it } from 'vitest';
import vueHsml from '../src';

function captureTransform(): Plugin & { result: string | undefined } {
  const plugin: Plugin & { result: string | undefined } = {
    name: 'capture-transform',
    enforce: 'pre',
    result: undefined,
    transform(code, id) {
      if (id.endsWith('App.vue')) {
        plugin.result = code;
      }
    },
  };
  return plugin;
}

describe('integration', () => {
  it('should build a Vue app with hsml templates', async () => {
    const capture = captureTransform();

    const result = await build({
      root: resolve(import.meta.dirname, 'fixtures'),
      plugins: [vueHsml(), capture, vue()],
      build: {
        write: false,
        rollupOptions: {
          input: resolve(import.meta.dirname, 'fixtures/entry.ts'),
        },
      },
      logLevel: 'silent',
    });

    // Verify the HSML template was compiled to HTML before Vue processes it
    expect(capture.result).toContain(
      '<template>'
        + '<div id="app">'
        + '<h1 class="text-xl font-bold">Hello HSML</h1>'
        + '<p>The count is {{ count }}</p>'
        + '<button @click="count++">Increment</button>'
        + '<ul>'
        + '<li v-for="i in 3" :key="i">Item {{ i }}</li>'
        + '</ul>'
        + '</div>'
        + '</template>',
    );

    // Verify the build succeeded and produced output
    const output = Array.isArray(result) ? result[0]! : result;
    expect('output' in output).toBe(true);
    if (!('output' in output)) return;
    const chunk = output.output.find(
      (o: { type: string }) => o.type === 'chunk' && 'isEntry' in o && o.isEntry,
    );
    expect(chunk).toBeDefined();
  });
});
