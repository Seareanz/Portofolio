(function() {

'use strict';

document.addEventListener('DOMContentLoaded', function() {

    var typingEl = document.getElementById('typingText');

    if (!typingEl) {
        return;
    }

    var techWords = ['PHP', 'HTML', 'CSS', 'JavaScript', 'Laravel', 'MySQL', 'Git'];

    var wordIndex = 0;
    var charIndex = 0;
    var isDeleting = false;

    function typeEffect() {

        var currentWord = techWords[wordIndex];
        var displayText;

        if (isDeleting) {

            displayText = currentWord.substring(0, charIndex - 1);
            charIndex--;

        } else {

            displayText = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        typingEl.textContent = displayText;

        // 
        var speed = isDeleting ? 60 : 120;

        if (!isDeleting && charIndex === currentWord.length) {

            speed = 2000; // jeda lebih lama
            isDeleting = true;

        } else if (isDeleting && charIndex === 0) {

            isDeleting = false;
            wordIndex = (wordIndex + 1) % techWords.length;
            speed = 400;
        }

        setTimeout(typeEffect, speed);
    }

    setTimeout(typeEffect, 800);
});

var hamburger = document.getElementById('hamburger');
var overlay = document.getElementById('navOverlay');
var navbar = document.getElementById('navbar');
var navLinks = document.querySelectorAll('.nav-links a');
var mobileNavLinks = overlay ? overlay.querySelectorAll('a') : [];
var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));

if (hamburger && overlay) {

    hamburger.addEventListener('click', function() {

        var isOpen = overlay.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    overlay.querySelectorAll('a').forEach(function(link) {

        link.addEventListener('click', function() {

            overlay.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

function updateNavbar() {

    var scrollY = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollY > 40) {

        navbar.classList.add('scrolled');

    } else {

        navbar.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', updateNavbar, { passive: true });

function syncAriaCurrent() {

    var allLinks = document.querySelectorAll('.nav-links a, .nav-overlay a');

    allLinks.forEach(function(link) {

        link.removeAttribute('aria-current');

        if (link.classList.contains('active')) {

            link.setAttribute('aria-current', 'page');
        }
    });
}

function setActiveNav(id) {

    navLinks.forEach(function(link) {

        var active = link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', active);
    });

    mobileNavLinks.forEach(function(link) {

        var active = link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', active);
    });

    syncAriaCurrent();
}

var currentSection = null;
var sectionChangeTimer = null;
var scrollTicking = false;
var lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
var LEAVE_DURATION = 400; // cepat tanpa geser-geser terlalu lama

function resetSection(section) {

    if (!section) {
        return;
    }

    section.classList.remove('is-active');
    section.classList.remove('is-leaving');
    section.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function(element) {

        element.classList.remove('visible');
    });
}

function activateSection(section) {

    if (!section) {
        return;
    }

    if (currentSection === section) {
        return;
    }

    clearTimeout(sectionChangeTimer);

    var previousSection = currentSection;

    
    if (previousSection && previousSection !== section) {

        previousSection.classList.remove('is-active');
        previousSection.classList.add('is-leaving');
        previousSection.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function(element) {

            element.classList.remove('visible');
        });

        sectionChangeTimer = setTimeout(function() {

            if (previousSection !== currentSection) {

                resetSection(previousSection);
            }

        }, LEAVE_DURATION);
    }

    
    sections.forEach(function(item) {

        if (item !== section && item !== previousSection) {

            resetSection(item);
        }
    });

    
    currentSection = section;
    section.classList.remove('is-leaving');
    void section.offsetWidth;
    section.classList.add('is-active');

    
    var revealElements = section.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    revealElements.forEach(function(element, index) {

        setTimeout(function() {

            if (currentSection !== section) {
                return;
            }

            element.classList.add('visible');

        }, 120 + (index * 110));
    });

    setActiveNav(section.id);
}

function activateHome() {

    clearTimeout(sectionChangeTimer);

    if (currentSection) {

        currentSection.classList.remove('is-active');
        currentSection.classList.remove('is-leaving');
    }

    sections.forEach(function(section) {

        resetSection(section);
    });

    currentSection = null;
    setActiveNav('home');
}

function detectActiveSection() {

    var scrollY = window.pageYOffset || document.documentElement.scrollTop;

    /*
     * 
     */
    if (scrollY <= window.innerHeight * 0.25) {

        activateHome();
        return;
    }

    var navHeight = navbar ? navbar.offsetHeight : 64;

    /*
     * 
     */
    var focusY = navHeight + ((window.innerHeight - navHeight) * 0.48);

    var bestSection = null;
    var bestScore = Infinity;

    sections.forEach(function(section) {

        var rect = section.getBoundingClientRect();
        var visibleAmount = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, navHeight);

        if (visibleAmount <= 0) {
            return;
        }

        var center = rect.top + (rect.height / 2);
        var distance = Math.abs(center - focusY);
        var visibilityPenalty = Math.max(0, (window.innerHeight - visibleAmount) * 0.06);
        var score = distance + visibilityPenalty;

        if (score < bestScore) {

            bestScore = score;
            bestSection = section;
        }
    });

    if (bestSection) {

        activateSection(bestSection);
    }
}

function handleSectionScroll() {

    if (scrollTicking) {
        return;
    }

    scrollTicking = true;

    requestAnimationFrame(function() {

        var currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
        var delta = Math.abs(currentScrollY - lastScrollY);

        /*
         * 
         */
        if (delta >= 8) {

            detectActiveSection();
            lastScrollY = currentScrollY;
        }

        updateNavbar();
        scrollTicking = false;
    });
}

window.addEventListener('scroll', handleSectionScroll, { passive: true });
window.addEventListener('resize', function() {

    detectActiveSection();

}, { passive: true });

window.addEventListener('load', function() {

    activateHome();

    setTimeout(function() {

        lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
        detectActiveSection();

    }, 200);

    updateNavbar();
});

var contactForm = document.getElementById('contactForm');
var formError = document.getElementById('formError');

function showFormError(message) {

    if (formError) {

        formError.textContent = message;
        formError.classList.add('show');

    } else {

        alert(message);
    }
}

if (contactForm) {

    contactForm.addEventListener('submit', function(event) {

        var name = document.getElementById('name').value.trim();
        var email = document.getElementById('email').value.trim();
        var message = document.getElementById('message').value.trim();

        if (formError) {

            formError.classList.remove('show');
        }

        if (!name || !email || !message) {

            event.preventDefault();
            showFormError('Mohon lengkapi Nama, Email, dan Pesan terlebih dahulu.');
            return;
        }

        if (email.indexOf('@') === -1 || email.indexOf('.') === -1) {

            event.preventDefault();
            showFormError('Mohon masukkan alamat email yang valid.');
            return;
        }
    });
}

window.addEventListener('load', function() {

    var urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('success') === 'true') {

        var notif = document.getElementById('successNotif');

        if (notif) {

            var contactSection = document.getElementById('contact');
            activateSection(contactSection);
            notif.classList.add('show');

            if (window.history && window.history.replaceState) {

                var newUrl = window.location.pathname + window.location.hash;
                window.history.replaceState({}, document.title, newUrl);
            }

            setTimeout(function() {

                notif.scrollIntoView({ behavior: 'smooth', block: 'center' });

            }, 500);
        }
    }
});

document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {

    anchor.addEventListener('click', function(event) {

        var targetId = this.getAttribute('href');

        if (!targetId || targetId === '#') {
            return;
        }

        var targetEl = document.querySelector(targetId);

        if (!targetEl) {
            return;
        }

        event.preventDefault();

        if (overlay && hamburger) {

            overlay.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        /*  */
        if (targetId === '#home') {

            activateHome();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (targetEl.classList.contains('section')) {

            activateSection(targetEl);
        }

        var navHeight = navbar ? navbar.offsetHeight : 64;
        var targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

        setTimeout(function() {

            detectActiveSection();

        }, 800);
    });
});

if (overlay && hamburger) {

    overlay.addEventListener('keydown', function(event) {

        if (event.key === 'Escape') {

            overlay.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            hamburger.focus();
        }
    });
}

setActiveNav('home');

})();
    