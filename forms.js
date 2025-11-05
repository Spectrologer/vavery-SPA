// Forms Module - Contact form handling
const Forms = (function() {
    function initializeBotChecker() {
        const butlerian = document.getElementById('butlerian');
        if (butlerian) butlerian.value = '2';
    }

    function handleFormSubmission(event) {
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

            const formData = new FormData(form);
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    successMessage.classList.remove('hidden');
                    form.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                errorMessage.classList.remove('hidden');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitIcon.className = 'fas fa-paper-plane';
                submitText.textContent = 'Send Message';
            });
        }
    }

    function init() {
        const mainContent = document.getElementById('main-content');

        // Event delegation for contact form submission
        if (mainContent) {
            mainContent.addEventListener('submit', handleFormSubmission);
        }

        // Initialize bot checker if on contact page
        if (window.location.pathname.includes('contact.html')) {
            initializeBotChecker();
        }
    }

    return {
        init,
        initializeBotChecker
    };
})();
