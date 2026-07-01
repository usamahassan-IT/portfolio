import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ---- SCENE SETUP ----
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// We use fog to blend the 3D objects into the background smoothly
// Initial dark mode fog
const darkFogColor = new THREE.Color(0x020202);
const lightFogColor = new THREE.Color(0xffffff); // Pure white fog
scene.fog = new THREE.FogExp2(darkFogColor, 0.03);
scene.background = new THREE.Color(0x020202); // Explicitly set background color

const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 12;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;

// ---- POST PROCESSING (BLOOM) ----
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 2.5, 1.2, 0.1);
bloomPass.threshold = 0.1;
bloomPass.strength = 2.5; 
bloomPass.radius = 1.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// ---- BACKGROUND CORE (FLUID BLUR) ----
const fluidGroup = new THREE.Group();
scene.add(fluidGroup);

const sphereGeo = new THREE.SphereGeometry(3, 32, 32);

// Vibrant, multi-color palette for a highly creative background
const fluidColors = [
    0x0fa4af, // Teal (User's accent)
    0x7c3aed, // Deep Violet
    0xf97316, // Bright Orange
    0xdb2777, // Hot Pink
    0x00f0ff, // Cyan
    0x10b981, // Emerald Green
    0xfacc15, // Vibrant Yellow
    0x6366f1  // Indigo
];
const fluidBlobs = [];

for(let i=0; i<fluidColors.length; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: fluidColors[i], transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(sphereGeo, mat);
    
    // Spread them around
    mesh.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4
    );
    
    fluidGroup.add(mesh);
    
    fluidBlobs.push({
        mesh: mesh,
        angle1: Math.random() * Math.PI * 2,
        angle2: Math.random() * Math.PI * 2,
        speed1: 0.2 + Math.random() * 0.4,
        speed2: 0.2 + Math.random() * 0.4,
        radiusX: 3 + Math.random() * 5,
        radiusY: 3 + Math.random() * 5
    });
}

// Particles
const particlesCount = 3000;
const positions = new Float32Array(particlesCount * 3);
const particleGeometry = new THREE.BufferGeometry();
for(let i = 0; i < particlesCount * 3; i++) {
    const r = 8 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i] = r * Math.sin(phi) * Math.cos(theta); 
    positions[i+1] = r * Math.sin(phi) * Math.sin(theta); 
    positions[i+2] = r * Math.cos(phi); 
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({ 
    color: 0xffffff, 
    size: 0.03, 
    transparent: true, 
    opacity: 0.5, 
    blending: THREE.AdditiveBlending 
});
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.1));
const pointLight = new THREE.PointLight(0xff003c, 2, 20);
scene.add(pointLight);

// ---- RESIZE ----
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(sizes.width, sizes.height);
});

// ---- MOUSE PARALLAX VARIABLES ----
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// ---- CUSTOM CURSOR GHOST TRAIL SETUP ----
const trailCount = 15;
const trails = [];

for (let i = 0; i < trailCount; i++) {
    const trail = document.createElement('div');
    trail.classList.add('cursor-trail');
    
    // Scale down the size and opacity as it gets further back
    const ratio = 1 - (i / trailCount);
    trail.style.opacity = ratio;
    trail.style.transform = "scale(" + ratio + ")";
    
    document.body.appendChild(trail);
    trails.push({ element: trail, x: windowHalfX, y: windowHalfY });
}

let mouseCursorX = windowHalfX;
let mouseCursorY = windowHalfY;

