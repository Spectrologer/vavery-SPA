document.addEventListener('DOMContentLoaded', () => {
    // Get references to both the main canvas and the new blur canvas
    const canvas = document.getElementById('portfolioCanvas');
    const blurCanvas = document.getElementById('blurCanvas');
    if (!canvas || !blurCanvas) {
        console.error("Canvas elements not found!");
        return;
    }
    const ctx = canvas.getContext('2d');
    const blurCtx = blurCanvas.getContext('2d');

    let animationId;
    let blurAnimationId; // Separate ID for the blur animation
    let isLowPowerMode = false;
    let isMobile = window.innerWidth < 768;
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastFrameTime = 0;
    let pointColor = '#FFFFFF';
    let points = [];
    let ticking = false;
    const frameInterval = 1000 / (isMobile ? 30 : 60);

    // --- Accessibility Color Contrast Functions ---
    function getLuminance(r, g, b) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function getContrastRatio(hex1, hex2) {
        const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
        const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
        const lum1 = getLuminance(r1, g1, b1), lum2 = getLuminance(r2, g2, b2);
        const brightest = Math.max(lum1, lum2), darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    // --- End Accessibility Functions ---
    
    class Point {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * (isMobile ? 1.5 : 2) + (isMobile ? 0.5 : 1);
            const speedMultiplier = isMobile ? 0.3 : 0.4;
            this.speedX = (Math.random() * speedMultiplier - speedMultiplier/2);
            this.speedY = (Math.random() * speedMultiplier - speedMultiplier/2);
        }

        draw(context) {
            context.fillStyle = pointColor;
            context.beginPath();
            context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            context.fill();
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
        if ('vibrate' in navigator) navigator.vibrate(10);
    }

    function animate(currentTime) {
        if (currentTime - lastFrameTime < frameInterval) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        lastFrameTime = currentTime;

        if (document.hidden) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!isReducedMotion) {
            points.forEach(p => {
                p.update();
                p.draw(ctx);
            });
        } else {
            points.forEach(p => p.draw(ctx));
        }
        
        animationId = requestAnimationFrame(animate);
    }

    function detectLowPowerDevice() {
        const tempCanvas = document.createElement('canvas');
        const gl = tempCanvas.getContext('webgl') || tempCanvas.getContext('experimental-webgl');
        if (!gl) return true;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            return renderer.includes('Intel') || renderer.includes('Mali') || renderer.includes('Adreno');
        }
        return false;
    }

    function enhanceMobileInteractions() {
        document.querySelectorAll('.btn, button, .nav-link').forEach(el => {
            el.addEventListener('touchstart', () => {
                if (el.matches('.btn, button')) el.style.transform = 'scale(0.98)';
                addHapticFeedback();
            }, { passive: true });
            
            if (el.matches('.btn, button')) {
                el.addEventListener('touchend', () => {
                    setTimeout(() => el.style.transform = '', 100);
                }, { passive: true });
            }
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

    const initializeBotChecker = () => {
        const butlerian = document.getElementById('butlerian');
        if (butlerian) butlerian.value = '2';
    };
    
    // --- Lightbox Functionality (Unchanged) ---
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

    function initPoints() {
        isLowPowerMode = detectLowPowerDevice();
        let baseCount = canvas.width * canvas.height / 9000;
        if (isReducedMotion) baseCount *= 0.3;
        else if (isMobile || isLowPowerMode) baseCount *= 0.5;
        const numberOfPoints = Math.max(10, Math.floor(baseCount));
        points = [];
        for (let i = 0; i < numberOfPoints; i++) {
            points.push(new Point());
        }
    }

    const infoIcon = document.getElementById('info-icon');
    const infoPanel = document.getElementById('info-panel');
    const mainContent = document.getElementById('main-content');

    // --- HTMX Integration ---
    // The previous `loadContent` function has been replaced by HTMX event listeners.

    // Handle events after new content is swapped in by HTMX
    document.body.addEventListener('htmx:afterSwap', function(event) {
        // Re-initialize JS for the new content
        const requestPath = event.detail.pathInfo.requestPath;
        if (requestPath.includes('projects.html')) {
            initializeProjectsPage();
        } else if (requestPath.includes('contact.html')) {
            setTimeout(initializeBotChecker, 100);
        }
        
        enhanceMobileInteractions();
        updatePageMeta(requestPath);
        updateActiveNav(requestPath);

        // Add the slide-down animation to the new content
        const newContainer = mainContent.querySelector('.content-container');
        if (newContainer) {
            newContainer.classList.add('animate-slide-down');
        }

        // Stop the blur effect
        setTimeout(() => {
            cancelAnimationFrame(blurAnimationId);
            if (blurCtx) {
                blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
            }
        }, 500); // Allow time for content animation
    });
    
    // Animate blur effect before HTMX swaps the content
    document.body.addEventListener('htmx:beforeRequest', function() {
        if (isReducedMotion) return;
        const animateBlur = () => {
            blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
            blurCtx.save();
            blurCtx.filter = 'blur(4px)';
            blurCtx.drawImage(canvas, 0, 0);
            blurCtx.restore();
            blurAnimationId = requestAnimationFrame(animateBlur);
        };
        blurAnimationId = requestAnimationFrame(animateBlur);
    });

    const pageConfig = {
        'home.html': { title: 'Vaughn Avery - Junior UX Designer & Frontend Developer', description: 'Junior UX Designer with experience in UI/UX design, frontend development, and user research. Available for full-time UX roles in remote.' },
        'projects.html': { title: 'UX Design Projects - Vaughn Avery Portfolio', description: 'View my UX design projects including Ochlo security app, Eugene Access service finder, and Cash Cache financial visualizer. Case studies and design process included.' },
        'about.html': { title: 'About Vaughn Avery - Junior UX Designer Skills & Experience', description: 'Learn about my background in UX design, frontend development, and technical skills. Experienced with Figma, Adobe Suite, HTML/CSS, and responsive design.' },
        'contact.html': { title: 'Contact Vaughn Avery - Hire Junior UX Designer', description: 'Get in touch to discuss UX design opportunities, freelance projects, or collaboration. Available for junior UX designer positions and contract work.' }
    };
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        blurCanvas.width = window.innerWidth;
        blurCanvas.height = window.innerHeight;
        isMobile = window.innerWidth < 768;
    }

    function getRandomAccessibleColors() {
        const white = "#FFFFFF";
        const WCAG_MIN_CONTRAST = 4.5;
        let themeColor, starColor, contrastRatio;
        do {
            const hue = Math.random() * 360;
            const saturation = 70 + Math.random() * 30;
            const themeLightness = 20 + Math.random() * 30;
            themeColor = hslToHex(hue, saturation, themeLightness);
            const starLightness = 75 + Math.random() * 10;
            starColor = hslToHex(hue, saturation, starLightness);
            contrastRatio = getContrastRatio(themeColor, white);
        } while (contrastRatio < WCAG_MIN_CONTRAST);
        return { themeColor, starColor };
    }

    function updatePageMeta(page) {
        const pageName = page.split('/').pop();
        const config = pageConfig[pageName];
        if (config) {
            document.title = config.title;
            document.querySelector('meta[name="description"]').setAttribute('content', config.description);
            document.querySelector('meta[property="og:title"]').setAttribute('content', config.title);
            document.querySelector('meta[property="og:description"]').setAttribute('content', config.description);
        }
    }
    
    function updateActiveNav(pageUrl) {
        const pageName = pageUrl.split('/').pop();
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active', 'text-white', 'font-bold');
            link.classList.add('text-gray-300');
            if (link.getAttribute('href') === pageName) {
                link.classList.add('active', 'text-white', 'font-bold');
                link.classList.remove('text-gray-300');
            }
        });
    }

    function updateScrollPosition() { ticking = false; }

    const colorizeButton = document.getElementById('colorize');
    colorizeButton.addEventListener('click', () => {
        colorizeButton.classList.add('spinning');
        const newColors = getRandomAccessibleColors();
        pointColor = newColors.starColor;
        document.documentElement.style.setProperty('--theme-color', newColors.themeColor);
        setTimeout(() => colorizeButton.classList.remove('spinning'), 500);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(animationId);
        else animationId = requestAnimationFrame(animate);
    });

    // Event delegation for contact form submission - THIS REMAINS THE SAME
    mainContent.addEventListener('submit', async (event) => {
        if (event.target && event.target.id === 'contact-form') {
            event.preventDefault();
            const form = event.target;
            const submitBtn = document.getElementById('submit-btn');
            const submitIcon = document.getElementById('submit-icon');
            const submitText = document.getElementById('submit-text');
            const successMessage = document.getElementById('success-message');
            const errorMessage = document.getElementById('error-message');
            
            successMessage.classList.add('hidden');
            errorMessage.classList.add('hidden');
            submitBtn.disabled = true;
            submitIcon.className = 'fas fa-spinner fa-spin';
            submitText.textContent = 'Sending...';
            
            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    successMessage.classList.remove('hidden');
                    form.reset();
                } else { throw new Error('Form submission failed'); }
            } catch (error) {
                errorMessage.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitIcon.className = 'fas fa-paper-plane';
                submitText.textContent = 'Send Message';
            }
        }
    });

    // Event delegation for various clicks - THIS REMAINS MOSTLY THE SAME
    mainContent.addEventListener('click', (event) => {
        // Email reveal
        if (event.target && event.target.id === 'email-reveal') {
            const emailSpan = event.target;
            if (emailSpan.getAttribute('data-revealed')) return;
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
        
        // Project case study toggle
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
                setTimeout(() => caseStudyContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 400);
            } else {
                buttonText.textContent = buttonText.textContent.replace('Hide Case Study', 'View Case Study');
            }
        }

        // Profile image easter egg
        const profileImage = event.target.closest('.profile-image');
        if (profileImage) {
            let clickCount = parseInt(profileImage.getAttribute('data-click-count') || '0');
            clickCount++;
            profileImage.setAttribute('data-click-count', clickCount);
            if (clickCount >= 2) profileImage.classList.add('falling');
        }
    });

    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('imageModal');
        if (!modal || modal.classList.contains('hidden')) return;
        switch(e.key) {
            case 'Escape': modal.querySelector('.lightbox-close').click(); break;
            case 'ArrowRight': modal.querySelector('.lightbox-next').click(); break;
            case 'ArrowLeft': modal.querySelector('.lightbox-prev').click(); break;
        }
    });

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
            event.stopPropagation();
            if (infoPanel.classList.contains('opacity-100')) hidePanel();
            else showPanel();
        });
        document.addEventListener('click', (event) => {
            if (!infoPanel.contains(event.target) && !infoIcon.contains(event.target)) {
                if (infoPanel.classList.contains('opacity-100')) hidePanel();
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const target = document.querySelector(e.target.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollPosition);
            ticking = true;
        }
    }, { passive: true });

    // Initial setup
    resizeCanvas();
    initPoints();
    animate();
    enhanceMobileInteractions();
    updateActiveNav('home.html'); // Set initial active link
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        initPoints();
    });
});
