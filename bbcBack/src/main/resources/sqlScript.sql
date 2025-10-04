-- customers table
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active',
    email_verified BOOLEAN DEFAULT FALSE
);

-- admins table
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- sellers table
CREATE TABLE sellers (
    seller_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    store_name VARCHAR(100) NOT NULL,
    office_address VARCHAR(255),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    holder_name VARCHAR(100),
    account_number VARCHAR(50),
    bank_name VARCHAR(100),
    branch_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active'
);

-- categories table
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    parent_id INT,
);

-- products table
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    thumbnail_url VARCHAR(255),
    description TEXT,
    regular_price DECIMAL(15,2) NOT NULL,
    sale_price DECIMAL(15,2),
    category INT,
    stock_status VARCHAR(20),
    stock_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    seller_id INT NOT NULL,
    FOREIGN KEY (category) REFERENCES categories(category_id),
    FOREIGN KEY (seller_id) REFERENCES sellers(seller_id)
);

-- carts table
CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    seller_id INT NOT NULL,
    store_name VARCHAR(100),
    product_name VARCHAR(100),
    product_thumbnail_url VARCHAR(255),
    product_unit_price DECIMAL(15,2),
    quantity INT NOT NULL,
    sub_total DECIMAL(15,2),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (seller_id) REFERENCES sellers(seller_id)
);

-- orders table
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_date DATE NOT NULL,
    order_total DECIMAL(15,2) NOT NULL,
    customer_id INT NOT NULL,
    discount DECIMAL(15,2) DEFAULT 0,
    shipping_charge DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    shipping_street VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_post_code VARCHAR(20),
    shipping_state VARCHAR(100),
    shipping_country VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Pending',
    sub_total DECIMAL(15,2),
    payment_status VARCHAR(20),
    payment_method VARCHAR(50),
    card_number VARCHAR(30),
    card_cvv VARCHAR(10),
    card_holder_name VARCHAR(100),
    card_expiry_date VARCHAR(10),
    gateway_fee DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- order_details table
CREATE TABLE order_details (
    order_details_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    seller_id INT NOT NULL,
    store_name VARCHAR(100),
    product_name VARCHAR(100),
    product_unit_price DECIMAL(15,2),
    product_thumbnail_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Pending',
    quantity INT NOT NULL,
    sub_total DECIMAL(15,2),
    delivery_date DATE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (seller_id) REFERENCES sellers(seller_id)
);

-- revenue_profit table
CREATE TABLE revenue_profit (
    rp_id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    order_id INT NOT NULL,
    order_date DATE NOT NULL,
    order_details_id INT NOT NULL,
    revenue DECIMAL(15,2) NOT NULL,
    costs DECIMAL(15,2) DEFAULT 0,
    platform_profit DECIMAL(15,2) DEFAULT 0,
    seller_profit DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (seller_id) REFERENCES sellers(seller_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (order_details_id) REFERENCES order_details(order_details_id)
);

-- coupons table
CREATE TABLE coupons (
    coupon_id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_code VARCHAR(50) NOT NULL UNIQUE,
    coupon_value DECIMAL(15,2) NOT NULL,
    coupon_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active'
);

-- wishlist table
CREATE TABLE wishlist (
    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- verification_code table
CREATE TABLE verification_code (
    vc_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES customers(customer_id)
    -- Assumption: verification_code is for customers only
);

-- refund_history table
CREATE TABLE refund_history (
    refund_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    order_details_id INT NOT NULL,
    seller_id INT NOT NULL,
    reason VARCHAR(255),
    bank_number VARCHAR(50),
    bank_name VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (order_details_id) REFERENCES order_details(order_details_id),
    FOREIGN KEY (seller_id) REFERENCES sellers(seller_id)
);

-- seller_withdrawals table
CREATE TABLE seller_withdrawals (
    sw_id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    store_name VARCHAR(100),
    holder_name VARCHAR(100),
    account_number VARCHAR(50),
    bank_name VARCHAR(100),
    branch_name VARCHAR(100),
    request_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (seller_id) REFERENCES sellers(seller_id)
);

-- Assumptions:
-- - VARCHAR lengths are chosen for typical use cases.
-- - Some fields (like status) are defaulted to 'Active' or 'Pending'.
-- - Foreign keys are set to restrict or cascade as appropriate.
-- - Some tables (like verification_code) are assumed to be for customers only.
-- - wishlist table is inferred from JOINs with products and customers.
-- - seller_withdrawals includes banking info for withdrawal requests.
