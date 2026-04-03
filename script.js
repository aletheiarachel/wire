let hasPassedMoodGate = false;
const launcherScreen = document.getElementById('launcherScreen');
const appScreen = document.getElementById('appScreen');
const enterAppBtn = document.getElementById('enterAppBtn');

const menuLinks = document.querySelectorAll('.menu-link');
const playlistCards = document.querySelectorAll('.playlist-card');
const trackRows = document.querySelectorAll('.track-row');

const contentArea = document.getElementById('contentArea') || document.querySelector('.content');

const nowTitle = document.getElementById('nowTitle');
const nowArtist = document.getElementById('nowArtist');
const nowCoverShape = document.getElementById('nowCoverShape');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressFill = document.getElementById('progressFill');
const currentTime = document.getElementById('currentTime');
const durationTime = document.getElementById('durationTime');
const progressTrack =
  document.getElementById('progressTrack') ||
  document.querySelector('.progress-track');

const audioEl = document.getElementById('audioPlayer');

let currentRoute = 'about';
let currentTrackKey = null;
let currentMoodKey = null;
let currentQueue = [];
let isPlaying = false;

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function getRoutes() {
  return qsa('.route');
}

const musicTracks = {
  'sh-alleen': {
    title: 'Alleen',
    artist: 'Secret Hideaway',
    audio: 'Alleen.mp3',
    image: 'Alleen.jpg'
  },
  'sh-melukis': {
    title: 'Melukis Obituari',
    artist: 'Secret Hideaway',
    audio: 'Melukis Obituari.mp3',
    image: 'Melukis Obituari.jpg'
  },
  'sh-try': {
    title: 'Try Again',
    artist: 'Secret Hideaway',
    audio: 'Try Again.mp3',
    image: 'Try Again.jpg'
  },
  'sh-hideaway': {
    title: 'Hideaway',
    artist: 'Secret Hideaway',
    audio: 'Hideaway.mp3',
    image: 'Hideaway.jpg'
  },
  'sh-ever': {
    title: 'Ever',
    artist: 'Arteeich',
    audio: 'Ever.mp3',
    image: 'Ever.jpg'
  },
  'sh-u': {
    title: 'U',
    artist: 'Arteeich',
    audio: 'U.mp3',
    image: 'U.jpg'
  },
  'sh-sike': {
    title: 'Sike',
    artist: 'Arteeich',
    audio: 'Sike.mp3',
    image: 'Sike.jpg'
  },
  'sh-fool': {
    title: 'Fool',
    artist: 'Arteeich',
    audio: 'fool.mp3',
    image: 'fool.jpg'
  },
  'sh-fine': {
    title: 'Fine',
    artist: 'Arteeich',
    audio: 'Fine.mp3',
    image: 'fool.jpg'
  },
  'jz-aku': {
    title: 'Aku, Kau, dan Musik',
    artist: 'JUZZER',
    audio: 'Aku Kau Dan Musik.mp3',
    image: 'Aku Kau Dan Musik.jpg'
  },
  'jz-buku': {
    title: 'Buku Pesta Cinta',
    artist: 'JUZZER',
    audio: 'Buku Pesta Cinta.mp3',
    image: 'Buku Pesta Cinta.jpg'
  },
  'jz-apakah': {
    title: 'Apakah Aku Harus Berubah Menjadi Perempuan',
    artist: 'JUZZER',
    audio: 'Apakah Aku Harus Berubah Menjadi Perempuan.mp3',
    image: 'Buku Pesta Cinta.jpg'
  },
  'jz-asam': {
    title: 'Asam Manis',
    artist: 'JUZZER',
    audio: 'Asam Manis.mp3',
    image: 'Buku Pesta Cinta.jpg'
  },
  'jz-hey': {
    title: 'Hey Kau Gadis Nan Jauh Di Sana (Live)',
    artist: 'JUZZER',
    audio: 'Hey Kau Gadis Nan Jauh Di Sana (Live).mp3',
    image: 'Hey Kau Gadis Nan Jauh Di Sana (Live).jpg'
  },
  'jz-malam': {
    title: 'Malam Yang Gulita',
    artist: 'JUZZER',
    audio: 'Malam Yang Gulita.mp3',
    image: 'Malam Yang Gulita.jpg'
  },
  'jz-romansa': {
    title: 'Romansa Akhir Pekan',
    artist: 'JUZZER',
    audio: 'Romansa Akhir Pekan.mp3',
    image: 'Romansa Akhir Pekan.jpg'
  }
};

