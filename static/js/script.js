function togglePanel() {
  const panel = document.getElementById("song-filter-panel");
  panel.classList.toggle("open");

  // Cambiar el texto del botón según el estado del panel
  const button = document.querySelector(".toggle-button");
  button.textContent = panel.classList.contains("open")
    ? "Ocultar Filtros"
    : "Mostrar Filtros";
}

function enableLoad() {
  document.getElementById("load-container").innerHTML = `

    <div class="load_page" id="load-page"> 
<span class="loader"></span>
    </div>

    `;
}

function filterPlaylist(event) {
  console.log("element: ", event.srcElement.value);
  loadPlaylists({
    title: event.srcElement.value,
    author: event.srcElement.value,
    // gender: event.srcElement.value,
  });
}

function disableLoad() {
  try {
    document.getElementById("load-page").remove();
  } catch (err) {}
}

async function filterSong() {
  const name = document.getElementById("songs-filter").value;
  const author = document.getElementById("songs-author-filter").value;
  const gender = document.getElementById("songs-gender").value;
  enableLoad();
  const resp = await (
    await fetch(`/get-all-songs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: 0,
        to: 100,
        filter: { title: name, author, gender },
      }),
    })
  ).json();

  console.log(resp);
  document.getElementById("playlist-name").innerHTML = resp.title;
  loadSongs(resp.songs);
  disableLoad();
}

async function loadPlaylists(params = {}) {
  enableLoad();
  const playlistConstainer = document.getElementById("playlist-container");
  playlistConstainer.innerHTML = "";

  const resp = await (
    await fetch(`/get-all-playlists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: 0, to: 100, filter: params }),
    })
  ).json();

  console.log(resp);
  disableLoad();

  let content = "";
  for (playlist of resp.items) {
    content += `
          <li class="playlist-item" onclick="selectPlaylist(${playlist[0]})" >
                      <span class="playlist-title"> 
                                    ${playlist[1]}
                      </span>
                      <span class="playlist-author"> 
                                    ${playlist[2]}
                      </span>
          </li>
`;
  }

  playlistConstainer.innerHTML = content;
}

async function selectPlaylist(id) {
  let playlist = { id: 1, title: "", author: "", gender: "", songs: [] };
  enableLoad();
  try {
    console.log("buscando: ", id.toString());
    const resp = await (await fetch(`/get-playlist/${id.toString()}`)).json();
    console.log(resp);
    playlist = resp;
    console.log(resp);

    document.getElementById("playlist-name").innerHTML = resp.title;
    loadSongs(resp.songs);
  } catch (e) {
    alert(e.message);
    console.log(e);
  }

  disableLoad();
}

function loadSongs(songs = []) {
  document.getElementById("song-items").innerHTML = "";

  let new_html = "";

  songs.forEach((song) => {
    new_html += `
            <li class="song-item" data-author="${song.author}" data-genre="${song.gender}">
              <h3>${song.name}</h3>
              <p>${song.author}</p>
                      <button onclick="playSong('${song.key}','${song.name}','${song.author}')">Play</button>
            </li>

`;

    document.getElementById("song-items").innerHTML = new_html;
  });
}

/******
 *
 *
 *Player section
 *
 * ***********/

let current_song_id = null;

let audioContext = new (window.AudioContext || window.webkitAudioContext)();

let receivedChunks = {};
let currentSource = null;

let maxReceivedChunk = 0;
let expectedChunkIndex = 0;
let isPlaying = false;
let song_info = null;
let play = false;

function togglePause() {
  if (play) {
    document.getElementById("play-btn").innerHTML = "Play";
    play = false;
  } else {
    document.getElementById("play-btn").innerHTML = "Pause";
    play = true;
    playNextChunk();
  }
}

async function playSong(song, name, author) {
  enableLoad();
  try {
    const resp = await (await fetch(`/get-music-steam/${song}`)).json();
    console.log("playing: ", resp);
    current_song_id = song;
    stopPlayback();

    socket.emit("client_message", {
      song_id: song,
      command: "init_song",
      params: [0, song],
    });

    togglePause();
    document.getElementById("song_name").innerHTML = name;
    document.getElementById("song_artist").innerHTML = author;

    // Escuchar mensajes del servidor
    socket.on(`server_message_${song}`, function (data) {
      console.log("Mensaje recibido del servidor:", data);
      switch (data.command) {
        case "audio_chunk":
          manageAudioStream(data.data);
          break;
        case "song_info":
          song_info = data.data;
          break;
        case "disconnect":
          break;
      }

      // Procesa el mensaje recibido
    });

    socket.on("audio_chunk", manageAudioStream);

    socket.on("song_info", (event) => {
      song_info = event;
      console.log(song_info);
    });
  } catch (e) {}

  disableLoad();
}

function stopPlayback() {
  if (currentSource) {
    currentSource.stop();
  }
  receivedChunks = {};
  expectedChunkIndex = 0;
  maxReceivedChunk = 0;
  if (socket) {
    socket.emit("free_port", socket.id);
  }
}

function manageAudioStream(event) {
  let { index, data } = event;
  console.log(index);
  let arrayBuffer = new Uint8Array(data).buffer;

  maxReceivedChunk = Math.max(maxReceivedChunk, index);

  updateProgress();
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
  if (receivedChunks.hasOwnProperty(expectedChunkIndex) && !isPlaying) {
    if (play) {
      const buffer = receivedChunks[expectedChunkIndex];
      currentSource = audioContext.createBufferSource();
      currentSource.buffer = buffer;
      currentSource.connect(audioContext.destination);
      currentSource.start();
      isPlaying = true;
      delete receivedChunks[expectedChunkIndex];
      expectedChunkIndex++;
      currentSource.onended = function () {
        if (song_info.size <= expectedChunkIndex) {
          stopPlayback();
        }

        isPlaying = false;
        playNextChunk();
        console.log("max chunk", maxReceivedChunk);
        console.log("expected chunk", expectedChunkIndex);
        console.log(
          maxReceivedChunk - expectedChunkIndex,
          "expected max difference",
        );
      };
      if (maxReceivedChunk - expectedChunkIndex < 10) {
        socket.emit("client_message", {
          song_id: current_song_id,
          command: "next_package",
          params: [maxReceivedChunk],
        });
      }
    }
  }
}

// Simulando el progreso del audio y la cantidad descargada
function updateProgress() {
  const progressPlayed = document.querySelector(".progress-played");
  const progressBuffered = document.querySelector(".progress-buffered");

  // Actualizar el progreso del audio
  const playedPercentage = (expectedChunkIndex / song_info.size) * 100;
  progressPlayed.style.width = `${playedPercentage}%`;

  // Actualizar la cantidad descargada
  const bufferedPercentage = (maxReceivedChunk / song_info.size) * 100;
  progressBuffered.style.width = `${bufferedPercentage}%`;
}

function seek(event) {
  const progressContainer = document.querySelector(".progress-container");
  const rect = progressContainer.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const width = rect.width;
  const seekTime = Math.floor((clickX / width) * song_info.size);

  expectedChunkIndex = seekTime;
  maxReceivedChunk = seekTime;
  updateProgress();
  socket.emit("client_message", {
    song_id: current_song_id,
    command: "next_package",
    params: [maxReceivedChunk],
  });
}

/****
 * end player settings
 * ******/

document.addEventListener("DOMContentLoaded", () => {
  loadPlaylists();
  socket.emit("test");
  socket.on("test", () => {
    console.log("respondido a test");
  });
});
