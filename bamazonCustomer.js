/* jshint esversion: 6 */

const inquirer = require("inquirer");
const mysql = require("mysql");
const cli_table = require("cli-table");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

connection.connect((err) => {
    if (err) console.log("Error occurred");

    console.log("\n-------------------------------------");
    console.log("=======  WELCOME TO BAMAZON!  =======");
    console.log("-------------------------------------\n");
    initialize();
});

function promptUser() {
    inquirer.prompt([
        {
            type: "input",
            name: "itemIdValue",
            message: "Enter the ID of the product you would like to buy",
            default: 0,
            validate: function (input) {
                return !isNaN(input) && parseInt(input) > 0;
            }
        },
        {
            type: "input",
            name: "numberOfUnits",
            message: "How many units would you like to buy?",
            default: 0,
            validate: function (input) {
                return !isNaN(input) && parseInt(input) > 0;
            }
        }
    ]).then((answers) => {
        let itemID = answers.itemIdValue;
        let numUnits = answers.numberOfUnits;

        placeOrder(itemID, numUnits);
    });
}

function initialize() {
    connection.query("select item_id, product_name, price from products", (err, results) => {
        if (err) throw err;

        let table = new cli_table({
            head: ["ID", "Product", "Price"]
        });

        results.forEach(element => {
            table.push([
                element.item_id,
                element.product_name,
                "$" + element.price
            ]);
        });

        console.log("\n" + table.toString() + "\n");
        promptUser();
    });
}

function placeOrder(id, units) {
    connection.query("select * from products where item_id = ?", [id], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            let currentItemName = results[0].product_name;
            let currentItemPrice = results[0].price;
            let currentStockQuantity = results[0].stock_quantity;
            if (units < currentStockQuantity) {
                let newStockQuantity = currentStockQuantity - units;
                let totalPrice = currentItemPrice * units;
                updateProductStock([newStockQuantity, id]);
                displayTotal({
                    productName: currentItemName,
                    productPrice: currentItemPrice,
                    unitsPurchased: units,
                    totalPrice: totalPrice
                });
                continueShopping();
            }
            else {
                console.log("\nInsufficient quantity!\n");
                initialize();
            }
        }
        else {
            console.log("\nRecord not found!\n");
            initialize();
        }
    });
}

function updateProductStock(params) {
    connection.query("update products set stock_quantity = ? where item_id = ?", params, (err, results) => {
        if (err) throw err;
    });
}

function displayTotal(item) {
    console.log("\nYOUR ORDER HAS BEEN PROCESSED\n");
    let table = new cli_table();
    table.push(
        {"Item:": item.productName},
        {"Item Price:": "$" + item.productPrice},
        {"Purchased Units:": item.unitsPurchased},
        {"Total:": "$" + item.totalPrice}
    );
    console.log(table.toString() + "\n");
}

function continueShopping() {
    inquirer.prompt([
        {
            type: "confirm",
            name: "keepShopping",
            message: "Would you like to continue shopping?",
            default: true
        }
    ]).then((response) => {
        if (response.keepShopping)
            initialize();
        else
            connection.end();
    });
}