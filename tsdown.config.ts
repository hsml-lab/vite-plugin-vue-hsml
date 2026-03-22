import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  clean: true,
  format: 'esm',
  target: 'node22',
  dts: true,
  sourcemap: true,
  fixedExtension: false,
  publint: true,
  exports: true,
});