// ---- ANIMATION LOOP ----
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Mouse Parallax background easing
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Fluid blob movement
    fluidBlobs.forEach((blob) => {
        blob.angle1 += blob.speed1 * 0.01;
        blob.angle2 += blob.speed2 * 0.01;
        blob.mesh.position.x = Math.sin(blob.angle1) * blob.radiusX;
        blob.mesh.position.y = Math.cos(blob.angle2) * blob.radiusY;
    });

    particles.rotation.y = elapsedTime * 0.05;

    // Update Ghost Cursor Trail
    let prevX = mouseCursorX;
    let prevY = mouseCursorY;

    trails.forEach((trail, index) => {
        // Smoothly interpolate towards the previous dot's position
        trail.x += (prevX - trail.x) * 0.4;
        trail.y += (prevY - trail.y) * 0.4;
        
        trail.element.style.left = (trail.x - 4) + 'px'; // 4 is half width
        trail.element.style.top = (trail.y - 4) + 'px';
        
        prevX = trail.x;
        prevY = trail.y;
    });

    composer.render();
    window.requestAnimationFrame(tick);
};
tick();

// ---- GSAP TIMELINE (LOADING & INTRO) ----
let loadProgress = { value: 0 };
const circleFg = document.querySelector('.circular-progress .fg');
const loadingPercentage = document.querySelector('.loading-percentage');
const loadingScreen = document.querySelector('#loading-screen');

gsap.to(canvas, { opacity: 1, duration: 2 });
const tl = gsap.timeline();

let lastP = 0;

tl.fromTo('.brand', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power3.out" })
.to(loadProgress, {
    value: 100,
    duration: 3.5, 
    ease: "power2.inOut",
    onUpdate: () => {
        const p = Math.round(loadProgress.value);
        
        // Animate the circular HUD ring (502 is the circumference)
        const dashoffset = 502 - (502 * (p / 100));
        if(circleFg) circleFg.style.strokeDashoffset = dashoffset;
        
        // Every time the number ticks up, we trigger a violent neon heartbeat pulse
        if (p !== lastP) {
            lastP = p;
            loadingPercentage.innerText = p + "%";
            
            gsap.fromTo(loadingPercentage, 
                { scale: 1.4, color: '#ff003c', textShadow: "0 0 50px #ff003c" },
                { scale: 1, color: '#ffffff', textShadow: "0 0 20px #00f0ff", duration: 0.2, ease: "power2.out", overwrite: "auto" }
            );
        }
        
        energyCore.rotation.x += p * 0.001;
        bloomPass.strength = 1.2 + (p * 0.015);
    }
}, "-=0.5")
.to('.loading-ui', { scale: 1.1, opacity: 0, duration: 0.6, ease: "power2.in", delay: 0.3 })
.to(loadingScreen, {
    opacity: 0, duration: 0.5,
    onComplete: () => {
        loadingScreen.style.display = 'none';
        document.getElementById('main-content').style.display = 'flex';
    }
}, "-=0.2")
// Fly camera inside
.to(camera.position, { z: 0.1, duration: 2.5, ease: "power4.inOut" }, "-=1")
.to(bloomPass, { strength: 8, duration: 1.2, ease: "power2.in" }, "-=2.5")
.to(bloomPass, { strength: 0.2, duration: 1.3, ease: "power2.out" }, ">")
// Reveal HTML Text Content & Editorial Layout
.to('#main-content', { opacity: 1, duration: 1 }, "-=1")
.fromTo('.editorial-nav', { y: -50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.5, ease: "power3.out" }, "-=0.5")
.from('.hero-left > *', { y: 50, opacity: 0, duration: 1.5, stagger: 0.2, ease: "power4.out" }, "-=1")
.from('.hero-right', { x: 50, opacity: 0, duration: 1.5, ease: "power4.out" }, "-=1.2");

// ---- ANIMATED TITLES LOGIC ----
const titles = [
    "Web Developer", 
    "Software Engineer", 
    "Full-Stack Developer", 
    "Digital Solutions Architect",
    "UI/UX Specialist",
    "Technical Lead",
    "System Architect",
    "Backend Developer",
    "Creative Technologist",
    "Web Application Engineer"
];
const titleElement = document.querySelector('.animated-title');
let titleIndex = 0;

if (titleElement) {
    // Start the animation loop after the main intro is done
    tl.add(() => {
        setInterval(() => {
            gsap.to(titleElement, {
                y: -30, opacity: 0, duration: 0.5, ease: "power2.in",
                onComplete: () => {
                    titleIndex = (titleIndex + 1) % titles.length;
                    titleElement.innerText = titles[titleIndex];
                    gsap.fromTo(titleElement, 
                        { y: 30, opacity: 0 }, 
                        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
                    );
                }
            });
        }, 3000); // Change title every 3 seconds
    }, "+=1");
}

// ---- MOUSE MOVE EVENTS ----

document.addEventListener('mousemove', (event) => {
    // Global parallax tracking for 3D camera
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
    
    // Target position for the head of the trail
    mouseCursorX = event.clientX;
    mouseCursorY = event.clientY;
});

// Add hover effect for clickable elements to the FIRST dot (the head)
document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => trails[0].element.classList.add('hover-active'));
    el.addEventListener('mouseleave', () => trails[0].element.classList.remove('hover-active'));
});

