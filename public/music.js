console.log("PKCE destekli music.js yüklendi");

import { clientId, redirectUri, playlistURI } from "./music-config.js";

const scopes = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state"
].join(" ");

let player, deviceId, isPaused = true, accessToken;

/* ---------- PKCE yardımcıları ---------- */
function generateRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const arr   = crypto.getRandomValues(new Uint32Array(length));
  return [...arr].map(x => chars[x % chars.length]).join("");
}

async function generateCodeChallenge(verifier) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
          .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function requestAccessToken(code) {
  const codeVerifier = localStorage.getItem("code_verifier");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier
  });

  const res  = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await res.json();
  return data.access_token;
}

/* ---------- Spotify Player ---------- */
function initializePlayer(token) {
  if (player) return;

  player = new Spotify.Player({
    name: "Web Player",
    getOAuthToken: cb => cb(token),
    volume: 0.8
  });

  player.addListener("ready", ({ device_id }) => {
    deviceId = device_id;
    console.log("Spotify hazır, device:", deviceId);

    /* Ortak playlist’i ilk şarkıdan başlat */
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        context_uri: playlistURI,
        offset: { position: 0 },
        position_ms: 0
      })
    }).catch(err => console.error("Playlist oynatma hatası:", err));
  });

  player.addListener("player_state_changed", state => {
    if (!state) return;
    isPaused = state.paused;
    const playBtn = document.getElementById("playBtn");
    playBtn.innerHTML = isPaused
      ? `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="white"><path d="M8 5v14l11-7z"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" fill="white"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>`;
  });

  /* Hata dinleyicileri */
  ["initialization_error", "authentication_error", "account_error", "playback_error"]
    .forEach(type => player.addListener(type, ({ message }) =>
      alert(`${type.replace("_", " ")}: ${message}`)));

  player.connect();

  /* Şu an çalan şarkıyı her 15 sn’de güncelle */
  fetchCurrentTrack(token);
  setInterval(() => fetchCurrentTrack(token), 15000);
}

/* ---------- DOM Yüklenince ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  const loginBtn   = document.getElementById("loginBtn");
  const controls   = document.getElementById("controls");
  const playBtn    = document.getElementById("playBtn");
  const nextBtn    = document.getElementById("nextBtn");
  const prevBtn    = document.getElementById("prevBtn");
  const suggestBtn = document.getElementById("suggestBtn");
  const songInput  = document.getElementById("songInput");
  const suggestions= document.getElementById("suggestions");

  /* Giriş butonu */
  loginBtn.addEventListener("click", async () => {
    const verifier  = generateRandomString(128);
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem("code_verifier", verifier);

    const authUrl = `https://accounts.spotify.com/authorize?` + new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: scopes,
      code_challenge_method: "S256",
      code_challenge: challenge,
      redirect_uri: redirectUri
    });
    window.location = authUrl;
  });

  /* OAuth redirect sonrası */
  const code = new URLSearchParams(window.location.search).get("code");
  if (code) {
    try {
      accessToken = await requestAccessToken(code);
      window.history.replaceState({}, document.title, redirectUri);
      loginBtn.style.display = "none";
      controls.style.display = "flex";
      if (window.Spotify) initializePlayer(accessToken);
      fetchPlaylistInfo(accessToken);                 // ← Playlist kutusunu getir
    } catch (err) {
      alert("Token alınırken hata oldu 😢");
      console.error(err);
    }
  }

  window.onSpotifyWebPlaybackSDKReady = () => {
    if (accessToken) initializePlayer(accessToken);
  };

  /* Kontrol butonları */
  playBtn.addEventListener("click", () => { if (player) isPaused ? player.resume() : player.pause(); });
  nextBtn.addEventListener("click", () => player?.nextTrack());
  prevBtn.addEventListener("click", () => player?.previousTrack());

  /* Şarkı öneri listesi (isteğe bağlı) */
  suggestBtn.addEventListener("click", () => {
    const song = songInput.value.trim();
    if (!song) return;
    const li = document.createElement("li");
    if (song.startsWith("https://open.spotify.com/")) {
      li.innerHTML = `<a href="${song}" target="_blank" style="color:white;">🎵 Spotify Linki</a>`;
    } else li.textContent = song;
    suggestions.appendChild(li);
    songInput.value = "";
  });
  songInput.addEventListener("keypress", e => { if (e.key === "Enter") suggestBtn.click(); });
});

/* ---------- Şarkı Bilgisi ---------- */
async function fetchCurrentTrack(token) {
  try {
    const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok || res.status === 204) return;
    const data  = await res.json();
    const track = data.item;
    if (!track) return;

    const nowPlaying = document.getElementById("nowPlaying");
    nowPlaying.style.display = "block";
    nowPlaying.innerHTML = `
      <a href="${track.external_urls.spotify}" target="_blank" style="text-decoration:none; color:white;">
        <img src="${track.album.images[0]?.url || ""}" style="width:64px;height:64px;border-radius:8px;margin-bottom:8px;">
        <strong>${track.name}</strong><br><small>${track.artists.map(a => a.name).join(", ")}</small>
      </a>`;
  } catch (err) { console.error("fetchCurrentTrack hata:", err); }
}

/* ---------- Playlist Bilgisi Kutusu ---------- */
async function fetchPlaylistInfo(token) {
  try {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistURI.split(":").pop()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();

    const box = document.createElement("div");
    box.style.textAlign = "center";
    box.style.margin = "20px 0";

    box.innerHTML = `
      <a href="${data.external_urls.spotify}" target="_blank" style="text-decoration:none; color:white;">
        <p style="color:#ccc; font-size:0.9rem;">${data.description || ""}</p>
      </a>`;

    const container = document.querySelector(".container");
    container.insertBefore(box, container.children[1]); // Başlığın hemen altına
  } catch (err) { console.error("fetchPlaylistInfo hata:", err); }
}

