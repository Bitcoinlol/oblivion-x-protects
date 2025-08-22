// LuaGuard Frontend JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Modal functionality
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginBtns = document.querySelectorAll('a[href="#login"]');
    const signupBtns = document.querySelectorAll('a[href="#signup"]');
    const closeBtns = document.querySelectorAll('.close');

    // Open login modal
    loginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'block';
        });
    });

    // Open signup modal
    signupBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            signupModal.style.display = 'block';
        });
    });

    // Close modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Form submissions
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                alert('Feature coming soon! Join our Discord for updates.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                form.closest('.modal').style.display = 'none';
            }, 1500);
        });
    });

    // Animated counter for stats
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 20);
    }

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animate counters for stats
                if (entry.target.classList.contains('stat-number')) {
                    const target = parseInt(entry.target.textContent.replace(/[^0-9]/g, ''));
                    animateCounter(entry.target, target);
                }
            }
        });
    }, { threshold: 0.1 });

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .step, .stat-number').forEach(el => {
        observer.observe(el);
    });

    // Copy to clipboard functionality
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Show toast notification
            showToast('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    // Toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    // Theme toggle (future feature)
    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
});

// API simulation functions
class LuaGuardAPI {
    static async login(email, password) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    token: 'mock_jwt_token',
                    user: { email, username: 'user123' }
                });
            }, 1000);
        });
    }

    static async signup(email, password, username) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: '30-day free trial activated!',
                    trial_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });
            }, 1000);
        });
    }

    static async generateKey(scriptId, duration = 30) {
        // Simulate key generation
        return new Promise((resolve) => {
            setTimeout(() => {
                const key = `LG-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
                resolve({
                    success: true,
                    key: key,
                    expires: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
                });
            }, 500);
        });
    }

    static async obfuscateScript(scriptContent, protectionLevel = 'basic') {
        // Simulate obfuscation
        return new Promise((resolve) => {
            setTimeout(() => {
                const obfuscated = `-- Protected by LuaGuard\nlocal ${Math.random().toString(36).substr(2, 10)} = function()\n    return "${Buffer.from(scriptContent).toString('base64').substr(0, 50)}..."\nend`;
                resolve({
                    success: true,
                    obfuscated: obfuscated,
                    protection_level: protectionLevel
                });
            }, 2000);
        });
    }
}

// Export for use in other files
window.LuaGuardAPI = LuaGuardAPI;
