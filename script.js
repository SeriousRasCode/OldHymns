const playPauseBtn = document.querySelector('.play-pause-btn');
const progressBar = document.getElementById('progress');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const trackList = Array.from(document.querySelectorAll('.track-list li'));
const seekSlider = document.getElementById('seekSlider');

let timeDisplay = document.getElementById('timeDisplay');
if (!timeDisplay) {
  timeDisplay = document.createElement('span');
  timeDisplay.id = 'timeDisplay';
  progressBar.parentNode.insertBefore(timeDisplay, progressBar.nextSibling);
}

let player = null;
let currentTrack = 0;
let progressUpdater = null;
let isSeeking = false;

function updateProgressBar() {
  if (player && player.playing()) {
    if (!isSeeking) {
      const currentTime = player.seek();
      const duration = player.duration();
      let width = (currentTime / duration) * 100;
      progressBar.style.width = width + "%";
      seekSlider.value = currentTime;

      // Update time display
      const currentMinutes = Math.floor(currentTime / 60);
      const currentSeconds = Math.floor(currentTime % 60);
      const durationMinutes = Math.floor(duration / 60);
      const durationSeconds = Math.floor(duration % 60);
      timeDisplay.textContent =
        ` ${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds} / ` +
        `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
    }
    progressUpdater = requestAnimationFrame(updateProgressBar);
  }
}

function startProgressLoop() {
  if (progressUpdater) cancelAnimationFrame(progressUpdater);
  updateProgressBar(); // Immediate update before starting loop
}

function stopProgressLoop() {
  if (progressUpdater) cancelAnimationFrame(progressUpdater);
  progressUpdater = null;
}

function playPause() {
  if (player && !player.playing()) {
    player.play();
    playPauseBtn.innerHTML = '⏸️';
    startProgressLoop();
  } else if (player) {
    player.pause();
    playPauseBtn.innerHTML = '▶️';
    stopProgressLoop();
  }
}

function playTrack(trackUrl, trackIndex) {
  if (player) {
    player.stop();
    stopProgressLoop();
  }
  
  currentTrack = trackIndex;
  player = new Howl({
    src: [trackUrl],
    html5: true,
    onplay: function() {
      playPauseBtn.innerHTML = '⏸️';
      songTitle.textContent = trackList[trackIndex].querySelector('a').textContent;
      artistName.textContent = 'የኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተክርስቲያን';
      seekSlider.max = player.duration();
      seekSlider.value = 0;
      progressBar.style.width = "0%";
      startProgressLoop();
    },
    onend: function() {
      playNext();
    }
  });

  player.on('load', function() {
    seekSlider.max = player.duration();
    seekSlider.value = 0;
    progressBar.style.width = "0%";
  });

  player.on('play', function() {
    startProgressLoop();
  });

  player.on('pause', function() {
    stopProgressLoop();
  });

  player.on('end', function() {
    playNext();
  });

  player.play();
}

function playNext() {
  currentTrack = (currentTrack + 1) % trackList.length;
  const nextTrackUrl = trackList[currentTrack].querySelector('a').getAttribute('onclick').match(/'(.*?)'/)[1];
  playTrack(nextTrackUrl, currentTrack);
}

function playPrevious() {
  currentTrack = (currentTrack - 1 + trackList.length) % trackList.length;
  const prevTrackUrl = trackList[currentTrack].querySelector('a').getAttribute('onclick').match(/'(.*?)'/)[1];
  playTrack(prevTrackUrl, currentTrack);
}

// Set up track list click handlers
trackList.forEach((track, index) => {
  track.addEventListener('click', function() {
    const trackUrl = track.querySelector('a').getAttribute('onclick').match(/'(.*?)'/)[1];
    playTrack(trackUrl, index);
  });
});

// SEEK LOGIC
seekSlider.addEventListener('input', function() {
  isSeeking = true;
  const seekTime = Number(seekSlider.value);
  const duration = player.duration();
  
  // Update progress bar during seeking
  let width = (seekTime / duration) * 100;
  progressBar.style.width = width + "%";
  
  // Update time display during seeking
  const currentMinutes = Math.floor(seekTime / 60);
  const currentSeconds = Math.floor(seekTime % 60);
  const durationMinutes = Math.floor(duration / 60);
  const durationSeconds = Math.floor(duration % 60);
  timeDisplay.textContent =
    ` ${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds} / ` +
    `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
});

seekSlider.addEventListener('change', function() {
  if (player) {
    player.seek(Number(seekSlider.value));
  }
  isSeeking = false;
  // Force immediate update and restart animation if playing
  if (player && player.playing()) {
    startProgressLoop();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
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

// Initialize first track if available
if (trackList.length > 0) {
  const firstTrackUrl = trackList[0].querySelector('a').getAttribute('onclick').match(/'(.*?)'/)[1];
  // Uncomment to autoplay first track
  // playTrack(firstTrackUrl, 0); 
}
