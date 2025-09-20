// API Client for MyHost Frontend
class MyHostAPI {
  constructor() {
    this.baseURL =
      window.location.hostname === "localhost"
        ? "http://localhost:3000/api"
        : "https://host-12bk.onrender.com/api";
    this.token = localStorage.getItem("authToken");
  }
}


    // Helper method to make API requests
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(userData) {
        const response = await this.makeRequest('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success) {
            this.token = response.token;
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Auto redirect to dashboard after successful registration
            UIHelper.showSuccess('Registration successful! Redirecting to dashboard...', null);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }

        return response;
    }

    async login(credentials) {
        const response = await this.makeRequest('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.success) {
            this.token = response.token;
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Auto redirect to dashboard after successful login
            UIHelper.showSuccess('Login successful! Redirecting to dashboard...', null);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }

        return response;
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            console.log('Logging out user...');

            // Clear ALL authentication data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userProfile');
            localStorage.removeItem('userData');
            sessionStorage.clear();

            // Clear cookies if any
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            UIHelper.showSuccess('You have been logged out successfully!');

            // Force redirect and prevent going back
            setTimeout(() => {
                window.location.replace('index.html');
            }, 1000);
        }
    }

    // Contact form submission
    async submitContactForm(formData) {
        return await this.makeRequest('/contact', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    // Domain search
    async searchDomain(domainName) {
        return await this.makeRequest('/domain/search', {
            method: 'POST',
            body: JSON.stringify({ domainName })
        });
    }

    // Purchase hosting plan
    async purchaseHosting(purchaseData) {
        return await this.makeRequest('/purchase', {
            method: 'POST',
            body: JSON.stringify(purchaseData)
        });
    }

    // Newsletter subscription
    async subscribeNewsletter(email) {
        return await this.makeRequest('/newsletter', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    // Dashboard data
    async getDashboardData() {
        return await this.makeRequest('/dashboard');
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.token;
    }

    // Get current user
    getCurrentUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }
}

// Initialize API client
const api = new MyHostAPI();

// Utility functions for form handling and UI updates
const UIHelper = {
    // Show loading spinner
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div>';
        }
    },

    // Show success message
    showSuccess(message, elementId = null) {
        const alertHtml = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        if (elementId) {
            document.getElementById(elementId).innerHTML = alertHtml;
        } else {
            this.showToast(message, 'success');
        }
    },

    // Show error message
    showError(message, elementId = null) {
        const alertHtml = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        if (elementId) {
            document.getElementById(elementId).innerHTML = alertHtml;
        } else {
            this.showToast(message, 'error');
        }
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        const toastId = 'toast-' + Date.now();
        const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';

        const toastHtml = `
            <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
                <div class="toast-body">${message}</div>
            </div>
        `;

        toastContainer.innerHTML += toastHtml;
        const toastElement = document.getElementById(toastId);

        // Show toast for 3 seconds
        toastElement.style.display = 'block';
        setTimeout(() => {
            toastElement.style.display = 'none';
            toastElement.remove();
        }, 3000);
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }
};

// Contact form handler
document.addEventListener('DOMContentLoaded', function() {
    // Handle contact form submission
    const contactForm = document.querySelector('form[action="/api/contact"]');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            try {
                UIHelper.showLoading('contact-form-result');
                const response = await api.submitContactForm(data);

                if (response.success) {
                    UIHelper.showSuccess('Message sent successfully! We will get back to you soon.', 'contact-form-result');
                    this.reset();
                }
            } catch (error) {
                UIHelper.showError(error.message || 'Failed to send message. Please try again.', 'contact-form-result');
            }
        });
    }

    // Handle domain search
    const domainSearchBtn = document.querySelector('.domain button[type="button"]');
    const domainInput = document.querySelector('.domain input[type="text"]');

    if (domainSearchBtn && domainInput) {
        domainSearchBtn.addEventListener('click', async function() {
            const domainName = domainInput.value.trim();

            if (!domainName) {
                UIHelper.showError('Please enter a domain name');
                return;
            }

            try {
                UIHelper.showLoading('domain-results');
                const response = await api.searchDomain(domainName);

                if (response.success) {
                    displayDomainResults(response.results);
                }
            } catch (error) {
                UIHelper.showError('Domain search failed. Please try again.');
            }
        });
    }

    // Handle newsletter subscription
    const newsletterForms = document.querySelectorAll('form');
    newsletterForms.forEach(form => {
        const emailInput = form.querySelector('input[placeholder*="email"]');
        const submitBtn = form.querySelector('button[type="button"]');

        if (emailInput && submitBtn && submitBtn.textContent.includes('Submit')) {
            submitBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                const email = emailInput.value.trim();

                if (!email || !isValidEmail(email)) {
                    UIHelper.showError('Please enter a valid email address');
                    return;
                }

                try {
                    const response = await api.subscribeNewsletter(email);

                    if (response.success) {
                        UIHelper.showSuccess('Successfully subscribed to newsletter!');
                        emailInput.value = '';
                    }
                } catch (error) {
                    UIHelper.showError(error.message || 'Subscription failed. Please try again.');
                }
            });
        }
    });

    // Handle hosting plan purchases
    const buyNowButtons = document.querySelectorAll('a[href*="Payment"]');
    buyNowButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!api.isLoggedIn()) {
                e.preventDefault();
                UIHelper.showError('Please login first to purchase a hosting plan');
                // Redirect to login page after a delay
                setTimeout(() => {
                    window.location.href = 'Login page/login.html';
                }, 2000);
                return;
            }

            // Store selected plan in localStorage for payment page
            const planCard = this.closest('.position-relative');
            const planName = planCard.querySelector('h4').textContent;
            const planPrice = planCard.querySelector('h1').textContent.match(/\$[\d.]+/)[0];

            localStorage.setItem('selectedPlan', JSON.stringify({
                name: planName,
                price: planPrice
            }));
        });
    });

    // Update UI based on login status
    updateUIForUser();
});

