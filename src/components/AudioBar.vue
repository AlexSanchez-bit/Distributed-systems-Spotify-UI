<template>
  <div class="w-11/12 bg-zinc-800/40 rounded-full h-2 mt-2 relative">
    <div class="relative h-full w-full py-0.5">
      <div
        class="absolute z-10 top-0 left-0 h-full bg-green-500 rounded-full"
        :style="{ width: `${played * 100}%` }"
      ></div>
      <div
        class="absolute top-0 left-0 h-full bg-gray-300/40 rounded-full"
        :style="{ width: `${downloaded * 100}%` }"
      ></div>
      <div
        class="absolute top-0 left-0 z-10 h-full bg-transparent items-center flex flex-row justify-end rounded-full"
        :style="{ width: `${played * 100}%` }"
      >
        <span
          class="bg-zinc-500 border border-gray-900 p-1 shadow-xl rounded-full"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from "vue";

interface Props {
  played: number;
  downloaded: number;
}

const props = defineProps<Props>();

const { downloaded, played } = toRefs(props);

watch(played, (_new, _old) => {
  console.log(_new);
});
watch(downloaded, (_new, _old) => {
  console.log(_new);
});
</script>

<style scoped>
/* Puedes añadir estilos adicionales si lo deseas */
</style>
