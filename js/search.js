import { normalizeString, debounce } from './utils.js';
import { renderPlaylist, initLazyLoading } from './ui.js';

export function initSearch(inputElement, originalSongs, playlistElement, onPlayCallback) {
    const handleSearch = debounce((e) => {
        const query = normalizeString(e.target.value.trim());
        if (!query) {
            renderPlaylist(originalSongs, playlistElement, onPlayCallback);
            initLazyLoading();
            return;
        }
        const filtered = originalSongs.filter(song => 
            normalizeString(song.title).includes(query) || 
            normalizeString(song.artist).includes(query)
        );
        renderPlaylist(filtered, playlistElement, onPlayCallback);
        initLazyLoading();
    }, 300);

    inputElement.addEventListener('input', handleSearch);
}
