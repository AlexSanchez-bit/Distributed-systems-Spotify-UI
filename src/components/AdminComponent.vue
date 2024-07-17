<template>
  <div class="container mx-auto p-4">
    <div class="flex">
      <!-- Formulario para crear/editar playlists -->
      <div class="w-1/2 mr-4">
        <h2 class="text-2xl font-bold mb-4">Crear/Editar Playlist</h2>
        <!-- Formulario para crear/editar playlist -->
        <form @submit.prevent="submitPlaylist">
          <div class="mb-4">
            <label
              for="playlistName"
              class="block text-sm font-medium text-gray-700"
              >Nombre de la Playlist</label
            >
            <input
              v-model="playlist.title"
              type="text"
              id="playlistName"
              name="playlistName"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
          <div class="mb-4">
            <label
              for="playlistAuthor"
              class="block text-sm font-medium text-gray-700"
              >Autor</label
            >
            <input
              v-model="playlist.author"
              type="text"
              id="playlistAuthor"
              name="playlistAuthor"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
          <h3 class="text-lg font-bold mb-2">Canciones</h3>
          <!-- Componente SongInput para agregar canciones -->
          <SongInput v-model="playlist.songs" />
          <button
            type="submit"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Guardar Playlist
          </button>
        </form>
      </div>
      <!-- Lista de playlists -->
      <div class="w-1/2">
        <h2 class="text-2xl font-bold mb-4">Playlists</h2>
        <!-- Componente Playlist para mostrar playlists existentes -->
        <Playlist
          v-for="playlist in playlists"
          :key="playlist.id"
          :playlist="playlist"
          @selectPlaylist="selectPlaylist"
          @deletedPlaylist="deletedPlaylist"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  get_host_direction,
  fetch_all_playlists,
  get_playlist_by_id,
} from "@/lib/data";
import { ref, reactive, watch, onMounted } from "vue";
import Playlist from "./utils/Playlist.vue";
import SongInput from "./utils/SongInput.vue";

// Datos de ejemplo de playlists
const playlists = ref([]);

onMounted(async () => {
  playlists.value = await fetch_all_playlists(0, 100);
  console.log(playlists.value);
});

// Estado de la playlist actualmente seleccionada para editar
const selectedPlaylist = ref(playlists.value[0]);

const edit = ref(false);

const playlist = reactive({
  title: "",
  author: "",
  songs: [],
  id: null,
});

// Función para seleccionar una playlist y mostrar sus detalles en el formulario
const selectPlaylist = async (newplaylist) => {
  const playl = await get_playlist_by_id(newplaylist.albumId);
  console.log(playl);
  edit.value = true;
  playlist.author = playl.artists[0];
  playlist.title = playl.title;
  playlist.id = playl.albumId;

  playl.songs.forEach((element) => {
    playlist.songs.push({
      author: element.author,
      name: element.name,
      id: element.key.toString(),
    });
  });
};

watch(playlist.songs, (newval, _oldval) => {
  console.log(newval, _oldval, playlist.songs);
});

// Función para guardar una nueva playlist o actualizar una existente
const submitPlaylist = async () => {
  const host = await get_host_direction();
  const { title, songs, author, id } = playlist;
  console.log(playlist, songs);
  if (edit.value) {
    fetch(`${host}/update-playlist`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        author: author,
        songs: songs,
        id: id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Respuesta del servidor:", data);
      })
      .catch((error) => {
        console.error("Hubo un problema con la petición fetch:", error);
      });
  } else {
    fetch(`${host}/add-playlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        author: author,
        songs: songs,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Respuesta del servidor:", data);
      })
      .catch((error) => {
        console.error("Hubo un problema con la petición fetch:", error);
      });
  }
  playlist.title = "";
  playlist.author = "";
  playlist.id = null;
  edit.value = false;

  while (playlist.songs.length > 0) {
    playlist.songs.pop();
  }
};
const deletedPlaylist = (id) => {
  console.log("removing");
  playlists.value = playlists.value.filter((el) => el.albumId != id);
};
</script>

<style>
/* Estilos de Tailwind CSS según sea necesario */
</style>
