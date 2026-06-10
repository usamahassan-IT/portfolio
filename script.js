/* ============================================
   USAMA HASSAN PORTFOLIO - JAVASCRIPT
   Maximum Animations & Interactivity
   ============================================ */

// ==========================================
// DARK / LIGHT THEME TOGGLE
// ==========================================
(function initTheme() {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();

function toggleTheme() {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';

    // Add transition class for smooth switch
    document.body.classList.add('theme-transitioning');

    if (isLight) {
        html.removeAttribute('data-theme');
        localStorage.setItem('portfolio-theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('portfolio-theme', 'light');
    }

    // Update particle colors
    updateParticleColors();

    // Remove transition class after animation completes
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
    }, 600);
}

function updateParticleColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (typeof particles !== 'undefined') {
        const darkColors = ['255, 107, 53', '232, 67, 147', '247, 201, 72', '255, 140, 90'];
        const lightColors = ['200, 60, 20', '180, 40, 110', '200, 155, 30', '210, 90, 40'];
        const colors = isLight ? lightColors : darkColors;
        particles.forEach(p => {
            p.color = colors[Math.floor(Math.random() * colors.length)];
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// ==========================================
// PRELOADER
// ==========================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
        initRevealAnimations();
        animateStats();
    }, 2200);
});

document.body.style.overflow = 'hidden';

// ==========================================
// CUSTOM CURSOR
// ==========================================
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    // Smooth cursor movement
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    followerX += (mouseX - followerX) * 0.08;
    followerY += (mouseY - followerY) * 0.08;

    cursor.style.left = cursorX - 4 + 'px';
    cursor.style.top = cursorY - 4 + 'px';
    cursorFollower.style.left = followerX - 18 + 'px';
    cursorFollower.style.top = followerY - 18 + 'px';

    requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover effects
const hoverTargets = document.querySelectorAll('a, button, .interest-card, .tool-card, .contact-card, .cert-card, .timeline-card, .skill-chip');
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        cursorFollower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        cursorFollower.classList.remove('hover');
    });
});

