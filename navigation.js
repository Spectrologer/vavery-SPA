// Navigation Module - HTMX integration and routing
const Navigation = (function() {
    const pageConfig = {
        'home.html': { title: 'Vaughn Avery - Junior UX Designer & Frontend Developer', description: 'Junior UX Designer with experience in UI/UX design, frontend development, and user research. Available for full-time UX roles in remote.' },
        'projects.html': { title: 'UX Design Projects - Vaughn Avery Portfolio', description: 'View my UX design projects including Ochlo security app, Eugene Access service finder, and Cash Cache financial visualizer. Case studies and design process included.' },
        'about.html': { title: 'About Vaughn Avery - Junior UX Designer Skills & Experience', description: 'Learn about my background in UX design, frontend development, and technical skills. Experienced with Figma, Adobe Suite, HTML/CSS, and responsive design.' },
        'contact.html': { title: 'Contact Vaughn Avery - Hire Junior UX Designer', description: 'Get in touch to discuss UX design opportunities, freelance projects, or collaboration. Available for junior UX designer positions and contract work.' }
    };

    function updatePageMeta(page) {
        const pageName = page.split('/').pop();
        const config = pageConfig[pageName];
        if (config) {
            document.title = config.title;
            const metaDesc = document.querySelector('meta[name="description"]');
            const ogTitle = document.querySelector('meta[property="og:title"]');
            const ogDesc = document.querySelector('meta[property="og:description"]');

            if (metaDesc) metaDesc.setAttribute('content', config.description);
            if (ogTitle) ogTitle.setAttribute('content', config.title);
            if (ogDesc) ogDesc.setAttribute('content', config.description);
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

    function handleContentSwap(event) {
        // Re-initialize JS for the new content
        const requestPath = event.detail.pathInfo.requestPath;
        if (requestPath.includes('projects.html')) {
            if (typeof Lightbox !== 'undefined') {
                Lightbox.initializeProjectsPage();
            }
            if (typeof DataBinding !== 'undefined') {
                DataBinding.initPage('projects');
            }
        } else if (requestPath.includes('about.html')) {
            if (typeof DataBinding !== 'undefined') {
                DataBinding.initPage('about');
            }
        } else if (requestPath.includes('contact.html')) {
            if (typeof Forms !== 'undefined') {
                Forms.initializeBotChecker();
            }
        }

        if (typeof Accessibility !== 'undefined') {
            Accessibility.enhanceMobileInteractions();
        }

        updatePageMeta(requestPath);
        updateActiveNav(requestPath);

        // Add the slide-down animation to the new content
        const mainContent = document.getElementById('main-content');
        const newContainer = mainContent.querySelector('.content-container');
        if (newContainer) {
            newContainer.classList.add('animate-slide-down');
        }

        // Stop the blur effect
        if (typeof CanvasAnimation !== 'undefined') {
            setTimeout(() => {
                CanvasAnimation.stopBlurAnimation();
            }, 500);
        }
    }

    function handleBeforeRequest() {
        // Animate blur effect before HTMX swaps the content
        if (typeof CanvasAnimation !== 'undefined') {
            CanvasAnimation.getBlurAnimation();
        }
    }

    function init() {
        // Handle events after new content is swapped in by HTMX
        document.body.addEventListener('htmx:afterSwap', handleContentSwap);

        // Animate blur effect before HTMX swaps the content
        document.body.addEventListener('htmx:beforeRequest', handleBeforeRequest);

        // Set initial active link
        updateActiveNav('home.html');
    }

    return {
        init,
        updatePageMeta,
        updateActiveNav
    };
})();