// Helper functions
function displayDomainResults(results) {
    const domainGrid = document.querySelector('.domain .row.g-3');
    if (!domainGrid) return;

    domainGrid.innerHTML = '';

    results.forEach(result => {
                const statusClass = result.available ? 'text-success' : 'text-danger';
                const statusText = result.available ? 'Available' : 'Taken';
                const buttonText = result.available ? 'Register' : 'Unavailable';
                const buttonClass = result.available ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm disabled';

                const domainHtml = `
            <div class="col-lg-2 col-md-3 col-sm-4 col-6 text-center">
                <h5 class="fw-bold text-primary mb-1">${result.domain.split('.')[1]}</h5>
                <p class="mb-1">${result.price}/year</p>
                <p class="mb-2 ${statusClass}">${statusText}</p>
                <button class="${buttonClass}" ${result.available ? `onclick="registerDomain('${result.domain}', ${result.price})"` : ''}>${buttonText}</button>
            </div>
        `;
        
        domainGrid.innerHTML += domainHtml;
    });
}

async function registerDomain(domain, price) {
    if (!api.isLoggedIn()) {
        UIHelper.showError('Please login first to register a domain');
        return;
    }

    try {
        const response = await api.purchaseHosting({
            plan: 'domain',
            domain: domain,
            amount: price
        });

        if (response.success) {
            UIHelper.showSuccess(`Domain ${domain} registered successfully!`);
        }
    } catch (error) {
        UIHelper.showError(error.message || 'Domain registration failed');
    }
}

function updateUIForUser() {
    const user = api.getCurrentUser();
    const registerBtn = document.querySelector('a[href*="login.html"]');
    
    if (user && registerBtn) {
        registerBtn.textContent = `Hi, ${user.fullName.split(' ')[0]}`;
        registerBtn.href = '#';
        registerBtn.classList.add('dropdown-toggle');
        registerBtn.setAttribute('data-bs-toggle', 'dropdown');
        registerBtn.onclick = function(e) {
            e.preventDefault();
            showUserMenu(this);
        };
    }
}

function showUserMenu(element) {
    const user = api.getCurrentUser();
    
    // Remove existing dropdown menu
    const existingDropdown = document.querySelector('.user-dropdown-menu');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'dropdown-menu show user-dropdown-menu';
    dropdownMenu.style.position = 'absolute';
    dropdownMenu.style.top = '100%';
    dropdownMenu.style.right = '0';
    dropdownMenu.style.zIndex = '1000';
    dropdownMenu.style.minWidth = '200px';
    
    dropdownMenu.innerHTML = `
        <div class="dropdown-header">${user.fullName}</div>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item" href="dashboard.html">
            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
        </a>
        <a class="dropdown-item" href="#" onclick="goToDashboard()">
            <i class="fas fa-user me-2"></i>Profile
        </a>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item text-danger" href="#" onclick="api.logout()">
            <i class="fas fa-sign-out-alt me-2"></i>Logout
        </a>
    `;
    
    // Position dropdown relative to button
    element.parentNode.style.position = 'relative';
    element.parentNode.appendChild(dropdownMenu);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!element.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.remove();
            document.removeEventListener('click', closeDropdown);
        }
    });
}

function goToDashboard() {
    UIHelper.showSuccess('Redirecting to dashboard...');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Add result containers if they don't exist
document.addEventListener('DOMContentLoaded', function() {
    // Add contact form result container
    const contactForm = document.querySelector('form[action="/api/contact"]');
    if (contactForm && !document.getElementById('contact-form-result')) {
        const resultDiv = document.createElement('div');
        resultDiv.id = 'contact-form-result';
        contactForm.parentNode.insertBefore(resultDiv, contactForm.nextSibling);
    }

    // Add domain results container
    const domainSection = document.querySelector('.domain');
    if (domainSection && !document.getElementById('domain-results')) {
        const resultDiv = document.createElement('div');
        resultDiv.id = 'domain-results';
        domainSection.appendChild(resultDiv);
    }
});
