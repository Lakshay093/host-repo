require('dotenv').config();
const mysql = require('mysql2');

console.log('Testing .env configuration...\n');

// Test database connection
const dbConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

dbConnection.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('Check your DB_PASSWORD in .env file');
    } else {
        console.log('✅ Database connection successful!');
        dbConnection.end();
    }
});

// Test email configuration
console.log('📧 Email settings:');
console.log(`   User: ${process.env.EMAIL_USER}`);
console.log(`   Password: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'}`);

// Test other settings
console.log('\n⚙️ Other settings:');
console.log(`   Port: ${process.env.PORT}`);
console.log(`   JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`   Node Environment: ${process.env.NODE_ENV}`);