// =========================
// DOM
// =========================
const pageLabel = document.getElementById('pageLabel');
const launcherScreen = document.getElementById('launcherScreen');
const appScreen = document.getElementById('appScreen');
const enterAppBtn = document.getElementById('enterAppBtn');
const menuLinks = document.querySelectorAll('.menu-link');
const routes = document.querySelectorAll('.route');

const playlistCards = document.querySelectorAll('.playlist-card');
const trackRows = document.querySelectorAll('.track-row');
const trackPlayBtns = document.querySelectorAll('.track-play-btn');

const nowTitle = document.getElementById('nowTitle');
const nowArtist = document.getElementById('nowArtist');
const nowCoverShape = document.getElementById('nowCoverShape');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressFill = document.getElementById('progressFill');
const currentTime = document.getElementById('currentTime');
const durationTime = document.getElementById('durationTime');

// pakai 1 audio object global
const audioEl = new Audio();
audioEl.preload = 'metadata';

// =========================
// STATE
// =========================
let currentRoute = 'playlist';
let currentTrackKey = null;
let currentMoodKey = null;
let currentQueue = [];
let isPlaying = false;

let fakeProgress = 0;
let fakeDuration = 30;
let fakeTimer = null;
let usingRealAudio = false;

// =========================
// PAGE TITLES
// =========================
const pageTitles = {
  about: 'about wire',
  playlist: 'mood playlist',
  music: 'music',
  artist: 'artist',
  news: 'news',
  events: 'events',
  achievements: 'achievements',
  contact: 'contact',
  suggestion: 'suggestion'
};

// =========================
// TRACK DATA
// isi audio kalau nanti sudah punya file lagu asli
// =========================
const musicTracks = {
  'sh-aileen': {
    title: 'Aileen',
    artist: 'Secret Hideaway',
    coverType: 'music-track',
    coverImage: 'assets/music/aileen.jpg',
    audio: ''
  },
  'sh-melukis': {
    title: 'Melukis Obituari',
    artist: 'Secret Hideaway',
    coverType: 'music-track',
    coverImage: 'assets/music/melukis-obituari.jpg',
    audio: ''
  },
  'jz-aku': {
    title: 'Aku, Kau, dan Musik',
    artist: 'JUZZER',
    coverType: 'music-track',
    coverImage: 'assets/music/aku-kau-dan-musik.jpg',
    audio: ''
  },
  'jz-buku': {
    title: 'Buku Pesta Cinta',
    artist: 'JUZZER',
    coverType: 'music-track',
    coverImage: 'assets/music/buku-pesta-cinta.jpg',
    audio: ''
  },
  'jz-apakah': {
    title: 'Apakah Aku Harus Berubah Menjadi Perempuan',
    artist: 'JUZZER',
    coverType: 'music-track',
    coverImage: 'assets/music/apakah-aku-harus-berubah.jpg',
    audio: ''
  },
  'ar-u': {
    title: 'U',
    artist: 'Arteeich',
    coverType: 'music-track',
    coverImage: 'assets/music/u.jpg',
    audio: ''
  },
  'ar-fine': {
    title: 'Fine',
    artist: 'Arteeich',
    coverType: 'music-track',
    coverImage: 'assets/music/fine.jpg',
    audio: ''
  },
  'ar-ever': {
    title: 'Ever',
    artist: 'Arteeich',
    coverType: 'music-track',
    coverImage: 'assets/music/ever.jpg',
    audio: ''
  },
  'tj-1': {
    title: 'Coming Soon',
    artist: 'The Jorts',
    coverType: 'music-track',
    coverImage: '',
    audio: ''
  }
};

// urutan normal kalau user klik dari halaman music
const musicPlaybackOrder = [
  'sh-aileen',
  'sh-melukis',
  'jz-aku',
  'jz-buku',
  'jz-apakah',
  'ar-u',
  'ar-fine',
  'ar-ever'
];

// mood -> playlist lagu contoh
const moodPlaylists = {
  electronic: ['sh-aileen', 'sh-melukis'],
  chill: ['jz-aku', 'sh-aileen'],
  'workout-a': ['ar-fine', 'ar-ever'],
  'workout-b': ['ar-ever', 'ar-u'],
  'pop-a': ['jz-buku', 'jz-apakah'],
  'pop-b': ['jz-apakah', 'jz-buku'],
  'pop-c': ['sh-melukis', 'jz-buku']
};

// =========================
// HELPERS
// =========================
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
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

