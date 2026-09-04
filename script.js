/**
 * GURSHARAN SINGH — PORTFOLIO SCRIPTS
 * Handcrafted vanilla JavaScript · Zero external dependencies
 */

(function () {
    'use strict';

    // 1. Mouse Spotlight Effect via CSS variables
    const spotlight = document.getElementById('spotlight');
    if (spotlight && window.matchMedia('(hover: hover)').matches) {
        window.addEventListener('pointermove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            document.documentElement.style.setProperty('--mouse-x', ${e.clientX}px);
            document.documentElement.style.setProperty('--mouse-y', ${e.clientY}px);
        }, { passive: true });
    }

    // 2. Active Navigation Highlight using IntersectionObserver
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    if ('IntersectionObserver' in window && sections.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -65% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach((link) => {
                        if (link.getAttribute('href') === #) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach((section) => observer.observe(section));
    }

    // 3. Clipboard API with Fallback & Toast Notification
    let toastTimeout = null;

    window.copyEmail = function (email) {
        const targetEmail = email || 'gurudeveloper05@gmail.com';
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(targetEmail).then(() => {
                showToast(Copied  to clipboard);
            }).catch(() => {
                fallbackCopy(targetEmail);
            });
        } else {
            fallbackCopy(targetEmail);
        }
    };

    function fallbackCopy(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast(Copied  to clipboard);
        } catch (err) {
            showToast(Email: );
        }
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        const msgEl = document.getElementById('toast-msg');
        if (!toast || !msgEl) return;

        msgEl.textContent = message;
        toast.classList.add('visible');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 3200);
    }
})();
