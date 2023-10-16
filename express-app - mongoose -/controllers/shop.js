const Product = require('../models/products');
const Category = require('../models/categories');
const Order = require('../models/order');

exports.getIndex = (req, res, next) => {

    console.log(req.session.isAuthenticated);

    Product.find()
        .then(products => {
            return products;
        }) 
        .then(products => {
            Category.find()
                .then(categories => {
                    res.render('shop/index', {
                        title: "Ana Sayfa",
                        products: products,
                        path: '/',
                        categories: categories
                    });
                })
        })
        .catch(err => {  next(err) });
}

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            return products;
        })
        .then(products => {
            Category.find()
                .then(categories => {
                    res.render('shop/products', {
                        title: "Ürünler",
                        products: products,
                        path: '/products',
                        categories: categories
                    });
                })
        })
        .catch(err => {  next(err) });

}

exports.getProductsByCategoryId = (req, res, next) => {
    const categoryid = req.params.categoryid;
    const model = [];

    Category.find()
        .then(categories => {
            model.categories = categories;
            return Product.find({categories: categoryid});
        })
        .then(products => {
            res.render('shop/products', {
                title: "Ürünler",
                products: products,
                categories: model.categories,
                selectedCategory: categoryid,
                path: '/products'
            });
        })
        .catch(err => {  next(err) });


}


exports.getProduct = (req, res, next) => {
    Product.findById(req.params.productid)
        .then(product => {
            res.render('shop/product-detail', {
                title: product.name,
                product: product,
                path: '/products'
            });
        });

}

exports.getProductDetails = (req, res, next) => {
    const products = Product.find();
    res.render('shop/details', {
        title: "Detaylar",
        products: products,
        path: '/details'
    });
}

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId') //user model altındaki ilişkili olan kaydı almamızı sağladı
        .execPopulate() 
        .then(user => {
            res.render('shop/cart', {
                title: "Sepet",
                products: user.cart.items, //ilişkilendirdiğimiz ürünler sayfaya yönlendirildi
                path: '/cart'
            });
        })
        .catch(err => {  next(err) });
}

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;

    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err =>  next(err));
}

exports.postCartItemDelete = (req, res, next) => {
    const productid = req.body.productid;
    req.user
        .deleteCartItem(productid)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {  next(err) });
}


exports.getOrders = (req, res, next) => {
    Order.find({'user.userId': req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                title: "Siparişler",
                orders: orders,
                path: '/orders'
            });
        })
        .catch(err => {
            next(err);
        });
}


exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then((user) => {
            const order = new Order({
                user: {
                    userId: req.user._id,
                    name: req.user.name,
                    email: req.user.email
                },
                items: user.cart.items.map(p => {
                    return {
                        product: {
                            _id: p.productId._id,
                            name: p.productId.name,
                            price: p.productId.price,
                            imageUrl: p.productId.imageUrl
                        },
                        quantity: p.quantity
                    }
                })
            });
            return order.save()
                .then(() => {
                    return req.user.clearCart();
                })
                .then(() => {
                    res.redirect('/orders');
                })
                .catch(err => {console.log(err)});
        })
        .catch(err => {  next(err) });
}