<p>
  <a href="https://www.npmjs.com/package/vite-plugin-vue-hsml" target="_blank">
    <img alt="NPM package" src="https://img.shields.io/npm/v/vite-plugin-vue-hsml.svg">
  </a>
  <a href="https://www.npmjs.com/package/vite-plugin-vue-hsml" target="_blank">
    <img alt="Downloads" src="https://img.shields.io/npm/dt/vite-plugin-vue-hsml.svg">
  </a>
  <a href="https://github.com/Shinigami92/vite-plugin-vue-hsml/actions/workflows/ci.yml">
    <img alt="Build Status" src="https://github.com/Shinigami92/vite-plugin-vue-hsml/actions/workflows/ci.yml/badge.svg?branch=main">
  </a>
  <a href="https://github.com/Shinigami92/vite-plugin-vue-hsml/blob/main/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/github/license/Shinigami92/vite-plugin-vue-hsml.svg">
  </a>
  <a href="https://www.paypal.com/donate?hosted_button_id=L7GY729FBKTZY" target="_blank">
    <img alt="Donate: PayPal" src="https://img.shields.io/badge/Donate-PayPal-blue.svg">
  </a>
</p>

# UNDER CONSTRUCTION

Right now there is no stable version of `hsml` available. I'm just working on it.

<img src="https://chronicle-brightspot.s3.amazonaws.com/6a/c4/00e4ab3143f7e0cf4d9fd33aa00b/constructocat2.jpg" width="400px" />

# vite-plugin-vue-hsml

[hsml](https://github.com/Shinigami92/hsml) is a hyper short markup language that is inspired by [pug](https://pugjs.org) (aka jade).

This plugin allows you to use `hsml` in Vue SFCs.

## Example

```vue
<script setup lang="ts">
defineProps<{
  /** Show the back button on small screens */
  backOnSmallScreen?: boolean;
  /** Show the back button on both small and big screens */
  back?: boolean;
  /** Do not applying overflow hidden to let use floatable components in title */
  noOverflowHidden?: boolean;
}>();

const container = ref();
const route = useRoute();
const { height: windowHeight } = useWindowSize();
const { height: containerHeight } = useElementBounding(container);
const wideLayout = computed(() => route.meta.wideLayout ?? false);
const sticky = computed(() => route.path?.startsWith('/settings/'));
const containerClass = computed(() => {
  // we keep original behavior when not in settings page and when the window height is smaller than the container height
  if (!isHydrated.value || !sticky.value || windowHeight.value < containerHeight.value) return null;

  return 'lg:sticky lg:top-0';
});
</script>

<template lang="hsml">
div(ref="container" :class="containerClass")
  .sticky.top-0.z10.backdrop-blur.native:lg:w-[calc(100vw-5rem)].native:xl:w-[calc(135%+(100vw-1200px)/2)](
    pt="[env(safe-area-inset-top,0)]"
    bg="[rgba(var(--rgb-bg-base),0.7)]"
  )
    .flex.justify-between.px5.py2.native:xl:flex(:class="{ 'xl:hidden': $route.name !== 'tag' }" border="b base")
      .flex.gap-3.items-center.py2.w-full(:overflow-hidden="!noOverflowHidden ? '' : false")
        NuxtLink.items-center.btn-text.p-0.xl:hidden(
          v-if="backOnSmallScreen || back"
          flex="~ gap1"
          :aria-label="$t('nav.back')"
          @click="$router.go(-1)"
        )
          .rtl-flip(i-ri:arrow-left-line)
        .flex.w-full.native-mac:justify-center.native-mac:text-center.native-mac:sm:justify-start(
          :truncate="!noOverflowHidden ? '' : false"
          data-tauri-drag-region
        )
          slot(name="title")
        .sm:hidde.nh-7.w-1px
      .flex.items-center.flex-shrink-0.gap-x-2
        slot(name="actions")
        PwaBadge.lg:hidden
        NavUser(v-if="isHydrated")
        NavUserSkeleton(v-else)
    slot(name="header")
      div(hidden)
  PwaInstallPrompt.lg:hidden
  .m-auto(:class="isHydrated && wideLayout ? 'xl:w-full sm:max-w-600px' : 'sm:max-w-600px md:shrink-0'")
    .h-6(hidden :class="{ 'xl:block': $route.name !== 'tag' && !$slots.header }")
    slot
</template>
```
