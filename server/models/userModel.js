import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        provider: { type: String, default: 'local' }, // local or google
        googleID: { type: String },
        profilePicture: { type: String },
        plan: { type: String, default: 'Free' }, // Free or Pro
    },
    { timestaps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
