<template>
  <div
    class="mb-4 p-4 rounded-lg shadow-md hover:bg-gray-100 cursor-pointer"
    @click="selectPlaylist(playlist)"
  >
    <div class="flex items-center mb-2">
      <img
        src="https://via.placeholder.com/50"
        alt="Playlist"
        class="w-12 h-12 rounded-md mr-2"
      />
      <div>
        <h3 class="text-lg font-bold">{{ playlist.name }}</h3>
        <p class="text-sm text-gray-600">{{ playlist.author }}</p>
      </div>
    </div>
    <p class="text-sm text-gray-600">{{ playlist.songs.length }} canciones</p>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  playlist: Object,
});

const emit = defineEmits(["selectPlaylist"]);

// Emitir evento para seleccionar la playlist
const selectPlaylist = (playlist) => {
  emit("selectPlaylist", playlist);
};
</script>

<style>
/* Estilos de Tailwind CSS según sea necesario */
</style>
