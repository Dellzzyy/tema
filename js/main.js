// Main Script for Storyboard Brother Celebration Website

let currentPhotoIndex = 0;
let activeFilteredPhotos = [];
let currentViewMode = 'book'; // 'book' or 'grid'

const handwrittenCaptions = [
    "Тот самый момент, когда понимаешь, что всё только начинается... ♡",
    "Лучшие дни и лучшая атмосфера! 🚀",
    "Настоящая дружба и поддержка сквозь года. ♡",
    "Каждый кадр — отдельная история и победа! ⚡",
    "Двигаемся только вперед, Тёма! 👑",
    "Хорошие моменты всегда рядом ♡",
    "Память, которая останется с нами навсегда. 🔥",
    "Стиль, драйв и бесконечный респект!"
];

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initial Load of All Photos
    if (window.albumsData && window.albumsData.allPhotos) {
        activeFilteredPhotos = [...window.albumsData.allPhotos];
        renderPhotoGrid(activeFilteredPhotos);
        if (typeof initAnimatedBook === 'function') {
            initAnimatedBook('all');
        }
    }

    // 2. Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('lightboxModal');
        if (modal && !modal.classList.contains('pointer-events-none')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.code === 'Space') {
                const videoPlayer = document.getElementById('lightboxVideoPlayer');
                const videoWrapper = document.getElementById('lightboxVideoWrapper');
                if (videoWrapper && !videoWrapper.classList.contains('hidden') && videoPlayer) {
                    e.preventDefault();
                    if (videoPlayer.paused) {
                        videoPlayer.play();
                    } else {
                        videoPlayer.pause();
                    }
                }
            }
        } else if (currentViewMode === 'book') {
            if (e.key === 'ArrowRight' && typeof flipBookNext === 'function') flipBookNext();
            if (e.key === 'ArrowLeft' && typeof flipBookPrev === 'function') flipBookPrev();
        }
    });
});

// View Toggle between Physical Book and Grid
function setGalleryView(mode) {
    currentViewMode = mode;
    const bookWrapper = document.getElementById('bookViewWrapper');
    const gridWrapper = document.getElementById('gridViewWrapper');
    const btnBook = document.getElementById('btnBookView');
    const btnGrid = document.getElementById('btnGridView');

    if (mode === 'book') {
        if (bookWrapper) bookWrapper.classList.remove('hidden');
        if (gridWrapper) gridWrapper.classList.add('hidden');
        if (btnBook) btnBook.className = "px-4 py-2 rounded-lg text-xs font-medium transition bg-amber-600 text-white shadow flex items-center gap-2";
        if (btnGrid) btnGrid.className = "px-4 py-2 rounded-lg text-xs font-medium transition text-slate-400 hover:text-white flex items-center gap-2";
    } else {
        if (bookWrapper) bookWrapper.classList.add('hidden');
        if (gridWrapper) gridWrapper.classList.remove('hidden');
        if (btnGrid) btnGrid.className = "px-4 py-2 rounded-lg text-xs font-medium transition bg-amber-600 text-white shadow flex items-center gap-2";
        if (btnBook) btnBook.className = "px-4 py-2 rounded-lg text-xs font-medium transition text-slate-400 hover:text-white flex items-center gap-2";
    }
}

// Category / Chapter Switcher
function switchCategory(category) {
    const heading = document.getElementById('galleryHeading');
    if (!window.albumsData || !window.albumsData.allPhotos) return;

    // Reset tab styles
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active', 'text-white'));

    if (category === 'all') {
        activeFilteredPhotos = [...window.albumsData.allPhotos];
        if (heading) heading.innerHTML = `<span>Фотоальбом</span>`;
        document.getElementById('cat-all')?.classList.add('active');
    } else if (category === 'album1' || category === 'album2' || category === 'album3') {
        activeFilteredPhotos = window.albumsData.allPhotos.filter(item => item.album === category);
        const albumNames = { album1: 'Альбом #1', album2: 'Альбом #2', album3: 'Альбом #3' };
        if (heading) heading.innerHTML = `<span>${albumNames[category]}</span>`;
        document.getElementById(`cat-${category}`)?.classList.add('active');
    } else {
        activeFilteredPhotos = [...window.albumsData.allPhotos].sort(() => 0.5 - Math.random()).slice(0, 30);
        const categoryTitles = { travel: 'Путешествия', friends: 'Друзья', auto: 'Авто', family: 'Семья' };
        if (heading) heading.innerHTML = `<span>${categoryTitles[category] || 'Фотографии'}</span>`;
    }

    renderPhotoGrid(activeFilteredPhotos);

    if (typeof initAnimatedBook === 'function') {
        initAnimatedBook(category);
    }
}

