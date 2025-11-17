// ====================================
// HONKAI STAR RAIL - MAIN SCRIPT
// ====================================

(function() {
    'use strict';

    // ====================================
    // DOM ELEMENTS
    // ====================================
    const DOM = {
        // Navigation
        menuToggle: document.querySelector('.menu-toggle'),
        navMenu: document.querySelector('.nav-menu'),
        navLinks: document.querySelectorAll('.navbar a'),
        
        // Audio
        audioToggle: document.getElementById('audio-toggle'),
        audioMuted: document.getElementById('audio-muted'),
        audioPlaying: document.getElementById('audio-playing'),
        bgMusic: document.getElementById('bg-music'),
        
        // Profile Image
        profileImg: document.querySelector('.profile img'),
        
        // Typed Text
        typedOutput: document.getElementById('typed-output'),
        
        // Stats
        statNumbers: document.querySelectorAll('.stat-number'),
        
        // Parallax
        parallaxElements: document.querySelectorAll('.parallax-element'),
        
        // Character Modal
        charCards: document.querySelectorAll('.char-card'),
        charModal: document.getElementById('charModal'),
        charModalName: document.getElementById('modalName'),
        charModalLore: document.getElementById('modalLore'),
        charModalClose: document.querySelector('#charModal .close-btn'),
        
        // Video Modal
        videoThumbs: document.querySelectorAll('.grid-video img'),
        videoModal: document.getElementById('videoModal'),
        videoElement: document.getElementById('galleryVideoElement'),
        videoModalClose: document.querySelector('#videoModal .close-btn-video'),
        
        // Personal Message Modal
        messageLink: document.getElementById('message-link'),
        messageModal: document.getElementById('messageModal'),
        messageVideo: document.getElementById('messageVideoElement'),
        messageAudio: document.getElementById('messageAudioElement'),
        closeMessageBtn: document.getElementById('close-message-btn')
    };

    // ====================================
    // CHARACTER DATA
    // ====================================
    const characterData = {
        castorice: {
            name: 'Castorice',
            lore: 'elcome to Okhema. I am Castorice. Apologies, it is my habit to keep my distance from others... I can get closer if you wish, however.'
        },
        cyrene: {
            name: 'Cyrene',
            lore: 'Is this a meeting ordained by fate, or... a long-overdue reunion? Its making my heart beat faster. Then... please once again call me "Cyrene" just like when we met the first time, okay.'
        },
        hyacine: {
            name: 'Hyacine',
            lore: 'As the descendant of Sky, I, Hyacinthia, will fulfill the Flame-Chase duty with all of you. At the same time, I ll do my best to help everyone as Hyacine, healer of the Twilight Courtyard. This is my good friend and assistant, the little pegasus Ika [sic]. Do you want pet them? Please, go ahead! They love being petted~.'
        }
    };

    // ====================================
    // MODAL HELPERS
    // ====================================
    function openModal(modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    function closeModal(modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ====================================
    // NAVIGATION MENU
    // ====================================
    function initNavigation() {
        if (!DOM.menuToggle || !DOM.navMenu) return;

        // Toggle mobile menu
        DOM.menuToggle.addEventListener('click', () => {
            DOM.navMenu.classList.toggle('active');
            const isExpanded = DOM.navMenu.classList.contains('active');
            DOM.menuToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when clicking nav links
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (DOM.navMenu.classList.contains('active')) {
                    DOM.navMenu.classList.remove('active');
                    DOM.menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (DOM.navMenu.classList.contains('active') &&
                !DOM.navMenu.contains(e.target) &&
                !DOM.menuToggle.contains(e.target)) {
                DOM.navMenu.classList.remove('active');
                DOM.menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ====================================
    // AUDIO CONTROL (FIXED)
    // ====================================
    function initAudio() {
        if (!DOM.audioToggle || !DOM.bgMusic) return;

        let isPlaying = false;

        // Set volume to reasonable level
        DOM.bgMusic.volume = 0.5;

        DOM.audioToggle.addEventListener('click', async () => {
            try {
                if (isPlaying) {
                    // Pause audio
                    DOM.bgMusic.pause();
                    isPlaying = false;
                    
                    // Update icons
                    if (DOM.audioMuted) DOM.audioMuted.classList.remove('hidden-icon');
                    if (DOM.audioPlaying) DOM.audioPlaying.classList.add('hidden-icon');
                    
                    console.log('✅ Audio paused');
                } else {
                    // Play audio
                    if (DOM.bgMusic.paused) {
                        await DOM.bgMusic.play();
                        isPlaying = true;
                        
                        // Update icons
                        if (DOM.audioMuted) DOM.audioMuted.classList.add('hidden-icon');
                        if (DOM.audioPlaying) DOM.audioPlaying.classList.remove('hidden-icon');
                        
                        console.log('✅ Audio playing');
                    }
                }
            } catch (error) {
                console.error('❌ Audio error:', error);
                alert('Gagal memutar musik. Pastikan file audio ada di: audio/cyrene_theme.mp3');
            }
        });

        // Handle when audio ends
        DOM.bgMusic.addEventListener('ended', () => {
            isPlaying = false;
            if (DOM.audioMuted) DOM.audioMuted.classList.remove('hidden-icon');
            if (DOM.audioPlaying) DOM.audioPlaying.classList.add('hidden-icon');
        });

        // Log audio info
        DOM.bgMusic.addEventListener('loadedmetadata', () => {
            console.log('🎵 Audio loaded:', DOM.bgMusic.src);
            console.log('Duration:', DOM.bgMusic.duration + 's');
        });

        DOM.bgMusic.addEventListener('error', (e) => {
            console.error('❌ Audio loading error');
            console.error('Source:', DOM.bgMusic.src);
            console.error('Error code:', DOM.bgMusic.error ? DOM.bgMusic.error.code : 'unknown');
        });
    }

    // ====================================
    // PROFILE IMAGE ZOOM (FIXED)
    // ====================================
    function initProfileZoom() {
        if (!DOM.profileImg) return;

        let overlay = null;

        DOM.profileImg.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const isZoomed = DOM.profileImg.classList.contains('zoomed');
            
            if (!isZoomed) {
                // Create overlay
                overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 9999;
                    cursor: zoom-out;
                `;
                document.body.appendChild(overlay);
                document.body.style.overflow = 'hidden';
                
                // Add zoom class
                DOM.profileImg.classList.add('zoomed');
                
                // Close on overlay click
                overlay.addEventListener('click', () => {
                    closeZoom();
                });
            } else {
                closeZoom();
            }
        });

        function closeZoom() {
            DOM.profileImg.classList.remove('zoomed');
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
                overlay = null;
            }
            document.body.style.overflow = '';
        }

        // Close zoom when clicking outside (fallback)
        document.addEventListener('click', (e) => {
            if (DOM.profileImg.classList.contains('zoomed') && 
                !DOM.profileImg.contains(e.target) &&
                e.target !== overlay) {
                closeZoom();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && DOM.profileImg.classList.contains('zoomed')) {
                closeZoom();
            }
        });
    }

    // ====================================
    // TYPED TEXT EFFECT
    // ====================================
    function initTypedText() {
        if (!DOM.typedOutput) return;

        const texts = [
            'Embark on the trailblaze through galaxies...',
            'Discover forgotten worlds and destinies...',
            'Join the Astral Express journey...'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        function type() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                DOM.typedOutput.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                DOM.typedOutput.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }

            if (!isDeleting && charIndex === currentText.length) {
                typingSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typingSpeed = 500;
            }

            setTimeout(type, typingSpeed);
        }

        type();
    }

    // ====================================
    // ANIMATED COUNTER
    // ====================================
    function initCounters() {
        if (!DOM.statNumbers || DOM.statNumbers.length === 0) return;

        const animateCounter = (element) => {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target + '+';
                }
            };

            updateCounter();
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        DOM.statNumbers.forEach(stat => observer.observe(stat));
    }

    // ====================================
    // PARALLAX SCROLLING
    // ====================================
    function initParallax() {
        if (!DOM.parallaxElements || DOM.parallaxElements.length === 0) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            DOM.parallaxElements.forEach(element => {
                const speed = element.getAttribute('data-speed') || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    // ====================================
    // PARTICLE CURSOR EFFECT
    // ====================================
    function initParticleCursor() {
        const canvas = document.getElementById('cursor-particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 - 1.5;
                this.life = 1;
                this.decay = Math.random() * 0.02 + 0.01;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life -= this.decay;
                if (this.size > 0.2) this.size -= 0.05;
            }

            draw() {
                ctx.fillStyle = `rgba(0, 255, 255, ${this.life})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(0, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const addParticles = (x, y) => {
            for (let i = 0; i < 3; i++) {
                particles.push(new Particle(x, y));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw();

                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        };

        let lastX = 0, lastY = 0;
        document.addEventListener('mousemove', (e) => {
            const distance = Math.hypot(e.clientX - lastX, e.clientY - lastY);
            
            if (distance > 5) {
                addParticles(e.clientX, e.clientY);
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        resize();
        window.addEventListener('resize', resize);
        animate();
    }

    // ====================================
    // CHARACTER MODAL
    // ====================================
    function initCharacterModal() {
        if (!DOM.charModal || !DOM.charModalClose) return;

        DOM.charCards.forEach(card => {
            card.addEventListener('click', () => {
                const charName = card.getAttribute('data-name');
                const charInfo = characterData[charName];

                if (charInfo) {
                    DOM.charModalName.textContent = charInfo.name;
                    DOM.charModalLore.textContent = charInfo.lore;
                    openModal(DOM.charModal);
                }
            });

            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        DOM.charModalClose.addEventListener('click', () => {
            closeModal(DOM.charModal);
        });

        DOM.charModal.addEventListener('click', (e) => {
            if (e.target === DOM.charModal) {
                closeModal(DOM.charModal);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !DOM.charModal.classList.contains('hidden')) {
                closeModal(DOM.charModal);
            }
        });
    }

    // ====================================
    // VIDEO MODAL
    // ====================================
    function initVideoModal() {
        if (!DOM.videoModal || !DOM.videoModalClose || !DOM.videoElement) return;

        DOM.videoThumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const videoSrc = thumb.getAttribute('data-video-src');

                if (videoSrc) {
                    DOM.videoElement.src = videoSrc;
                    openModal(DOM.videoModal);
                    
                    DOM.videoElement.play().catch(error => {
                        console.error('Video playback error:', error);
                    });
                }
            });

            thumb.setAttribute('tabindex', '0');
            thumb.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    thumb.click();
                }
            });
        });

        const closeVideo = () => {
            closeModal(DOM.videoModal);
            DOM.videoElement.pause();
            DOM.videoElement.src = '';
        };

        DOM.videoModalClose.addEventListener('click', closeVideo);

        DOM.videoModal.addEventListener('click', (e) => {
            if (e.target === DOM.videoModal) {
                closeVideo();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !DOM.videoModal.classList.contains('hidden')) {
                closeVideo();
            }
        });
    }

    // ====================================
    // PERSONAL MESSAGE MODAL
    // ====================================
    function initPersonalMessage() {
        if (!DOM.messageLink || !DOM.messageModal || !DOM.messageVideo || !DOM.closeMessageBtn) return;

        // Open message modal
        DOM.messageLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            openModal(DOM.messageModal);
            
            // Reset and sync video/audio
            DOM.messageVideo.currentTime = 0;
            if (DOM.messageAudio) {
                DOM.messageAudio.currentTime = 0;
            }
            
            // Play video
            DOM.messageVideo.play().then(() => {
                // Sync audio if exists
                if (DOM.messageAudio) {
                    DOM.messageAudio.play().catch(error => {
                        console.log('Audio sync error:', error);
                    });
                }
            }).catch(error => {
                console.error('Video play error:', error);
            });
        });

        // Sync audio with video controls
        if (DOM.messageAudio) {
            DOM.messageVideo.addEventListener('pause', () => {
                DOM.messageAudio.pause();
            });
            
            DOM.messageVideo.addEventListener('play', () => {
                DOM.messageAudio.play().catch(e => console.log('Audio sync error:', e));
            });
        }

        // Close message modal
        const closeMessage = () => {
            closeModal(DOM.messageModal);
            
            DOM.messageVideo.pause();
            DOM.messageVideo.currentTime = 0;
            
            if (DOM.messageAudio) {
                DOM.messageAudio.pause();
                DOM.messageAudio.currentTime = 0;
            }
        };

        DOM.closeMessageBtn.addEventListener('click', closeMessage);

        DOM.messageModal.addEventListener('click', (e) => {
            if (e.target === DOM.messageModal) {
                closeMessage();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !DOM.messageModal.classList.contains('hidden')) {
                closeMessage();
            }
        });
    }

    // ====================================
    // SMOOTH SCROLL ENHANCEMENT
    // ====================================
    function initSmoothScroll() {
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href && href.startsWith('#') && href !== '#message') {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        const offsetTop = targetElement.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // ====================================
    // INTERSECTION OBSERVER (Scroll Animations)
    // ====================================
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        const animateElements = document.querySelectorAll('.char-card, .grid-video img');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // ====================================
    // INITIALIZATION
    // ====================================
    function initializeApp() {
        try {
            initNavigation();
            initAudio();
            initProfileZoom();
            initTypedText();
            initCounters();
            initParallax();
            initParticleCursor();
            initCharacterModal();
            initVideoModal();
            initPersonalMessage();
            initSmoothScroll();
            initScrollAnimations();
            
            console.log('✨ Astral Express initialized successfully!');
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

})();