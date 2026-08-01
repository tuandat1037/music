export async function fetchMusicData() {
    try {
        const response = await fetch('data/music.json');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}