const musicPlaybackOrder = Object.keys(musicTracks);

const moodPlaylists = {
  chill: ['sh-ever', 'sh-fine', 'sh-hideaway'],
  'get-up': ['jz-aku', 'sh-sike', 'sh-u'],
  rage: ['jz-apakah', 'jz-asam', 'sh-try'],
  'feeling-blue': ['sh-alleen', 'sh-melukis', 'jz-malam']
};

const moodMap = {
  excited: ['jz-aku', 'sh-sike', 'sh-u'],
  sensitive: ['sh-alleen', 'sh-melukis', 'sh-hideaway'],
  stressed: ['jz-asam', 'sh-try', 'jz-romansa'],
  bored: ['sh-ever', 'sh-fine', 'jz-buku'],
  angry: ['jz-apakah', 'jz-malam', 'sh-try'],
  hurt: ['sh-alleen', 'sh-hideaway', 'jz-romansa']
};

function formatTime(value) {
  if (!isFinite(value)) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function getRandomMoodTrack(moodName) {
  const list = moodMap[moodName] || [];
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

function getTrackImageNode(trackKey) {
  const track = musicTracks[trackKey];
  if (!track || !track.image) return null;

  const img = document.createElement('img');
  img.src = track.image;
  img.alt = track.title;
  img.onerror = function () {
    this.style.display = 'none';
  };
  return img;
}

function getPlaylistImageNode(playlistKey) {
  const cardImg = qs(`.playlist-card[data-track="${playlistKey}"] .mood-bg`);
  if (cardImg) {
    const clone = cardImg.cloneNode(true);
    clone.onerror = function () {
      this.style.display = 'none';
    };
    return clone;
  }
  return null;
}

function fillContainerWithImage(container, imageNode, fallbackClass = 'cover-shape') {
  if (!container) return;
  container.innerHTML = '';

  if (imageNode) {
    container.appendChild(imageNode.cloneNode(true));
    return;
  }

  const fallback = document.createElement('div');
  fallback.className = fallbackClass;
  container.appendChild(fallback);
}

function getTrackDurationLabel(trackKey) {
  const track = musicTracks[trackKey];
  if (!track || !track.audio) return '3:00';
  return track.audio.toLowerCase().includes('demo') ? '0:05' : '3:00';
}

function syncMainPlayButton() {
  if (playPauseBtn) {
    playPauseBtn.textContent = isPlaying ? '❚❚' : '▶';
  }
}

function resetProgressUI() {
  if (progressFill) progressFill.style.width = '0%';
  if (currentTime) currentTime.textContent = '0:00';
  if (durationTime) durationTime.textContent = '0:00';
}

function setMoodFullscreen(isFullscreen) {
  const sidebar = document.querySelector('.sidebar');
  const content = document.querySelector('.content');
  const layout = document.querySelector('.layout');
  const logoBar = document.querySelector('.logo-bar');
  const nowPlaying = document.querySelector('.now-playing');

  if (isFullscreen) {
    if (sidebar) sidebar.classList.add('mood-fullscreen-hide');
    if (layout) layout.classList.add('mood-fullscreen-layout');
    if (content) content.classList.add('mood-fullscreen-content');
    if (logoBar) logoBar.classList.add('mood-fullscreen-logo');
    if (nowPlaying) nowPlaying.classList.add('mood-fullscreen-hide');
  } else {
    if (sidebar) sidebar.classList.remove('mood-fullscreen-hide');
    if (layout) layout.classList.remove('mood-fullscreen-layout');
    if (content) content.classList.remove('mood-fullscreen-content');
    if (logoBar) logoBar.classList.remove('mood-fullscreen-logo');
    if (nowPlaying) nowPlaying.classList.remove('mood-fullscreen-hide');
  }
}

function updateActiveStates() {
  playlistCards.forEach((card) => {
    card.classList.toggle('is-playing', card.dataset.track === currentMoodKey && isPlaying);
  });

  trackRows.forEach((row) => {
    row.classList.toggle('is-playing', row.dataset.track === currentTrackKey && isPlaying);
  });

  qsa('.playlist-song-row').forEach((row) => {
    row.classList.toggle('is-playing', row.dataset.track === currentTrackKey && isPlaying);
  });
}

function renderNowCover(trackKey) {
  if (!nowCoverShape) return;
  fillContainerWithImage(nowCoverShape, getTrackImageNode(trackKey), 'cover-image');
}

function setNowPlaying(trackKey) {
  const track = musicTracks[trackKey];
  if (!track) return;

  currentTrackKey = trackKey;
  if (nowTitle) nowTitle.textContent = track.title;
  if (nowArtist) nowArtist.textContent = track.artist;
  renderNowCover(trackKey);
  updateActiveStates();
}

function getQueueIndex() {
  return currentQueue.indexOf(currentTrackKey);
}

function playNextTrack() {
  if (!currentQueue.length) return;
  const currentIndex = getQueueIndex();
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % currentQueue.length : 0;
  const nextTrackKey = currentQueue[nextIndex];

  playTrack(nextTrackKey, {
    queue: currentQueue,
    moodKey: currentMoodKey
  });
}

function playTrack(trackKey, options = {}) {
  const track = musicTracks[trackKey];
  if (!track || !audioEl) return;

  currentQueue =
    Array.isArray(options.queue) && options.queue.length
      ? [...options.queue]
      : [...musicPlaybackOrder];

  currentMoodKey = options.moodKey ?? null;

  setNowPlaying(trackKey);

  audioEl.pause();
  audioEl.src = track.audio || '';
  audioEl.load();

  isPlaying = true;
  syncMainPlayButton();
  updateActiveStates();

  audioEl.play().catch(() => {
    isPlaying = false;
    syncMainPlayButton();
    updateActiveStates();
  });
}

function playFromMusic(trackKey) {
  playTrack(trackKey, {
    queue: musicPlaybackOrder,
    moodKey: null
  });
}

function togglePlayPause() {
  if (!audioEl || !currentTrackKey) return;

  if (audioEl.paused) {
    audioEl.play().then(() => {
      isPlaying = true;
      syncMainPlayButton();
      updateActiveStates();
    }).catch(() => {});
  } else {
    audioEl.pause();
    isPlaying = false;
    syncMainPlayButton();
    updateActiveStates();
  }
}

function ensureMoodCheckRoute() {
  let route = qs('.route[data-route="mood-check"]');
  if (route) return route;

  route = document.createElement('section');
  route.className = 'route';
  route.setAttribute('data-route', 'mood-check');

  route.innerHTML = `
    <div class="mood-check-wrap">
      <h2 class="mood-check-title">How are you really feeling today?</h2>
      <div class="mood-grid">
        <button class="mood-option excited" type="button" data-mood="excited">
          <div class="mood-face">><</div>
          <div class="mood-label">Excited</div>
        </button>
        <button class="mood-option sensitive" type="button" data-mood="sensitive">
          <div class="mood-face">◔◔</div>
          <div class="mood-label">Sensitive</div>
        </button>
        <button class="mood-option stressed" type="button" data-mood="stressed">
          <div class="mood-face">◎◎</div>
          <div class="mood-label">Stressed</div>
        </button>
        <button class="mood-option bored" type="button" data-mood="bored">
          <div class="mood-face">◡◡</div>
          <div class="mood-label">Bored</div>
        </button>
        <button class="mood-option angry" type="button" data-mood="angry">
          <div class="mood-face">一 一</div>
          <div class="mood-label">Angry</div>
        </button>
        <button class="mood-option hurt" type="button" data-mood="hurt">
          <div class="mood-face">◠◠</div>
          <div class="mood-label">Hurt</div>
        </button>
      </div>
    </div>
  `;

  contentArea.appendChild(route);

  qsa('.mood-option', route).forEach((option) => {
    option.addEventListener('click', () => {
      const moodName = option.dataset.mood;
      const trackKey = getRandomMoodTrack(moodName);
      if (!trackKey) return;
      openMoodResult(trackKey);
    });
  });

  return route;
}

function ensureMoodResultRoute() {
  let route = qs('.route[data-route="mood-result"]');
  if (route) return route;

  route = document.createElement('section');
  route.className = 'route';
  route.setAttribute('data-route', 'mood-result');

  route.innerHTML = `
    <div class="mood-result-wrap">
      <div class="mood-result-headline">Song that match your mood right now is...</div>
      <div class="mood-result-title" id="moodResultTitle"></div>
      <div class="mood-result-artist" id="moodResultArtist"></div>

      <div class="mood-result-player">
        <div class="mood-result-image-wrap" id="moodResultImageWrap"></div>
      </div>

      <button class="continue-music-btn" type="button" id="continueToMusicBtn">Open Music</button>
    </div>
  `;

  contentArea.appendChild(route);

  const btn = qs('#continueToMusicBtn', route);
  if (btn) {
    btn.addEventListener('click', () => {
      hasPassedMoodGate = true;
      setMoodFullscreen(false);
      showRoute('music');
    });
  }

  return route;
}

function ensurePlaylistDetailRoute() {
  let route = qs('.route[data-route="playlist-detail"]');
  if (route) return route;

  route = document.createElement('section');
  route.className = 'route';
  route.setAttribute('data-route', 'playlist-detail');

  route.innerHTML = `
    <div class="playlist-detail-wrap">
      <button class="playlist-detail-back" type="button" id="playlistDetailBack">← Back</button>

      <div class="playlist-detail-hero">
        <div class="playlist-detail-hero-image" id="playlistHeroImageWrap"></div>
        <div class="playlist-detail-hero-overlay"></div>
        <div class="playlist-detail-hero-title" id="playlistHeroTitle">Playlist</div>
      </div>

      <div class="playlist-table-head">
        <span>#</span>
        <span>Name Song</span>
        <span>Artist</span>
        <span>Time</span>
      </div>

      <div class="playlist-song-list" id="playlistSongList"></div>
    </div>
  `;

  contentArea.appendChild(route);

  const backBtn = qs('#playlistDetailBack', route);
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showRoute('playlist');
    });
  }

  return route;
}

