// ====================================
// STARFIELD ANIMATION
// Interactive cosmic background effect
// ====================================

(function() {
    'use strict';

    // ====================================
    // CONFIGURATION
    // ====================================
    const CONFIG = {
        baseStars: 220,
        galaxyCount: 3,
        twinkleSpeed: 0.02,
        cometChance: 0.003,
        parallaxStrength: 0.002,
        maxStarSize: 2.5
    };

    // ====================================
    // CANVAS SETUP
    // ====================================
    const canvas = document.getElementById('starfield');
    if (!canvas) {
        console.warn('Starfield canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = Math.max(1, window.devicePixelRatio || 1);

    // State
    let stars = [];
    let galaxies = [];
    let comets = [];
    let pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let lastTime = performance.now();

    // ====================================
    // UTILITY FUNCTIONS
    // ====================================
    const random = (min = 0, max = 1) => Math.random() * (max - min) + min;
    
    const hsla = (h, s, l, a) => `hsla(${h}, ${s}%, ${l}%, ${a})`;
    
    const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

    // ====================================
    // ENTITY CREATION
    // ====================================
    function createStar() {
        const size = random(0.5, CONFIG.maxStarSize);
        const depth = random(0.1, 1.0);
        
        return {
            x: random(0, width),
            y: random(0, height),
            size: size,
            depth: depth,
            baseAlpha: random(0.3, 0.8) * depth,
            currentAlpha: 0,
            twinkle: random(0, Math.PI * 2),
            twinkleSpeed: CONFIG.twinkleSpeed * random(0.8, 1.2),
            colorShift: random(-15, 15),
            vx: random(-0.5, 0.5) * 0.05 * depth,
            vy: random(-0.5, 0.5) * 0.05 * depth,
            renderX: 0,
            renderY: 0
        };
    }

    function createGalaxy() {
        return {
            x: random(0, width),
            y: random(0, height),
            radius: random(150, 450),
            hue: random(200, 280),
            alpha: random(0.05, 0.15),
            drift: random(-0.02, 0.02)
        };
    }

    function createComet() {
        const startEdge = Math.random() < 0.5 ? 0 : width;
        const startY = random(0, height);
        const angle = startEdge === 0 ? random(-20, 20) : random(160, 200);
        const speed = random(1500, 3000);
        const rad = angle * (Math.PI / 180);
        
        return {
            x: startEdge,
            y: startY,
            vx: Math.cos(rad) * speed,
            vy: Math.sin(rad) * speed,
            hue: random(250, 300),
            alpha: 1.0,
            length: random(80, 150)
        };
    }

    // ====================================
    // SCENE MANAGEMENT
    // ====================================
    function resize() {
        dpr = Math.max(1, window.devicePixelRatio || 1);
        width = Math.max(300, window.innerWidth);
        height = Math.max(300, window.innerHeight);
        
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        
        initScene();
    }

    function initScene() {
        stars = [];
        galaxies = [];
        comets = [];
        
        // Calculate star count based on screen size
        const scale = (width * height) / (1920 * 1080);
        const targetStars = Math.round(CONFIG.baseStars * Math.max(0.5, scale));
        
        for (let i = 0; i < targetStars; i++) {
            stars.push(createStar());
        }
        
        for (let i = 0; i < CONFIG.galaxyCount; i++) {
            galaxies.push(createGalaxy());
        }
    }

    // ====================================
    // UPDATE LOGIC
    // ====================================
    function update(deltaTime) {
        // Smooth pointer interpolation
        pointer.x += (pointer.tx - pointer.x) * 0.08;
        pointer.y += (pointer.ty - pointer.y) * 0.08;
        
        const normalizedDelta = deltaTime * 60;

        // Update stars
        for (const star of stars) {
            // Twinkle effect
            star.twinkle += star.twinkleSpeed * deltaTime;
            const twinkle = Math.sin(star.twinkle) * 0.5 + 0.5;
            
            // Movement
            star.x += star.vx * normalizedDelta;
            star.y += star.vy * normalizedDelta;
            
            // Parallax effect
            const parallaxX = (pointer.x - width / 2) * (star.depth * CONFIG.parallaxStrength);
            const parallaxY = (pointer.y - height / 2) * (star.depth * CONFIG.parallaxStrength);
            
            star.renderX = star.x + parallaxX;
            star.renderY = star.y + parallaxY;
            
            // Wrap around edges
            if (star.x < -50) star.x = width + 50;
            if (star.x > width + 50) star.x = -50;
            if (star.y > height + 50) star.y = -50;
            if (star.y < -50) star.y = height + 50;
            
            // Update alpha
            star.currentAlpha = star.baseAlpha * (0.6 + 0.4 * twinkle);
        }

        // Update galaxies
        for (const galaxy of galaxies) {
            galaxy.x += galaxy.drift * deltaTime * 10;
            
            if (galaxy.x < -galaxy.radius) galaxy.x = width + galaxy.radius;
            if (galaxy.x > width + galaxy.radius) galaxy.x = -galaxy.radius;
        }

        // Update comets
        for (let i = comets.length - 1; i >= 0; i--) {
            const comet = comets[i];
            
            comet.x += comet.vx * deltaTime;
            comet.y += comet.vy * deltaTime;
            comet.length *= 0.995;
            comet.alpha *= 0.997;
            
            // Remove dead comets
            if (comet.x < -200 || comet.x > width + 200 || comet.alpha < 0.02) {
                comets.splice(i, 1);
            }
        }

        // Spawn new comets randomly
        if (Math.random() < CONFIG.cometChance) {
            comets.push(createComet());
        }
    }

    // ====================================
    // RENDER LOGIC
    // ====================================
    function draw() {
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#020417');
        gradient.addColorStop(1, '#04061a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw galaxies
        for (const galaxy of galaxies) {
            const grad = ctx.createRadialGradient(galaxy.x, galaxy.y, 0, galaxy.x, galaxy.y, galaxy.radius);
            grad.addColorStop(0, hsla(galaxy.hue, 70, 60, galaxy.alpha));
            grad.addColorStop(0.25, hsla(galaxy.hue + 20, 70, 45, galaxy.alpha * 0.7));
            grad.addColorStop(0.6, hsla(galaxy.hue + 50, 70, 30, galaxy.alpha * 0.25));
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(galaxy.x, galaxy.y, galaxy.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }

        // Draw stars
        for (const star of stars) {
            const radius = Math.max(0.2, star.size);
            const alpha = Math.max(0, Math.min(1, star.currentAlpha));
            
            // Glow effect
            const glowGrad = ctx.createRadialGradient(
                star.renderX, star.renderY, 0,
                star.renderX, star.renderY, radius * 6
            );
            const hue = 200 + star.colorShift;
            
            glowGrad.addColorStop(0, rgba(255, 255, 255, alpha));
            glowGrad.addColorStop(0.2, hsla(hue, 90, 70, alpha * 0.6));
            glowGrad.addColorStop(0.7, rgba(0, 0, 0, 0));
            
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(star.renderX, star.renderY, radius * 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Core
            ctx.fillStyle = rgba(255, 255, 255, alpha);
            ctx.beginPath();
            ctx.arc(star.renderX, star.renderY, radius * 0.9, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw comets
        for (const comet of comets) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            
            // Trail
            ctx.strokeStyle = hsla(comet.hue, 90, 70, comet.alpha);
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(comet.x, comet.y);
            ctx.lineTo(
                comet.x - (comet.vx * 0.4 * comet.length / 150),
                comet.y - (comet.vy * 0.4 * comet.length / 150)
            );
            ctx.stroke();
            
            // Head
            ctx.lineWidth = 5 + comet.length * 0.05;
            ctx.beginPath();
            ctx.moveTo(comet.x, comet.y);
            ctx.lineTo(comet.x - comet.vx * 0.1, comet.y - comet.vy * 0.1);
            ctx.stroke();
            
            ctx.restore();
        }
    }

    // ====================================
    // ANIMATION LOOP
    // ====================================
    function loop(currentTime) {
        const deltaTime = Math.min(1, (currentTime - lastTime) / 1000);
        lastTime = currentTime;
        
        update(deltaTime);
        draw();
        
        requestAnimationFrame(loop);
    }

    // ====================================
    // EVENT LISTENERS
    // ====================================
    window.addEventListener('resize', resize);
    
    window.addEventListener('mousemove', (e) => {
        pointer.tx = e.clientX;
        pointer.ty = e.clientY;
    });
    
    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
            pointer.tx = e.touches[0].clientX;
            pointer.ty = e.touches[0].clientY;
        }
    }, { passive: true });
    
    // Device orientation for mobile
    window.addEventListener('deviceorientation', (ev) => {
        if (ev.gamma === null) return;
        
        const normalizedX = (ev.gamma + 90) / 180 * width;
        const normalizedY = (ev.beta + 180) / 360 * height;
        
        pointer.tx = normalizedX;
        pointer.ty = normalizedY;
    });

    // ====================================
    // INITIALIZATION
    // ====================================
    resize();
    requestAnimationFrame(loop);

})();