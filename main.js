document.addEventListener('DOMContentLoaded', () => {

// --- Dynamic Page Titles for SEO ---
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

    function updatePageMeta(page) {
        const config = pageConfig[page];
        if (config) {
            // Update title
            document.title = config.title;
            
            // Update meta description
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', config.description);
            }
            
            // Update Open Graph tags
            let ogTitle = document.querySelector('meta[property="og:title"]');
            let ogDesc = document.querySelector('meta[property="og:description"]');
            
            if (ogTitle) ogTitle.setAttribute('content', config.title);
            if (ogDesc) ogDesc.setAttribute('content', config.description);
        }
    }

    // --- Bot Checker Initialization (moved to top for global access) ---
    const initializeBotChecker = () => {
        const butlerian = document.getElementById('butlerian');
        if (butlerian) {
            butlerian.value = '2';
        }
    };

// --- Mobile-Optimized Canvas Animation Setup ---
    
    const canvas = document.getElementById('portfolioCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    const ctx = canvas.getContext('2d');

    let points = [];
    let pointColor = '#FFFFFF';
    let animationId;
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isMobile = window.innerWidth < 768;
    let isLowPowerMode = false;

    // Detect if device might be low-power
    function detectLowPowerDevice() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return true; // No WebGL = likely low power
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            // Basic check for integrated graphics or mobile GPUs
            return renderer.includes('Intel') || renderer.includes('Mali') || renderer.includes('Adreno');
        }
        return false;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        isMobile = window.innerWidth < 768;
    }
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        initPoints(); // Reinitialize with new device detection
    });
    resizeCanvas();

    class Point {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * (isMobile ? 1.5 : 2) + (isMobile ? 0.5 : 1);
            
            // Slower movement on mobile to reduce CPU usage
            const speedMultiplier = isMobile ? 0.3 : 0.4;
            this.speedX = (Math.random() * speedMultiplier - speedMultiplier/2);
            this.speedY = (Math.random() * speedMultiplier - speedMultiplier/2);
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
        isLowPowerMode = detectLowPowerDevice();
        
        // Adaptive particle count based on device capabilities
        let baseCount = canvas.width * canvas.height / 9000;
        
        if (isReducedMotion) {
            baseCount *= 0.3; // Significantly fewer particles for accessibility
        } else if (isMobile || isLowPowerMode) {
            baseCount *= 0.5; // Half the particles on mobile/low-power
        }
        
        const numberOfPoints = Math.max(10, Math.floor(baseCount));
        points = [];
        for (let i = 0; i < numberOfPoints; i++) {
            points.push(new Point());
        }
    }

    let lastFrameTime = 0;
    const targetFPS = isMobile ? 30 : 60; // Lower FPS on mobile
    const frameInterval = 1000 / targetFPS;

    function animate(currentTime) {
        // Skip frames if we're not ready yet (throttle animation)
        if (currentTime - lastFrameTime < frameInterval) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        lastFrameTime = currentTime;

        // Pause animation if page is not visible (saves battery)
        if (document.hidden) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Only animate if reduced motion is not preferred
        if (!isReducedMotion) {
            for (let i = 0; i < points.length; i++) {
                points[i].update();
                points[i].draw();
            }
        } else {
            // Static particles for reduced motion users
            for (let i = 0; i < points.length; i++) {
                points[i].draw();
            }
        }
        
        animationId = requestAnimationFrame(animate);
    }

    // Pause animation when page becomes hidden (saves battery)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animationId = requestAnimationFrame(animate);
        }
    });

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
    // This line starts the animation
    colorizeButton.classList.add('spinning');

    const newColors = getRandomCorrespondingColors();
    pointColor = newColors.starColor;
    document.documentElement.style.setProperty('--theme-color', newColors.themeColor);

    // This line removes the animation class after it's done (500ms)
    setTimeout(() => colorizeButton.classList.remove('spinning'), 500);
});

    /// --- Mobile-Enhanced Lightbox Functionality ---
    let currentImageIndex = 0;
    let galleryImages = [];
    let touchStartX = 0;
    let touchStartY = 0;

    function initializeLightbox() {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const caption = document.getElementById('lightbox-caption');
        const closeBtn = document.querySelector('.lightbox-close');
        const prevBtn = document.querySelector('.lightbox-prev');
        const nextBtn = document.querySelector('.lightbox-next');
        
        galleryImages = Array.from(document.querySelectorAll('.gallery-image'));

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
            const imgSrc = img.getAttribute('data-full') || img.src;
            modalImage.src = imgSrc;
            modalImage.alt = img.alt;
            caption.textContent = img.getAttribute('data-caption') || '';
        }

        // Touch/swipe support for mobile
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

            // Only trigger swipe if horizontal movement is greater than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > 50) { // Minimum swipe distance
                    if (deltaX > 0) {
                        showNextImage(); // Swipe left = next image
                    } else {
                        showPrevImage(); // Swipe right = previous image
                    }
                }
            }

            touchStartX = 0;
            touchStartY = 0;
        }

        // Add click event listeners to all gallery images
        galleryImages.forEach((img, index) => {
            img.addEventListener('click', () => {
                openModal(index);
            });
        });

        // Touch events for swipe navigation
        if (modal) {
            modal.addEventListener('touchstart', handleTouchStart, { passive: true });
            modal.addEventListener('touchend', handleTouchEnd, { passive: true });
        }

        // Close modal when clicking the close button
        if (closeBtn) {
            closeBtn.removeEventListener('click', closeModal);
            closeBtn.addEventListener('click', closeModal);
        }

        // Navigate to next image
        if (nextBtn) {
            nextBtn.removeEventListener('click', showNextImage);
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showNextImage();
            });
        }

        // Navigate to previous image
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

        // Prevent modal image from closing the modal when clicked
        if (modalImage) {
            modalImage.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }
    
    // NEW FUNCTION TO INITIALIZE PROJECTS PAGE JS
    function initializeProjectsPage() {
        // No need to add event listeners here. Event delegation is now used.
        
        // Also initialize lightbox since it's on the projects page
        initializeLightbox();
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

            // Initialize appropriate functionality based on loaded page
            if (url === 'projects.html') {
                initializeProjectsPage();
            } else if (url === 'contact.html') {
                // Initialize bot checker when contact page is loaded
                setTimeout(initializeBotChecker, 100);
            }
            
            // Always enhance mobile interactions after content loads
            enhanceMobileInteractions();
            
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
    
// --- Contact Form Handling ---
    mainContent.addEventListener('submit', async (event) => {
        if (event.target && event.target.id === 'contact-form') {
            event.preventDefault();
            
            const form = event.target;
            const submitBtn = document.getElementById('submit-btn');
            const submitIcon = document.getElementById('submit-icon');
            const submitText = document.getElementById('submit-text');
            const successMessage = document.getElementById('success-message');
            const errorMessage = document.getElementById('error-message');
            
            // Hide any existing messages
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
                    // Success
                    successMessage.classList.remove('hidden');
                    form.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Error
                errorMessage.classList.remove('hidden');
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitIcon.className = 'fas fa-paper-plane';
                submitText.textContent = 'Send Message';
            }
        }
    });
    

    
    // --- Mobile Navigation Enhancements ---
    
    // Add haptic feedback on mobile devices (if supported)
    function addHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10); // Very subtle vibration
        }
    }

    // Improve button interactions for mobile
    function enhanceMobileInteractions() {
        const buttons = document.querySelectorAll('.btn, button');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Add touch feedback to buttons
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
        
        // Add touch feedback to navigation
        navLinks.forEach(link => {
            link.addEventListener('touchstart', () => {
                addHapticFeedback();
            }, { passive: true });
        });
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
        
        // Check for case study toggle clicks using event delegation
        const toggleButton = event.target.closest('.case-study-toggle');
        if (toggleButton) {
            const projectId = toggleButton.getAttribute('data-project');
            const caseStudyContent = document.getElementById(projectId + '-case-study');
            const buttonText = toggleButton.querySelector('.btn-text') || toggleButton;

            const isExpanded = caseStudyContent.classList.toggle('expanded');
            toggleButton.classList.toggle('expanded');

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

        // Profile image easter egg
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

    // Check for bot checker on any page load (including direct navigation)
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
    
    // Start observing the main content for changes
    observer.observe(mainContent, { childList: true, subtree: true });

    // --- Site Info Popover ---
    const infoIcon = document.getElementById('info-icon');
    const infoPanel = document.getElementById('info-panel');

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
            event.stopPropagation(); // Prevent click from bubbling up to the document
            const isVisible = infoPanel.classList.contains('opacity-100');
            if (isVisible) {
                hidePanel();
            } else {
                showPanel();
            }
        });

        // Close popover when clicking outside
        document.addEventListener('click', (event) => {
            if (!infoPanel.contains(event.target) && !infoIcon.contains(event.target)) {
                // Only hide if it's currently visible
                if (infoPanel.classList.contains('opacity-100')) {
                    hidePanel();
                }
            }
        });
    }

    // Initialize on first load
    enhanceMobileInteractions();

    // Add smooth scroll for anchor links 
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

    // Optimize scroll performance on mobile
    let ticking = false;
    function updateScrollPosition() {
        // Add any scroll-based effects here if needed
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollPosition);
            ticking = true;
        }
    }, { passive: true });
});