function ensureMessagesRoute() {
  let route = qs('.route[data-route="messages"]');
  if (route) return route;

  route = document.createElement('section');
  route.className = 'route';
  route.setAttribute('data-route', 'messages');

  route.innerHTML = `
    <div class="message-form-wrap" id="messageFormWrap">
      <div class="contact-heading">Send Messages</div>
      <div class="form-group">
        <label class="form-label">To:</label>
        <input class="form-input" type="text" placeholder="write recipient name">
      </div>
      <div class="form-group">
        <label class="form-label">Choose songs:</label>
        <input class="form-input" type="text" placeholder="write song title">
      </div>
      <div class="form-group">
        <label class="form-label">Send messages to them:</label>
        <textarea class="form-input form-textarea" placeholder="write your message"></textarea>
      </div>
      <button class="form-submit" type="button" id="messageSubmit">Submit</button>
    </div>

    <div class="form-thanks hidden" id="messageThanks">
      <div class="thanks-title">Message sent</div>
      <div class="thanks-sub">Your message has been submitted.</div>
    </div>
  `;

  contentArea.appendChild(route);

  const submit = qs('#messageSubmit', route);
  const thanks = qs('#messageThanks', route);
  const formWrap = qs('#messageFormWrap', route);

  if (submit) {
    submit.addEventListener('click', () => {
      if (formWrap) formWrap.classList.add('hidden');
      if (thanks) thanks.classList.remove('hidden');
    });
  }

  return route;
}

