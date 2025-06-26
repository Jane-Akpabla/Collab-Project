// Modern JavaScript for Shogun Restaurant Website

class ShogunRestaurant {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.handlePageLoad();
    }

    setupEventListeners() {
        // DOM Content Loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initAOS();
            this.setupNavigation();
            this.setupMenuTabs();
            this.setupTestimonialSlider();
            this.setupScrollEffects();
            this.setupFormHandling();
            this.setupBackToTop();
            this.setupLoadingScreen();
        });

        // Window Events
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
        window.addEventListener('load', this.handleWindowLoad.bind(this));
    }

    initializeComponents() {
        this.currentTestimonial = 0;
        this.testimonialInterval = null;
        this.isMenuOpen = false;
        this.scrollPosition = 0;
    }

    handlePageLoad() {
        // Set minimum date for reservation form
        const dateInput = document.querySelector('input[type="date"]');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }
    }

    // Loading Screen
    setupLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.remove();
                }, 500);
            }, 2000);
        }
    }

    // Initialize AOS (Animate On Scroll)
    initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 100,
                delay: 100
            });
        }
    }

    // Navigation
    setupNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        const header = document.getElementById('header');

        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                this.toggleMobileMenu(navToggle, navMenu);
            });
        }

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    this.smoothScrollTo(targetSection);
                    this.closeMobileMenu(navToggle, navMenu);
                    this.updateActiveNavLink(link);
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                this.closeMobileMenu(navToggle, navMenu);
            }
        });

        // Update active nav link on scroll
        this.setupScrollSpy();
    }

    toggleMobileMenu(toggle, menu) {
        this.isMenuOpen = !this.isMenuOpen;
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu(toggle, menu) {
        this.isMenuOpen = false;
        toggle.classList.remove('active');
        menu.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    setupScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentSection = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${currentSection}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // Menu Tabs
    setupMenuTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                    
                    // Trigger AOS refresh for new content
                    if (typeof AOS !== 'undefined') {
                        setTimeout(() => AOS.refresh(), 100);
                    }
                }
            });
        });
    }

    // Testimonial Slider
    setupTestimonialSlider() {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        const navDots = document.querySelectorAll('.nav-dot');
        
        if (testimonialCards.length === 0) return;

        // Auto-play testimonials
        this.startTestimonialAutoplay();

        // Manual navigation
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.showTestimonial(index);
                this.resetTestimonialAutoplay();
            });
        });

        // Pause on hover
        const testimonialSlider = document.querySelector('.testimonials-slider');
        if (testimonialSlider) {
            testimonialSlider.addEventListener('mouseenter', () => {
                this.pauseTestimonialAutoplay();
            });
            
            testimonialSlider.addEventListener('mouseleave', () => {
                this.startTestimonialAutoplay();
            });
        }
    }

    showTestimonial(index) {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        const navDots = document.querySelectorAll('.nav-dot');
        
        // Hide all testimonials
        testimonialCards.forEach(card => card.classList.remove('active'));
        navDots.forEach(dot => dot.classList.remove('active'));
        
        // Show selected testimonial
        if (testimonialCards[index]) {
            testimonialCards[index].classList.add('active');
            navDots[index].classList.add('active');
            this.currentTestimonial = index;
        }
    }

    startTestimonialAutoplay() {
        this.testimonialInterval = setInterval(() => {
            const testimonialCards = document.querySelectorAll('.testimonial-card');
            this.currentTestimonial = (this.currentTestimonial + 1) % testimonialCards.length;
            this.showTestimonial(this.currentTestimonial);
        }, 5000);
    }

    pauseTestimonialAutoplay() {
        if (this.testimonialInterval) {
            clearInterval(this.testimonialInterval);
        }
    }

    resetTestimonialAutoplay() {
        this.pauseTestimonialAutoplay();
        this.startTestimonialAutoplay();
    }

    // Scroll Effects
    setupScrollEffects() {
        const header = document.getElementById('header');
        
        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            window.addEventListener('scroll', this.throttle(() => {
                const scrolled = window.pageYOffset;
                const parallax = hero.querySelector('.hero-bg');
                if (parallax) {
                    parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
                }
            }, 16));
        }
    }

    handleScroll() {
        const header = document.getElementById('header');
        const scrollPosition = window.pageYOffset;
        
        // Header scroll effect
        if (header) {
            if (scrollPosition > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Back to top button
        this.updateBackToTopButton(scrollPosition);
        
        this.scrollPosition = scrollPosition;
    }

    // Back to Top Button
    setupBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                this.smoothScrollTo(document.body);
            });
        }
    }

    updateBackToTopButton(scrollPosition) {
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            if (scrollPosition > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    }

    // Form Handling
    setupFormHandling() {
        const reservationForm = document.querySelector('.reservation .form');
        
        if (reservationForm) {
            reservationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleReservationSubmit(reservationForm);
            });
        }

        // Form validation
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    handleReservationSubmit(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Basic validation
        if (this.validateForm(form)) {
            // Simulate form submission
            this.showNotification('Reservation request submitted successfully! We will contact you shortly.', 'success');
            form.reset();
        } else {
            this.showNotification('Please fill in all required fields correctly.', 'error');
        }
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        
        // Remove existing error styling
        field.classList.remove('error');
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
            }
        }
        
        // Date validation (must be today or future)
        if (field.type === 'date' && value) {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                isValid = false;
            }
        }
        
        if (!isValid) {
            field.classList.add('error');
        }
        
        return isValid;
    }

    clearFieldError(field) {
        field.classList.remove('error');
    }

    // Utility Functions
    smoothScrollTo(target) {
        const targetPosition = target.offsetTop - 80; // Account for fixed header
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);
    }

    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    handleResize() {
        // Close mobile menu on resize
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMobileMenu(navToggle, navMenu);
        }
        
        // Refresh AOS on resize
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    handleWindowLoad() {
        // Hide loading screen
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        // Refresh AOS
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    // Performance optimization utilities
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
}

// Initialize the application
const shogunApp = new ShogunRestaurant();

// Additional CSS for notifications and form validation
const additionalStyles = `
    .notification {
        font-family: var(--font-primary);
        font-size: 0.875rem;
        line-height: 1.4;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    }
    
    .notification-close:hover {
        background-color: rgba(255,255,255,0.2);
    }
    
    .form input.error,
    .form select.error,
    .form textarea.error {
        border-color: #f44336;
        box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
    }
    
    @media (max-width: 768px) {
        .notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Add AOS library
const aosLink = document.createElement('link');
aosLink.rel = 'stylesheet';
aosLink.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
document.head.appendChild(aosLink);