// LuaGuard Frontend JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for sections
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

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

    // Free trial function
    function getFreeTrial() {
        if (localStorage.getItem('freeTrialUsed')) {
            showToast('You already have a key sorry', 'error');
            return;
        }
        
        OblivionXAPI.getFreeTrial().then(result => {
            if (result.success) {
                // Copy to clipboard
                navigator.clipboard.writeText(result.key).then(() => {
                    showToast('Copied 30 day free api key', 'success');
                    localStorage.setItem('freeTrialUsed', 'true');
                    localStorage.setItem('freeTrialKey', result.key);
                }).catch(() => {
                    showToast('Failed to copy key. Please copy manually: ' + result.key, 'error');
                });
            }
        });
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

// Oblivion X Protects API functions
class OblivionXAPI {
    static async getFreeTrial() {
        // Simulate free trial generation
        return new Promise((resolve) => {
            setTimeout(() => {
                const key = `OX_30D_${Math.random().toString(36).substr(2, 16).toUpperCase()}`;
                resolve({
                    success: true,
                    key: key,
                    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });
            }, 500);
        });
    }

    static async obfuscateScript(scriptContent) {
        // Simulate advanced obfuscation
        return new Promise((resolve) => {
            setTimeout(() => {
                const obfuscated = `-- Protected by Oblivion X Protects\nlocal _0x${Math.random().toString(36).substr(2, 8)} = function()\n    return "${Buffer.from(scriptContent).toString('base64').substr(0, 50)}..."\nend`;
                resolve({
                    success: true,
                    obfuscated: obfuscated,
                    protection_level: 'advanced'
                });
            }, 2000);
        });
    }

    static async createProject(projectData) {
        // Simulate project creation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    projectId: Date.now(),
                    loadstring: `loadstring(game:HttpGet("https://api.oblivionxprotects.com/files/v3/loaders/${Date.now()}.lua"))()`
                });
            }, 1000);
        });
    }
}

// Export for use in other files
window.OblivionXAPI = OblivionXAPI;
