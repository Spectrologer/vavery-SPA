/ Gallery Modal JavaScript
// This handles the lightbox functionality for the art gallery images

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const caption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    const galleryImages = document.querySelectorAll('.gallery-image');

    let currentImageIndex = 0;
    let images = Array.from(galleryImages);

    // Function to open the modal with a specific image
    function openModal(index) {
        currentImageIndex = index;
        const img = images[currentImageIndex];
        const imgSrc = img.src;
        const imgCaption = img.getAttribute('data-caption') || '';

        modalImage.src = imgSrc;
        modalImage.alt = img.alt;
        caption.textContent = imgCaption;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Add the visible class for CSS animations
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);

        // Prevent body scrolling when modal is open
        document.body.style.overflow = 'hidden';
    }

    // Function to close the modal
    function closeModal() {
        modal.classList.remove('visible');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
        }, 400); // Match the CSS transition duration
    }

    // Function to show the next image
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        const img = images[currentImageIndex];
        const imgSrc = img.src;
        const imgCaption = img.getAttribute('data-caption') || '';

        modalImage.src = imgSrc;
        modalImage.alt = img.alt;
        caption.textContent = imgCaption;
    }

    // Function to show the previous image
    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        const img = images[currentImageIndex];
        const imgSrc = img.src;
        const imgCaption = img.getAttribute('data-caption') || '';

        modalImage.src = imgSrc;
        modalImage.alt = img.alt;
        caption.textContent = imgCaption;
    }

    // Add click event listeners to all gallery images
    images.forEach((img, index) => {
        img.addEventListener('click', () => {
            openModal(index);
        });
    });

    // Close modal when clicking the close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Navigate to next image
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showNextImage();
        });
    }

    // Navigate to previous image
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPrevImage();
        });
    }

    // Close modal when clicking outside the image
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('visible')) return;

        switch(e.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
        }
    });

    // Prevent modal image from closing the modal when clicked
    if (modalImage) {
        modalImage.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});