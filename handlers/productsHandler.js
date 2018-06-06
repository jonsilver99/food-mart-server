'use strict';

class ProductsHandler {

    static resolveFeaturedProducts(bestSellers, newest) {
        let featuredProducts = {}

        for (let i = 0; i < bestSellers.length; i++) {
            let categoryName = this.getCategoryName(bestSellers[i]._id)
            let categoryProducts = bestSellers[i].products;
            categoryProducts.forEach(product => product.BestSeller = true);
            featuredProducts[categoryName] = {
                bestSellers: categoryProducts
            }
        }
        for (let i = 0; i < newest.length; i++) {
            let categoryName = this.getCategoryName(newest[i]._id);
            let categoryProducts = newest[i].products
            categoryProducts.forEach(product => product.New = true);
            featuredProducts[categoryName].newest = this.filterSameProducts(featuredProducts[categoryName].bestSellers, categoryProducts)
        }
        featuredProducts = this.morphToArray(featuredProducts);
        return featuredProducts;
    }

    static filterSameProducts(bestSellers, newest) {
        for (let i = 0; i < newest.length; i++) {
            let newProduct = newest[i];
            for (let k = 0; k < bestSellers.length; k++) {
                let bestSeller = bestSellers[k];

                if (this.isSameProduct(bestSeller, newProduct)) {
                    newProduct.duplicate = true
                    break
                }
            }
        }
        let filtered = newest.filter(product => !product.duplicate);
        newest = [filtered[0], filtered[1]]
        return newest
    }

    static isSameProduct(prod1, prod2) {
        return prod1._id.toString() == prod2._id.toString();
    }

    static morphToArray(featuredProducts) {
        let array = [];
        for (let category in featuredProducts) {

            let newCategory = {
                Name: category,
                Products: [...featuredProducts[category].bestSellers, ...featuredProducts[category].newest]
            }
            array.push(newCategory);
        }
        return array;
    }

    static getCategoryName(_id) {
        const dictionary = {
            '5ae4afce85d0ed5dc2709655': 'Bakery',
            '5ae4afce85d0ed5dc2709657': 'Dairy',
            '5ae4afce85d0ed5dc2709659': 'Drinks',
            '5ae4afce85d0ed5dc270965b': 'MeatAndSeafood',
            '5ae4afce85d0ed5dc270965d': 'Pantry',
            '5ae4afce85d0ed5dc270965f': 'VeggiesAndFruits'
        }
        return dictionary[_id.toString()];
    }

}

module.exports = ProductsHandler;