function ensureSendMessagesMenu() {
  if (qs('.menu-link[data-route="messages"]')) return;

  const suggestionBtn = qs('.menu-link[data-route="suggestion"]');
  if (!suggestionBtn || !suggestionBtn.parentElement) return;

  const btn = document.createElement('button');
  btn.className = 'menu-link';
  btn.type = 'button';
  btn.dataset.route = 'messages';
  btn.textContent = 'Send Messages';

  suggestionBtn.insertAdjacentElement('afterend', btn);

  btn.addEventListener('click', () => {
    showRoute('messages');
  });
}

function openMoodResult(trackKey) {
  const route = ensureMoodResultRoute();
  const track = musicTracks[trackKey];
  if (!track) return;

  const titleEl = qs('#moodResultTitle', route);
  const artistEl = qs('#moodResultArtist', route);
  const imageWrap = qs('#moodResultImageWrap', route);

  if (titleEl) titleEl.textContent = track.title;
  if (artistEl) artistEl.textContent = track.artist;

  fillContainerWithImage(imageWrap, getTrackImageNode(trackKey));

  hasPassedMoodGate = true;

  setMoodFullscreen(false);
  showRoute('mood-result');

  playTrack(trackKey, {
    queue: [trackKey],
    moodKey: null
  });
}

