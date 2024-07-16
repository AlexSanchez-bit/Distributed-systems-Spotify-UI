<template>
  <div class="spotify-player">
    <img :src="track.albumCover" :alt="track.album" class="album-cover" />
    <div class="track-info">
      <h3 class="track-name">{{ track.name }}</h3>
      <p class="artist-name">{{ track.artist }}</p>
    </div>
    <button @click="togglePlay" class="play-button">
      <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  track: {
    type: Object,
    required: true,
    default: () => ({
      name: "Nombre de la canción",
      artist: "Artista",
      album: "Álbum",
      albumCover: "https://via.placeholder.com/300",
      spotifyUri: "spotify:track:1234567890",
    }),
  },
});

const isPlaying = ref(false);

const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  // Aquí iría la lógica para reproducir/pausar la canción usando el SDK de Spotify
  console.log(
    `${isPlaying.value ? "Reproduciendo" : "Pausando"} ${props.track.name}`,
  );
};
</script>

<style scoped>
.spotify-player {
  display: flex;
  align-items: center;
  background-color: #282828;
  color: white;
  padding: 10px;
  border-radius: 8px;
  width: 300px;
}

.album-cover {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 10px;
}

.track-info {
  flex-grow: 1;
}

.track-name {
  margin: 0;
  font-size: 16px;
}

.artist-name {
  margin: 0;
  font-size: 14px;
  color: #b3b3b3;
}

.play-button {
  background-color: #1db954;
  border: none;
  border-radius: 50%;
  color: white;
  width: 40px;
  height: 40px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button:hover {
  transform: scale(1.05);
}
</style>
