// Authentication System for MyHost
class AuthSystem {
    constructor() {
        // Make sure MyHostAPI is available
        if (typeof MyHostAPI === 'undefined') {
            console.error('MyHostAPI is not defined. Make sure api.js is loaded before auth.js');
            this.showError('Error initializing authentication system. Please refresh the page.');
            return;
        }
        
        this.api = new MyHostAPI();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Check if user is already logged in
            if (this.api.isLoggedIn()) {
                this.redirectToDashboard();
                return;
            }

            this.setupLoginForm();
            this.setupRegistrationForm();
            this.setupFormToggle();
        });
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async(e) => {
            e.preventDefault();
            await this.handleLogin(loginForm);
        });
    }

    setupRegistrationForm() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        registerForm.addEventListener('submit', async(e) => {
            e.preventDefault();
            await this.handleRegistration(registerForm);
        });
    }

    setupFormToggle() {
        const toggleLinks = document.querySelectorAll('.toggle-form');
        toggleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleForms();
            });
        });
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Validate inputs
        if (!this.validateLoginInputs(credentials)) {
            return;
        }

        try {
            this.showLoading('login-btn');
            const response = await this.api.login(credentials);

            if (response.success) {
                this.showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
            }
        } catch (error) {
            this.showError(error.message || 'Login failed. Please try again.');
        } finally {
            this.hideLoading('login-btn', 'Login');
        }
    }

    async handleRegistration(form) {
        const formData = new FormData(form);
        const userData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            phone: formData.get('phone')
        };

        // Validate inputs
        if (!this.validateRegistrationInputs(userData)) {
            return;
        }

        try {
            this.showLoading('register-btn');
            const response = await this.api.register({
                fullName: userData.fullName,
                email: userData.email,
                password: userData.password,
                phone: userData.phone
            });

            if (response.success) {
                this.showSuccess('Registration successful! Redirecting to dashboard...');
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
            }
        } catch (error) {
            this.showError(error.message || 'Registration failed. Please try again.');
        } finally {
            this.hideLoading('register-btn', 'Register');
        }
    }

    validateLoginInputs(credentials) {
        if (!credentials.email || !credentials.password) {
            this.showError('Please fill in all fields');
            return false;
        }

        if (!this.isValidEmail(credentials.email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        return true;
    }

    validateRegistrationInputs(userData) {
        const { fullName, email, password, confirmPassword, phone } = userData;

        if (!fullName || !email || !password || !confirmPassword) {
            this.showError('Please fill in all required fields');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return false;
        }

        if (phone && !this.isValidPhone(phone)) {
            this.showError('Please enter a valid phone number');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
    }

    toggleForms() {
        const loginContainer = document.getElementById('login-container');
        const registerContainer = document.getElementById('register-container');

        if (loginContainer && registerContainer) {
            loginContainer.classList.toggle('d-none');
            registerContainer.classList.toggle('d-none');
        }
    }

    showLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
            button.disabled = true;
        }
    }

    hideLoading(buttonId, originalText) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'danger');
    }

    showMessage(message, type) {
        const alertContainer = document.getElementById('alert-container') || this.createAlertContainer();

        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        alertContainer.innerHTML = alertHtml;

        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                const alert = alertContainer.querySelector('.alert');
                if (alert) {
                    alert.remove();
                }
            }, 3000);
        }
    }

    createAlertContainer() {
        const container = document.createElement('div');
        container.id = 'alert-container';
        container.className = 'mt-3';

        const form = document.querySelector('form');
        if (form) {
            form.parentNode.insertBefore(container, form);
        }

        return container;
    }

    redirectToDashboard() {
        window.location.href = '/dashboard.html';
    }
}

// Initialize auth system
const authSystem = new AuthSystem();