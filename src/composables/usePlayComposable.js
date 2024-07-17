import { get_host_direction } from "@/lib/data";
import { io } from "socket.io-client";
import { server } from "typescript";
import { ref, watch, computed } from "vue";

export function usePlayerState() {
  const current_song = ref(0);

  let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let receivedChunks = {};
  let currentSource = null;

  const maxReceivedChunk = ref(0);
  const expectedChunkIndex = ref(0);
  const isPlaying = ref(false);
  const song_info = ref(null);
  const play = ref(false);

  let socket;
  let port;

  async function setPlay() {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    play.value = !play.value;
    try {
      console.log("buscando cancion");
      const server_direction = await get_host_direction();
      console.log(server_direction);
      const resp = await (
        await fetch(`${server_direction}/get-song/${current_song.value.key}`)
      ).json();
      console.log(resp);
      create_socket(server_direction + resp.port);
    } catch (err) {
      console.log("error");
      console.log(err);
    }
  }

  function stopPlayback() {
    if (currentSource) {
      currentSource.stop();
    }
    play.value = false;
    receivedChunks = {};
    expectedChunkIndex.value = 0;
    maxReceivedChunk.value = 0;
    socket.emit("free_port", binding_dir);
    socket = null;
  }

  watch(play, async (_new, old) => {});

  function manageAudioStream(event) {
    let { index, data } = event;
    console.log(index);
    let arrayBuffer = new Uint8Array(data).buffer;

    maxReceivedChunk.value = Math.max(maxReceivedChunk.value, index);

    audioContext.decodeAudioData(
      arrayBuffer,
      function (buffer) {
        receivedChunks[index] = buffer;
        playNextChunk();
      },
      function (e) {
        console.error("Error decoding audio data", e);
      },
    );
  }

  function playNextChunk() {
    if (
      receivedChunks.hasOwnProperty(expectedChunkIndex.value) &&
      !isPlaying.value
    ) {
      const buffer = receivedChunks[expectedChunkIndex.value];
      currentSource = audioContext.createBufferSource();
      currentSource.buffer = buffer;
      currentSource.connect(audioContext.destination);
      currentSource.start();
      isPlaying.value = true;
      delete receivedChunks[expectedChunkIndex.value];
      expectedChunkIndex.value++;
      currentSource.onended = function () {
        if (song_info.value.size <= expectedChunkIndex.value) {
          stopPlayback();
        }

        isPlaying.value = false;
        playNextChunk();
        console.log("max chunk", maxReceivedChunk.value);
        console.log("expected chunk", expectedChunkIndex.value);
        console.log(
          maxReceivedChunk.value - expectedChunkIndex.value,
          "expected max diference",
        );
        if (maxReceivedChunk.value - expectedChunkIndex.value < 3) {
          socket.emit("next_package", maxReceivedChunk.value);
        }
      };
    }
  }

  function create_socket(binding_dir) {
    console.log(binding_dir);

    console.log("enlazando socket");
    socket = io(binding_dir);
    port = binding_dir;

    socket.emit("init_song", expectedChunkIndex.value);

    socket.on("audio_chunk", manageAudioStream);

    socket.on("song_info", (event) => {
      song_info.value = event;
    });

    socket.on("connect", () => {
      console.log(socket.id); // x8WIv7-mJelg7on_ALbx
      socket.emit("message", "holaaaa desde vuex2");
    });

    socket.on("disconnect", () => {
      console.log("conexion perdida"); // undefined
      setPlay();
    });
  }

  const played = computed(() => {
    return (
      expectedChunkIndex.value / (song_info.value ? song_info.value.size : 1)
    );
  });

  const downloaded = computed(() => {
    return (
      maxReceivedChunk.value / (song_info.value ? song_info.value.size : 1)
    );
  });

  return { play, setPlay, played, downloaded, current_song };
}