function stopFakeProgress() {
  if (fakeTimer) {
    clearInterval(fakeTimer);
    fakeTimer = null;
  }
}

function stopRealAudio() {
  audioEl.pause();
  audioEl.removeAttribute('src');
  audioEl.load();
}

function stopAllPlayback() {
  stopFakeProgress();
  stopRealAudio();
  usingRealAudio = false;
}

function renderNowCover(track) {
  if (!nowCoverShape) return;
  if (!track) return;

  if (track.coverType === 'music-track' && track.coverImage) {
    nowCoverShape.className = 'cover-shape music-track';
    nowCoverShape.innerHTML = `<img src="${track.coverImage}" alt="${track.title}" style="width:100%;height:100%;object-fit:cover;display:block;">`;
    return;
  }

  nowCoverShape.className = 'cover-shape ' + track.coverType;
  nowCoverShape.innerHTML = '';
}

function updateActiveStates() {
  // highlight mood cards
  playlistCards.forEach((card) => {
    const isMoodActive = card.dataset.track === currentMoodKey;
    card.classList.toggle('is-playing', isMoodActive);

    const badge = card.querySelector('.play-badge');
    if (badge) {
      badge.textContent = isMoodActive && isPlaying ? 'Playing' : 'Play';
    }
  });

  // highlight music rows
  trackRows.forEach((row) => {
    const isTrackActive = row.dataset.track === currentTrackKey;
    row.classList.toggle('is-playing', isTrackActive);

    const btn = row.querySelector('.track-play-btn');
    if (btn) {
      btn.textContent = isTrackActive && isPlaying ? '❚❚' : '▶';
    }
  });
}

function setNowPlaying(trackKey) {
  const track = musicTracks[trackKey];
  if (!track) return;

  currentTrackKey = trackKey;

  if (nowTitle) nowTitle.textContent = track.title;
  if (nowArtist) nowArtist.textContent = track.artist;

  renderNowCover(track);
  updateActiveStates();
}

function startFakeProgress(duration = 30) {
  stopFakeProgress();

  fakeProgress = 0;
  fakeDuration = duration;

  if (progressFill) progressFill.style.width = '0%';
  if (currentTime) currentTime.textContent = '0:00';
  if (durationTime) durationTime.textContent = formatTime(fakeDuration);

  fakeTimer = setInterval(() => {
    if (!isPlaying) return;

    fakeProgress += 1;

    if (fakeProgress >= fakeDuration) {
      playNextTrack();
      return;
    }

    if (progressFill) {
      progressFill.style.width = `${(fakeProgress / fakeDuration) * 100}%`;
    }

    if (currentTime) {
      currentTime.textContent = formatTime(fakeProgress);
    }
  }, 1000);
}

function getQueueIndex() {
  return currentQueue.indexOf(currentTrackKey);
}

function playNextTrack() {
  if (!currentQueue.length) return;

  const currentIndex = getQueueIndex();
  const nextIndex = currentIndex >= 0
    ? (currentIndex + 1) % currentQueue.length
    : 0;

  const nextTrackKey = currentQueue[nextIndex];
  playTrack(nextTrackKey, {
    queue: currentQueue,
    moodKey: currentMoodKey
  });
}

function playTrack(trackKey, options = {}) {
  const track = musicTracks[trackKey];
  if (!track) return;

  const queue = Array.isArray(options.queue) && options.queue.length
    ? options.queue
    : musicPlaybackOrder;

  currentQueue = [...queue];
  currentMoodKey = options.moodKey ?? null;

  stopAllPlayback();
  resetProgressUI();

  isPlaying = true;
  setNowPlaying(trackKey);
  syncMainPlayButton();

  if (track.audio) {
    usingRealAudio = true;
    audioEl.src = track.audio;
    audioEl.play().catch(() => {
      isPlaying = false;
      syncMainPlayButton();
      updateActiveStates();
    });
  } else {
    usingRealAudio = false;
    startFakeProgress(30);
  }

  updateActiveStates();
}

function playFromMood(moodKey) {
  const moodQueue = moodPlaylists[moodKey];
  if (!moodQueue || !moodQueue.length) return;

  playTrack(moodQueue[0], {
    queue: moodQueue,
    moodKey: moodKey
  });
}

function playFromMusic(trackKey) {
  playTrack(trackKey, {
    queue: musicPlaybackOrder,
    moodKey: null
  });
}

