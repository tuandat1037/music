import { formatTime, createRipple } from './utils.js';

export function renderPlaylist(songs, playlistElement, onPlayCallback) {
    playlistElement.innerHTML = '';
    songs.forEach(song => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        li.dataset.id = song.id;
        li.tabIndex = 0;

        const img = document.createElement('img');
        img.dataset.src = song.cover;
        img.alt = song.title;
        img.classList.add('lazy-load');

        const details = document.createElement('div');
        details.className = 'track-details';
        details.innerHTML = `<span class="title">${song.title}</span><span class="artist">${song.artist}</span>`;

        // Tạo Equalizer
        const equalizer = document.createElement('div');
        equalizer.className = 'equalizer';
        equalizer.innerHTML = '<span></span><span></span><span></span>';

        const duration = document.createElement('span');
        duration.className = 'track-duration';
        duration.textContent = song.duration;

        // Nút play dự phòng (đã ẩn bằng CSS)
        const playBtn = document.createElement('button');
        playBtn.className = 'play-track-btn';
        playBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            onPlayCallback(song.id);
        });

        li.addEventListener('click', () => onPlayCallback(song.id));
        li.addEventListener('dblclick', () => onPlayCallback(song.id));
        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') onPlayCallback(song.id);
        });

        li.appendChild(img);
        li.appendChild(details);
        li.appendChild(equalizer); // Thêm Equalizer vào danh sách
        li.appendChild(duration);
        li.appendChild(playBtn);
        playlistElement.appendChild(li);
    });
}

export function updatePlayingUI(currentSong, isPlaying) {
    // Highlight bài hát đang phát
    document.querySelectorAll('.playlist-item').forEach(item => {
        if (parseInt(item.dataset.id) === currentSong.id) {
            item.classList.add('active');
            const eq = item.querySelector('.equalizer');
            if (eq) {
                if (isPlaying) eq.classList.remove('equalizer-paused');
                else eq.classList.add('equalizer-paused');
            }
        } else {
            item.classList.remove('active');
            const eq = item.querySelector('.equalizer');
            if (eq) eq.classList.add('equalizer-paused');
        }
    });

    // Cập nhật thanh player dưới cùng
    const coverImg = document.getElementById('current-cover');
    coverImg.src = currentSong.cover;
    document.getElementById('current-title').textContent = currentSong.title;
    document.getElementById('current-artist').textContent = currentSong.artist;
    document.getElementById('duration-time').textContent = currentSong.duration;

    // === Thêm code cập nhật màn hình Now Playing ===
    const npView = document.getElementById('now-playing-view');
    const npCover = document.getElementById('np-cover');
    const npTitle = document.getElementById('np-title');
    const npArtist = document.getElementById('np-artist');
    
    if (npView) {
        npView.style.backgroundImage = `url('${currentSong.cover}')`;
        npCover.src = currentSong.cover;
        npTitle.textContent = currentSong.title;
        npArtist.textContent = currentSong.artist;
        npView.classList.add('active'); // Tự động mở màn hình Now Playing
    }

    // Xử lý đĩa than quay ở thanh dưới
    if (isPlaying) {
        coverImg.classList.add('spin-effect');
        coverImg.classList.remove('paused-spin');
    } else {
        coverImg.classList.add('paused-spin');
    }

    // Đổi icon Play/Pause
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    if (isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

export function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy-load');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy-load');
                observer.unobserve(img);
            }
        });
    });
    lazyImages.forEach(img => observer.observe(img));
}

export function showSkeleton(container, count = 5) {
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.className = 'skeleton-item';
        item.innerHTML = `
            <div class="skeleton-img skeleton-loading"></div>
            <div style="flex: 1;">
                <div class="skeleton-text skeleton-loading" style="width: 50%;"></div>
                <div class="skeleton-text skeleton-loading" style="width: 30%;"></div>
            </div>
        `;
        container.appendChild(item);
    }
}
