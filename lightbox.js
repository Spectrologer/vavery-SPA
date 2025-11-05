// Lightbox Module - Image gallery functionality
const Lightbox = (function() {
    let currentImageIndex = 0;
    let galleryImages = [];
    let lightboxInitialized = false;
    let touchStartX = 0;
    let touchStartY = 0;

    function initializeLightbox() {
        if (lightboxInitialized) return;

        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const caption = document.getElementById('lightbox-caption');
        const closeBtn = document.querySelector('.lightbox-close');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');

        galleryImages = Array.from(document.querySelectorAll('.gallery-image'));

        function closeModal() {
            modal.classList.remove('visible');

            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                document.body.style.overflow = '';
            }, 400);
        }

        function openModal(index) {
            currentImageIndex = index;
            const img = galleryImages[currentImageIndex];
            const imgSrc = img.getAttribute('data-full') || img.src;
            const imgCaption = img.getAttribute('data-caption') || '';

            modalImage.src = imgSrc;
            modalImage.alt = img.alt;
            caption.textContent = imgCaption;

            modal.classList.remove('hidden');
            modal.classList.add('flex');

            setTimeout(() => {
                modal.classList.add('visible');
            }, 10);

            document.body.style.overflow = 'hidden';
        }

        function showNextImage() {
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            updateModalImage();
        }

        function showPrevImage() {
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            updateModalImage();
        }

        function updateModalImage() {
            const img = galleryImages[currentImageIndex];
            const imgSrc = img.getAttribute('data-full') || img.src;
            modalImage.src = imgSrc;
            modalImage.alt = img.alt;
            caption.textContent = img.getAttribute('data-caption') || '';
        }

        function handleTouchStart(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }

        function handleTouchEnd(e) {
            if (!touchStartX || !touchStartY) return;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchStartX - touchEndX;
            const deltaY = touchStartY - touchEndY;
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) showNextImage();
                else showPrevImage();
            }
            touchStartX = 0;
            touchStartY = 0;
        }

        galleryImages.forEach((img, index) => {
            img.addEventListener('click', () => openModal(index));
        });

        if (modal) {
            modal.addEventListener('touchstart', handleTouchStart, { passive: true });
            modal.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNextImage(); });
        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrevImage(); });
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        if (modalImage) modalImage.addEventListener('click', (e) => e.stopPropagation());

        lightboxInitialized = true;
    }

    function initializeProjectsPage() {
        // Reset lightbox state for newly loaded content
        lightboxInitialized = false;
        initializeLightbox();
    }

    function init() {
        // Initialize lightbox on page load if we're on projects page
        if (window.location.pathname.includes('projects.html') || document.querySelectorAll('.gallery-image').length > 0) {
            initializeLightbox();
        }
    }

    return {
        init,
        initializeProjectsPage
    };
})();
