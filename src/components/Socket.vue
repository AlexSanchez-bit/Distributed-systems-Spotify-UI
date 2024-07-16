<template>
  <div class="flex flex-col gap-3 items-center">
    <AudioBar class="flex-1" :played="played" :downloaded="downloaded" />
    <div
      className="flex flex-row transition-all duration-75 justify-between items-center h-full w-full px-4 z-50"
    >
      <div>{{ songStore.song_playing ?? "" }}</div>
      <button @click="setPlay" class="bg-white rounded-full p-4 text-black">
        <Play v-if="!play" />
        <Pause v-else />
      </button>
      <div>Volumen</div>
    </div>
    <ProgressBar :value="value"></ProgressBar>
  </div>
</template>

<script setup lang="ts">
import ProgressBar from "primevue/progressbar";

import Play from "../icons/Play.vue";
import Pause from "../icons/Pause.vue";
import AudioBar from "./AudioBar.vue";

import { usePlayerState } from "../composables/usePlayComposable";
import { usePlayerStore } from "@/stores/musicPlayStore";
const songStore = usePlayerStore();

const { play, setPlay, played, downloaded } = usePlayerState();
</script>
