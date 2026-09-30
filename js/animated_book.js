// Animated 3D Flip Book Scrapbook with Glued Photos & Varied Layout Patterns

let pageFlipInstance = null;
let currentBookPhotos = [];
let isProgrammaticFlip = false;

// 5 Distinct Natural Page-Turn Patterns with Smooth Harmonic Physics & Zero-Jerk Motion
const FLIP_PATTERNS = [
    {
        name: 'Грациозный верхний изгиб',
        corner: 'top',
        arc: 0.042,
        duration: 700,
        ease: 'sine',
        soundFreq: 1420
    },
    {
        name: 'Нижний диагональный подхват',
        corner: 'bottom',
        arc: -0.042,
        duration: 720,
        ease: 'natural',
        soundFreq: 1300
    },
    {
        name: 'Шелковый плавный перекат',
        corner: 'top',
        arc: 0.035,
        duration: 680,
        ease: 'sine',
        soundFreq: 1360
    },
    {
        name: 'Естественный разворот',
        corner: 'top',
        arc: 0.038,
        duration: 710,
        ease: 'smooth',
        soundFreq: 1480
    },
    {
        name: 'Размеренный глубокий переворот',
        corner: 'bottom',
        arc: -0.045,
        duration: 740,
        ease: 'cubic',
        soundFreq: 1200
    }
];

let lastFlipPatternIdx = -1;

function getRandomFlipPattern() {
    let nextIdx = Math.floor(Math.random() * FLIP_PATTERNS.length);
    if (nextIdx === lastFlipPatternIdx) {
        nextIdx = (nextIdx + 1) % FLIP_PATTERNS.length;
    }
    lastFlipPatternIdx = nextIdx;
    return FLIP_PATTERNS[nextIdx];
}

// Synthesized subtle paper rustle sound via Web Audio API tuned to each pattern
function playPaperFlipSound(freq = 1350, animDuration = 1050) {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const duration = Math.max(0.18, Math.min(0.35, animDuration / 3200));
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, ctx.currentTime);
        filter.Q.setValueAtTime(1.6, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.045, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();
    } catch (e) {
        // Audio policy muted or unavailable
    }
}

function initAnimatedBook(category = 'all') {
    if (!window.albumsData || !window.albumsData.allPhotos) return;

    if (category === 'all') {
        currentBookPhotos = [...window.albumsData.allPhotos];
    } else {
        currentBookPhotos = window.albumsData.allPhotos.filter(item => item.album === category);
    }

    buildAndMountBook();
}

function buildAndMountBook() {
    if (pageFlipInstance) {
        try {
            pageFlipInstance.destroy();
        } catch (e) {
            console.log('PageFlip destroy note:', e);
        }
        pageFlipInstance = null;
    }

    const host = document.getElementById('bookFlipHost') || document.getElementById('bookDeskMat') || document.getElementById('bookFlipTarget')?.parentElement;
    if (!host) return;

    // Ensure clean target element (in case St.PageFlip.destroy() removed previous target)
    let bookContainer = document.getElementById('bookFlipTarget');
    if (!bookContainer) {
        bookContainer = document.createElement('div');
        bookContainer.id = 'bookFlipTarget';
        bookContainer.className = 'w-full flex justify-center items-center';
        host.appendChild(bookContainer);
    }

    // Generate HTML Pages
    bookContainer.innerHTML = generateBookPagesHtml(currentBookPhotos);

    // Give DOM a tick to layout
    setTimeout(() => {
        try {
            const pageElements = bookContainer.querySelectorAll('.page');
            if (pageElements.length === 0) return;

            // Extra wide and immersive sizing across screen
            pageFlipInstance = new St.PageFlip(bookContainer, {
                width: 580,
                height: 740,
                size: 'stretch',
                minWidth: 320,
                maxWidth: 740,
                minHeight: 460,
                maxHeight: 940,
                maxShadowOpacity: 0.75,
                showCover: true,
                mobileScrollSupport: false,
                useMouseEvents: false,
                showPageCorners: false,
                disableFlipByClick: true,
                clickEventForward: false,
                usePortrait: true,
                startZIndex: 10,
                autoSize: true,
                flippingTime: 700
            });

            pageFlipInstance.loadFromHTML(pageElements);

            // Page flip event listener
            pageFlipInstance.on('flip', (e) => {
                updatePageCounter(e.data);
                if (!isProgrammaticFlip) {
                    const pat = getRandomFlipPattern();
                    playPaperFlipSound(pat.soundFreq, pat.duration);
                }
                isProgrammaticFlip = false;
            });

            updatePageCounter(0);
        } catch (err) {
            console.error('Failed to initialize St.PageFlip:', err);
        }
    }, 80);
}

