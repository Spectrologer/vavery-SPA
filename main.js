// Main Application Entry Point - Modular SPA
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    const modules = [CanvasAnimation, ThemeManager, Navigation, Lightbox, Forms, Accessibility];

    modules.forEach(module => {
        if (module && typeof module.init === 'function') {
            module.init();
        }
    });

    // Set up cross-module communication
    if (typeof ThemeManager !== 'undefined' && typeof CanvasAnimation !== 'undefined') {
        // Sync initial theme colors
        const initialColor = ThemeManager.getPointColor();
        if (initialColor) {
            CanvasAnimation.setPointColor(initialColor);
        }
    }
});
