import { fetchMusicData } from './api.js';
import { renderPlaylist, updatePlayingUI, initLazyLoading, showSkeleton } from './ui.js';
import { initSearch } from './search.js';
import { Player } from './player.js';

document.addEventListener('DOMContentLoaded', async () => {
    // === Xử lý Theme (Dark/Light Mode) ===
        // === Nút Back để quay lại danh sách ===
    const backBtn = document.getElementById('back-btn');
    const npView = document.getElementById('now-playing-view');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            npView.classList.remove('active');
        });
    }

    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    const sunIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    const moonIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' ? sunIcon : moonIcon;

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ? sunIcon : moonIcon;
    });

    // === Khởi tạo Player ===
    const playlistElement = document.getElementById('playlist');
    const skeletonContainer = document.getElementById('loading-skeleton');
    const searchInput = document.getElementById('search-input');

    showSkeleton(skeletonContainer, 8);

    const songs = await fetchMusicData();
    
    if (songs.length === 0) {
        skeletonContainer.innerHTML = '<p>Không có dữ liệu bài hát.</p>';
        return;
    }

    skeletonContainer.innerHTML = '';
    
    let player;
    const handlePlay = (id) => {
        const index = songs.findIndex(song => song.id === id);
        if (index !== -1) player.playSong(index);
    };

    renderPlaylist(songs, playlistElement, handlePlay);
    initLazyLoading();

    player = new Player(songs, updatePlayingUI);
    initSearch(searchInput, songs, playlistElement, handlePlay);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                player.togglePlay();
                break;
            case 'ArrowRight':
                e.preventDefault();
                player.audio.currentTime += 5;
                break;
            case 'ArrowLeft':
                e.preventDefault();
                player.audio.currentTime -= 5;
                break;
            case 'ArrowUp':
                e.preventDefault();
                player.setVolume(Math.min(1, parseFloat(player.volume) + 0.1));
                document.getElementById('volume-bar').value = player.volume;
                break;
            case 'ArrowDown':
                e.preventDefault();
                player.setVolume(Math.max(0, parseFloat(player.volume) - 0.1));
                document.getElementById('volume-bar').value = player.volume;
                break;
        }
    });
});