function generateBookPagesHtml(photos) {
    let pagesHtml = '';

    // 1. FRONT COVER (Hardcover)
    const coverPhoto = 'photo_2026-09-27_02-43-54.jpg';
    pagesHtml += `
        <div class="page page-cover-front relative select-none" data-density="hard">
            <div class="cover-corner-tl"></div>
            <div class="cover-corner-tr"></div>
            <div class="cover-corner-bl"></div>
            <div class="cover-corner-br"></div>

            <div class="cover-inner-wrapper">
                <!-- Top Header -->
                <div class="cover-title-area">
                    <span class="font-hand text-4xl sm:text-5xl text-amber-400 tracking-wider">ФОТОАЛЬБОМ</span>
                    <div class="cover-gold-divider"></div>
                </div>

                <!-- Center Large Glued Framed Photo -->
                <div class="cover-center-photo-block">
                    <div class="glued-photo cover-photo-card" onclick="openLightboxByPath('${coverPhoto}')">
                        <div class="scotch-tape-top washi-tape-color"></div>
                        <div class="cover-img-frame">
                            <img src="${encodeURI(coverPhoto)}" alt="Обложка" onerror="this.style.opacity='0'">
                        </div>
                    </div>
                </div>

                <!-- Bottom Spacer for layout balance -->
                <div class="cover-bottom-space"></div>
            </div>
        </div>
    `;

    function renderMediaCard(item, extraClass = '', tapeHtml = '', maxH = 480, maxW = 440) {
        if (!item) return '';
        const isVideo = item.type === 'video';
        const mediaThumb = item.thumb || item.path;
        const safeTitle = (item.title || 'Видео').replace(/'/g, "\\'");
        const clickHandler = isVideo
            ? `openVideoLightbox('${encodeURI(item.path)}', '${encodeURI(item.thumb || '')}', '${safeTitle}')`
            : `openLightboxByPath('${encodeURI(item.path)}')`;

        const ratio = item.ratio || (item.w && item.h ? Math.round((item.w / item.h) * 1000) / 1000 : 1.333);

        const videoBadgeHtml = isVideo ? `
            <div class="absolute inset-0 bg-black/40 hover:bg-black/25 transition-all flex flex-col items-center justify-center pointer-events-none">
                <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500/95 text-white flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110 backdrop-blur-sm pl-1 border border-white/20">
                    <svg class="w-6 h-6 text-black fill-current" viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
                </div>
                <span class="mt-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-semibold text-amber-200 tracking-wider border border-white/10 shadow">
                    ▶ ВИДЕО
                </span>
            </div>
        ` : '';

        return `
            <div class="glued-photo group cursor-pointer ${extraClass}" onclick="${clickHandler}">
                ${tapeHtml}
                <div class="photo-mount-box overflow-hidden rounded bg-slate-900 relative" style="aspect-ratio: ${ratio}; max-height: ${maxH}px; max-width: ${maxW}px;">
                    <img src="${encodeURI(mediaThumb)}" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" onerror="this.style.opacity='0'">
                    ${videoBadgeHtml}
                </div>
            </div>
        `;
    }

    // 2. INNER PAGES: SMART ORIENTATION-AWARE LAYOUTS (NO CROPPING, NO OVERLAPPING)
    let photoIndex = 0;
    let pageNum = 1;

    while (photoIndex < photos.length) {
        const remaining = photos.length - photoIndex;
        const p1 = photos[photoIndex];
        const p2 = photos[photoIndex + 1];
        const p3 = photos[photoIndex + 2];

        let patternType = '';
        let countConsumed = 1;

        if (remaining === 1) {
            patternType = 'solo_hero';
            countConsumed = 1;
        } else if (remaining === 2) {
            if (p1.orient === 'portrait' && p2.orient === 'portrait') {
                patternType = 'two_portraits_row';
                countConsumed = 2;
            } else if (p1.orient === 'landscape' && p2.orient === 'landscape') {
                patternType = 'two_landscapes_col';
                countConsumed = 2;
            } else {
                patternType = 'two_mixed_col';
                countConsumed = 2;
            }
        } else {
            if (p1.orient === 'portrait' && p2.orient === 'portrait' && (pageNum % 3 !== 0)) {
                patternType = 'two_portraits_row';
                countConsumed = 2;
            } else if (p1.orient === 'landscape' && p2.orient === 'landscape' && (pageNum % 3 !== 0)) {
                patternType = 'two_landscapes_col';
                countConsumed = 2;
            } else if (p1.orient === 'landscape' && p2.orient === 'portrait' && p3.orient === 'portrait' && (pageNum % 4 === 1)) {
                patternType = 'trio_landscape_top';
                countConsumed = 3;
            } else if (p1.orient === 'portrait' && p2.orient === 'portrait' && p3.orient === 'landscape' && (pageNum % 4 === 2)) {
                patternType = 'trio_landscape_bot';
                countConsumed = 3;
            } else if ((p1.orient !== p2.orient) && (pageNum % 2 === 0)) {
                patternType = 'two_mixed_col';
                countConsumed = 2;
            } else {
                patternType = 'solo_hero';
                countConsumed = 1;
            }
        }

        let pageContent = '';

        if (patternType === 'solo_hero') {
            const isPort = p1.orient === 'portrait';
            const maxH = isPort ? 510 : 350;
            const maxW = isPort ? 380 : 460;
            const rot = (pageNum % 2 === 0) ? 'rotate-1' : '-rotate-1';
            const tape = isPort 
                ? '<div class="scotch-tape-top"></div>' 
                : '<div class="scotch-tape-tl"></div><div class="scotch-tape-tr washi-tape-color"></div>';

            pageContent = `
                <div class="p-5 sm:p-8 h-full flex flex-col justify-center items-center select-none my-auto">
                    ${renderMediaCard(p1, `mx-auto ${rot}`, tape, maxH, maxW)}
                </div>
            `;
        } else if (patternType === 'two_portraits_row') {
            // Two vertical portraits side-by-side: centered together in the middle of the page
            pageContent = `
                <div class="p-4 sm:p-7 h-full flex flex-col justify-center items-center select-none my-auto">
                    <div class="flex flex-row justify-center items-center gap-4 sm:gap-6 w-full max-w-[470px] my-auto">
                        ${renderMediaCard(p1, '-rotate-1.5', '<div class="scotch-tape-top"></div>', 360, 210)}
                        ${renderMediaCard(p2, 'rotate-1.5', '<div class="scotch-tape-top washi-tape-color"></div>', 360, 210)}
                    </div>
                </div>
            `;
        } else if (patternType === 'two_landscapes_col') {
            // Two landscape photos stacked vertically centered with guaranteed gap
            pageContent = `
                <div class="p-4 sm:p-7 h-full flex flex-col justify-center items-center select-none my-auto">
                    <div class="flex flex-col justify-center items-center gap-5 sm:gap-7 w-full max-w-[430px] my-auto">
                        ${renderMediaCard(p1, '-rotate-1', '<div class="scotch-tape-top"></div>', 220, 390)}
                        ${renderMediaCard(p2, 'rotate-1', '<div class="photo-bracket-tl"></div><div class="photo-bracket-br"></div>', 220, 390)}
                    </div>
                </div>
            `;
        } else if (patternType === 'two_mixed_col') {
            // 1 Landscape + 1 Portrait: centered together in the middle of the page
            const isP1Land = p1.orient === 'landscape';
            const h1 = isP1Land ? 210 : 260;
            const w1 = isP1Land ? 370 : 210;
            const h2 = isP1Land ? 260 : 210;
            const w2 = isP1Land ? 210 : 370;

            pageContent = `
                <div class="p-4 sm:p-7 h-full flex flex-col justify-center items-center select-none my-auto">
                    <div class="flex flex-col justify-center items-center gap-4 sm:gap-6 w-full max-w-[440px] my-auto">
                        ${renderMediaCard(p1, '-rotate-1', '<div class="scotch-tape-top"></div>', h1, w1)}
                        ${renderMediaCard(p2, 'rotate-1', '<div class="scotch-tape-tl washi-tape-color"></div>', h2, w2)}
                    </div>
                </div>
            `;
        } else if (patternType === 'trio_landscape_top') {
            // 1 Landscape Top + 2 Portraits Bottom centered
            pageContent = `
                <div class="p-4 sm:p-6 h-full flex flex-col justify-center items-center select-none my-auto">
                    <div class="flex flex-col justify-center items-center gap-4 sm:gap-5 w-full max-w-[430px] my-auto">
                        ${renderMediaCard(p1, 'rotate-0.5', '<div class="scotch-tape-top washi-tape-color"></div>', 190, 370)}
                        <div class="flex flex-row justify-center items-center gap-3 sm:gap-4 w-full max-w-[410px]">
                            ${renderMediaCard(p2, '-rotate-1', '<div class="scotch-tape-top"></div>', 210, 185)}
                            ${renderMediaCard(p3, 'rotate-1', '<div class="photo-bracket-tl"></div><div class="photo-bracket-br"></div>', 210, 185)}
                        </div>
                    </div>
                </div>
            `;
        } else if (patternType === 'trio_landscape_bot') {
            // 2 Portraits Top + 1 Landscape Bottom centered
            pageContent = `
                <div class="p-4 sm:p-6 h-full flex flex-col justify-center items-center select-none my-auto">
                    <div class="flex flex-col justify-center items-center gap-4 sm:gap-5 w-full max-w-[430px] my-auto">
                        <div class="flex flex-row justify-center items-center gap-3 sm:gap-4 w-full max-w-[410px]">
                            ${renderMediaCard(p1, '-rotate-1', '<div class="scotch-tape-top"></div>', 210, 185)}
                            ${renderMediaCard(p2, 'rotate-1', '<div class="scotch-tape-top washi-tape-color"></div>', 210, 185)}
                        </div>
                        ${renderMediaCard(p3, 'rotate-0.5', '<div class="photo-bracket-tl"></div><div class="photo-bracket-br"></div>', 190, 370)}
                    </div>
                </div>
            `;
        }

        pagesHtml += `
            <div class="page" data-density="soft">
                ${pageContent}
            </div>
        `;

        photoIndex += countConsumed;
        pageNum++;
    }

    // Ensure even number of inner pages for double page book
    if ((pageNum - 1) % 2 !== 0) {
        pagesHtml += `
            <div class="page p-10 flex flex-col justify-center items-center text-center select-none" data-density="soft">
                <div class="py-12">
                    <span class="font-hand text-6xl text-amber-400 block mb-6">👑</span>
                    <h3 class="font-hand text-4xl sm:text-5xl text-white">Продолжение следует...</h3>
                </div>
            </div>
        `;
    }

    // 3. BACK COVER (Hardcover)
    pagesHtml += `
        <div class="page page-cover-back relative select-none" data-density="hard">
            <div class="cover-corner-tl"></div>
            <div class="cover-corner-tr"></div>
            <div class="cover-corner-bl"></div>
            <div class="cover-corner-br"></div>

            <div class="cover-inner-wrapper">
                <div class="cover-title-area">
                    <span class="font-hand text-4xl text-amber-400">2026</span>
                    <div class="cover-gold-divider"></div>
                </div>

                <div class="my-auto text-center px-4">
                    <span class="text-6xl block mb-4">👑</span>
                    <h3 class="font-hand text-4xl sm:text-5xl text-white leading-tight">С Днём Рождения, Тёма!</h3>
                    <p class="font-hand text-2xl text-amber-200 mt-3">Будь счастлив и уверен в себе! ♡</p>
                </div>

                <div class="cover-bottom-space flex items-center justify-center">
                    <span class="text-xs uppercase font-sans tracking-widest text-slate-500">КОНЕЦ АЛЬБОМА</span>
                </div>
            </div>
        </div>
    `;

    return pagesHtml;
}

function updatePageCounter(currentPage) {
    const counter = document.getElementById('bookSpreadCounter');
    const prevBtn = document.getElementById('bookPrevBtn');
    const nextBtn = document.getElementById('bookNextBtn');

    if (!pageFlipInstance) return;

    const totalPages = pageFlipInstance.getPageCount();
    if (counter) {
        if (currentPage === 0) {
            counter.innerText = `Обложка альбома (всего ${totalPages} стр.)`;
        } else if (currentPage >= totalPages - 1) {
            counter.innerText = `Задняя обложка (стр. ${totalPages})`;
        } else {
            counter.innerText = `Страницы ${currentPage} - ${currentPage + 1} из ${totalPages}`;
        }
    }

    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages - 1;
}

function flipBookNext() {
    if (!pageFlipInstance) return;
    if (pageFlipInstance.getCurrentPageIndex() >= pageFlipInstance.getPageCount() - 1) return;
    const pattern = getRandomFlipPattern();
    window.__currentFlipPattern = pattern;
    isProgrammaticFlip = true;
    if (typeof playPaperFlipSound === 'function') {
        playPaperFlipSound(pattern.soundFreq, pattern.duration);
    }
    pageFlipInstance.flipNext(pattern.corner, pattern);
}

function flipBookPrev() {
    if (!pageFlipInstance) return;
    if (pageFlipInstance.getCurrentPageIndex() <= 0) return;
    const pattern = getRandomFlipPattern();
    window.__currentFlipPattern = pattern;
    isProgrammaticFlip = true;
    if (typeof playPaperFlipSound === 'function') {
        playPaperFlipSound(pattern.soundFreq, pattern.duration);
    }
    pageFlipInstance.flipPrev(pattern.corner, pattern);
}

function openLightboxByPath(path) {
    if (!path) return;
    if (typeof window.openLightbox === 'function') {
        window.openLightbox(path);
    } else {
        const modal = document.getElementById('lightboxModal');
        const mainImg = document.getElementById('lightboxMainImg');
        if (modal && mainImg) {
            mainImg.src = encodeURI(decodeURI(path));
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.classList.add('opacity-100');
        }
    }
}

function openVideoLightbox(videoPath, thumbPath, title) {
    if (typeof window.openVideoLightbox === 'function') {
        window.openVideoLightbox(videoPath, thumbPath, title);
    }
}

window.initAnimatedBook = initAnimatedBook;
window.flipBookNext = flipBookNext;
window.flipBookPrev = flipBookPrev;
window.openLightboxByPath = openLightboxByPath;
window.openVideoLightbox = window.openVideoLightbox || openVideoLightbox;
