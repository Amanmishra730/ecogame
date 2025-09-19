"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecogame';
        const conn = await mongoose_1.default.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('Database connection error (continuing without DB):', error);
        // Do not exit in development so stateless routes (e.g., AI) still work
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};
exports.default = connectDB;
//# sourceMappingURL=database.js.map