function createPlaylistRow(trackKey, index, playlistKey) {
  const track = musicTracks[trackKey];
  if (!track) return null;

  const row = document.createElement('button');
  row.className = 'playlist-song-row';
  row.type = 'button';
  row.dataset.track = trackKey;
  row.dataset.playlist = playlistKey;

  const thumbWrap = document.createElement('span');
  thumbWrap.className = 'playlist-song-thumb';

  const imageNode = getTrackImageNode(trackKey);
  if (imageNode) thumbWrap.appendChild(imageNode.cloneNode(true));

  row.innerHTML = `
    <span class="playlist-song-index">${String(index + 1).padStart(2, '0')}</span>
    <span class="playlist-song-main-text">
      <span class="playlist-song-name">${track.title}</span>
    </span>
    <span class="playlist-song-artist">${track.artist}</span>
    <span class="playlist-song-time">${getTrackDurationLabel(trackKey)}</span>
  `;

  const mainText = qs('.playlist-song-main-text', row);
  if (mainText) {
    const mainWrap = document.createElement('span');
    mainWrap.className = 'playlist-song-main';
    mainWrap.appendChild(thumbWrap);
    mainWrap.appendChild(mainText.cloneNode(true));
    mainText.replaceWith(mainWrap);
  }

  row.addEventListener('click', () => {
    const queue = moodPlaylists[playlistKey] || [trackKey];
    playTrack(trackKey, {
      queue,
      moodKey: playlistKey
    });
    updateActiveStates();
  });

  return row;
}

function openPlaylistDetail(playlistKey) {
  const route = ensurePlaylistDetailRoute();
  const heroWrap = qs('#playlistHeroImageWrap', route);
  const heroTitle = qs('#playlistHeroTitle', route);
  const songList = qs('#playlistSongList', route);

  const cardTitleNode = qs(`.playlist-card[data-track="${playlistKey}"] .card-title`);
  const heroImageNode = getPlaylistImageNode(playlistKey);
  const tracks = moodPlaylists[playlistKey] || [];

  if (heroTitle) {
    heroTitle.textContent = cardTitleNode ? cardTitleNode.textContent.trim() : 'Playlist';
  }

  fillContainerWithImage(heroWrap, heroImageNode);

  if (songList) {
    songList.innerHTML = '';
    tracks.forEach((trackKey, index) => {
      const row = createPlaylistRow(trackKey, index, playlistKey);
      if (row) songList.appendChild(row);
    });
  }

  showRoute('playlist-detail');
}

function showRoute(routeName) {
  currentRoute = routeName || 'about';

  getRoutes().forEach((route) => {
    route.classList.toggle('active', route.dataset.route === currentRoute);
  });

  qsa('.menu-link').forEach((button) => {
    const route = button.dataset.route;

    const isMusicFlow =
      route === 'music' &&
      (currentRoute === 'mood-check' || currentRoute === 'mood-result');

    const isPlaylistFlow =
      route === 'playlist' &&
      currentRoute === 'playlist-detail';

    button.classList.toggle(
      'active',
      route === currentRoute || isMusicFlow || isPlaylistFlow
    );
  });

  if (currentRoute === 'mood-check') {
    setMoodFullscreen(true);
  } else {
    setMoodFullscreen(false);
  }

  if (contentArea) contentArea.scrollTop = 0;
}

