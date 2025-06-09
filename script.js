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

      // time display
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
  progressUpdater = requestAnimationFrame(updateProgressBar);
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
    playPauseBtn.innerHTML = 'Play';
    stopProgressLoop();
  }
}

function playTrack(trackUrl, trackIndex) {
  if (player) {
    player.stop();
    stopProgressLoop();
  }
  player = new Howl({
    src: [trackUrl],
    html5: true,
    onplay: function() {
      playPauseBtn.innerHTML = '⏸️';
      songTitle.textContent = trackList[trackIndex].querySelector('a').textContent;
      artistName.textContent = 'የኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተክርስቲያን  ';
      seekSlider.max = player.duration();
      seekSlider.value = 0;
      startProgressLoop();
    },
    onend: function() {
      playNext();
    }
  });

  player.on('load', function() {
    seekSlider.max = player.duration();
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

trackList.forEach((track, index) => {
  track.addEventListener('click', function() {
    const trackUrl = track.querySelector('a').getAttribute('onclick').match(/'(.*?)'/)[1];
    playTrack(trackUrl, index);
  });
});

// SEEK LOGIC
seekSlider.addEventListener('input', function() {
  isSeeking = true;
  // Do not update progress while seeking
});
seekSlider.addEventListener('change', function() {
  if (player) {
    player.seek(Number(seekSlider.value));
  }
  isSeeking = false;
  // Resume animation ONLY if playing
  if (player && player.playing()) {
    startProgressLoop();
  }
});

// If you have next/prev buttons with IDs nextBtn/prevBtn, uncomment below and ensure IDs exist in your HTML
// document.getElementById('nextBtn')?.addEventListener('click', playNext);
// document.getElementById('prevBtn')?.addEventListener('click', playPrevious);
