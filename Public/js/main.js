(function($) {
    "use strict";

    // Spinner
    var spinner = function() {
        setTimeout(function() {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();

    // Initiate the wowjs
    new WOW().init();

    // Sticky Navbar
    $(window).scroll(function() {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });

    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";

    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
                function() {
                    const $this = $(this);
                    $this.addClass(showClass);
                    $this.find($dropdownToggle).attr("aria-expanded", "true");
                    $this.find($dropdownMenu).addClass(showClass);
                },
                function() {
                    const $this = $(this);
                    $this.removeClass(showClass);
                    $this.find($dropdownToggle).attr("aria-expanded", "false");
                    $this.find($dropdownMenu).removeClass(showClass);
                }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });

    // Back to top button
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function() {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
    });

    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });

    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 25,
        dots: true,
        loop: true,
        center: true,
        responsive: {
            0: {
                items: 1
            },
            576: {
                items: 1
            },
            768: {
                items: 2
            },
            992: {
                items: 3
            }
        }
    });

    // Enhanced Authentication handling
    $(document).ready(function() {
        // Check if user is logged in and update UI
        updateAuthenticationUI();

        // Handle login form submission
        $('#loginForm').on('submit', handleLogin);

        // Handle registration form submission  
        $('#registerForm').on('submit', handleRegistration);

        // Handle user menu interactions
        setupUserMenuHandlers();
    });

    // Update UI based on authentication status
    function updateAuthenticationUI() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');

        if (token && user) {
            const userData = JSON.parse(user);
            updateNavbarForLoggedInUser(userData);
        }
    }

    // Update navbar for logged in user
    function updateNavbarForLoggedInUser(user) {
        const registerLink = $('a[href*="login.html"], a:contains("Login"), a:contains("Register")').first();

        if (registerLink.length > 0) {
            const firstName = user.fullName ? user.fullName.split(' ')[0] : 'User';

            // Create user dropdown
            const userDropdownHtml = `
                <div class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle text-primary fw-bold" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-user me-1"></i>Hi, ${firstName}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><h6 class="dropdown-header">${user.fullName}</h6></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="dashboard.html"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</a></li>
                        <li><a class="dropdown-item" href="#" onclick="goToDashboard()"><i class="fas fa-user me-2"></i>Profile</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="handleLogout()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                    </ul>
                </div>
            `;

            // Replace the register/login link with user dropdown
            registerLink.closest('li').replaceWith(userDropdownHtml);
        }
    }

    // Handle login form submission
    async function handleLogin(e) {
        e.preventDefault();

        const email = $('#email').val();
        const password = $('#password').val();
        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.html();

        // Validation
        if (!email || !password) {
            showAlert('Please fill in all fields', 'error');
            return;
        }

        // Show loading
        submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Logging in...');
        submitBtn.prop('disabled', true);

        try {
            const response = await api.login({ email, password });

            if (response.success) {
                showAlert('Login successful! Redirecting to dashboard...', 'success');

                // Clear form
                $(this)[0].reset();

                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            }
        } catch (error) {
            showAlert(error.message || 'Login failed. Please try again.', 'error');
        } finally {
            // Restore button
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
        }
    }

    // Handle registration form submission
    async function handleRegistration(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const userData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone')
        };

        const submitBtn = $(this).find('button[type="submit"]');
        const originalText = submitBtn.html();

        // Validation
        if (!userData.fullName || !userData.email || !userData.password) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        // Show loading
        submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Creating Account...');
        submitBtn.prop('disabled', true);

        try {
            const response = await api.register(userData);

            if (response.success) {
                showAlert('Registration successful! Redirecting to dashboard...', 'success');

                // Clear form
                $(this)[0].reset();

                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            }
        } catch (error) {
            showAlert(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            // Restore button
            submitBtn.html(originalText);
            submitBtn.prop('disabled', false);
        }
    }

    // Setup user menu handlers
    function setupUserMenuHandlers() {
        // Dashboard redirect function
        window.goToDashboard = function() {
            showAlert('Redirecting to dashboard...', 'info');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        };

        // Logout handler
        window.handleLogout = function() {
            if (confirm('Are you sure you want to logout?')) {
                // Clear all auth data
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                sessionStorage.clear();

                showAlert('Logged out successfully!', 'success');

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        };
    }

    // Enhanced alert function
    function showAlert(message, type = 'info') {
        // Remove existing alerts
        $('.custom-alert').remove();

        const alertClass = type === 'success' ? 'alert-success' :
            type === 'error' ? 'alert-danger' :
            type === 'warning' ? 'alert-warning' : 'alert-info';

        const iconClass = type === 'success' ? 'fa-check-circle' :
            type === 'error' ? 'fa-exclamation-circle' :
            type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

        const alertHtml = `
            <div class="alert ${alertClass} alert-dismissible fade show custom-alert" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                <i class="fas ${iconClass} me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        $('body').append(alertHtml);

        // Auto remove after 5 seconds
        setTimeout(() => {
            $('.custom-alert').fadeOut(() => {
                $('.custom-alert').remove();
            });
        }, 5000);
    }

    // Make showAlert globally available
    window.showAlert = showAlert;

})(jQuery);

// Additional utility functions for authentication
document.addEventListener('DOMContentLoaded', function() {
    // Check for authentication redirect
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');

    if (redirect === 'login') {
        showAlert('Please login to continue', 'warning');
    }

    // Auto-redirect if already logged in and on login page
    const currentPage = window.location.pathname;
    const isLoginPage = currentPage.includes('login.html') || currentPage.includes('register.html');
    const token = localStorage.getItem('authToken');

    if (isLoginPage && token) {
        showAlert('You are already logged in. Redirecting to dashboard...', 'info');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }
});