// Canvas Animation Module - Background particle system
const CanvasAnimation = (function() {
    let canvas, ctx, blurCanvas, blurCtx;
    let animationId, blurAnimationId;
    let isLowPowerMode = false;
    let isMobile = false;
    let isReducedMotion = false;
    let lastFrameTime = 0;
    let pointColor = '#FFFFFF';
    let points = [];
    const frameInterval = 1000 / 60;

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
        // Check hardware concurrency (CPU cores)
        const cores = navigator.hardwareConcurrency || 2;
        if (cores <= 2) return true;

        // Check device memory if available
        if ('deviceMemory' in navigator && navigator.deviceMemory <= 4) return true;

        // Check connection if available
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') return true;
        }

        const tempCanvas = document.createElement('canvas');
        const gl = tempCanvas.getContext('webgl') || tempCanvas.getContext('experimental-webgl');
        if (!gl) return true;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            return renderer.includes('Intel') || renderer.includes('Mali') || renderer.includes('Adreno') ||
                   renderer.includes('PowerVR') || renderer.includes('VideoCore');
        }
        return false;
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

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        blurCanvas.width = window.innerWidth;
        blurCanvas.height = window.innerHeight;
        isMobile = window.innerWidth < 768;
        initPoints();
    }

    function init() {
        canvas = document.getElementById('portfolioCanvas');
        blurCanvas = document.getElementById('blurCanvas');
        if (!canvas || !blurCanvas) {
            console.error("Canvas elements not found!");
            return false;
        }

        ctx = canvas.getContext('2d');
        blurCtx = blurCanvas.getContext('2d');
        isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        resizeCanvas();
        animate();

        window.addEventListener('resize', resizeCanvas);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(animationId);
            else animationId = requestAnimationFrame(animate);
        });

        return true;
    }

    function setPointColor(color) {
        pointColor = color;
    }

    function getBlurAnimation() {
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
    }

    function stopBlurAnimation() {
        cancelAnimationFrame(blurAnimationId);
        if (blurCtx) {
            blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
        }
    }

    return {
        init,
        setPointColor,
        getBlurAnimation,
        stopBlurAnimation
    };
})();