// ---- THEME TOGGLE LOGIC & SYSTEM PREFERENCE ----
const themeToggleBtn = document.getElementById('theme-toggle');

// Helper to apply a specific mode to the Three.js scene
const applyThreeJsTheme = (light) => {
    if (light) {
        gsap.to(scene.background, { r: lightFogColor.r, g: lightFogColor.g, b: lightFogColor.b, duration: 1 });
        gsap.to(scene.fog.color, { r: lightFogColor.r, g: lightFogColor.g, b: lightFogColor.b, duration: 1 });
        gsap.to(particleMaterial.color, { r: 0.2, g: 0.2, b: 0.2, duration: 1 }); // Dark grey particles
        gsap.to(coreMaterial.color, { r: 1.0, g: 0.0, b: 0.2, duration: 1 }); // Shift core to match magenta accent
        gsap.to(bloomPass, { strength: 0.1, duration: 1 }); // Less bloom in light mode
    } else {
        gsap.to(scene.background, { r: darkFogColor.r, g: darkFogColor.g, b: darkFogColor.b, duration: 1 });
        gsap.to(scene.fog.color, { r: darkFogColor.r, g: darkFogColor.g, b: darkFogColor.b, duration: 1 });
        gsap.to(particleMaterial.color, { r: 1.0, g: 1.0, b: 1.0, duration: 1 }); // White particles
        gsap.to(coreMaterial.color, { r: 0.0, g: 0.94, b: 1.0, duration: 1 }); // Cyan core
        gsap.to(bloomPass, { strength: 0.2, duration: 1 }); // Restore dark mode bloom
    }
};

// Check system preference on load
const systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
let isLightMode = systemPrefersLight;

// Apply initial state
if (isLightMode) {
    document.body.classList.add('light-mode');
    themeToggleBtn.innerText = "🌙 Dark Mode";
    applyThreeJsTheme(true);
}

// Toggle on click
themeToggleBtn.addEventListener('click', () => {
    isLightMode = !isLightMode;
    document.body.classList.toggle('light-mode', isLightMode);
    themeToggleBtn.innerText = isLightMode ? "🌙 Dark Mode" : "☀️ Light Mode";
    applyThreeJsTheme(isLightMode);
});



// ---- 3D TILT EFFECT FOR CARDS ----
document.querySelectorAll('.tilt-element').forEach(card => {
    const glare = card.querySelector('.glare');
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;  
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate rotation (max 10 degrees)
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        
        gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1500,
            ease: "power2.out",
            duration: 0.5
        });
        
        if(glare) {
            gsap.to(glare, {
                opacity: 1,
                x: x,
                y: y,
                duration: 0.5
            });
        }
    });
    
    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            ease: "power3.out",
            duration: 1.2
        });
        if(glare) {
            gsap.to(glare, { opacity: 0, duration: 1.2 });
        }
    });
});

// ---- MOBILE MENU LOGIC ----
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const siteNav = document.getElementById('site-nav');

if (mobileMenuBtn && siteNav) {
    mobileMenuBtn.addEventListener('click', () => {
        siteNav.classList.toggle('menu-open');
    });

    // Close the menu when any link is clicked
    const navLinks = siteNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            siteNav.classList.remove('menu-open');
        });
    });
}
