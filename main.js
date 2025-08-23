document.addEventListener('DOMContentLoaded', () => {
    // This is for animating the background canvas
    const canvas = document.getElementById('portfolioCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    const ctx = canvas.getContext('2d');

    let animationId;
    let isLowPowerMode = false;
    let isMobile = window.innerWidth < 768;
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastFrameTime = 0;
    let pointColor = '#FFFFFF';
    let points = [];
    let ticking = false;
    const frameInterval = 1000 / (isMobile ? 30 : 60); // Lower FPS on mobile
    
    // --- Accessibility Color Contrast Functions ---

    /**
     * Calculates the relative luminance of a color.
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {number} The luminance value (0-1)
     */
    function getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    /**
     * Calculates the contrast ratio between two hex colors.
     * @param {string} hex1 - The first color in hex format (e.g., "#RRGGBB")
     * @param {string} hex2 - The second color in hex format
     * @returns {number} The contrast ratio
     */
    function getContrastRatio(hex1, hex2) {
        const r1 = parseInt(hex1.slice(1, 3), 16);
        const g1 = parseInt(hex1.slice(3, 5), 16);
        const b1 = parseInt(hex1.slice(5, 7), 16);

        const r2 = parseInt(hex2.slice(1, 3), 16);
        const g2 = parseInt(hex2.slice(3, 5), 16);
        const b2 = parseInt(hex2.slice(5, 7), 16);

        const lum1 = getLuminance(r1, g1, b1);
        const lum2 = getLuminance(r2, g2, b2);

        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);

        return (brightest + 0.05) / (darkest + 0.05);
    }

    // --- End Accessibility Functions ---
    
    class Point {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * (isMobile ? 1.5 : 2) + (isMobile ? 0.5 : 1);
            
            // Slower movement on mobile to save some CPU
            const speedMultiplier = isMobile ? 0.3 : 0.4;
            this.speedX = (Math.random() * speedMultiplier - speedMultiplier/2);
            this.speedY = (Math.random() * speedMultiplier - speedMultiplier/2);
        }

        draw() {
            ctx.fillStyle = pointColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
    }

    function addHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10); // A tiny buzz
        }
    }

    function animate(currentTime) {
        // Skip frames if we're not ready yet (throttle animation)
        if (currentTime - lastFrameTime < frameInterval) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        lastFrameTime = currentTime;

        // Pause animation if the page is not visible to save battery
        if (document.hidden) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Only animate if the user doesn't prefer reduced motion
        if (!isReducedMotion) {
            for (let i = 0; i < points.length; i++) {
                points[i].update();
                points[i].draw();
            }
        } else {
            // Static particles for folks who want less motion
            for (let i = 0; i < points.length; i++) {
                points[i].draw();
            }
        }
        
        animationId = requestAnimationFrame(animate);
    }

    // This checks if the device might be running low on power
    function detectLowPowerDevice() {
        const tempCanvas = document.createElement('canvas');
        const gl = tempCanvas.getContext('webgl') || tempCanvas.getContext('experimental-webgl');
        if (!gl) return true; // No WebGL means it's probably low power
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            // Checking for integrated graphics or mobile GPUs
            return renderer.includes('Intel') || renderer.includes('Mali') || renderer.includes('Adreno');
        }
        return false;
    }

    function enhanceMobileInteractions() {
        const buttons = document.querySelectorAll('.btn, button');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Adds touch feedback to buttons
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.98)';
                addHapticFeedback();
            }, { passive: true });
            
            button.addEventListener('touchend', () => {
                setTimeout(() => {
                    button.style.transform = '';
                }, 100);
            }, { passive: true });
        });
        
        // Adds touch feedback to the navigation
        navLinks.forEach(link => {
            link.addEventListener('touchstart', () => {
                addHapticFeedback();
            }, { passive: true });
        });
    }

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

    // Sets up the anti-bot field on the contact form
    const initializeBotChecker = () => {
        const butlerian = document.getElementById('butlerian');
        if (butlerian) {
            butlerian.value = '2';
        }
    };
    
    let currentImageIndex = 0;
    let galleryImages = [];
    let lightboxInitialized = false;
    let touchStartX = 0;
    let touchStartY = 0;

    // This sets up the lightbox functionality
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

        // Handles touch/swipe for mobile
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

            // Trigger swipe only if the horizontal movement is more than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > 50) { // Minimum swipe distance
                    if (deltaX > 0) {
                        showNextImage(); // Swipe left for next
                    } else {
                        showPrevImage(); // Swipe right for previous
                    }
                }
            }

            touchStartX = 0;
            touchStartY = 0;
        }

        // Click listeners for all gallery images
        galleryImages.forEach((img, index) => {
            img.addEventListener('click', () => {
                openModal(index);
            });
        });

        // Touch events for swiping
        if (modal) {
            modal.addEventListener('touchstart', handleTouchStart, { passive: true });
            modal.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        // Close button click listener
        if (closeBtn) {
            closeBtn.removeEventListener('click', closeModal);
            closeBtn.addEventListener('click', closeModal);
        }

        // Next button click listener
        if (nextBtn) {
            nextBtn.removeEventListener('click', showNextImage);
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showNextImage();
            });
        }

        // Previous button click listener
        if (prevBtn) {
            prevBtn.removeEventListener('click', showPrevImage);
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

        // Don't close modal when clicking the image itself
        if (modalImage) {
            modalImage.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        lightboxInitialized = true;
    }
    
    function initializeProjectsPage() {
        // Initializes the lightbox, which is used on the projects page
        initializeLightbox();
    }

    function initPoints() {
        isLowPowerMode = detectLowPowerDevice();
        
        // The number of particles depends on the device
        let baseCount = canvas.width * canvas.height / 9000;
        
        if (isReducedMotion) {
            baseCount *= 0.3; // Way fewer particles for accessibility
        } else if (isMobile || isLowPowerMode) {
            baseCount *= 0.5; // Half the particles on mobile/low-power
        }
        
        const numberOfPoints = Math.max(10, Math.floor(baseCount));
        points = [];
        for (let i = 0; i < numberOfPoints; i++) {
            points.push(new Point());
        }
    }

    // Initializes the info popover
    const infoIcon = document.getElementById('info-icon');
    const infoPanel = document.getElementById('info-panel');

    function loadContent(url) {
        // Loads content dynamically
        try {
            mainContent.style.opacity = '0';
            setTimeout(async () => {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.text();
                mainContent.innerHTML = data;
                mainContent.style.opacity = '1';

                // Initialize stuff based on which page was loaded
                if (url === 'projects.html') {
                    initializeProjectsPage();
                } else if (url === 'contact.html') {
                    setTimeout(initializeBotChecker, 100);
                }
                
                enhanceMobileInteractions();
            }, 300);
        } catch (error) {
            mainContent.innerHTML = `<p class="text-center text-red-400">Error loading content: ${error.message}</p>`;
            mainContent.style.opacity = '1';
        }
    }

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

    // Handles page title and meta tags
    const pageConfig = {
        'home.html': {
            title: 'Vaughn Avery - Junior UX Designer & Frontend Developer',
            description: 'Junior UX Designer with experience in UI/UX design, frontend development, and user research. Available for full-time UX roles in remote.'
        },
        'projects.html': {
            title: 'UX Design Projects - Vaughn Avery Portfolio',
            description: 'View my UX design projects including Ochlo security app, Eugene Access service finder, and Cash Cache financial visualizer. Case studies and design process included.'
        },
        'about.html': {
            title: 'About Vaughn Avery - Junior UX Designer Skills & Experience', 
            description: 'Learn about my background in UX design, frontend development, and technical skills. Experienced with Figma, Adobe Suite, HTML/CSS, and responsive design.'
        },
        'contact.html': {
            title: 'Contact Vaughn Avery - Hire Junior UX Designer',
            description: 'Get in touch to discuss UX design opportunities, freelance projects, or collaboration. Available for junior UX designer positions and contract work.'
        }
    };
    
    // Updates the canvas size on window resize
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        isMobile = window.innerWidth < 768;
    }

    /**
     * Generates random, accessible theme and star colors.
     * It ensures the theme color has a contrast ratio of at least 4.5:1 against white (for button text).
     */
    function getRandomAccessibleColors() {
        const white = "#FFFFFF";
        const WCAG_MIN_CONTRAST = 4.5;
        let themeColor, starColor, contrastRatio;

        do {
            const hue = Math.random() * 360;
            const saturation = 70 + Math.random() * 30;
            
            // Generate a theme color that is dark enough to contrast with white text
            const themeLightness = 20 + Math.random() * 30; // Skew towards darker colors
            themeColor = hslToHex(hue, saturation, themeLightness);
            
            // The star color can be brighter
            const starLightness = 75 + Math.random() * 10;
            starColor = hslToHex(hue, saturation, starLightness);
            
            // The primary check is now against white for button text readability
            contrastRatio = getContrastRatio(themeColor, white);

        } while (contrastRatio < WCAG_MIN_CONTRAST);

        return { themeColor, starColor };
    }


    function updatePageMeta(page) {
        const config = pageConfig[page];
        if (config) {
            // Updates title and meta tags
            document.title = config.title;
            
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', config.description);
            }
            
            let ogTitle = document.querySelector('meta[property="og:title"]');
            let ogDesc = document.querySelector('meta[property="og:description"]');
            
            if (ogTitle) ogTitle.setAttribute('content', config.title);
            if (ogDesc) ogDesc.setAttribute('content', config.description);
        }
    }

    function updateScrollPosition() {
        // Any scroll-based effects would go here
        ticking = false;
    }

    // Event listeners
    
    // Handles the color randomizer button
    const colorizeButton = document.getElementById('colorize');
    colorizeButton.addEventListener('click', () => {
        colorizeButton.classList.add('spinning');
        const newColors = getRandomAccessibleColors(); // Use the new accessible function
        pointColor = newColors.starColor;
        document.documentElement.style.setProperty('--theme-color', newColors.themeColor);
        setTimeout(() => colorizeButton.classList.remove('spinning'), 500);
    });

    // Pause animation when the page is hidden (for battery life)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animationId = requestAnimationFrame(animate);
        }
    });

    // Handles form submissions using event delegation
    const mainContent = document.getElementById('main-content');
    mainContent.addEventListener('submit', async (event) => {
        if (event.target && event.target.id === 'contact-form') {
            event.preventDefault();
            
            const form = event.target;
            const submitBtn = document.getElementById('submit-btn');
            const submitIcon = document.getElementById('submit-icon');
            const submitText = document.getElementById('submit-text');
            const successMessage = document.getElementById('success-message');
            const errorMessage = document.getElementById('error-message');
            
            // Hide any old messages
            successMessage.classList.add('hidden');
            errorMessage.classList.add('hidden');
            
            // Show loading state
            submitBtn.disabled = true;
            submitIcon.className = 'fas fa-spinner fa-spin';
            submitText.textContent = 'Sending...';
            
            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    successMessage.classList.remove('hidden');
                    form.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                errorMessage.classList.remove('hidden');
            } finally {
                // Reset the button
                submitBtn.disabled = false;
                submitIcon.className = 'fas fa-paper-plane';
                submitText.textContent = 'Send Message';
            }
        }
    });

    // Handles various clicks on dynamically loaded content
    mainContent.addEventListener('click', (event) => {
        // Email reveal
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
        
        // Case study toggle
        const toggleButton = event.target.closest('.case-study-toggle');
        if (toggleButton) {
            const projectId = toggleButton.getAttribute('data-project');
            const caseStudyContent = document.getElementById(projectId + '-case-study');
            const buttonText = toggleButton.querySelector('.btn-text') || toggleButton;

            const isExpanded = caseStudyContent.classList.toggle('expanded');
            toggleButton.classList.toggle('expanded');
            
            toggleButton.setAttribute('aria-expanded', isExpanded);
            caseStudyContent.setAttribute('aria-hidden', !isExpanded);

            if (isExpanded) {
                buttonText.textContent = buttonText.textContent.replace('View Case Study', 'Hide Case Study');
                setTimeout(() => {
                    caseStudyContent.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }, 400);
            } else {
                buttonText.textContent = buttonText.textContent.replace('Hide Case Study', 'View Case Study');
            }
        }

        // "View My Work" button
        const viewWorkButton = event.target.closest('#view-work-btn');
        if (viewWorkButton) {
            event.preventDefault();
            document.querySelector('header .nav-link[href="projects.html"]').click();
        }

        // "Get In Touch" button
        const getInTouchButton = event.target.closest('#get-in-touch-btn');
        if (getInTouchButton) {
            event.preventDefault();
            document.querySelector('header .nav-link[href="contact.html"]').click();
        }
        
        //
        // 🥚🥚🥚🥚
        // Nothing to see here
        // 🥚🥚🥚🥚
        //
        const profileImage = event.target.closest('.profile-image');
        if (profileImage) {
            let clickCount = parseInt(profileImage.getAttribute('data-click-count') || '0');
            clickCount++;
            profileImage.setAttribute('data-click-count', clickCount);

            if (clickCount >= 2) {
                profileImage.classList.add('falling');
            }
        }
    });

    // Handles keyboard navigation (e.g., Esc, Arrow keys) for the lightbox
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

    // The observer looks for changes in the main content to initialize things
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const contactForm = document.getElementById('contact-form');
                const projectsPageLoaded = document.querySelector('.project-showcase');
                
                if (projectsPageLoaded) {
                     initializeProjectsPage();
                }
                if (contactForm && !contactForm.getAttribute('data-bot-checker-initialized')) {
                    initializeBotChecker();
                    contactForm.setAttribute('data-bot-checker-initialized', 'true');
                }
            }
        });
    });
    
    // Starts observing the main content
    observer.observe(mainContent, { childList: true, subtree: true });

    const navLinks = document.querySelectorAll('.nav-link');
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

    // Closes the info popover when you click outside of it
    if (infoIcon && infoPanel) {
        const hidePanel = () => {
            infoPanel.classList.remove('opacity-100', 'translate-y-0');
            infoPanel.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
        };
        const showPanel = () => {
            infoPanel.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
            infoPanel.classList.add('opacity-100', 'translate-y-0');
        };
        infoIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Stops the click from bubbling up
            const isVisible = infoPanel.classList.contains('opacity-100');
            if (isVisible) {
                hidePanel();
            } else {
                showPanel();
            }
        });
        document.addEventListener('click', (event) => {
            if (!infoPanel.contains(event.target) && !infoIcon.contains(event.target)) {
                if (infoPanel.classList.contains('opacity-100')) {
                    hidePanel();
                }
            }
        });
    }

    // Smooth scroll for anchor links
    document.addEventListener('click', (e) => {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const target = document.querySelector(e.target.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });

    // This makes scrolling more performant on mobile
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollPosition);
            ticking = true;
        }
    }, { passive: true });

    // Initial setup when the page loads
    resizeCanvas();
    initPoints();
    animate();
    enhanceMobileInteractions();
    loadInitialPage();

    window.addEventListener('resize', () => {
        resizeCanvas();
        initPoints(); // Re-initialize with new device detection
    });
});
