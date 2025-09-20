require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

console.log('👥 Checking registered users...\n');

// Get all users
connection.query('SELECT * FROM users ORDER BY created_at DESC', (err, results) => {
    if (err) {
        console.error('❌ Error fetching users:', err);
        return;
    }

    if (results.length === 0) {
        console.log('📝 No users registered yet');
        connection.end();
        return;
    }

    console.log(`👥 Total registered users: ${results.length}\n`);

    console.log('📋 Recent registrations:');
    console.log('─'.repeat(80));

    results.forEach((user, index) => {
        console.log(`${index + 1}. ${user.full_name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   📱 Phone: ${user.phone || 'Not provided'}`);
        console.log(`   📅 Registered: ${user.created_at}`);
        console.log(`   🔐 Last Login: ${user.last_login || 'Never'}`);
        console.log(`   ✅ Status: ${user.is_active ? 'Active' : 'Inactive'}`);
        console.log('─'.repeat(40));
    });

    connection.end();
});