document.addEventListener('DOMContentLoaded', () => {
    // --- Canvas Animation Setup ---
    
    const canvas = document.getElementById('portfolioCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    const ctx = canvas.getContext('2d');

    let points = [];
    let pointColor = '#FFFFFF';

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Point {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = pointColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initPoints() {
        const numberOfPoints = Math.floor((canvas.width * canvas.height) / 9000);
        points = [];
        for (let i = 0; i < numberOfPoints; i++) {
            points.push(new Point());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < points.length; i++) {
            points[i].update();
            points[i].draw();
        }
        requestAnimationFrame(animate);
    }

    initPoints();
    animate();
    window.addEventListener('resize', initPoints);

    // --- Color Randomizer Button Functionality ---
    const colorizeButton = document.getElementById('colorize');

    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    function getRandomCorrespondingColors() {
        const hue = Math.random() * 360;
        const saturation = 70 + Math.random() * 30;
        const darkLightness = 25 + Math.random() * 15;
        const brightLightness = 75 + Math.random() * 10;
        const themeColor = hslToHex(hue, saturation, darkLightness);
        const starColor = hslToHex(hue, saturation, brightLightness);
        return { themeColor, starColor };
    }

    colorizeButton.addEventListener('click', () => {
        const newColors = getRandomCorrespondingColors();
        pointColor = newColors.starColor;
        document.documentElement.style.setProperty('--theme-color', newColors.themeColor);
    });

    // --- Lightbox Functionality ---
    let currentImageIndex = 0;
    let galleryImages = [];

    function initializeLightbox() {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const caption = document.getElementById('lightbox-caption');
        const closeBtn = document.querySelector('.lightbox-close');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');
        
        // Re-query gallery images each time content is loaded
        galleryImages = Array.from(document.querySelectorAll('.gallery-image'));

        function openModal(index) {
            currentImageIndex = index;
            const img = galleryImages[currentImageIndex];
            const imgSrc = img.src;
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

        function closeModal() {
            modal.classList.remove('visible');
            
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                document.body.style.overflow = '';
            }, 400);
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
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            caption.textContent = img.getAttribute('data-caption') || '';
        }

        // Add click event listeners to all gallery images
        galleryImages.forEach((img, index) => {
            img.addEventListener('click', () => {
                openModal(index);
            });
        });

        // Close modal when clicking the close button
        if (closeBtn) {
            closeBtn.removeEventListener('click', closeModal); // Remove old listener
            closeBtn.addEventListener('click', closeModal);
        }

        // Navigate to next image
        if (nextBtn) {
            nextBtn.removeEventListener('click', showNextImage); // Remove old listener
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showNextImage();
            });
        }

        // Navigate to previous image
        if (prevBtn) {
            prevBtn.removeEventListener('click', showPrevImage); // Remove old listener
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

        // Prevent modal image from closing the modal when clicked
        if (modalImage) {
            modalImage.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    // Keyboard navigation (global listener)
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('imageModal');
        if (!modal || modal.classList.contains('hidden')) return;

        switch(e.key) {
            case 'Escape':
                modal.querySelector('.lightbox-close').click();
                break;
            case 'ArrowRight':
                modal.querySelector('.lightbox-next').click();
                break;
            case 'ArrowLeft':
                modal.querySelector('.lightbox-prev').click();
                break;
        }
    });

    // --- Dynamic Page Content Loading ---
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.nav-link');

    const loadContent = async (url) => {
        try {
            mainContent.style.opacity = '0';
            await new Promise(resolve => setTimeout(resolve, 300));

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            mainContent.innerHTML = data;
            mainContent.style.opacity = '1';

            // Initialize lightbox after content is loaded
            if (url === 'projects.html') {
                setTimeout(initializeLightbox, 100);
            }
        } catch (error) {
            mainContent.innerHTML = `<p class="text-center text-red-400">Error loading content: ${error.message}</p>`;
            mainContent.style.opacity = '1';
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = e.target.getAttribute('href');

            navLinks.forEach(navLink => {
                navLink.classList.remove('text-white', 'font-bold');
                navLink.classList.add('text-gray-300');
            });
            e.target.classList.add('text-white', 'font-bold');
            e.target.classList.remove('text-gray-300');

            loadContent(url);
            history.pushState(null, '', `?page=${url.split('.')[0]}`);
        });
    });

    function loadInitialPage() {
        const initialPage = new URLSearchParams(window.location.search).get('page');
        const homeLink = document.querySelector('a[href="home.html"]');
        
        if (initialPage) {
            const linkToActivate = document.querySelector(`a[href="${initialPage}.html"]`);
            if (linkToActivate) {
                linkToActivate.click();
            } else {
                homeLink.click();
            }
        } else {
            homeLink.click();
        }
    }
    
    loadInitialPage();

    // --- Event Listener for Dynamically Loaded Content ---
    mainContent.addEventListener('click', (event) => {
        // Email reveal functionality
        if (event.target && event.target.id === 'email-reveal') {
            const emailSpan = event.target;
            
            if (emailSpan.getAttribute('data-revealed')) {
                return;
            }
            emailSpan.setAttribute('data-revealed', 'true');

            const user = emailSpan.getAttribute('data-user');
            const domain = emailSpan.getAttribute('data-domain');
            const emailAddress = `${user}@${domain}`;
            
            const mailLink = document.createElement('a');
            mailLink.href = `mailto:${emailAddress}`;
            mailLink.textContent = emailAddress;
            mailLink.className = emailSpan.className; 
            mailLink.classList.remove('cursor-pointer');
            
            emailSpan.parentNode.replaceChild(mailLink, emailSpan);
        }

        // "View My Work" button functionality
        const viewWorkButton = event.target.closest('#view-work-btn');
        if (viewWorkButton) {
            event.preventDefault();
            document.querySelector('header .nav-link[href="projects.html"]').click();
        }

        // "Get In Touch" button functionality
        const getInTouchButton = event.target.closest('#get-in-touch-btn');
        if (getInTouchButton) {
            event.preventDefault();
            document.querySelector('header .nav-link[href="contact.html"]').click();
        }
    });
});