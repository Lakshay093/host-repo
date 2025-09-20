require('dotenv').config();
const mysql = require('mysql2');

console.log('🔍 Testing database connection...\n');

// Display current configuration (without showing password)
console.log('📋 Current configuration:');
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   User: ${process.env.DB_USER}`);
console.log(`   Database: ${process.env.DB_NAME}`);
console.log(`   Port: ${process.env.DB_PORT || 3306}`);
console.log(`   Password: ${process.env.DB_PASSWORD ? 'Lak123@shay' : '***NOT SET***'}\n`);

// Test connection with your .env settings
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Database connection FAILED:');
        console.error('Error:', err.message);
        console.error('Code:', err.code);
        console.log('\n🔧 Troubleshooting steps:');

        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('1. ❌ Wrong username or password');
            console.log('   - Check your MySQL password in .env file');
            console.log('   - Try connecting with these credentials in MySQL Workbench');
        } else if (err.code === 'ECONNREFUSED') {
            console.log('1. ❌ MySQL server is not running');
            console.log('   - Start MySQL service');
            console.log('   - Check if MySQL is running in MySQL Workbench');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('1. ❌ Database does not exist');
            console.log('   - Create database "myhost_db" in MySQL Workbench');
            console.log('   - Run the database.sql script');
        }

        console.log('2. Open MySQL Workbench and verify connection works there first');
        process.exit(1);
    }

    console.log('✅ Database connection SUCCESSFUL!');

    // Test if our database exists and has tables
    connection.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('❌ Error checking tables:', err.message);
            console.log('💡 The database exists but may be empty.');
            console.log('   Run the database.sql script in MySQL Workbench to create tables.');
            connection.end();
            return;
        }

        if (results.length === 0) {
            console.log('⚠️ Database is empty (no tables found)');
            console.log('📝 You need to:');
            console.log('   1. Open MySQL Workbench');
            console.log('   2. Connect to your database');
            console.log('   3. Run the database.sql script to create tables');
            connection.end();
            return;
        }

        console.log(`📊 Found ${results.length} tables in database:`);
        results.forEach((table, index) => {
            const tableName = table[`Tables_in_${process.env.DB_NAME}`];
            console.log(`   ${index + 1}. ${tableName}`);
        });

        // Test sample data in hosting_plans table
        connection.query('SELECT COUNT(*) as count FROM hosting_plans', (err, results) => {
            if (err) {
                console.error('❌ Error checking hosting plans:', err.message);
                console.log('💡 Tables exist but may not have data. Run the complete database.sql script.');
            } else {
                const count = results[0].count;
                if (count > 0) {
                    console.log(`\n🎯 Sample data: ${count} hosting plans found`);

                    // Show the hosting plans
                    connection.query('SELECT name, display_name, price FROM hosting_plans', (err, plans) => {
                        if (!err && plans.length > 0) {
                            console.log('📦 Available hosting plans:');
                            plans.forEach(plan => {
                                console.log(`   - ${plan.display_name}: $${plan.price}`);
                            });
                        }

                        console.log('\n🎉 Database is ready for your application!');
                        console.log('✅ You can now start your server with: node server.js');
                        connection.end();
                    });
                } else {
                    console.log('\n⚠️ No hosting plans found in database');
                    console.log('📝 Run the complete database.sql script to add sample data');
                    connection.end();
                }
            }
        });
    });
});

// Handle connection errors
connection.on('error', (err) => {
    console.error('Database connection lost:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Attempting to reconnect...');
    }
});