[![NPM](https://img.shields.io/npm/v/vite-plugin-vue-hsml.svg)](https://www.npmjs.com/package/vite-plugin-vue-hsml)
[![Downloads](https://img.shields.io/npm/dt/vite-plugin-vue-hsml.svg)](https://www.npmjs.com/package/vite-plugin-vue-hsml)
[![CI](https://github.com/hsml-lab/vite-plugin-vue-hsml/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/hsml-lab/vite-plugin-vue-hsml/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/hsml-lab/vite-plugin-vue-hsml/branch/main/graph/badge.svg)](https://codecov.io/gh/hsml-lab/vite-plugin-vue-hsml)
[![License: MIT](https://img.shields.io/github/license/hsml-lab/vite-plugin-vue-hsml.svg)](https://github.com/hsml-lab/vite-plugin-vue-hsml/blob/main/LICENSE)
[![Donate: PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.com/donate?hosted_button_id=L7GY729FBKTZY)

# vite-plugin-vue-hsml

Use [HSML](https://github.com/hsml-lab/hsml) in your Vue Single File Components. Write less markup, ship faster.

> Still early — tracking [hsml](https://github.com/hsml-lab/hsml) as it stabilizes.

## What it does

This plugin lets you use `<template lang="hsml">` in Vue SFCs. At build time, HSML is compiled to HTML before Vue processes the template — zero runtime cost.

```vue
<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
</script>

<template lang="hsml">
div
  h1.text-xl.font-bold Hello World
  button(@click="count++") Count is {{ count }}
  .card
    p.text-gray-500 Nice to meet you!
</template>
```

Compiles to:

```vue
<template>
  <div>
    <h1 class="text-xl font-bold">Hello World</h1>
    <button @click="count++">Count is {{ count }}</button>
    <div class="card">
      <p class="text-gray-500">Nice to meet you!</p>
    </div>
  </div>
</template>
```

<details>
<summary><b>Real-world example</b> — 20% fewer characters, 47% fewer lines in the template</summary>

Based on [elk-zone/elk `MainContent.vue`](https://github.com/elk-zone/elk/blob/main/app/components/main/MainContent.vue).

### HSML

```vue
<script setup lang="ts">
const { back = false } = defineProps<{
  /**
   * Should we show a back button?
   * Note: this will be forced to false on xl screens to avoid duplicating the sidebar's back button.
   */
  back?: boolean | 'small-only';
  /** Show the back button on small screens */
  backOnSmallScreen?: boolean;
  /** Do not applying overflow hidden to let use floatable components in title */
  noOverflowHidden?: boolean;
}>();

const container = ref();
const route = useRoute();
const userSettings = useUserSettings();
const { height: windowHeight } = useWindowSize();
const { height: containerHeight } = useElementBounding(container);
const wideLayout = computed(() => route.meta.wideLayout ?? false);
const sticky = computed(() => route.path?.startsWith('/settings/'));
const containerClass = computed(() => {
  // we keep original behavior when not in settings page and when the window height is smaller than the container height
  if (!isHydrated.value || !sticky.value || windowHeight.value < containerHeight.value) return null;

  return 'lg:sticky lg:top-0';
});

const showBackButton = computed(() => {
  switch (back) {
    case 'small-only':
      return isSmallOrMediumScreen.value;
    case true:
      return !isExtraLargeScreen.value;
    default:
      return false;
  }
});
</script>

<template lang="hsml">
div(ref="container" :class="containerClass")
  .sticky.top-0.z-20(
    pt="[env(safe-area-inset-top,0)]"
    bg="[rgba(var(--rgb-bg-base),0.7)]"
    :class="{
      'backdrop-blur': !getPreferences(userSettings, 'optimizeForLowPerformanceDevice'),
    }"
  )
    .min-h-53px.px-2.py-1(flex="~ justify-between" :class="{ 'xl:hidden': $route.name !== 'tag' }" border="b base")
      .w-full(flex="~ items-center")
        button.btn-text.flex.items-center.p-3.xl:hidden(
          v-if="backOnSmallScreen || showBackButton"
          :aria-label="$t('nav.back')"
          @click="$router.go(-1)"
        )
          .text-lg.rtl-flip(i-ri:arrow-left-line)
        .flex.w-full
          slot(name="title")
        .sm:hidden.h-7.w-1px
      .px-3(flex="~ items-center shrink-0 gap-x-2")
        slot(name="actions")
        PwaBadge.xl:hidden
        NavUser(v-if="isHydrated")
        NavUserSkeleton(v-else)
    slot(name="header")
      div(hidden)
  PwaInstallPrompt.xl:hidden
  .m-auto(:class="isHydrated && wideLayout ? 'xl:w-full sm:max-w-600px' : 'sm:max-w-600px md:shrink-0'")
    .h-6(hidden :class="{ 'xl:block': $route.name !== 'tag' && !$slots.header }")
    slot
</template>
```

### Equivalent HTML

> **Note:** This example uses [UnoCSS Attributify Mode](https://unocss.dev/presets/attributify), where utility classes appear as individual attributes. The basic example above shows standard `class` attribute output.

```vue
<!-- script block would be same -->

<template>
  <div ref="container" :class="containerClass">
    <div
      sticky
      top-0
      z-20
      pt="[env(safe-area-inset-top,0)]"
      bg="[rgba(var(--rgb-bg-base),0.7)]"
      :class="{
        'backdrop-blur': !getPreferences(userSettings, 'optimizeForLowPerformanceDevice'),
      }"
    >
      <div
        flex="~ justify-between"
        min-h-53px
        px-2
        py-1
        :class="{ 'xl:hidden': $route.name !== 'tag' }"
        border="b base"
      >
        <div flex="~ items-center" w-full>
          <button
            v-if="backOnSmallScreen || showBackButton"
            btn-text
            flex
            items-center
            p-3
            xl:hidden
            :aria-label="$t('nav.back')"
            @click="$router.go(-1)"
          >
            <div text-lg i-ri:arrow-left-line class="rtl-flip" />
          </button>
          <div flex w-full>
            <slot name="title" />
          </div>
          <div sm:hidden h-7 w-1px />
        </div>
        <div flex="~ items-center shrink-0 gap-x-2" px-3>
          <slot name="actions" />
          <PwaBadge xl:hidden />
          <NavUser v-if="isHydrated" />
          <NavUserSkeleton v-else />
        </div>
      </div>
      <slot name="header">
        <div hidden />
      </slot>
    </div>
    <PwaInstallPrompt xl:hidden />
    <div
      :class="isHydrated && wideLayout ? 'xl:w-full sm:max-w-600px' : 'sm:max-w-600px md:shrink-0'"
      m-auto
    >
      <div hidden :class="{ 'xl:block': $route.name !== 'tag' && !$slots.header }" h-6 />
      <slot />
    </div>
  </div>
</template>
```

</details>

## Installation

```sh
npm install -D vite-plugin-vue-hsml
# or
pnpm add -D vite-plugin-vue-hsml
# or
bun add -D vite-plugin-vue-hsml
```

## Setup

Add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueHsml from 'vite-plugin-vue-hsml';

export default defineConfig({
  plugins: [vueHsml(), vue()],
});
```

That's it. Any `<template lang="hsml">` block will be compiled automatically.

## HSML syntax at a glance

```hsml
// Tags (div is the default when only class/id is used)
h1 Hello World
.container
  .card Hello

// Classes and IDs
h1#title.text-red.font-bold Hello

// Attributes
img(src="/photo.jpg" alt="A photo")
a(href="https://example.com" target="_blank") Link

// Multiline attributes
button(
  @click="handleClick"
  :disabled="loading"
  class="btn btn-primary"
) Submit

// Vue directives work as-is
div(v-if="show")
  ul
    li(v-for="item in items" :key="item.id") {{ item.name }}
```

For the full syntax reference, see the [HSML documentation](https://github.com/hsml-lab/hsml#hsml-syntax).

## Requirements

- Node.js >= 22
- Vite ^6.4.1 || ^7.1.11 || ^8.0.0

## License

[MIT](LICENSE)
