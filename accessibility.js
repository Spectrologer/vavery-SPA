// Accessibility Module - WCAG compliance and mobile enhancements
const Accessibility = (function() {
    function addHapticFeedback() {
        if ('vibrate' in navigator) navigator.vibrate(10);
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

    function handleKeyboardNavigation() {
        const modal = document.getElementById('imageModal');
        document.addEventListener('keydown', (e) => {
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
    }

    function handleSmoothScrolling() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    function handleInfoPanel() {
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
    }

    function handleEmailReveal() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
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
            });
        }
    }

    function handleCaseStudyToggle() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.addEventListener('click', (event) => {
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
            });
        }
    }

    function handleProfileImageEasterEgg() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.addEventListener('click', (event) => {
                // Profile image easter egg
                const profileImage = event.target.closest('.profile-image');
                if (profileImage) {
                    let clickCount = parseInt(profileImage.getAttribute('data-click-count') || '0');
                    clickCount++;
                    profileImage.setAttribute('data-click-count', clickCount);
                    if (clickCount >= 2) profileImage.classList.add('falling');
                }
            });
        }
    }

    function init() {
        enhanceMobileInteractions();
        handleKeyboardNavigation();
        handleSmoothScrolling();
        handleInfoPanel();
        handleEmailReveal();
        handleCaseStudyToggle();
        handleProfileImageEasterEgg();
    }

    return {
        init,
        enhanceMobileInteractions
    };
})();
