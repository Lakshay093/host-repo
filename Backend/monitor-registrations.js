require('dotenv').config();
const mysql = require('mysql2');

let lastUserCount = 0;

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

console.log('🔍 Monitoring user registrations... (Press Ctrl+C to stop)\n');

function checkNewUsers() {
    connection.query('SELECT COUNT(*) as count FROM users', (err, results) => {
        if (err) {
            console.error('Error:', err);
            return;
        }

        const currentCount = results[0].count;

        if (currentCount > lastUserCount) {
            const newUsers = currentCount - lastUserCount;
            console.log(`🎉 ${newUsers} new user(s) registered! Total: ${currentCount}`);

            // Show the latest user
            connection.query('SELECT full_name, email, created_at FROM users ORDER BY created_at DESC LIMIT 1', (err, latest) => {
                if (!err && latest.length > 0) {
                    const user = latest[0];
                    console.log(`   👤 Latest: ${user.full_name} (${user.email})`);
                    console.log(`   📅 Time: ${user.created_at}\n`);
                }
            });
        }

        lastUserCount = currentCount;
    });
}

// Check every 5 seconds
setInterval(checkNewUsers, 5000);

// Initial check
checkNewUsers();