function openMoodFlow() {
  if (hasPassedMoodGate) {
    setMoodFullscreen(false);
    showRoute('music');
    return;
  }

  ensureMoodCheckRoute();
  setMoodFullscreen(true);
  showRoute('mood-check');
}

function showApp() {
  if (launcherScreen) launcherScreen.classList.add('hidden');
  if (appScreen) appScreen.classList.remove('hidden');

  ensureMoodCheckRoute();
  setMoodFullscreen(true);
  showRoute('mood-check');
}

function openArtistDetail(name, imgSrc, bioText) {
  const artistListContainer = document.getElementById('artistListContainer');
  const artistDetailContainer = document.getElementById('artistDetailContainer');
  const displayArtistName = document.getElementById('displayArtistName');
  const displayArtistImg = document.getElementById('displayArtistImg');
  const displayArtistBio = document.getElementById('displayArtistBio');

  if (artistListContainer) artistListContainer.classList.add('hidden');
  if (artistDetailContainer) artistDetailContainer.classList.remove('hidden');

  if (displayArtistName) displayArtistName.textContent = name;

  if (displayArtistImg) {
    displayArtistImg.src = imgSrc;
    displayArtistImg.alt = name;
    displayArtistImg.onerror = function () {
      this.style.display = 'none';
    };
    displayArtistImg.style.display = 'block';
  }

  if (displayArtistBio) {
    displayArtistBio.innerHTML = bioText;
  }

  const contentArea = document.querySelector('.content');
  if (contentArea) contentArea.scrollTop = 0;
}
window.openArtistDetail = openArtistDetail;

function closeArtistDetail() {
  const artistListContainer = document.getElementById('artistListContainer');
  const artistDetailContainer = document.getElementById('artistDetailContainer');
  const displayArtistImg = document.getElementById('displayArtistImg');

  if (artistListContainer) artistListContainer.classList.remove('hidden');
  if (artistDetailContainer) artistDetailContainer.classList.add('hidden');

  if (displayArtistImg) {
    displayArtistImg.style.display = 'block';
  }
}
window.closeArtistDetail = closeArtistDetail;
function navigateTo(route) {
  if (route === 'music') {
    openMoodFlow();
    return;
  }
  showRoute(route);
}
window.navigateTo = navigateTo;

const eventsTabs = qsa('.events-tab');
const eventsPanels = qsa('.events-panel');

eventsTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    eventsTabs.forEach((t) => t.classList.remove('active'));
    eventsPanels.forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');

    const panel = document.getElementById(target);
    if (panel) panel.classList.add('active');
  });
});

const newsList = document.getElementById('newsList');
const articleDetail = document.getElementById('articleDetail');
const articleBack = document.getElementById('articleBack');
const articleHeroImg = document.getElementById('articleHeroImg');
const articleTitleEl = document.getElementById('articleTitle');
const articleDateEl = document.getElementById('articleDate');
const articleBodyEl = document.getElementById('articleBody');

