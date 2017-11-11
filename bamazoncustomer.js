// NPMs Modules
var inquirer = require('inquirer');
var mysql = require('mysql');

//MySQL Connection params
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    
    user: 'root',

    password: '',
    database: 'Bamazon'
});

//Function for user purchase
function promptUserPurchase() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'item_id',
            message: 'Which item ID you would like to purchase?.',
            validate: validateInput,
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'How many do you want to purchase?',
            validate: validateInput,
        }
    ]).then(function (input) {
       

        var item = input.item_id;
        var quantity = input.quantity;

        //Query database for item
        var queryStr = 'SELECT * FROM products WHERE ?';

        connection.query(queryStr, { item_id: item }, function (err, data) {
            if (err) throw err;

            else if(data.length === 0) {
                console.log('ERROR: Invalid Item ID. Try again');
                displayInventory();

            } else {
                var productData = data[0];

                //Check to see if item is avaliable 
                if (quantity <= productData.stock_quantity) {
                    console.log('Congratulations. Placing order!');

                    var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

                    //Update the database
                    connection.query(updateQueryStr, function (err, data) {
                        if (err) throw err;

                        console.log('Your oder has been placed! Your total is $' + productData.price * quantity);
                        console.log('Thank you for shopping with Bamazon');
                        console.log("\n---------------------------------------------------------------------\n");

                        //End the database connection
                        connection.end();
                    })
                } else {
                    console.log('Sorry, the item is not in stock, please place another order');
                    displayInventory();
                }
            }
        })
    })
}

//Retrieve the current inventory from the database
function displayInventory() {
    queryStr = 'SELECT * FROM products';

    connection.query(queryStr, function (err, data) {
        if (err) throw err;

        console.log('Existing Inventory: ');
        console.log('...................\n');

        var strOut = '';
        for (var i = 0; i < data.length; i++) {
            strOut = '';
            strOut += 'Item ID: ' + data[i].item_id + '  //  ';
            strOut += 'Product Name: ' + data[i].product_name + '  //  ';
            strOut += 'Department: ' + data[i].department_name + '  //  ';
            strOut += 'Price: $' + data[i].price + '\n';

            console.log(strOut);
        }

        console.log("---------------------------------------------------------------------\n");

        promptUserPurchase();
    })
}

// Fun Bamazon function
function runBamazon() {

//Display available inventory
displayInventory();
}
//Call to run function
runBamazon();
