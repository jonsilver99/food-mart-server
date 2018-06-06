'use strict';

class OrderHandler {

    static canSupply(itemsInCart) {
        let shortOnStock = []
        let cartItem;
        for (let i = 0; i < itemsInCart.length; i++) {
            cartItem = itemsInCart[i]
            if (cartItem.Qty > cartItem.Product.UnitsInStock) {
                shortOnStock.push({
                    Product: cartItem.Product.ProductName,
                    Requested: cartItem.Qty,
                    Available: cartItem.Product.UnitsInStock
                })
            }
        }
        return (shortOnStock.length > 0) ? false : true;
    }
}

module.exports = OrderHandler;