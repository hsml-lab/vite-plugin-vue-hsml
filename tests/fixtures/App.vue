<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
</script>

<template lang="hsml">
div#app
  h1.text-xl.font-bold Hello HSML
  p The count is {{ count }}
  button(@click="count++") Increment
  ul
    li(v-for="i in 3" :key="i") Item {{ i }}
</template>
