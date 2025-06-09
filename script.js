const playPauseBtn = document.querySelector('.play-pause-btn');
const progressBar = document.getElementById('progress');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const trackList = Array.from(document.querySelectorAll('.track-list li'));
const seekSlider = document.getElementById('seekSlider');

// Create time display if it doesn't exist
let timeDisplay = document.getElementById('timeDisplay') || (() => {
  const td = document.createElement('span');
  td.id = 'timeDisplay';
  progressBar.parentNode.insertBefore(td, progressBar.nextSibling);
  return td;
})();

let player = null;
let currentTrack = 0;
let progressInterval = null;
let isSeeking = false;

// More reliable progress updater using interval instead of RAF
function updateProgress() {
  if (!player || !player.playing() || isSeeking) return;
  
  const currentTime = player.seek();
  const duration = player.duration();
  
  // Update progress bar
  const progressPercent = (currentTime / duration) * 100;
  progressBar.style.width = `${progressPercent}%`;
  seekSlider.value = currentTime;
  
  // Update time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function startProgressUpdates() {
  stopProgressUpdates();
  updateProgress(); // Immediate update
  progressInterval = setInterval(updateProgress, 250); // Update 4 times per second
}

function stopProgressUpdates() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function playPause() {
  if (!player) return;
  
  if (player.playing()) {
    player.pause();
    playPauseBtn.innerHTML = '▶️';
    stopProgressUpdates();
  } else {
    player.play();
    playPauseBtn.innerHTML = '⏸️';
    startProgressUpdates();
  }
}

function playTrack(trackUrl, trackIndex) {
  // Stop current player if exists
  if (player) {
    player.stop();
    stopProgressUpdates();
  }

  currentTrack = trackIndex;
  player = new Howl({
    src: [trackUrl],
    html5: true,
    onplay: () => {
      playPauseBtn.innerHTML = '⏸️';
      songTitle.textContent = trackList[trackIndex].querySelector('a').textContent;
      artistName.textContent = 'የኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተክርስቲያን';
      seekSlider.max = player.duration();
      seekSlider.value = 0;
      progressBar.style.width = '0%';
      startProgressUpdates();
    },
    onload: () => {
      seekSlider.max = player.duration();
    },
    onend: playNext,
    onpause: stopProgressUpdates
  });

  player.play();
}

function playNext() {
  currentTrack = (currentTrack + 1) % trackList.length;
  const nextTrackUrl = trackList[currentTrack].querySelector('a').getAttribute('onclick').match(/'([^']+)'/)[1];
  playTrack(nextTrackUrl, currentTrack);
}

function playPrevious() {
  currentTrack = (currentTrack - 1 + trackList.length) % trackList.length;
  const prevTrackUrl = trackList[currentTrack].querySelector('a').getAttribute('onclick').match(/'([^']+)'/)[1];
  playTrack(prevTrackUrl, currentTrack);
}

// Track list event handlers
trackList.forEach((track, index) => {
  track.addEventListener('click', () => {
    const trackUrl = track.querySelector('a').getAttribute('onclick').match(/'([^']+)'/)[1];
    playTrack(trackUrl, index);
  });
});

// Improved seeking logic
seekSlider.addEventListener('input', () => {
  isSeeking = true;
  const seekTime = parseFloat(seekSlider.value);
  const duration = player.duration();
  
  // Update visuals during seek
  progressBar.style.width = `${(seekTime / duration) * 100}%`;
  
  // Update time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  timeDisplay.textContent = `${formatTime(seekTime)} / ${formatTime(duration)}`;
});

seekSlider.addEventListener('change', () => {
  if (!player) return;
  
  const seekTime = parseFloat(seekSlider.value);
  player.seek(seekTime);
  isSeeking = false;
  
  // Force immediate update
  updateProgress();
  
  // Restart updates if playing
  if (player.playing()) {
    startProgressUpdates();
  }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (!player) return;
  
  switch(e.code) {
    case 'Space':
      e.preventDefault();
      playPause();
      break;
    case 'ArrowRight':
      player.seek(Math.min(player.seek() + 10, player.duration()));
      break;
    case 'ArrowLeft':
      player.seek(Math.max(player.seek() - 10, 0));
      break;
    case 'ArrowUp':
      playNext();
      break;
    case 'ArrowDown':
      playPrevious();
      break;
  }
});

// Initialize with first track if available
if (trackList.length > 0) {
  const firstTrackUrl = trackList[0].querySelector('a').getAttribute('onclick').match(/'([^']+)'/)[1];
  // playTrack(firstTrackUrl, 0); // Uncomment to autoplay first track
}
