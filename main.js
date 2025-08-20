document.addEventListener('DOMContentLoaded', () => {
    // --- Canvas Animation Setup ---
    const canvas = document.getElementById('portfolioCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    const ctx = canvas.getContext('2d');

    let points = [];
    // The color of the stars/points. This will be changed by the button.
    let pointColor = '#FFFFFF';

    // Function to set canvas size to fill the window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Set initial size

    // Defines a single star/point
    class Point {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.4 - 0.2; // Slower speed
            this.speedY = Math.random() * 0.4 - 0.2; // Slower speed
        }

        // Update point's position
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Wrap points when they go off-screen
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        // Draw the point on the canvas
        draw() {
            ctx.fillStyle = pointColor; // Use the global color variable
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Create the initial set of points
    function initPoints() {
        // Adjust number of points based on screen size
        const numberOfPoints = Math.floor((canvas.width * canvas.height) / 9000);
        points = [];
        for (let i = 0; i < numberOfPoints; i++) {
            points.push(new Point());
        }
    }

    // The main animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < points.length; i++) {
            points[i].update();
            points[i].draw();
        }
        requestAnimationFrame(animate); // Loop forever
    }

    initPoints();
    animate();
    window.addEventListener('resize', initPoints); // Re-initialize points on resize

    // --- Color Randomizer Button Functionality ---
    const colorizeButton = document.getElementById('colorize');

    /**
     * Converts an HSL color value to HEX.
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {string} The HEX color string.
     */
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

  /**
 * Generates a pair of corresponding colors: a dark one for the theme (high-contrast with white text)
 * and a bright one for the stars (visible on a dark background).
 * @returns {{themeColor: string, starColor: string}}
 */
function getRandomCorrespondingColors() {
    const hue = Math.random() * 360;
    const saturation = 70 + Math.random() * 30; // Vibrant saturation remains good

    // A darker lightness value for the theme to ensure white text is always readable
    const darkLightness = 25 + Math.random() * 15; // Adjusted: now between 25% and 40%
    
    // A bright lightness value for the stars to ensure they are visible
    const brightLightness = 75 + Math.random() * 10; // Between 75% and 85%

    const themeColor = hslToHex(hue, saturation, darkLightness);
    const starColor = hslToHex(hue, saturation, brightLightness);

    return { themeColor, starColor };
}


    // Event listener for the colorize button
    colorizeButton.addEventListener('click', () => {
        const newColors = getRandomCorrespondingColors();

        // Update the star color with the bright version
        pointColor = newColors.starColor;

        // Update the CSS variable with the dark version for the site theme
        document.documentElement.style.setProperty('--theme-color', newColors.themeColor);
    });


    // --- Dynamic Page Content Loading ---
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.nav-link');

    // Fetches and loads HTML content into the main area
    const loadContent = async (url) => {
        try {
            mainContent.style.opacity = '0'; // Fade out
            await new Promise(resolve => setTimeout(resolve, 300)); // Wait for fade

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            mainContent.innerHTML = data;
            mainContent.style.opacity = '1'; // Fade in
        } catch (error) {
            mainContent.innerHTML = `<p class="text-center text-red-400">Error loading content: ${error.message}</p>`;
            mainContent.style.opacity = '1';
        }
    };

    // Handle navigation clicks to load content without a full page refresh
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = e.target.getAttribute('href');

            // Update active link style
            navLinks.forEach(navLink => {
                navLink.classList.remove('text-white', 'font-bold');
                navLink.classList.add('text-gray-300');
            });
            e.target.classList.add('text-white', 'font-bold');
            e.target.classList.remove('text-gray-300');

            loadContent(url);
            // Update URL for bookmarking/sharing
            history.pushState(null, '', `?page=${url.split('.')[0]}`);
        });
    });
    
    // Load initial page based on URL parameter or default to home
    function loadInitialPage() {
        const initialPage = new URLSearchParams(window.location.search).get('page');
        const homeLink = document.querySelector('a[href="home.html"]');
        
        if (initialPage) {
            const linkToActivate = document.querySelector(`a[href="${initialPage}.html"]`);
            if (linkToActivate) {
                linkToActivate.click();
            } else {
                homeLink.click(); // Default to home if page not found
            }
        } else {
            homeLink.click(); // Default to home
        }
    }
    
    loadInitialPage();
});
