import { formatTime, showToast, createRipple } from './utils.js';
import { updatePlayingUI } from './ui.js';

export class Player {
    constructor(songs, uiCallback) {
        this.songs = songs;
        this.currentIndex = 0;
        this.audio = document.getElementById('audio-player');
        this.uiCallback = uiCallback;
        this.repeatMode = localStorage.getItem('repeat') || 'none';
        this.isShuffle = localStorage.getItem('shuffle') === 'true';
        this.volume = localStorage.getItem('volume') || 1;
        
        this.init();
    }

    init() {
        this.audio.volume = this.volume;
        document.getElementById('volume-bar').value = this.volume;

        this.audio.addEventListener('loadedmetadata', () => {
            document.getElementById('duration-time').textContent = formatTime(this.audio.duration);
        });

        this.audio.addEventListener('timeupdate', () => {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progress-bar').value = progress || 0;
            document.getElementById('current-time').textContent = formatTime(this.audio.currentTime);
        });

        this.audio.addEventListener('ended', () => this.handleEnded());

        this.audio.addEventListener('error', () => {
            showToast('Không thể phát bài hát. Đang chuyển bài...');
            setTimeout(() => this.next(), 2000);
        });

        document.getElementById('play-pause-btn').addEventListener('click', () => this.togglePlay());
        document.getElementById('next-btn').addEventListener('click', () => this.next());
        document.getElementById('prev-btn').addEventListener('click', () => this.prev());
        document.getElementById('shuffle-btn').addEventListener('click', (e) => this.toggleShuffle(e));
        document.getElementById('repeat-btn').addEventListener('click', (e) => this.toggleRepeat(e));
        document.getElementById('mute-btn').addEventListener('click', (e) => this.toggleMute(e));
        
        document.getElementById('progress-bar').addEventListener('input', (e) => {
            const seekTime = (e.target.value / 100) * this.audio.duration;
            this.audio.currentTime = seekTime;
        });

        document.getElementById('volume-bar').addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });

        this.updateRepeatUI();
        this.updateShuffleUI();
    }

    playSong(index) {
        if (index < 0 || index >= this.songs.length) return;
        this.currentIndex = index;
        const song = this.songs[index];
        
        this.audio.src = song.url;
        this.audio.load();
        this.audio.play().catch(err => {
            if (err.name !== 'AbortError') {
                showToast('Không thể phát bài hát. Kiểm tra URL R2.');
            }
        });
        
        this.uiCallback(song, true);
    }

       togglePlay() {
        if (this.audio.paused) {
            if (!this.audio.src) {
                this.playSong(0);
            } else {
                this.audio.play();
                this.uiCallback(this.songs[this.currentIndex], true);
            }
        } else {
            this.audio.pause();
            this.uiCallback(this.songs[this.currentIndex], false);
        }
    }


    next() {
        if (this.isShuffle) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * this.songs.length);
            } while (randomIndex === this.currentIndex && this.songs.length > 1);
            this.playSong(randomIndex);
        } else {
            const nextIndex = (this.currentIndex + 1) % this.songs.length;
            this.playSong(nextIndex);
        }
    }

    prev() {
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
        } else {
            const prevIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
            this.playSong(prevIndex);
        }
    }

    handleEnded() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.audio.play();
        } else if (this.repeatMode === 'all' || this.currentIndex < this.songs.length - 1) {
            this.next();
        } else {
            this.audio.pause();
            this.uiCallback(this.songs[this.currentIndex], false);
        }
    }

    toggleShuffle(e) {
        createRipple(e);
        this.isShuffle = !this.isShuffle;
        localStorage.setItem('shuffle', this.isShuffle);
        this.updateShuffleUI();
    }

    toggleRepeat(e) {
        createRipple(e);
        if (this.repeatMode === 'none') this.repeatMode = 'all';
        else if (this.repeatMode === 'all') this.repeatMode = 'one';
        else this.repeatMode = 'none';
        
        localStorage.setItem('repeat', this.repeatMode);
        this.updateRepeatUI();
    }

    toggleMute(e) {
        createRipple(e);
        this.audio.muted = !this.audio.muted;
        document.getElementById('volume-icon').style.display = this.audio.muted ? 'none' : 'block';
        document.getElementById('mute-icon').style.display = this.audio.muted ? 'block' : 'none';
    }

    setVolume(value) {
        this.volume = value;
        this.audio.volume = value;
        localStorage.setItem('volume', value);
        if (value > 0 && this.audio.muted) {
            this.audio.muted = false;
            document.getElementById('volume-icon').style.display = 'block';
            document.getElementById('mute-icon').style.display = 'none';
        }
    }

    updateRepeatUI() {
        const btn = document.getElementById('repeat-btn');
        btn.classList.remove('active');
        if (this.repeatMode !== 'none') btn.classList.add('active');
    }

    updateShuffleUI() {
        const btn = document.getElementById('shuffle-btn');
        if (this.isShuffle) btn.classList.add('active');
        else btn.classList.remove('active');
    }
}
