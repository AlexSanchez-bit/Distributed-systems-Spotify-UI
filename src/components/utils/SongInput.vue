<template>
  <div>
    <div
      v-for="(song, index) in songs"
      :key="index"
      class="flex items-center mb-2"
    >
      <div class="w-1/3">
        <label
          :for="'songName-' + index"
          class="block text-sm font-medium text-gray-700"
          >Nombre de la Canción</label
        >
        <input
          v-model="song.name"
          :id="'songName-' + index"
          :name="'songName-' + index"
          type="text"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </div>
      <div class="w-1/3 ml-2">
        <label
          :for="'songAuthor-' + index"
          class="block text-sm font-medium text-gray-700"
          >Autor</label
        >
        <input
          v-model="song.author"
          :id="'songAuthor-' + index"
          :name="'songAuthor-' + index"
          type="text"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </div>
      <div class="w-1/3 ml-2">
        <label
          :for="'songFile-' + index"
          class="block text-sm font-medium text-gray-700"
          >Archivo de Audio</label
        >
        <input
          type="file"
          @change="(event) => handleFileUpload(event, index)"
          :id="'songFile-' + index"
          :name="'songFile-' + index"
          accept="audio/mp3"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
      </div>
      <div class="ml-2">
        <button
          @click="removeSong(index)"
          type="button"
          class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Eliminar
        </button>
      </div>
    </div>
    <div class="mt-4">
      <button
        @click="addSong"
        type="button"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Agregar Canción
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: Array,
});

const emit = defineEmits(["update:modelValue"]);

const songs = ref(props.modelValue || []);

// Agregar una nueva canción al arreglo de canciones
const addSong = () => {
  songs.value.push({ name: "", author: "", id: null });
};

// Eliminar una canción del arreglo de canciones
const removeSong = (index) => {
  songs.value.splice(index, 1);
};

// Emitir evento con el arreglo actualizado de canciones al componente padre
const emitChange = () => {
  emit("update:modelValue", songs.value);
};

// Observador para emitir cambios cuando se actualiza el arreglo de canciones
watch(songs, () => {
  emitChange();
});

const file = ref(null);

// Manejar el cambio de archivo en el input
const handleFileUpload = async (event, index) => {
  file.value = event.target.files[0];
  await uploadFile(index);
};

// Enviar el archivo al servidor
const uploadFile = async (index) => {
  if (!file.value) {
    console.error("No se ha seleccionado ningún archivo.");
    return;
  }

  console.log(file.value);
  const formData = new FormData();
  formData.append("file", file.value);

  try {
    const response = await fetch("http://localhost:8081/upload-file", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    console.log(response);
    const data = await response.text();
    console.log(data);
    songs.value[index].id = data;
    console.log("Respuesta del servidor:", data);
  } catch (error) {
    console.error("Hubo un problema con la petición fetch:", error);
  }
};
</script>

<style>
/* Estilos de Tailwind CSS según sea necesario */
</style>
