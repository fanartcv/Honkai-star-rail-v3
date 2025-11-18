// ====================================
// LAZY LOADING SYSTEM
// Load images/videos hanya saat terlihat
// ====================================

(function() {
    'use strict';

    // ====================================
    // 1. CONFIGURATION
    // ====================================
    const CONFIG = {
        rootMargin: '50px', // Load 50px sebelum terlihat
        threshold: 0.01,
        loadDelay: 100, // Delay sebelum load (ms)
        placeholderColor: '#0a1929' // Warna placeholder
    };

    // ====================================
    // 2. LAZY LOAD IMAGES
    // ====================================
    class LazyImageLoader {
        constructor() {
            this.images = [];
            this.observer = null;
        }

        init() {
            // Find all images that need lazy loading
            this.images = Array.from(document.querySelectorAll('img[data-src], img[loading="lazy"]'));
            
            if (this.images.length === 0) {
                console.log('ℹ️ No images to lazy load');
                return;
            }

            // Setup Intersection Observer
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    rootMargin: CONFIG.rootMargin,
                    threshold: CONFIG.threshold
                }
            );

            // Observe all images
            this.images.forEach(img => {
                this.prepareImage(img);
                this.observer.observe(img);
            });

            console.log(`🖼️ Lazy loading ${this.images.length} images`);
        }

        prepareImage(img) {
            // Add placeholder background
            if (!img.style.backgroundColor) {
                img.style.backgroundColor = CONFIG.placeholderColor;
            }

            // Set data-src if using native lazy loading
            if (!img.hasAttribute('data-src') && img.hasAttribute('src')) {
                img.setAttribute('data-src', img.src);
                img.removeAttribute('src');
            }

            // Add loading class
            img.classList.add('lazy-loading');
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Delay loading slightly for smoother performance
                    setTimeout(() => {
                        this.loadImage(img);
                    }, CONFIG.loadDelay);

                    // Stop observing this image
                    this.observer.unobserve(img);
                }
            });
        }

        loadImage(img) {
            const src = img.getAttribute('data-src');
            
            if (!src) return;

            // Create new image to preload
            const tempImg = new Image();
            
            tempImg.onload = () => {
                img.src = src;
                img.classList.remove('lazy-loading');
                img.classList.add('lazy-loaded');
                
                // Add fade-in animation
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    img.style.opacity = '1';
                }, 10);
            };

            tempImg.onerror = () => {
                console.error('❌ Failed to load image:', src);
                img.classList.add('lazy-error');
            };

            tempImg.src = src;
        }

        // Fallback untuk browser tanpa Intersection Observer
        loadAllImages() {
            this.images.forEach(img => this.loadImage(img));
        }
    }

    // ====================================
    // 3. LAZY LOAD VIDEOS
    // ====================================
    class LazyVideoLoader {
        constructor() {
            this.videos = [];
            this.observer = null;
        }

        init() {
            // Find all videos with data-src
            this.videos = Array.from(document.querySelectorAll('video[data-src]'));
            
            if (this.videos.length === 0) {
                console.log('ℹ️ No videos to lazy load');
                return;
            }

            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    rootMargin: CONFIG.rootMargin,
                    threshold: CONFIG.threshold
                }
            );

            this.videos.forEach(video => {
                video.classList.add('lazy-loading');
                this.observer.observe(video);
            });

            console.log(`🎬 Lazy loading ${this.videos.length} videos`);
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    this.loadVideo(video);
                    this.observer.unobserve(video);
                }
            });
        }

        loadVideo(video) {
            const sources = video.querySelectorAll('source[data-src]');
            
            sources.forEach(source => {
                const src = source.getAttribute('data-src');
                if (src) {
                    source.src = src;
                    source.removeAttribute('data-src');
                }
            });

            // If video has data-src directly
            const videoSrc = video.getAttribute('data-src');
            if (videoSrc) {
                video.src = videoSrc;
                video.removeAttribute('data-src');
            }

            video.load();
            video.classList.remove('lazy-loading');
            video.classList.add('lazy-loaded');
        }
    }

    // ====================================
    // 4. LAZY LOAD BACKGROUND IMAGES
    // ====================================
    class LazyBackgroundLoader {
        constructor() {
            this.elements = [];
            this.observer = null;
        }

        init() {
            // Find all elements with data-bg attribute
            this.elements = Array.from(document.querySelectorAll('[data-bg]'));
            
            if (this.elements.length === 0) {
                console.log('ℹ️ No background images to lazy load');
                return;
            }

            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    rootMargin: CONFIG.rootMargin,
                    threshold: CONFIG.threshold
                }
            );

            this.elements.forEach(el => this.observer.observe(el));

            console.log(`🎨 Lazy loading ${this.elements.length} background images`);
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const bg = element.getAttribute('data-bg');
                    
                    if (bg) {
                        element.style.backgroundImage = `url(${bg})`;
                        element.removeAttribute('data-bg');
                        element.classList.add('bg-loaded');
                    }

                    this.observer.unobserve(element);
                }
            });
        }
    }

    // ====================================
    // 5. PRELOAD CRITICAL IMAGES
    // ====================================
    class CriticalImagePreloader {
        init() {
            // Preload hero image and first few images
            const criticalImages = document.querySelectorAll('.hero img, .profile img');
            
            criticalImages.forEach(img => {
                if (img.hasAttribute('data-src')) {
                    const src = img.getAttribute('data-src');
                    img.src = src;
                    img.removeAttribute('data-src');
                }
                
                // Remove lazy loading for critical images
                img.removeAttribute('loading');
            });

            console.log(`⚡ Preloaded ${criticalImages.length} critical images`);
        }
    }

    // ====================================
    // 6. LOADING PLACEHOLDER STYLES
    // ====================================
    function addPlaceholderStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Lazy loading states */
            .lazy-loading {
                background-color: ${CONFIG.placeholderColor};
                background-image: linear-gradient(
                    90deg,
                    ${CONFIG.placeholderColor} 0%,
                    rgba(0, 191, 255, 0.1) 50%,
                    ${CONFIG.placeholderColor} 100%
                );
                background-size: 200% 100%;
                animation: lazy-shimmer 1.5s infinite;
            }

            @keyframes lazy-shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }

            .lazy-loaded {
                background-image: none !important;
                background-color: transparent !important;
            }

            .lazy-error {
                background-color: rgba(255, 0, 0, 0.1);
                border: 1px dashed rgba(255, 0, 0, 0.3);
            }

            /* Blur placeholder effect */
            img.lazy-loading {
                filter: blur(5px);
            }

            img.lazy-loaded {
                filter: blur(0);
                transition: filter 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // ====================================
    // 7. NETWORK-AWARE LOADING
    // ====================================
    class NetworkAwareLoader {
        constructor() {
            this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        }

        init() {
            if (!this.connection) {
                console.log('ℹ️ Network Information API not supported');
                return;
            }

            const effectiveType = this.connection.effectiveType;
            
            console.log(`📶 Connection type: ${effectiveType}`);

            // Adjust loading strategy based on connection
            if (effectiveType === 'slow-2g' || effectiveType === '2g') {
                CONFIG.rootMargin = '0px'; // Load hanya saat visible
                CONFIG.loadDelay = 300; // Delay lebih lama
                console.log('🐌 Slow connection detected - adjusted loading strategy');
            } else if (effectiveType === '4g') {
                CONFIG.rootMargin = '100px'; // Load lebih agresif
                CONFIG.loadDelay = 0;
                console.log('🚀 Fast connection detected - optimized loading');
            }

            // Listen for connection changes
            this.connection.addEventListener('change', () => {
                console.log('📶 Connection changed:', this.connection.effectiveType);
            });
        }
    }

    // ====================================
    // 8. PRIORITY LOADING
    // ====================================
    class PriorityLoader {
        init() {
            // Images in viewport get highest priority
            const viewportImages = Array.from(document.querySelectorAll('img')).filter(img => {
                const rect = img.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom > 0;
            });

            viewportImages.forEach(img => {
                if (img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'eager');
                }
            });

            console.log(`⚡ ${viewportImages.length} images set to eager loading`);
        }
    }

    // ====================================
    // MAIN INITIALIZATION
    // ====================================
    function init() {
        console.log('🚀 Lazy Loader Starting...');

        // Add placeholder styles
        addPlaceholderStyles();

        // Check for Intersection Observer support
        if (!('IntersectionObserver' in window)) {
            console.warn('⚠️ IntersectionObserver not supported - loading all images');
            const imageLoader = new LazyImageLoader();
            imageLoader.loadAllImages();
            return;
        }

        // Initialize loaders
        const networkLoader = new NetworkAwareLoader();
        networkLoader.init();

        const criticalPreloader = new CriticalImagePreloader();
        criticalPreloader.init();

        const priorityLoader = new PriorityLoader();
        priorityLoader.init();

        const imageLoader = new LazyImageLoader();
        imageLoader.init();

        const videoLoader = new LazyVideoLoader();
        videoLoader.init();

        const bgLoader = new LazyBackgroundLoader();
        bgLoader.init();

        console.log('✅ Lazy Loader Ready!');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();