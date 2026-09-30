// Physical Realistic 3D Photo Album Book Controller

let currentSpreadIndex = 0;
let bookPhotos = [];
let activeBookCategory = 'all';

function initPhysicalBook(category = 'all') {
    activeBookCategory = category;
    if (!window.albumsData || !window.albumsData.allPhotos) return;

    if (category === 'all') {
        bookPhotos = [...window.albumsData.allPhotos];
    } else {
        bookPhotos = window.albumsData.allPhotos.filter(item => item.album === category);
    }

    currentSpreadIndex = 0;
    renderBookSpread();
}

function renderBookSpread() {
    const bookContainer = document.getElementById('physicalBookContainer');
    const spreadCounter = document.getElementById('bookSpreadCounter');
    const prevBtn = document.getElementById('bookPrevBtn');
    const nextBtn = document.getElementById('bookNextBtn');

    if (!bookContainer) return;

    // Calculate total 2-page spreads (2 photos per page = 4 photos per spread)
    const photosPerSpread = 4;
    const totalSpreads = Math.ceil(bookPhotos.length / photosPerSpread);

    if (totalSpreads === 0) {
        bookContainer.innerHTML = `<div class="p-12 text-center text-slate-400 font-hand text-2xl">В этом альбоме пока нет фотографий...</div>`;
        return;
    }

    if (currentSpreadIndex >= totalSpreads) currentSpreadIndex = totalSpreads - 1;
    if (currentSpreadIndex < 0) currentSpreadIndex = 0;

    // Update controls
    if (spreadCounter) spreadCounter.innerText = `Разворот ${currentSpreadIndex + 1} из ${totalSpreads} (всего ${bookPhotos.length} фото)`;
    if (prevBtn) prevBtn.disabled = currentSpreadIndex === 0;
    if (nextBtn) nextBtn.disabled = currentSpreadIndex === totalSpreads - 1;

    // Get photos for current spread (2 for left page, 2 for right page)
    const startIndex = currentSpreadIndex * photosPerSpread;
    const spreadPhotos = bookPhotos.slice(startIndex, startIndex + photosPerSpread);

    const leftPhotos = spreadPhotos.slice(0, 2);
    const rightPhotos = spreadPhotos.slice(2, 4);

    const leftPageNum = (currentSpreadIndex * 2) + 1;
    const rightPageNum = (currentSpreadIndex * 2) + 2;

    const html = `
        <div class="physical-book p-4 sm:p-8 max-w-5xl mx-auto my-6 relative overflow-hidden">
            <!-- Central Spine Line Shadow -->
            <div class="book-spine hidden sm:block"></div>

            <!-- Two Page Spread Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 relative z-10">

                <!-- LEFT PAGE -->
                <div class="page-spread p-6 sm:p-8 flex flex-col justify-between min-h-[420px] relative border border-white/5">
                    <!-- Top Page Title -->
                    <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                        <span class="font-hand text-xl text-amber-300">ФОТОАЛЬБОМ // ТЁМА</span>
                        <span class="font-mono text-xs text-slate-500">Стр. ${leftPageNum}</span>
                    </div>

                    <!-- Left Page Photos -->
                    <div class="space-y-6 flex-1 flex flex-col justify-center">
                        ${renderPagePhotos(leftPhotos, startIndex)}
                    </div>

                    <!-- Page Bottom Handwritten Note -->
                    <div class="pt-4 mt-2 border-t border-white/10 text-right">
                        <span class="font-hand text-lg text-slate-400">Память & Эмоции ♡</span>
                    </div>
                </div>

                <!-- RIGHT PAGE -->
                <div class="page-spread p-6 sm:p-8 flex flex-col justify-between min-h-[420px] relative border border-white/5">
                    <!-- Top Page Title -->
                    <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                        <span class="font-hand text-xl text-amber-300">ВОСПОМИНАНИЯ</span>
                        <span class="font-mono text-xs text-slate-500">Стр. ${rightPageNum}</span>
                    </div>

                    <!-- Right Page Photos -->
                    <div class="space-y-6 flex-1 flex flex-col justify-center">
                        ${renderPagePhotos(rightPhotos, startIndex + leftPhotos.length)}
                    </div>

                    <!-- Page Bottom Handwritten Note -->
                    <div class="pt-4 mt-2 border-t border-white/10 text-left">
                        <span class="font-hand text-lg text-slate-400">С днём рождения! 👑</span>
                    </div>
                </div>

            </div>
        </div>
    `;

    bookContainer.innerHTML = html;
}

function renderPagePhotos(photosList, globalOffset) {
    if (photosList.length === 0) {
        return `<div class="font-hand text-slate-500 text-center py-8 text-xl">Страница заполнена</div>`;
    }

    return photosList.map((item, idx) => {
        const photoNum = globalOffset + idx + 1;
        const rotationAngles = ['-2deg', '3deg', '-1deg', '2deg'];
        const rot = rotationAngles[idx % rotationAngles.length];

        return `
            <div class="photo-mount-frame cursor-pointer group relative" style="transform: rotate(${rot});" onclick="openLightboxByPath('${item.path}')">
                <div class="aspect-[4/3] w-full overflow-hidden rounded bg-slate-900">
                    <img src="${encodeURI(item.path)}" alt="Photo ${photoNum}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy">
                </div>
                <div class="mt-2 flex items-center justify-between text-xs text-slate-800 font-hand text-base px-1">
                    <span>Момент #${photoNum}</span>
                    <span class="text-amber-700">♡</span>
                </div>
            </div>
        `;
    }).join('');
}

function nextSpread() {
    const totalSpreads = Math.ceil(bookPhotos.length / 4);
    if (currentSpreadIndex < totalSpreads - 1) {
        currentSpreadIndex++;
        playPageFlipSound();
        renderBookSpread();
    }
}

function prevSpread() {
    if (currentSpreadIndex > 0) {
        currentSpreadIndex--;
        playPageFlipSound();
        renderBookSpread();
    }
}

function playPageFlipSound() {
    if (typeof playClickSound === 'function') {
        playClickSound();
    }
}

function openLightboxByPath(path) {
    if (window.albumsData && window.albumsData.allPhotos) {
        const idx = window.albumsData.allPhotos.findIndex(item => item.path === path);
        if (idx !== -1 && typeof openLightbox === 'function') {
            openLightbox(idx);
        }
    }
}

window.initPhysicalBook = initPhysicalBook;
window.nextSpread = nextSpread;
window.prevSpread = prevSpread;
window.openLightboxByPath = openLightboxByPath;
