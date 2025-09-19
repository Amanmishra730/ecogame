"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const seedData_1 = require("./seedData");
const runSeed = async () => {
    try {
        await (0, database_1.default)();
        await (0, seedData_1.seedAll)();
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};
runSeed();
//# sourceMappingURL=index.js.map