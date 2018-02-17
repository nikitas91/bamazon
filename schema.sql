CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
	item_id INTEGER(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(500) NOT NULL,
    department_name VARCHAR(500),
    price DOUBLE(10,2),
    stock_quantity INTEGER(10)
);