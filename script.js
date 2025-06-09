const playPauseBtn = document.querySelector('.play-pause-btn');
const progress = document.getElementById('progress');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const trackList = Array.from(document.querySelectorAll('.track-list li'));
const seekSlider = document.getElementById('seekSlider');

let player = null;
let currentTrack = 0;

function playPause() {
  if (player && !player.playing()) {
    player.play();
    playPauseBtn.innerHTML = 'አቁም';
  } else if (player) {
    player.pause();
    playPauseBtn.innerHTML = 'አጫውት';
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
      playPauseBtn.innerHTML = 'አቁም';
      songTitle.textContent = trackList[trackIndex].querySelector('a').textContent;
      artistName.textContent = 'Ethiopian Orthodox Church';
    },
    onend: function() {
      playNext();
    }
  });

  // Event listener assignments for player
  player.on('load', function() {
    seekSlider.max = player.duration();
  });

  player.on('አጫውት', function() {
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

document.getElementById('nextBtn').addEventListener('click', playNext);
document.getElementById('prevBtn').addEventListener('click', playPrevious);

let isSeeking = false;

function updateProgressBar() {
  if (player && player.playing() && !isSeeking) {
    const currentTime = player.seek();
    const duration = player.duration();
    
    let width = (currentTime / duration) * 100;
    seekSlider.value = width;

    // Display current time in minutes:seconds format
    const currentMinutes = Math.floor(currentTime / 60);
    const currentSeconds = Math.floor(currentTime % 60);
    progress.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
  }

  requestAnimationFrame(updateProgressBar);
}

seekSlider.addEventListener('input', function() {
  isSeeking = true;
  const seekPercentage = seekSlider.value;
  customSeek(seekPercentage);
});

seekSlider.addEventListener('change', function() {
  isSeeking = false;
});

function customSeek(seekPercentage) {
  if (player) {
    const duration = player.duration();
    const seekPosition = (seekPercentage / 100) * duration;
    player.seek(seekPosition);
  }
}
