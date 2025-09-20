# MyHost - Complete Web Hosting Management System

## Overview

MyHost is a comprehensive web hosting management system with both frontend and backend components. The system allows users to register, login, purchase hosting plans, manage domains, and access a full dashboard for managing their hosting services.

## Features

### Frontend Features

- **Responsive Design**: Mobile-friendly interface built with Bootstrap
- **Modern UI**: Clean and professional design with animations
- **Domain Search**: Real-time domain availability checking
- **Hosting Plans**: Three tier hosting plans (Premium, Business, Cloud Startup)
- **Contact System**: Integrated contact form with backend processing
- **Newsletter**: Email subscription system
- **Team Showcase**: Team member profiles with social links

### Backend Features

- **User Authentication**: JWT-based login/registration system
- **Database Integration**: MySQL database with comprehensive schema
- **Email Integration**: Automated email notifications
- **API Endpoints**: RESTful API for all operations
- **Dashboard**: Complete user management dashboard
- **Order Management**: Full order processing system
- **Domain Management**: Domain registration and management
- **Security**: Password hashing, rate limiting, input validation

## Technology Stack

### Frontend

- HTML5/CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Font Awesome Icons
- Google Fonts

### Backend

- Node.js
- Express.js
- MySQL
- JWT Authentication
- Bcrypt for password hashing
- Nodemailer for emails

## Installation Guide

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/myhost.git
cd myhost
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Database Setup

1. Create a MySQL database:

```sql
CREATE DATABASE myhost_db;
```

2. Import the database schema:

```bash
mysql -u your_username -p myhost_db < database.sql
```

### Step 4: Environment Configuration

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:

```env
# Database
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=myhost_db

# JWT Secret (Generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_here

# Email Configuration
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

### Step 5: Project Structure

```
myhost/
├── server.js              # Main server file
├── database.sql           # Database schema
├── package.json           # Dependencies
├── .env                  # Environment variables
├── public/               # Static files (your existing HTML/CSS/JS)
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   ├── domain.html
│   ├── hosting.html
│   ├── team.html
│   ├── testimonial.html
│   ├── comparison.html
│   ├── dashboard.html    # New dashboard
│   ├── css/
│   ├── js/
│   │   └── api.js        # API client
│   ├── images/
│   └── Login page/
│       ├── login.html    # Enhanced login page
│       └── auth.js       # Authentication system
└── README.md
```

### Step 6: Start the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### POST /api/register

Register a new user account.

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST /api/login

Login with existing credentials.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Domain Management

#### POST /api/domain/search

Search for domain availability.

**Request Body:**

```json
{
  "domainName": "example"
}
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "domain": "example.com",
      "available": true,
      "price": 9.99
    }
  ]
}
```

### Hosting Management

#### POST /api/purchase

Purchase a hosting plan (requires authentication).

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Request Body:**

```json
{
  "plan": "premium",
  "amount": 22.49
}
```

### Dashboard

#### GET /api/dashboard

Get user dashboard data (requires authentication).

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {...},
    "hostingAccounts": [...],
    "orders": [...],
    "domains": [...]
  }
}
```

## Frontend Integration

### API Client Usage

```javascript
// Initialize API client
const api = new MyHostAPI();

// Login user
try {
  const response = await api.login({
    email: "user@example.com",
    password: "password123",
  });

  if (response.success) {
    // Redirect to dashboard
    window.location.href = "/dashboard.html";
  }
} catch (error) {
  console.error("Login failed:", error.message);
}

// Search domains
const results = await api.searchDomain("example");

// Submit contact form
await api.submitContactForm({
  name: "John Doe",
  email: "john@example.com",
  subject: "Support Request",
  message: "Need help with hosting",
});
```

### Form Integration

Your existing HTML forms automatically integrate with the backend when you include the API client:

```html
<!-- Contact form in contact.html -->
<form action="/api/contact" method="POST">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <input type="text" name="subject" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send Message</button>
</form>

<!-- Include the API client -->
<script src="js/api.js"></script>
```

## Database Schema

### Key Tables

- **users**: User account information
- **hosting_accounts**: Active hosting services
- **domains**: Domain registrations
- **orders**: Purchase history
- **contact_messages**: Contact form submissions
- **newsletter_subscribers**: Email subscribers
- **support_tickets**: Customer support tickets

### Relationships

- Users can have multiple hosting accounts
- Users can own multiple domains
- Orders track purchases and link to hosting accounts
- Support tickets are linked to users

## Security Features

### Authentication

- JWT tokens for secure authentication
- Password hashing with bcrypt
- Token expiration and refresh

### Input Validation

- Email format validation
- Password strength requirements
- SQL injection prevention
- XSS protection

### Rate Limiting

- API endpoint protection
- Login attempt limitations
- Spam prevention

## Email Integration

### Automated Emails

- Welcome emails for new users
- Order confirmations
- Support ticket notifications
- Password reset emails

### Configuration

Set up Gmail app passwords or configure SMTP settings in your `.env` file.

## Deployment

### Production Checklist

1. Set secure JWT secret
2. Configure production database
3. Set up SSL certificates
4. Configure email service
5. Set up monitoring
6. Configure backup systems

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your_production_db_host
JWT_SECRET=very_secure_random_string
EMAIL_USER=your_production_email
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Verify MySQL is running
   - Check database credentials in .env
   - Ensure database exists

2. **JWT Token Issues**

   - Check JWT_SECRET in .env
   - Verify token expiration settings
   - Clear browser localStorage

3. **Email Not Sending**

   - Verify Gmail app password
   - Check email configuration
   - Test SMTP connection

4. **Frontend API Calls Failing**
   - Check CORS configuration
   - Verify API endpoints
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For technical support or questions:

- Email: lakshaydiman21518@gmail.com
- Phone: +91 7018321518
- GitHub Issues: [Create an issue](https://github.com/your-username/myhost/issues)

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Changelog

### v1.0.0 (Current)

- Initial release with full backend integration
- User authentication system
- Dashboard functionality
- Domain search and management
- Order processing system
- Email integration
- Responsive design
- API documentation

---

**Note**: This system provides a complete foundation for a web hosting business. All frontend components have been preserved and enhanced with backend connectivity. The system is production-ready with proper security measures, database optimization, and scalability considerations.
