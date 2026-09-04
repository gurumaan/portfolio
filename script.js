/**
 * GURSHARAN SINGH — PORTFOLIO SCRIPTS
 * Handcrafted vanilla JavaScript · Zero external dependencies
 */

(function () {
    'use strict';

    // 1. Mouse Spotlight Effect via CSS variables
    var spotlight = document.getElementById('spotlight');
    if (spotlight && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
        window.addEventListener('pointermove', function (e) {
            document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
            document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
        }, { passive: true });
    }

    // 2. Active Navigation Highlight using IntersectionObserver
    var navLinks = document.querySelectorAll('.nav-link');
    var sections = document.querySelectorAll('.content-section');

    if ('IntersectionObserver' in window && sections.length > 0) {
        var observerOptions = {
            root: null,
            rootMargin: '-20% 0px -65% 0px',
            threshold: 0
        };

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    navLinks.forEach(function (link) {
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    // 3. Clipboard API with Fallback & Toast Notification
    var toastTimeout = null;

    window.copyEmail = function (email) {
        var targetEmail = email || 'gurudeveloper05@gmail.com';

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(targetEmail).then(function () {
                showToast('Copied ' + targetEmail + ' to clipboard');
            }).catch(function () {
                fallbackCopy(targetEmail);
            });
        } else {
            fallbackCopy(targetEmail);
        }
    };

    function fallbackCopy(text) {
        try {
            var textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Copied ' + text + ' to clipboard');
        } catch (err) {
            showToast('Email: ' + text);
        }
    }

    function showToast(message) {
        var toast = document.getElementById('toast');
        var msgEl = document.getElementById('toast-msg');
        if (!toast || !msgEl) return;

        msgEl.textContent = message;
        toast.classList.add('visible');

        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }
        toastTimeout = setTimeout(function () {
            toast.classList.remove('visible');
        }, 3200);
    }
})();
