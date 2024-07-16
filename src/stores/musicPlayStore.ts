import { defineStore } from "pinia";
import { ref } from "vue";

export const usePlayerStore = defineStore("player", () => {
  const song_playing = ref(null);

  return { song_playing };
});