const articlesData = {
  1: {
    title: 'Langkah Mendunia Mahasiswa Vokasi UI Lewat Inovasi Berdampak',
    date: '11 Agustus 2025',
    image: 'foto news 1.jpeg',
    paragraphs: [
      'Depok-Program studi (prodi) Produksi Media, Program Pendidikan Vokasi, Universitas Indonesia (UI) dikenal sebagai kawah candradimuka bagi talenta kreatif muda Indonesia. Melalui pendekatan pembelajaran berbasis proyek (project-based learning) dan kolaborasi lintas disiplin, prodi ini mendorong mahasiswa untuk menggabungkan budaya, teknologi, dan kreativitas dalam menghasilkan karya yang relevan di kancah global.',
      'Hasilnya terlihat dari lima konsentrasi—Game, Fashion & Lifestyle, Musik, Film, dan Mainan—menunjukkan hasil kolaborasi lintas disiplin yang dikembangkan selama perkuliahan. Dari ranah Game, tim Ox-Lab meluncurkan Lodaya Conquest, gim edukasi 2D pixel art bertema Reog Ponorogo yang mengajak pemain menjelajahi nilai-nilai budaya melalui gameplay interaktif. Di bidang Fashion & Lifestyle, studio FLUI menampilkan koleksi FLUENT dan Bayang yang menggabungkan desain modern, isu keberlanjutan, dan teknologi augmented reality. Konsentrasi Musik lewat WIRE Studio memperkenalkan E-Zine, zine digital interaktif yang membahas musik independen, tren pop culture, dan narasi kreatif yang dekat dengan gaya hidup urban.',
      'Sementara itu, konsentrasi Film menampilkan dokumenter Baduy: The Silent Education yang berisikan potret kehidupan masyarakat adat Baduy yang mengajarkan nilai kehidupan melalui praktik pendidikan sederhana tetapi sarat makna. Film ini mampu menyentuh hati penonton internasional dengan pesan universalnya. Sedangkan dari bidang Mainan, TOBO Studio menciptakan Tinka dan ToBo, mainan modular edukatif yang merangsang kreativitas anak lewat bentuk yang fleksibel dan menyenangkan.',
      'Berbagai karya tersebut ditampilkan saat delegasi dari prodi Produksi Media bersama prodi lainnya saat gelaran Osaka World Expo 2025 yang berlangsung di Paviliun Indonesia pada 21-27 Juli 2025. Mereka tampil memukau dengan karya-karya inovatif yang memadukan budaya lokal, teknologi modern, dan narasi kreatif. Tak hanya pameran, delegasi juga mengikuti forum bisnis internasional, serta melakukan kunjungan akademik ke Osaka University dan Kansai University. Berbagai agenda tersebut membuka peluang kolaborasi riset dan industri kreatif di masa depan.',
      'Ketua Program Studi Produksi Media, Ngurah Rangga Wiwesa, M.I.Kom., mengatakan, "Partisipasi mahasiswa kami di Osaka World Expo 2025 merupakan bentuk nyata kontribusi pendidikan vokasi dalam diplomasi budaya berbasis inovasi. Kami bangga menunjukkan bahwa karya anak muda Indonesia mampu tampil percaya diri di panggung global". Senada dengan Rangga, Direktur Program Pendidikan Vokasi UI, Padang Wicaksono, S.E., Ph.D, mengatakan bahwa kehadiran mahasiswa Vokasi UI di Osaka World Expo 2025 membuktikan bahwa pendidikan vokasi bukan hanya mampu mencetak talenta yang unggul secara kompetensi, melainkan juga mampu mengangkat identitas dan kebanggaan bangsa di level internasional. “Kami berharap ke depan semakin banyak kolaborasi yang membuka jalan bagi mahasiswa untuk berkiprah di panggung dunia sebagai duta kebudayaan untuk Indonesia,” ujar Padang. Keikutsertaan mahasiswa Vokasi UI di Osaka World Expo 2025 menjadi bukti bahwa pendekatan interdisipliner dalam pendidikan vokasi dapat melahirkan inovasi yang relevan secara global, berakar pada budaya, dan berdampak bagi masa depan industri kreatif dunia.'
    ]
  },
  2: {
    title: 'WIRE: Label Rekaman Musik Pertama dari Prodi Produksi Media Vokasi UI',
    date: '8 November 2024',
    image: 'foto news 2.png',
    paragraphs: [
      'WIRE merupakan label rekaman musik pertama yang dibangun oleh Program Studi Produksi Media Vokasi UI sebagai wadah berkarya, berproduksi, dan bereksperimen bagi mahasiswa konsentrasi musik.',
      'Lewat WIRE, mahasiswa tidak hanya belajar membuat karya musik, tetapi juga terlibat langsung dalam proses branding, promosi, distribusi digital, dokumentasi visual, hingga pengelolaan identitas artist.',
      'Kehadiran label ini menjadi langkah penting dalam membangun ekosistem musik yang lebih profesional di lingkungan kampus, sehingga mahasiswa dapat merasakan pengalaman industri sejak masih menjalani perkuliahan.',
      'Selain menjadi ruang publikasi karya, WIRE juga diharapkan menjadi jembatan kolaborasi antara mahasiswa, dosen, dan pelaku industri kreatif, sekaligus memperkuat posisi Produksi Media Vokasi UI dalam pengembangan talenta musik muda.'
    ]
  }
};

