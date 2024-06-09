import { io } from "socket.io-client";
import { ref, watch } from "vue";
export function usePlayerState() {
  let audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let receivedChunks = {};
  let expectedChunkIndex = 0;
  let currentSource = null;

  const isPlaying = ref(false);
  const song_info = ref(null);
  const play = ref(false);

  async function setPlay(params) {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    play.value = !play.value;
    try {
      console.log("buscando cancion");
      const resp = await (
        await fetch("http://localhost:5000/get-song/1")
      ).json();
      console.log(resp);
      create_socket("http://localhost:" + resp.port);
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
    expectedChunkIndex = 0;
  }

  watch(play, async (_new, old) => {});

  function manageAudioStream(event) {
    let { index, data } = event;
    console.log(index);
    let arrayBuffer = new Uint8Array(data).buffer;

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
    if (receivedChunks.hasOwnProperty(expectedChunkIndex) && !isPlaying.value) {
      const buffer = receivedChunks[expectedChunkIndex];
      currentSource = audioContext.createBufferSource();
      currentSource.buffer = buffer;
      currentSource.connect(audioContext.destination);
      currentSource.start();
      isPlaying.value = true;
      delete receivedChunks[expectedChunkIndex];
      expectedChunkIndex++;

      currentSource.onended = function () {
        console.log(song_info.value.size, expectedChunkIndex);
        if (song_info.value.size <= expectedChunkIndex) {
          console.log("finish");
          stopPlayback();
        }

        isPlaying.value = false;
        playNextChunk();
      };
    }
  }

  function create_socket(binding_dir) {
    console.log(binding_dir);

    console.log("enlazando socket");
    const socket = io(binding_dir);

    expectedChunkIndex = 0;
    socket.emit("init_song", 0);

    socket.on("audio_chunk", manageAudioStream);

    socket.on("song_info", (event) => {
      song_info.value = event;
    });

    socket.on("audio_end", () => {
      socket.emit("free_port", 1234);
    });

    socket.on("connect", () => {
      console.log(socket.id); // x8WIv7-mJelg7on_ALbx
      socket.emit("message", "holaaaa desde vuex2");
    });

    socket.on("disconnect", () => {
      console.log("conexion perdida"); // undefined
      alert("conexion perdida");
    });
  }

  return { play, setPlay };
}