// Render Photos in Grid
function renderPhotoGrid(photos) {
    const grid = document.getElementById('photoGrid');
    const countAll = document.getElementById('count-all');
    if (!grid) return;

    if (countAll) countAll.innerText = photos.length;

    let html = '';
    photos.forEach((item, index) => {
        const staggerDelay = Math.min(index, 12) * 25;
        const isVideo = item.type === 'video';
        const displaySrc = item.thumb || item.path;

        const videoBadge = isVideo ? `
            <div class="absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg pl-0.5 pointer-events-none group-hover:scale-110 transition-transform">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
            </div>
            <div class="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-amber-200 uppercase tracking-wider border border-white/10 pointer-events-none">
                ▶ Видео
            </div>
        ` : '';

        html += `
            <div class="photo-card-animated img-zoom-container relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-white/10 cursor-pointer group" style="animation-delay: ${staggerDelay}ms;" onclick="openLightbox(${index})">
                <img src="${encodeURI(displaySrc)}" alt="" class="img-zoom w-full h-full object-cover" loading="lazy" decoding="async" onerror="this.style.opacity='0'">
                ${videoBadge}
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-3 pointer-events-none">
                    <span class="font-hand text-lg text-amber-200">${item.title || (isVideo ? 'Видео' : `Момент #${index + 1}`)}</span>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}

// Open Video in Lightbox Player
function openVideoLightbox(videoPath, thumbPath = '', title = 'Видеозапись') {
    if (!videoPath) return;

    const modal = document.getElementById('lightboxModal');
    const mainImg = document.getElementById('lightboxMainImg');
    const videoWrapper = document.getElementById('lightboxVideoWrapper');
    const videoPlayer = document.getElementById('lightboxVideoPlayer');
    const videoTitle = document.getElementById('lightboxVideoTitle');
    if (!modal) return;

    // Hide photo image
    if (mainImg) {
        mainImg.classList.add('hidden');
        mainImg.src = '';
    }

    // Single-encode safely
    const cleanVideoSrc = encodeURI(decodeURI(videoPath));
    const cleanThumbSrc = thumbPath ? encodeURI(decodeURI(thumbPath)) : '';

    // Show and load video player
    if (videoWrapper && videoPlayer) {
        videoWrapper.classList.remove('hidden');
        if (videoTitle) videoTitle.innerText = title;
        videoPlayer.pause();
        if (cleanThumbSrc) videoPlayer.poster = cleanThumbSrc;
        videoPlayer.src = cleanVideoSrc;
        videoPlayer.load();
        const playPromise = videoPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
    }

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');

    if (window.lucide) {
        lucide.createIcons();
    }
}

// Open Photo in Lightbox
function openLightboxByPath(path) {
    if (!path) return;

    const modal = document.getElementById('lightboxModal');
    const mainImg = document.getElementById('lightboxMainImg');
    const videoWrapper = document.getElementById('lightboxVideoWrapper');
    const videoPlayer = document.getElementById('lightboxVideoPlayer');
    if (!modal) return;

    // Stop and hide video if playing
    if (videoPlayer) {
        try {
            videoPlayer.pause();
            videoPlayer.removeAttribute('src');
            videoPlayer.load();
        } catch(e) {}
    }
    if (videoWrapper) videoWrapper.classList.add('hidden');

    // Show photo with single encoding
    if (mainImg) {
        mainImg.src = encodeURI(decodeURI(path));
        mainImg.classList.remove('hidden');
    }

    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');

    if (window.lucide) {
        lucide.createIcons();
    }
}

// Unified Open Lightbox (Handles Index, String Path, or Object)
function openLightbox(target) {
    let item = null;
    if (typeof target === 'number') {
        item = activeFilteredPhotos[target] || (window.albumsData?.allPhotos && window.albumsData.allPhotos[target]);
    } else if (typeof target === 'string') {
        item = window.albumsData?.allPhotos?.find(p => p.path === target || p.thumb === target) || { type: 'photo', path: target };
    } else if (typeof target === 'object' && target !== null) {
        item = target;
    }
    if (!item) return;

    if (item.type === 'video') {
        openVideoLightbox(item.path, item.thumb, item.title);
    } else {
        openLightboxByPath(item.path);
    }
}

// Close Modal and Stop Playback
function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    const videoPlayer = document.getElementById('lightboxVideoPlayer');

    if (videoPlayer) {
        try {
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            videoPlayer.removeAttribute('src');
            videoPlayer.load();
        } catch(e) {}
    }

    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.classList.remove('opacity-100');
    }
}

// Stubs for compatibility
function nextPhoto() {}
function prevPhoto() {}

function triggerHeart() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 60,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#ef4444', '#ffffff', '#fbbf24']
        });
    }
}

window.switchCategory = switchCategory;
window.setGalleryView = setGalleryView;
window.filterPhotos = switchCategory;
window.openLightbox = openLightbox;
window.openLightboxByPath = openLightboxByPath;
window.openVideoLightbox = openVideoLightbox;
window.closeLightbox = closeLightbox;
window.nextPhoto = nextPhoto;
window.prevPhoto = prevPhoto;
window.triggerHeart = triggerHeart;
