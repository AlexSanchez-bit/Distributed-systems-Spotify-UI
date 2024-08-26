let audioContext = new (window.AudioContext || window.webkitAudioContext)();

let receivedChunks = {};
let currentSource = null;

const maxReceivedChunk = 0;
const expectedChunkIndex = 0;
const isPlaying = false;
const song_info = null;
const play = false;

let socket;

async function setPlay() {
  console.log(playerStore.song_playing);
  if (playerStore.song_playing == null) {
    return;
  }
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  play.value = !play.value;

  playerStore.is_playing = play.value;
  try {
    console.log("buscando cancion");
    const server_direction = "http://127.0.0.1:8081"; //await get_host_direction(); // await get_host_direction();
    console.log(server_direction);
    console.log("buscando cancion 2");
    const resp = await (
      await fetch(
        `${server_direction}/get-song/${playerStore.song_playing.key}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    ).json();
    console.log(resp);
    create_socket(server_direction, resp.socket);
  } catch (err) {
    console.log("error");
    console.log(err.message);
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
  if (socket) {
    socket.emit("free_port", socket.id);
    socket.disconnect();
    socket = null;
  }
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
        "expected max difference",
      );
      if (maxReceivedChunk.value - expectedChunkIndex.value < 3) {
        socket.emit("next_package", maxReceivedChunk.value);
      }
    };
  }
}
