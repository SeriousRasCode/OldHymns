const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.querySelector('.play-pause-btn');
const progress = document.getElementById('progress');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const trackList = Array.from(document.querySelectorAll('.track-list li'));
const seekSlider = document.getElementById('seekSlider');

let currentTrack = 0;

function playPause() {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playPauseBtn.innerHTML = '&#9646;&#9646;'; // Unicode for pause symbol
  } else {
    audioPlayer.pause();
    playPauseBtn.innerHTML = '&#9658;'; // Unicode for play symbol
  }
}

function playTrack(trackUrl) {
  audioPlayer.src = trackUrl;
  audioPlayer.play();
  playPauseBtn.innerHTML = '&#9646;&#9646;'; // Unicode for pause symbol

  const trackIndex = trackList.findIndex(track => track.querySelector('a').getAttribute('onclick').includes(trackUrl));
  currentTrack = trackIndex;

  updateTrackInfo(trackIndex);
}

function playNext() {
  currentTrack = (currentTrack + 1) % trackList.length;
  const nextTrackUrl = trackList[currentTrack].querySelector('a').getAttribute('onclick').match(/'(.*?)'/)[1];
  playTrack(nextTrackUrl);
}

function playPrevious() {
  currentTrack = (currentTrack - 1 + trackList.length) % trackList.length;
  const prevTrackUrl = trackList[currentTrack].querySelector('a').getAttribute('onclick').match(/'(.*?)'/)[1];
  playTrack(prevTrackUrl);
}

function updateTrackInfo(trackIndex) {
  const trackInfo = trackList[trackIndex].textContent;
  songTitle.textContent = trackInfo;
  artistName.textContent = 'Ethiopian Orthodox Church';
}

audioPlayer.addEventListener('loadedmetadata', function() {
  seekSlider.max = audioPlayer.duration;
});

audioPlayer.addEventListener('timeupdate', function() {
  const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  //progress.style.width = percent + '%';
  seekSlider.value = audioPlayer.currentTime;
});

seekSlider.addEventListener('input', function() {
  audioPlayer.currentTime = seekSlider.value;
});