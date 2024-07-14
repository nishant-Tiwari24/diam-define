import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://myapp:zrb449SSr8IVTiGQ@clusternest.rd43owt.mongodb.net/');
        console.log("Connected to database");
    } catch (error) {
        console.error("Database connection error:", error);
    }
};

export { connectDB };
