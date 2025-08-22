// Background Animation JavaScript
// This creates the animated particle background for standalone pages like projects.html

document.addEventListener('DOMContentLoaded', () => {
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
});