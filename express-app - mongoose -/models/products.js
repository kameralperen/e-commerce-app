const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name : {
        type: String,
        required: [true, 'Ürün için isim girmelisiniz'],
        minlength: [5, 'Ürün ismi için minimum 5 karakter girmelisiniz'],
        maxlength: [255, 'Ürün ismi için maksimum 255 karakter girmelisiniz'],
        lowercase: true,
        trim: true
    },
    price: {
        type: Number,
        required: function() {
            return this.isActive
        },
        minlength: [0, 'Ürün için minimum 0 Fiyatı girmelisiniz'],
        maxlength: [10000, 'Ürün için maksimum 10000 Fiyatı girmelisiniz'],
        get: value => Math.round(value),
        set: value => Math.round(value)
    },
    description: {
        type: String,
        minlength: [10, 'Ürün açıklaması minimum 10 karakter olmalıdır']
    },
    imageUrl: String,
    date: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: {
        type: Array,
        validate: {
            validator: function(value){
                return value && value.length > 0;
            }
        },
        message: 'Ürün için en az 1 etiket eklemelisiniz'
    },
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: false
        }
    ],
    isActive: Boolean
});

module.exports = mongoose.model('Product', productSchema);