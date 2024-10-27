const genders = ["Rock", "Romance", "Balad", "Pop", "Metal"];
let isModeEdit = false;

function enableEditMode() {
  const editComponent = document.getElementById("mode-edit-cancel");
  editComponent.innerHTML = `
          <button onclick="disableModeEdit()">Cancel</button>
`;
  isModeEdit = true;
}

function disableModeEdit() {
  isModeEdit = false;
  const editComponent = document.getElementById("mode-edit-cancel");
  editComponent.innerHTML = ``;
  songs = [];
  loadSongs();
  document.getElementById("playlist-id").value = Date.now();
  document.getElementById("playlist-title").value = null;
  document.getElementById("playlist-author").value = null;
  document.getElementById("playlist-gender").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  loadPlaylists();
});

function enableLoad() {
  document.getElementById("load-container").innerHTML = `

    <div class="load_page" id="load-page"> 
<span class="loader"></span>
    </div>

    `;
}

function disableLoad() {
  try {
    document.getElementById("load-page").remove();
  } catch (err) {}
}

current_host = null;

isModeEdit = false;

function setEdit(value) {
  isModeEdit = value;
}

let songs = [];

const current_playlist = { id: Date.now(), title: null, author: null };

async function addSong() {
  enableLoad();
  const playlistId = document.getElementById("song-playlist-id").value;
  const name = document.getElementById("song-name").value;
  const author = document.getElementById("song-author").value;
  const gender = document.getElementById("song-gender").value;
  const file = document.getElementById("song-file").files[0];

  if (!file) {
    alert("archivo no reconocido");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  const resp = await (
    await fetch("/upload-song", {
      method: "POST",
      body: formData,
    })
  ).json();

  console.log(resp);
  songs.push({ name: name, author: author, id: resp.filename, gender: gender });

  document.getElementById("song-playlist-id").value = null;
  document.getElementById("song-name").value = null;
  document.getElementById("song-author").value = null;
  document.getElementById("song-gender").value = "Rock";
  document.getElementById("song-file").value = null;

  loadSongs();
  disableLoad();
}

async function removeSong(key) {
  songs = songs.filter((song) => song.key != key);
  loadSongs();
}

async function savePlaylist() {
  enableLoad();
  const id = document.getElementById("playlist-id").value;
  const title = document.getElementById("playlist-title").value;
  const author = document.getElementById("playlist-author").value;
  const gender = document.getElementById("playlist-gender").value;

  try {
    if (isModeEdit) {
      const result = await (
        await fetch("/update-playlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Especifica que estás enviando JSON
          },
          body: JSON.stringify({
            id,
            title,
            author,
            songs,
            gender,
          }),
        })
      ).json();
      console.log(result);
      alert("Playlist editada exitosamente");
    } else {
      console.log("saving: ", {
        id,
        title,
        author,
        songs,
        gender,
      });
      const result = await (
        await fetch("add-playlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Especifica que estás enviando JSON
          },
          body: JSON.stringify({
            id,
            title,
            author,
            songs,
            gender,
          }),
        })
      ).json();
      console.log(result);
      alert("Playlist agregada exitosamente");
    }
    document.getElementById("playlist-id").value = Date.now();
    document.getElementById("playlist-title").value = null;
    document.getElementById("playlist-author").value = null;
    document.getElementById("playlist-gender").value = "";

    songs = [];
    disableLoad();
    loadSongs();
    loadPlaylists();
  } catch (e) {
    alert("Ocurrio un error");
  }
}

async function loadPlaylists(params = {}) {
  // Aquí se haría una llamada AJAX para obtener las playlists del servidor
  // Simulación de datos

  enableLoad();
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
  let playlists = resp.items;

  const container = document.getElementById("playlists-container");
  container.innerHTML = "";

  playlists.forEach((playlist) => {
    const playlistElement = document.createElement("div");
    playlistElement.className = "playlist";
    playlistElement.innerHTML = `
            <strong>${playlist[1]}</strong> by ${playlist[2]}
            <button onclick="editPlaylist(${playlist[0]})">Edit</button>
            <button onclick="deletePlaylist(${playlist[0]})">Delete</button>
        `;
    playlistElement.onclick = () => loadSongs(playlist.id);
    container.appendChild(playlistElement);
  });
  disableLoad();
}

function filterPlaylists() {
  const title = document.getElementById("filter-title").value;
  const author = document.getElementById("filter-author").value;
  const gender = document.getElementById("filter-gender").value;

  loadPlaylists({ title, author, gender });
}

async function editPlaylist(id) {
  enableLoad();
  console.log("buscando", id);
  let playlist = { id: 1, title: "", author: "", gender: "", songs: [] };
  try {
    const resp = await (await fetch(`/get-playlist/${id}`)).json();
    console.log(resp);
    playlist = resp;
    enableEditMode();
  } catch (e) {
    alert(e.message);
    console.log(e);
  }
  disableLoad();

  document.getElementById("playlist-id").value = playlist.id;
  document.getElementById("playlist-title").value = playlist.title;
  document.getElementById("playlist-author").value = playlist.author;
  document.getElementById("playlist-gender").value = playlist.gender;
  songs = playlist.songs;
  loadSongs();
}

async function deletePlaylist(id) {
  alert(id);
  enableLoad();
  const response = await (await fetch(`/remove-playlist/${id}`)).json();
  console.log(response);
  disableLoad();
  loadPlaylists();
}

function loadSongs(playlistId) {
  document.getElementById("song-playlist-id").value = playlistId;

  // Aquí se haría una llamada AJAX para obtener las canciones de la playlist
  // Simulación de datos

  const container = document.getElementById("songs-container");
  container.innerHTML = "";

  songs.forEach((song) => {
    const songElement = document.createElement("div");
    songElement.className = "song";
    songElement.innerHTML = `
            ${song.name} by ${song.author}
            <button class="remove-btn" onclick="removeSong('${song.key}')">Remove</button>
        `;
    container.appendChild(songElement);
  });
}
