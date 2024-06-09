<template>
  <div
    className="flex flex-row justify-between items-center h-full w-full px-4 z-50"
  >
    <div>...Current Song</div>
    <button @click="setPlay" class="bg-white rounded-full p-4 text-black">
      <Play v-if="!play" />
      <Pause v-else />
    </button>
    <div>Volumen</div>
  </div>
</template>

<script setup lang="ts">
import Play from "../icons/Play.vue";
import Pause from "../icons/Pause.vue";

import { usePlayerState } from "../composables/usePlayComposable";

const { play, setPlay } = usePlayerState();
</script>