// ==========================================
// PARTICLES BACKGROUND
// ==========================================
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        // Warm colors: orange, coral, amber
        const colors = [
            '255, 107, 53',    // Orange
            '232, 67, 147',    // Pink
            '247, 201, 72',    // Amber
            '255, 140, 90',    // Light coral
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += this.pulseSpeed;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        const pulsedOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.pulse));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${pulsedOpacity})`;
        ctx.fill();
    }
}

// Create particles
function initParticles() {
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
    particles = [];
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

initParticles();

// Draw connections between nearby particles
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                const opacity = (1 - dist / 150) * 0.08;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(255, 107, 53, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    drawConnections();
    animationId = requestAnimationFrame(animateParticles);
}

animateParticles();

// Mouse interaction with particles
let particleMouseX = 0, particleMouseY = 0;
document.addEventListener('mousemove', (e) => {
    particleMouseX = e.clientX;
    particleMouseY = e.clientY;
    particles.forEach(p => {
        const dx = p.x - particleMouseX;
        const dy = p.y - particleMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
            const force = (120 - dist) / 120;
            p.speedX += (dx / dist) * force * 0.3;
            p.speedY += (dy / dist) * force * 0.3;
            // Dampen speed
            p.speedX *= 0.97;
            p.speedY *= 0.97;
        }
    });
});

// ==========================================
// TYPEWRITER EFFECT
// ==========================================
const typewriterElement = document.getElementById('typewriter');
const typewriterTexts = [
    'Front-End Web Developer',
    'UI/UX Enthusiast',
    'Responsive Design Expert',
    'JavaScript Developer',
    'Clean Code Advocate',
    'Problem Solver'
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeDelay = 80;

function typeWriter() {
    const currentText = typewriterTexts[textIndex];

    if (isDeleting) {
        typewriterElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typeDelay = 40;
    } else {
        typewriterElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typeDelay = 80;
    }

    if (!isDeleting && charIndex === currentText.length) {
        typeDelay = 2500;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typewriterTexts.length;
        typeDelay = 500;
    }

    setTimeout(typeWriter, typeDelay);
}

setTimeout(typeWriter, 2500);

// ==========================================
// NAVIGATION
// ==========================================
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

// Scroll effects
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar scroll effect
    if (scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Active nav link
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === sectionId) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Mobile menu
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// SCROLL REVEAL ANIMATIONS
// ==========================================
function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger the animation
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

// ==========================================
// STATS COUNTER ANIMATION
// ==========================================
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCount(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => observer.observe(num));
}

function animateCount(element, target) {
    let current = 0;
    const increment = target / 60;
    const duration = 2000;
    const stepTime = duration / 60;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

// ==========================================
// SKILL BAR ANIMATIONS
// ==========================================
const skillBars = document.querySelectorAll('.skill-progress');

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('animated');
            }, 300);
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

skillBars.forEach(bar => skillObserver.observe(bar));

// ==========================================
// TILT EFFECT ON HERO IMAGE
// ==========================================
const heroImageWrapper = document.querySelector('.hero-image-wrapper');
if (heroImageWrapper) {
    heroImageWrapper.addEventListener('mousemove', (e) => {
        const rect = heroImageWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -8;
        const rotateY = (x - centerX) / centerX * 8;

        heroImageWrapper.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    heroImageWrapper.addEventListener('mouseleave', () => {
        heroImageWrapper.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        heroImageWrapper.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    heroImageWrapper.addEventListener('mouseenter', () => {
        heroImageWrapper.style.transition = 'none';
    });
}

// ==========================================
// MAGNETIC BUTTON EFFECT
// ==========================================
document.querySelectorAll('.btn, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'none';
    });
});

// ==========================================
// PARALLAX ON HERO GLOWS
// ==========================================
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const glow1 = document.querySelector('.hero-glow-1');
    const glow2 = document.querySelector('.hero-glow-2');

    if (glow1 && scrollY < window.innerHeight) {
        glow1.style.transform = `translate(${scrollY * 0.1}px, ${scrollY * 0.2}px) scale(${1 + scrollY * 0.0003})`;
        glow2.style.transform = `translate(${-scrollY * 0.08}px, ${-scrollY * 0.15}px) scale(${1 + scrollY * 0.0002})`;
    }
});

// ==========================================
// CONTACT FORM
// ==========================================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('form-submit');
        const originalContent = submitBtn.innerHTML;
        
        // Animate button
        submitBtn.innerHTML = `
            <span>Sending...</span>
            <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
        `;
        submitBtn.style.pointerEvents = 'none';

        setTimeout(() => {
            submitBtn.innerHTML = `
                <span>Message Sent!</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            `;
            submitBtn.style.background = 'linear-gradient(135deg, #00e676, #00c853)';
            contactForm.reset();

            setTimeout(() => {
                submitBtn.innerHTML = originalContent;
                submitBtn.style.background = '';
                submitBtn.style.pointerEvents = '';
            }, 3000);
        }, 1500);
    });
}

// ==========================================
// TEXT SCRAMBLE EFFECT ON SECTION TITLES
// ==========================================
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += char;
            } else {
                output += from;
            }
        }
        this.el.innerText = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

// Apply text scramble to section titles on scroll
const sectionTitles = document.querySelectorAll('.section-title');
const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const originalText = entry.target.textContent;
            const scramble = new TextScramble(entry.target);
            scramble.setText(originalText);
            titleObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

sectionTitles.forEach(title => titleObserver.observe(title));

// ==========================================
// SMOOTH HOVER RIPPLE ON CARDS
// ==========================================
document.querySelectorAll('.timeline-card, .contact-card, .interest-card, .tool-card, .skill-chip').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 107, 53, 0.06), var(--bg-card) 60%)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.background = '';
    });
});

// ==========================================
// PAGE VISIBILITY - PAUSE ANIMATIONS
// ==========================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationId);
    } else {
        animateParticles();
    }
});

// ==========================================
// INITIALIZE EVERYTHING
// ==========================================
console.log('%c👋 Hey there, curious developer!', 'color: #ff6b35; font-size: 18px; font-weight: bold;');
console.log('%cBuilt with ❤️ by Usama Hassan', 'color: #f7c948; font-size: 14px;');