function renderArticle(articleId) {
  const data = articlesData[articleId];
  if (!data) return;

  if (articleTitleEl) articleTitleEl.textContent = data.title;
  if (articleDateEl) articleDateEl.textContent = data.date || '';

  if (articleHeroImg) {
    articleHeroImg.src = data.image;
    articleHeroImg.alt = data.title;
  }

  if (articleBodyEl) {
    articleBodyEl.innerHTML = '';
    (data.paragraphs || []).forEach((paragraph) => {
      const p = document.createElement('p');
      p.className = 'article-text';
      p.textContent = paragraph;
      articleBodyEl.appendChild(p);
    });
  }

  if (newsList) newsList.classList.add('hidden');
  if (articleDetail) articleDetail.classList.remove('hidden');
  if (contentArea) contentArea.scrollTop = 0;
}

qsa('.news-row').forEach((row) => {
  row.addEventListener('click', () => {
    renderArticle(row.dataset.article);
  });
});

if (articleBack) {
  articleBack.addEventListener('click', () => {
    if (articleDetail) articleDetail.classList.add('hidden');
    if (newsList) newsList.classList.remove('hidden');
  });
}

const suggestionSubmit = document.getElementById('suggestionSubmit');
const suggestionThanks = document.getElementById('suggestionThanks');
const suggestionFormWrap = document.getElementById('suggestionForm');

if (suggestionSubmit) {
  suggestionSubmit.addEventListener('click', () => {
    if (suggestionFormWrap) suggestionFormWrap.classList.add('hidden');
    if (suggestionThanks) suggestionThanks.classList.remove('hidden');
  });
}

if (enterAppBtn) {
  enterAppBtn.addEventListener('click', showApp);
}

function bindMenuLinks() {
  qsa('.menu-link').forEach((btn) => {
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', () => {
      const target = btn.dataset.route;

      if (target === 'music') {
        openMoodFlow();
        return;
      }

      showRoute(target);
    });
  });
}

bindMenuLinks();

playlistCards.forEach((card) => {
  card.addEventListener('click', () => {
    openPlaylistDetail(card.dataset.track);
  });
});

trackRows.forEach((row) => {
  row.addEventListener('click', () => {
    playFromMusic(row.dataset.track);
  });
});

if (playPauseBtn) {
  playPauseBtn.addEventListener('click', togglePlayPause);
}

if (progressTrack) {
  progressTrack.addEventListener('click', (event) => {
    if (!audioEl || !audioEl.duration) return;

    const rect = progressTrack.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    audioEl.currentTime = audioEl.duration * ratio;
  });
}

if (audioEl) {
  audioEl.addEventListener('loadedmetadata', () => {
    if (!isFinite(audioEl.duration)) return;
    if (durationTime) durationTime.textContent = formatTime(audioEl.duration);
  });

  audioEl.addEventListener('timeupdate', () => {
    if (!audioEl.duration) return;
    const percent = (audioEl.currentTime / audioEl.duration) * 100;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (currentTime) currentTime.textContent = formatTime(audioEl.currentTime);
  });

  audioEl.addEventListener('ended', () => {
    playNextTrack();
  });

  audioEl.addEventListener('play', () => {
    isPlaying = true;
    syncMainPlayButton();
    updateActiveStates();
  });

  audioEl.addEventListener('pause', () => {
    isPlaying = false;
    syncMainPlayButton();
    updateActiveStates();
  });

  audioEl.addEventListener('error', () => {
    isPlaying = false;
    syncMainPlayButton();
    updateActiveStates();
  });
}

ensureMoodCheckRoute();
ensureMoodResultRoute();
ensurePlaylistDetailRoute();
ensureMessagesRoute();
ensureSendMessagesMenu();
bindMenuLinks();

resetProgressUI();
syncMainPlayButton();
updateActiveStates();
showRoute('about');