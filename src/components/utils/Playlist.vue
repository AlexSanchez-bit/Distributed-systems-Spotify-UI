<template>
  <div class="mb-4 p-4 rounded-lg shadow-md hover:bg-gray-100 cursor-pointer">
    <div class="flex items-center mb-2">
      <img
        src="https://via.placeholder.com/50"
        alt="Playlist"
        class="w-12 h-12 rounded-md mr-2"
        @click="selectPlaylist(playlist)"
      />
      <div @click="selectPlaylist(playlist)">
        <h3 class="text-lg font-bold">{{ playlist.title }}</h3>
        <p class="text-sm text-gray-600">{{ playlist.artists.join(",") }}</p>
      </div>
    </div>
    <button
      @click="removeSong(playlist.id)"
      type="button"
      class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      Eliminar
    </button>
    <p class="text-sm text-gray-600">{{ playlist.songs?.length }} canciones</p>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { get_host_direction, playlists } from "@/lib/data";
const props = defineProps({
  playlist: Object,
});

const emit = defineEmits(["selectPlaylist", "deletedPlaylist"]);

// Emitir evento para seleccionar la playlist
const selectPlaylist = (playlist) => {
  emit("selectPlaylist", playlist);
};

const removeSong = async (id) => {
  console.log(id);
  const host = await get_host_direction();
  fetch(`${host}/delete-playlist/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Respuesta del servidor:", data);
      emit("deletedPlaylist", id);
    })
    .catch((error) => {
      console.error("Hubo un problema con la petición fetch:", error);
    });
};
</script>

<style>
/* Estilos de Tailwind CSS según sea necesario */
</style>
