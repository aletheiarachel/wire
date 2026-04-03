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

const musicTracks = {
  'sh-alleen': { title: 'Alleen', artist: 'Secret Hideaway', audio: 'audio/alleen-demo.wav' },
  'sh-melukis': { title: 'Melukis Obituari', artist: 'Secret Hideaway', audio: 'audio/melukis-demo.wav' },
  'sh-try': { title: 'Try Again', artist: 'Secret Hideaway', audio: 'audio/tryagain-demo.wav' },
  'sh-hideaway': { title: 'Hideaway', artist: 'Secret Hideaway', audio: 'audio/hideaway-demo.wav' },
  'sh-ever': { title: 'Ever', artist: 'Arteeich', audio: 'audio/ever-demo.wav' },
  'sh-u': { title: 'U', artist: 'Arteeich', audio: 'audio/u-demo.wav' },
  'sh-sike': { title: 'Sike', artist: 'Arteeich', audio: 'audio/sike-demo.wav' },
  'sh-fool': { title: 'Fool', artist: 'Arteeich', audio: 'audio/fool-demo.wav' },
  'sh-fine': { title: 'Fine', artist: 'Arteeich', audio: 'audio/fine-demo.wav' },
  'jz-aku': { title: 'Aku, Kau, dan Musik', artist: 'JUZZER', audio: 'audio/akukaudanmusik-demo.wav' },
  'jz-buku': { title: 'Buku Pesta Cinta', artist: 'JUZZER', audio: 'audio/bukupestacinta-demo.wav' },
  'jz-apakah': { title: 'Apakah Aku Harus Berubah Menjadi Perempuan', artist: 'JUZZER', audio: 'audio/apakah-demo.wav' },
  'jz-asam': { title: 'Asam Manis', artist: 'JUZZER', audio: 'audio/asammanis-demo.wav'},
  'jz-hey': { title: 'Hey Kau Gadis Nan Jauh Di Sana', artist: 'JUZZER', audio: 'audio/heykaugadisnanjauhdisana-demo.wav'},
  'jz-malam': { title: 'Malam Yang Gulita', artist: 'JUZZER', audio: 'audio/malamyanggulita-demo.wav'},
  'jz-romansa': { title: 'Romansa Akhir Pekan', artist: 'JUZZER', audio: 'audio/romansaakhirpekan-demo.wav'}
};

const musicPlaybackOrder = [
  'sh-alleen',
  'sh-melukis',
  'sh-try',
  'sh-hideaway',
  'sh-ever',
  'sh-u',
  'sh-sike',
  'sh-fool',
  'sh-fine',
  'jz-aku',
  'jz-buku',
  'jz-apakah',
  'jz-asam',
  'jz-hey',
  'jz-malam',
  'jz-romansa'
];

const moodPlaylists = {
  chill: ['sh-alleen', 'sh-u', 'sh-hideaway'],
  'get-up': ['jz-aku', 'sh-ever', 'sh-try'],
  rage: ['jz-apakah', 'sh-sike', 'sh-fool'],
  'feeling-blue': ['sh-melukis', 'sh-alleen', 'sh-hideaway']
};

const moodRecommendations = {
  excited: ['jz-aku', 'jz-buku', 'sh-try', 'sh-ever'],
  sensitive: ['sh-melukis', 'sh-alleen', 'sh-hideaway'],
  stressed: ['sh-fine', 'sh-sike', 'jz-apakah'],
  bored: ['sh-u', 'sh-ever', 'jz-aku'],
  angry: ['jz-apakah', 'sh-sike', 'sh-fool'],
  hurt: ['sh-alleen', 'sh-melukis', 'sh-hideaway']
};
const lastMoodPick = {};

function getRandomMoodTrack(moodName) {
  const moodTracks = moodRecommendations[moodName] || [];
  if (!moodTracks.length) return null;
  if (moodTracks.length === 1) return moodTracks[0];

  let picked = null;
  do {
    const randomIndex = Math.floor(Math.random() * moodTracks.length);
    picked = moodTracks[randomIndex];
  } while (picked === lastMoodPick[moodName]);

  lastMoodPick[moodName] = picked;
  return picked;
}

function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function formatTime(sec) {
  const m = Math.floor(sec / 60) || 0;
  const s = String(Math.floor(sec % 60) || 0).padStart(2, '0');
  return `${m}:${s}`;
}

function getRoutes() {
  return qsa('.route');
}

function getTrackImageNode(trackKey) {
  const img = qs(`.track-row[data-track="${trackKey}"] img`);
  return img ? img.cloneNode(true) : null;
}

function getPlaylistImageNode(playlistKey) {
  const img = qs(`.playlist-card[data-track="${playlistKey}"] .mood-bg`);
  return img ? img.cloneNode(true) : null;
}

function fillContainerWithImage(container, imageNode, className = '') {
  if (!container) return;
  container.innerHTML = '';
  if (!imageNode) return;

  const clone = imageNode.cloneNode(true);
  if (className) clone.classList.add(className);
  container.appendChild(clone);
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
hasPassedMoodGate = true;
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
  if (displayArtistName) displayArtistName.innerText = name;
  if (displayArtistImg) displayArtistImg.src = imgSrc;
  if (displayArtistBio) displayArtistBio.innerHTML = bioText;

  if (contentArea) contentArea.scrollTop = 0;
}
window.openArtistDetail = openArtistDetail;

function closeArtistDetail() {
  const artistListContainer = document.getElementById('artistListContainer');
  const artistDetailContainer = document.getElementById('artistDetailContainer');

  if (artistListContainer) artistListContainer.classList.remove('hidden');
  if (artistDetailContainer) artistDetailContainer.classList.add('hidden');
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

const articlesData = {
  1: { title: 'Article', image: 'assets/news/article1.jpg' },
  2: { title: 'Article', image: 'assets/news/article2.jpg' },
  3: { title: 'Article', image: 'assets/news/article3.jpg' },
  4: { title: 'Article', image: 'assets/news/article4.jpg' },
  5: { title: 'Article', image: 'assets/news/article5.jpg' }
};

qsa('.news-row').forEach((row) => {
  row.addEventListener('click', () => {
    const data = articlesData[row.dataset.article];
    if (!data) return;

    if (articleTitleEl) articleTitleEl.textContent = data.title;
    if (articleHeroImg) {
      articleHeroImg.src = data.image;
      articleHeroImg.alt = data.title;
    }

    if (newsList) newsList.classList.add('hidden');
    if (articleDetail) articleDetail.classList.remove('hidden');
    if (contentArea) contentArea.scrollTop = 0;
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