const Product = require('./products');
const mongoose = require('mongoose');
const {isEmail} = require('validator');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        validate: [isEmail, 'Geçersiz email girdiniz. Lütfen doğru bir mail adresi kullanın!']
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    isAdmin: {
        type: Boolean,
        default: false
    },
    cart: {
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
});

userSchema.methods.addToCart = function (product) {
    const index = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString()
    });

    const updatedCartItems = [...this.cart.items];

    let itemQuantity = 1;
    if (index >= 0) {
        // cart zaten eklenmek istenen product var: quantity'i arttır
        itemQuantity = this.cart.items[index].quantity + 1;
        updatedCartItems[index].quantity = itemQuantity;

    } else {
        // updatedCartItems!a yeni bir eleman ekle
        updatedCartItems.push({
            productId: product._id,
            quantity: itemQuantity
        });
    }

    this.cart = {
        items: updatedCartItems
    }

    return this.save();
}

userSchema.methods.getCart = async function (product) {

    const ids = this.cart.items.map(i => {
        return i.productId;
    });

    const products = await Product
        .find({
            _id: {
                $in: ids
            }
        })
        .select('name price imageUrl');
    return products.map(p => {
        return {
            name: p.name,
            price: p.price,
            imageUrl: p.imageUrl,
            quantity: this.cart.items.find(i_1 => {
                return i_1.productId.toString() === p._id.toString();
            }).quantity
        };
    });

}

userSchema.methods.deleteCartItem = function (productid) {
    const cartItem = this.cart.items.filter(item => {
        return item.productId.toString() !== productid.toString();
    });

    this.cart.items = cartItem;
    return this.save();
}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] };
    return this.save()
}

module.exports = mongoose.model('User', userSchema);