'use strict';

class CartHandler {

    static getItemIndex(itemsInCart, item) {
        let itemIndex;
        for (let i = 0; i < itemsInCart.length; i++) {
            let itemInCart = itemsInCart[i]
            if (itemInCart.Product == item.Product) {
                itemIndex = i;
                return itemIndex
            }
        }
        return false
    }

    static addItem(itemsInCart, newItem) {
        itemsInCart.push(newItem)
        return itemsInCart
    }

    static changeItemQty(itemsInCart, updateItem, index, sumUp) {
        if (itemsInCart[index].Product == updateItem.Product) {
            if (sumUp) itemsInCart[index].Qty += updateItem.Qty
            else itemsInCart[index].Qty = updateItem.Qty
        }
        return itemsInCart
    }

    static removeItem(itemsInCart, updateItem, index) {
        if (itemsInCart[index].Product == updateItem.Product) {
            itemsInCart.splice(index, 1);
        }
        return itemsInCart
    }
}

module.exports = CartHandler;