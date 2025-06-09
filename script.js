const playPauseBtn = document.querySelector('.play-pause-btn');
const progressBar = document.getElementById('progress'); // This is the visual bar
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const trackList = Array.from(document.querySelectorAll('.track-list li'));
const seekSlider = document.getElementById('seekSlider');

// Add a display element for time if you want
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

// Fix: update to use seconds, not percent!
function updateProgressBar() {
  if (player && player.playing() && !isSeeking) {
    const currentTime = player.seek();
    const duration = player.duration();

    // Visual progress bar (width as percent)
    let width = (currentTime / duration) * 100;
    progressBar.style.width = width + "%";

    // Slider
    seekSlider.value = currentTime;

    // Display current time in minutes:seconds format
    const currentMinutes = Math.floor(currentTime / 60);
    const currentSeconds = Math.floor(currentTime % 60);
    const durationMinutes = Math.floor(duration / 60);
    const durationSeconds = Math.floor(duration % 60);
    timeDisplay.textContent = ` ${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds} / ${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
  }
  if (player && player.playing()) {
    progressUpdater = requestAnimationFrame(updateProgressBar);
  }
}

function playPause() {
  if (player && !player.playing()) {
    player.play();
    playPauseBtn.innerHTML = '⏸️';
    updateProgressBar(); // Resume progress updates!
  } else if (player) {
    player.pause();
    playPauseBtn.innerHTML = 'Play';
    if (progressUpdater) cancelAnimationFrame(progressUpdater);
  }
}

function playTrack(trackUrl, trackIndex) {
  if (player) {
    player.stop();
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
      updateProgressBar();
    },
    onend: function() {
      playNext();
    }
  });

  player.on('load', function() {
    seekSlider.max = player.duration();
  });

  player.on('play', function() {
    updateProgressBar();
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

document.getElementById('nextBtn')?.addEventListener('click', playNext);
document.getElementById('prevBtn')?.addEventListener('click', playPrevious);

// SEEKING
seekSlider.addEventListener('input', function() {
  isSeeking = true;
});
seekSlider.addEventListener('change', function() {
  if (player) {
    player.seek(Number(seekSlider.value));
  }
  isSeeking = false;
  updateProgressBar();
});