function togglePlayPause() {
  if (!currentTrackKey) return;

  isPlaying = !isPlaying;
  syncMainPlayButton();

  if (usingRealAudio) {
    if (isPlaying) {
      audioEl.play().catch(() => {
        isPlaying = false;
        syncMainPlayButton();
      });
    } else {
      audioEl.pause();
    }
  }

  updateActiveStates();
}

// =========================
// NAVIGATION
// =========================
function showApp() {
  launcherScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  showRoute('about');
}

function showRoute(routeName) {
  currentRoute = pageTitles[routeName] ? routeName : 'playlist';

  if (pageLabel) {
    pageLabel.textContent = pageTitles[currentRoute];
  }

  routes.forEach((section) => {
    section.classList.toggle('active', section.dataset.route === currentRoute);
  });

  menuLinks.forEach((button) => {
    button.classList.toggle('active', button.dataset.route === currentRoute);
  });
}

// =========================
// EVENTS TABS
// =========================
const eventsTabs = document.querySelectorAll('.events-tab');
const eventsPanels = document.querySelectorAll('.events-panel');

eventsTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    eventsTabs.forEach(t => t.classList.remove('active'));
    eventsPanels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const panel = document.querySelector(`.events-panel[data-panel="${target}"]`);
    if (panel) panel.classList.add('active');
  });
});

// =========================
// NEWS — list → detail
// =========================
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
  5: { title: 'Article', image: 'assets/news/article5.jpg' },
};

document.querySelectorAll('.news-row').forEach((row) => {
  row.addEventListener('click', () => {
    const id = row.dataset.article;
    const data = articlesData[id];
    if (!data) return;

    if (articleTitleEl) articleTitleEl.textContent = data.title;
    if (articleHeroImg) {
      articleHeroImg.src = data.image;
      articleHeroImg.alt = data.title;
    }

    if (newsList) newsList.classList.add('hidden');
    if (articleDetail) articleDetail.classList.remove('hidden');
  });
});

if (articleBack) {
  articleBack.addEventListener('click', () => {
    if (articleDetail) articleDetail.classList.add('hidden');
    if (newsList) newsList.classList.remove('hidden');
  });
}

// =========================
// CONTACT — social links only, no form
// =========================

// =========================
// SUGGESTION FORM
// =========================
const suggestionSubmit = document.getElementById('suggestionSubmit');
const suggestionThanks = document.getElementById('suggestionThanks');
const suggestionFormWrap = document.getElementById('suggestionForm');

if (suggestionSubmit) {
  suggestionSubmit.addEventListener('click', () => {
    if (suggestionFormWrap) suggestionFormWrap.classList.add('hidden');
    if (suggestionThanks) suggestionThanks.classList.remove('hidden');
  });
}

// =========================
// AUDIO EVENTS
// =========================
audioEl.addEventListener('loadedmetadata', () => {
  if (!isFinite(audioEl.duration)) return;
  if (durationTime) durationTime.textContent = formatTime(Math.floor(audioEl.duration));
});

audioEl.addEventListener('timeupdate', () => {
  if (!audioEl.duration) return;

  const percent = (audioEl.currentTime / audioEl.duration) * 100;

  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }

  if (currentTime) {
    currentTime.textContent = formatTime(Math.floor(audioEl.currentTime));
  }
});

audioEl.addEventListener('ended', () => {
  playNextTrack();
});

audioEl.addEventListener('pause', () => {
  if (!audioEl.ended && usingRealAudio) {
    syncMainPlayButton();
    updateActiveStates();
  }
});

audioEl.addEventListener('play', () => {
  syncMainPlayButton();
  updateActiveStates();
});

// =========================
// EVENT LISTENERS
// =========================
if (enterAppBtn) {
  enterAppBtn.addEventListener('click', showApp);
}

menuLinks.forEach((btn) => {
  btn.addEventListener('click', () => {
    showRoute(btn.dataset.route);
  });
});

playlistCards.forEach((card) => {
  card.addEventListener('click', () => {
    playFromMood(card.dataset.track);
  });
});

trackRows.forEach((row) => {
  row.addEventListener('click', () => {
    playFromMusic(row.dataset.track);
  });
});

trackPlayBtns.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    const parentRow = btn.closest('.track-row');
    if (!parentRow) return;
    playFromMusic(parentRow.dataset.track);
  });
});

if (playPauseBtn) {
  playPauseBtn.addEventListener('click', togglePlayPause);
}

// =========================
// INIT
// =========================
resetProgressUI();
syncMainPlayButton();
updateActiveStates();