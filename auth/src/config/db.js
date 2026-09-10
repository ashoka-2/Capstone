import mongoose from "mongoose";



export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.AUTH_MONGO_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB", error);
        process.exit(1);
    }
}
