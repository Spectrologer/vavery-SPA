// Main Application Entry Point - Modular SPA
document.addEventListener('DOMContentLoaded', () => {
    // Register service worker for caching and offline capability
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }

    // Initialize all modules
    const modules = [CanvasAnimation, ThemeManager, Navigation, Forms, Accessibility, DataBinding];

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
