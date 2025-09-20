-- MyHost Database Schema
-- Create database
CREATE DATABASE
IF NOT EXISTS myhost_db;
USE myhost_db;

-- Users table
CREATE TABLE users
(
    id INT
    AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR
    (100) NOT NULL,
    email VARCHAR
    (100) UNIQUE NOT NULL,
    password VARCHAR
    (255) NOT NULL,
    phone VARCHAR
    (20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
    UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'suspended')
    DEFAULT 'active',
    INDEX idx_email
    (email)
);

    -- Contact messages table
    CREATE TABLE contact_messages
    (
        id INT
        AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR
        (100) NOT NULL,
    email VARCHAR
        (100) NOT NULL,
    subject VARCHAR
        (200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM
        ('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at
        (created_at),
    INDEX idx_status
        (status)
);

        -- Domains table
        CREATE TABLE domains
        (
            id INT
            AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    domain_name VARCHAR
            (100) UNIQUE NOT NULL,
    extension VARCHAR
            (10) NOT NULL,
    price DECIMAL
            (10, 2) NOT NULL,
    status ENUM
            ('available', 'registered', 'expired') DEFAULT 'available',
    registered_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY
            (user_id) REFERENCES users
            (id) ON
            DELETE
            SET NULL
            ,
    INDEX idx_domain_name
            (domain_name),
    INDEX idx_user_id
            (user_id)
);

            -- Orders table
            CREATE TABLE orders
            (
                id INT
                AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_type ENUM
                ('hosting', 'domain', 'both') DEFAULT 'hosting',
    plan_type VARCHAR
                (50) NOT NULL,
    amount DECIMAL
                (10, 2) NOT NULL,
    status ENUM
                ('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR
                (50),
    payment_id VARCHAR
                (100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_date TIMESTAMP NULL,
    FOREIGN KEY
                (user_id) REFERENCES users
                (id) ON
                DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status
                (status),
    INDEX idx_created_at
                (created_at)
);

                -- Hosting accounts table
                CREATE TABLE hosting_accounts
                (
                    id INT
                    AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    plan_type ENUM
                    ('premium', 'business', 'cloud_startup') NOT NULL,
    domain_name VARCHAR
                    (100),
    server_info JSON,
    status ENUM
                    ('active', 'suspended', 'cancelled', 'expired') DEFAULT 'active',
    disk_space_gb INT DEFAULT 100,
    bandwidth_gb INT DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY
                    (user_id) REFERENCES users
                    (id) ON
                    DELETE CASCADE,
    FOREIGN KEY (order_id)
                    REFERENCES orders
                    (id) ON
                    DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status
                    (status),
    INDEX idx_expires_at
                    (expires_at)
);

                    -- Newsletter subscribers table
                    CREATE TABLE newsletter_subscribers
                    (
                        id INT
                        AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR
                        (100) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM
                        ('active', 'unsubscribed') DEFAULT 'active',
    INDEX idx_email
                        (email),
    INDEX idx_status
                        (status)
);

                        -- Support tickets table
                        CREATE TABLE support_tickets
                        (
                            id INT
                            AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR
                            (200) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM
                            ('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM
                            ('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assigned_to INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON
                            UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY
                            (user_id) REFERENCES users
                            (id) ON
                            DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status
                            (status)
);

                            -- Payments table
                            CREATE TABLE payments
                            (
                                id INT
                                AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    amount DECIMAL
                                (10, 2) NOT NULL,
    payment_method VARCHAR
                                (50) NOT NULL,
    transaction_id VARCHAR
                                (100),
    status ENUM
                                ('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY
                                (user_id) REFERENCES users
                                (id) ON
                                DELETE CASCADE,
    FOREIGN KEY (order_id)
                                REFERENCES orders
                                (id) ON
                                DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_order_id
                                (order_id),
    INDEX idx_status
                                (status)
);

                                -- Server resources table
                                CREATE TABLE server_resources
                                (
                                    id INT
                                    AUTO_INCREMENT PRIMARY KEY,
    hosting_account_id INT NOT NULL,
    cpu_usage DECIMAL
                                    (5, 2) DEFAULT 0,
    memory_usage DECIMAL
                                    (5, 2) DEFAULT 0,
    disk_usage DECIMAL
                                    (5, 2) DEFAULT 0,
    bandwidth_used DECIMAL
                                    (10, 2) DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY
                                    (hosting_account_id) REFERENCES hosting_accounts
                                    (id) ON
                                    DELETE CASCADE,
    INDEX idx_hosting_account_id (hosting_account_id),
    INDEX idx_recorded_at
                                    (recorded_at)
);

                                    -- Admin users table
                                    CREATE TABLE admin_users
                                    (
                                        id INT
                                        AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR
                                        (50) UNIQUE NOT NULL,
    email VARCHAR
                                        (100) UNIQUE NOT NULL,
    password VARCHAR
                                        (255) NOT NULL,
    role ENUM
                                        ('super_admin', 'admin', 'support') DEFAULT 'support',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM
                                        ('active', 'inactive') DEFAULT 'active',
    INDEX idx_username
                                        (username),
    INDEX idx_role
                                        (role)
);

                                        -- Insert sample data for testing
                                        INSERT INTO users
                                            (full_name, email, password, phone)
                                        VALUES
                                            ('Lakshay Kumar', 'lakshay@myhost.com', '$2a$10$N3Z1jH.VTmA6.0EjxWlYl.1L7k5.8QCT7gLw3GZfuUhzs9wJKqO3q', '+91 7018321518'),
                                            ('Test User', 'test@example.com', '$2a$10$N3Z1jH.VTmA6.0EjxWlYl.1L7k5.8QCT7gLw3GZfuUhzs9wJKqO3q', '+91 9876543210');

                                        -- Insert sample domains
                                        INSERT INTO domains
                                            (domain_name, extension, price, status)
                                        VALUES
                                            ('example.com', '.com', 9.99, 'available'),
                                            ('mysite.net', '.net', 9.99, 'available'),
                                            ('business.org', '.org', 9.99, 'available'),
                                            ('webapp.in', '.in', 9.99, 'available');

                                        -- Insert admin user (password: admin123)
                                        INSERT INTO admin_users
                                            (username, email, password, role)
                                        VALUES
                                            ('admin', 'admin@myhost.com', '$2a$10$N3Z1jH.VTmA6.0EjxWlYl.1L7k5.8QCT7gLw3GZfuUhzs9wJKqO3q', 'super_admin');

                                        -- Create indexes for better performance
                                        CREATE INDEX idx_users_status ON users(status);
                                        CREATE INDEX idx_orders_created_payment ON orders(created_at, payment_date);
                                        CREATE INDEX idx_hosting_accounts_plan_status ON hosting_accounts(plan_type, status);

                                        -- Triggers for automatic updates
                                        DELIMITER //

                                        CREATE TRIGGER update_order_status 
AFTER
                                        INSERT ON
                                        payments
                                        FOR
                                        EACH
                                        ROW
                                        BEGIN
                                            IF NEW.status = 'completed' THEN
                                            UPDATE orders SET status = 'completed', payment_date = NEW.created_at 
        WHERE id = NEW.order_id;
                                        END
                                        IF;
END//

                                        CREATE TRIGGER create_hosting_account 
AFTER
                                        UPDATE ON orders 
FOR EACH ROW
                                        BEGIN
                                            IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.order_type IN ('hosting', 'both') THEN
                                            INSERT INTO hosting_accounts
                                                (user_id, order_id, plan_type, status, expires_at)
                                            VALUES
                                                (NEW.user_id, NEW.id, NEW.plan_type, 'active', DATE_ADD(NOW(), INTERVAL
                                            1 MONTH));
                                        END
                                        IF;
END//

DELIMITER ;