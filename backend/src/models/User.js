import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        enum: ['user','admin'],
        default: 'user',
    },
    city: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    paymentOptions: {
        upiId: { type: String, default: '' },
        cardNumber: { type: String, default: '' },
        expiryDate: { type: String, default: '' },
        cvv: { type: String, default: '' },
    },
    lastLogin: {
        type: Date,
        default: null,
    },
},{
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.pre('save',async function (next){
    if (!this.isModified('password')){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;