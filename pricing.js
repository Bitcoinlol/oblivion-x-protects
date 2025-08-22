// Pricing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Billing toggle functionality
    const billingToggle = document.getElementById('billingToggle');
    const priceElements = document.querySelectorAll('.price[data-monthly]');

    if (billingToggle) {
        billingToggle.addEventListener('change', function() {
            const isYearly = this.checked;
            
            priceElements.forEach(priceEl => {
                const monthlyPrice = priceEl.getAttribute('data-monthly');
                const yearlyPrice = priceEl.getAttribute('data-yearly');
                
                if (isYearly && yearlyPrice) {
                    priceEl.textContent = yearlyPrice;
                } else if (monthlyPrice) {
                    priceEl.textContent = monthlyPrice;
                }
            });

            // Update period text
            const periodElements = document.querySelectorAll('.period');
            periodElements.forEach(periodEl => {
                if (periodEl.textContent.includes('/month') || periodEl.textContent.includes('/year')) {
                    periodEl.textContent = isYearly ? '/year' : '/month';
                }
            });
        });
    }

    // Plan selection
    const planBtns = document.querySelectorAll('.plan-btn');
    planBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const planCard = this.closest('.pricing-card');
            const planName = planCard.querySelector('h3').textContent;
            
            if (this.textContent.includes('Contact Sales')) {
                // Open contact form or redirect to contact page
                window.open('https://discord.gg/tKF8gCw5qp', '_blank');
                return;
            }
            
            if (this.textContent.includes('Start Free Trial')) {
                // Open signup modal with trial
                const signupModal = document.getElementById('signupModal') || createSignupModal();
                signupModal.style.display = 'block';
                return;
            }
            
            // Handle paid plan selection
            handlePlanSelection(planName, this);
        });
    });

    // Animate pricing cards on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.pricing-card').forEach(card => {
        card.style.animation = 'slideInUp 0.6s ease forwards paused';
        observer.observe(card);
    });

    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
    });
});

function handlePlanSelection(planName, button) {
    // Show loading state
    const originalText = button.textContent;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;

    // Simulate payment processing
    setTimeout(() => {
        alert(`Redirecting to payment for ${planName} plan...`);
        
        // In a real app, this would redirect to Stripe/PayPal/etc.
        // For demo purposes, we'll just show a success message
        setTimeout(() => {
            alert('Payment successful! Welcome to LuaGuard Premium!');
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        }, 2000);
        
        button.textContent = originalText;
        button.disabled = false;
    }, 1500);
}

function createSignupModal() {
    // Create signup modal if it doesn't exist
    const modal = document.createElement('div');
    modal.id = 'signupModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Start Your 30-Day Free Trial</h2>
            <p class="modal-subtitle">No credit card required</p>
            <form class="auth-form">
                <div class="form-group">
                    <label for="trial-email">Email</label>
                    <input type="email" id="trial-email" required>
                </div>
                <div class="form-group">
                    <label for="trial-password">Password</label>
                    <input type="password" id="trial-password" required>
                </div>
                <div class="form-group">
                    <label for="trial-username">Username</label>
                    <input type="text" id="trial-username" required>
                </div>
                <button type="submit" class="btn btn-primary">Start Free Trial</button>
                <p class="form-footer">Already have an account? <a href="#login">Login</a></p>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    const form = modal.querySelector('.auth-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('trial-email').value;
        const password = document.getElementById('trial-password').value;
        const username = document.getElementById('trial-username').value;
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;

        try {
            const result = await LuaGuardAPI.signup(email, password, username);
            if (result.success) {
                alert('Account created successfully! Your 30-day free trial has started.');
                modal.style.display = 'none';
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            alert('Failed to create account: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    return modal;
}

// Pricing calculator
function calculateYearlyDiscount(monthlyPrice) {
    const yearly = monthlyPrice * 12 * 0.8; // 20% discount
    return (yearly / 12).toFixed(2);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .pricing-card:nth-child(1) { animation-delay: 0.1s; }
    .pricing-card:nth-child(2) { animation-delay: 0.2s; }
    .pricing-card:nth-child(3) { animation-delay: 0.3s; }
    .pricing-card:nth-child(4) { animation-delay: 0.4s; }
    
    .faq-item {
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .faq-item:hover {
        transform: translateY(-2px);
    }
    
    .faq-item.expanded {
        border-color: var(--primary-purple);
        box-shadow: var(--shadow);
    }
    
    .file-upload.dragover .file-upload-label {
        border-color: var(--primary-purple);
        background: rgba(124, 58, 237, 0.1);
    }
`;
document.head.appendChild(style);
