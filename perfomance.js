// ====================================
// PERFORMANCE OPTIMIZATION
// Optimasi untuk semua device
// ====================================

(function() {
    'use strict';

    // ====================================
    // 1. DETECT DEVICE CAPABILITY
    // ====================================
    const DeviceDetector = {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isLowEnd: false,
        
        init() {
            // Check device memory (jika tersedia)
            if (navigator.deviceMemory) {
                this.isLowEnd = navigator.deviceMemory < 4; // < 4GB RAM = low-end
            }
            
            // Check hardware concurrency (CPU cores)
            if (navigator.hardwareConcurrency) {
                this.isLowEnd = this.isLowEnd || navigator.hardwareConcurrency < 4;
            }
            
            // Check connection speed
            if (navigator.connection) {
                const conn = navigator.connection;
                const slowConnection = conn.effectiveType === 'slow-2g' || 
                                      conn.effectiveType === '2g' || 
                                      conn.effectiveType === '3g';
                this.isLowEnd = this.isLowEnd || slowConnection;
            }
            
            console.log('📱 Device Info:', {
                isMobile: this.isMobile,
                isLowEnd: this.isLowEnd,
                memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'unknown',
                cores: navigator.hardwareConcurrency || 'unknown',
                connection: navigator.connection ? navigator.connection.effectiveType : 'unknown'
            });
            
            return this;
        }
    };

    // ====================================
    // 2. DEBOUNCE & THROTTLE UTILITIES
    // ====================================
    const Helpers = {
        // Debounce: eksekusi setelah delay, reset jika dipanggil lagi
        debounce(func, wait = 250) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle: eksekusi maksimal sekali per interval
        throttle(func, limit = 250) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Request Animation Frame Throttle (untuk scroll)
        rafThrottle(func) {
            let rafId = null;
            return function(...args) {
                if (rafId) return;
                rafId = requestAnimationFrame(() => {
                    func.apply(this, args);
                    rafId = null;
                });
            };
        }
    };

    // ====================================
    // 3. OPTIMIZE SCROLL EVENTS
    // ====================================
    const ScrollOptimizer = {
        init() {
            const device = DeviceDetector.init();
            
            // Replace semua scroll event dengan throttled version
            const scrollHandlers = [];
            const originalAddEventListener = window.addEventListener;
            
            window.addEventListener = function(type, listener, options) {
                if (type === 'scroll') {
                    const throttleTime = device.isLowEnd ? 500 : 250;
                    const throttledListener = Helpers.rafThrottle(
                        Helpers.throttle(listener, throttleTime)
                    );
                    scrollHandlers.push({ original: listener, throttled: throttledListener });
                    return originalAddEventListener.call(this, type, throttledListener, options);
                }
                return originalAddEventListener.call(this, type, listener, options);
            };
            
            console.log('✅ Scroll events optimized');
        }
    };

    // ====================================
    // 4. OPTIMIZE RESIZE EVENTS
    // ====================================
    const ResizeOptimizer = {
        init() {
            const device = DeviceDetector.init();
            const resizeHandlers = [];
            const originalAddEventListener = window.addEventListener;
            
            window.addEventListener = function(type, listener, options) {
                if (type === 'resize') {
                    const debounceTime = device.isLowEnd ? 500 : 250;
                    const debouncedListener = Helpers.debounce(listener, debounceTime);
                    resizeHandlers.push({ original: listener, debounced: debouncedListener });
                    return originalAddEventListener.call(this, type, debouncedListener, options);
                }
                return originalAddEventListener.call(this, type, listener, options);
            };
            
            console.log('✅ Resize events optimized');
        }
    };

    // ====================================
    // 5. REDUCE ANIMATIONS ON LOW-END
    // ====================================
    const AnimationOptimizer = {
        init() {
            const device = DeviceDetector.init();
            
            if (device.isLowEnd) {
                // Disable/reduce animations
                const style = document.createElement('style');
                style.textContent = `
                    *, *::before, *::after {
                        animation-duration: 0.001s !important;
                        transition-duration: 0.001s !important;
                    }
                    
                    #cursor-particles {
                        display: none !important;
                    }
                    
                    .profile img {
                        transition: none !important;
                    }
                `;
                document.head.appendChild(style);
                console.log('⚡ Animations reduced for low-end device');
            }
        }
    };

    // ====================================
    // 6. OPTIMIZE CANVAS (Starfield & Particles)
    // ====================================
    const CanvasOptimizer = {
        init() {
            const device = DeviceDetector.init();
            
            if (device.isLowEnd || device.isMobile) {
                // Reduce particle count
                setTimeout(() => {
                    const cursorCanvas = document.getElementById('cursor-particles');
                    const starfieldCanvas = document.getElementById('starfield');
                    
                    if (cursorCanvas) {
                        cursorCanvas.style.display = 'none';
                        console.log('🚫 Cursor particles disabled');
                    }
                    
                    if (starfieldCanvas && device.isLowEnd) {
                        // Reduce starfield quality
                        const ctx = starfieldCanvas.getContext('2d');
                        if (ctx) {
                            starfieldCanvas.width = Math.floor(window.innerWidth * 0.5);
                            starfieldCanvas.height = Math.floor(window.innerHeight * 0.5);
                            starfieldCanvas.style.transform = 'scale(2)';
                            starfieldCanvas.style.imageRendering = 'pixelated';
                            console.log('⚡ Starfield quality reduced');
                        }
                    }
                }, 100);
            }
        }
    };

    // ====================================
    // 7. PRECONNECT TO EXTERNAL RESOURCES
    // ====================================
    const PreconnectOptimizer = {
        init() {
            // Preconnect ke Google Fonts jika belum ada
            const preconnects = [
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com'
            ];
            
            preconnects.forEach(url => {
                if (!document.querySelector(`link[href="${url}"]`)) {
                    const link = document.createElement('link');
                    link.rel = 'preconnect';
                    link.href = url;
                    link.crossOrigin = 'anonymous';
                    document.head.appendChild(link);
                }
            });
            
            console.log('✅ Preconnect links added');
        }
    };

    // ====================================
    // 8. OPTIMIZE IMAGES (Add loading attribute)
    // ====================================
    const ImageOptimizer = {
        init() {
            // Add loading="lazy" to all images except hero
            const images = document.querySelectorAll('img');
            images.forEach((img, index) => {
                // Skip first 2 images (hero section)
                if (index > 1 && !img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
            });
            
            console.log(`✅ ${images.length - 2} images set to lazy load`);
        }
    };

    // ====================================
    // 9. REDUCE MOTION (Respect user preference)
    // ====================================
    const MotionReducer = {
        init() {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            if (prefersReducedMotion) {
                const style = document.createElement('style');
                style.textContent = `
                    *, *::before, *::after {
                        animation: none !important;
                        transition: none !important;
                    }
                `;
                document.head.appendChild(style);
                console.log('♿ Reduced motion respected');
            }
        }
    };

    // ====================================
    // 10. MEMORY CLEANUP
    // ====================================
    const MemoryManager = {
        init() {
            // Clear unused event listeners on page hide
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // Pause animations/videos when tab not visible
                    const videos = document.querySelectorAll('video');
                    videos.forEach(v => {
                        if (!v.paused) {
                            v.pause();
                            v.dataset.wasPlaying = 'true';
                        }
                    });
                } else {
                    // Resume videos
                    const videos = document.querySelectorAll('video[data-was-playing="true"]');
                    videos.forEach(v => {
                        v.play();
                        delete v.dataset.wasPlaying;
                    });
                }
            });
            
            console.log('✅ Memory management initialized');
        }
    };

    // ====================================
    // 11. PERFORMANCE MONITOR
    // ====================================
    const PerformanceMonitor = {
        init() {
            if (window.performance && window.performance.memory) {
                setInterval(() => {
                    const memory = window.performance.memory;
                    const usedMemory = (memory.usedJSHeapSize / 1048576).toFixed(2);
                    const totalMemory = (memory.totalJSHeapSize / 1048576).toFixed(2);
                    
                    if (usedMemory / totalMemory > 0.9) {
                        console.warn('⚠️ High memory usage:', `${usedMemory}MB / ${totalMemory}MB`);
                    }
                }, 10000); // Check every 10 seconds
            }
        }
    };

    // ====================================
    // MAIN INITIALIZATION
    // ====================================
    function init() {
        console.log('🚀 Performance Optimizer Starting...');
        
        // Initialize all optimizers
        DeviceDetector.init();
        ScrollOptimizer.init();
        ResizeOptimizer.init();
        AnimationOptimizer.init();
        CanvasOptimizer.init();
        PreconnectOptimizer.init();
        ImageOptimizer.init();
        MotionReducer.init();
        MemoryManager.init();
        PerformanceMonitor.init();
        
        console.log('✅ Performance Optimizer Ready!');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();