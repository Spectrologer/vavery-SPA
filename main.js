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

    // --- NEW: Event Listener for Dynamically Loaded Content ---
    // This listens for clicks on the main content area. If the clicked
    // element is the email reveal span, it runs the reveal logic.
    mainContent.addEventListener('click', (event) => {
        // Check if the clicked element is the one we're looking for
        if (event.target && event.target.id === 'email-reveal') {
            const emailSpan = event.target;
            
            // Prevent this from running more than once
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
            
            // Copy styling from the original span
            mailLink.className = emailSpan.className; 
            mailLink.classList.remove('cursor-pointer');
            
            // Replace the span with the new clickable link
            emailSpan.parentNode.replaceChild(mailLink, emailSpan);
        }
    });
});