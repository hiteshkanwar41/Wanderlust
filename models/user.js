const mongoose=require("mongoose");
const {Schema}=mongoose;
// passport-local-mongoose is an ES Module.
// When imported with CommonJS (require), it returns an object:
// { default: pluginFunction, errors: {...} }
// Mongoose's schema.plugin() expects the plugin function itself,
// so we access the default export using `.default`.
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema=new Schema({
    username: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true,
        lowercase: true,
        trim: true
    },
    googleId:{
        type:String
    }
});

userSchema.plugin(passportLocalMongoose,{
    usernameField:"email"
});

module.exports = mongoose.model('User', userSchema);




