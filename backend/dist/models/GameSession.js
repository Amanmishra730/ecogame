"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const GameSessionSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    gameType: {
        type: String,
        required: true,
        enum: ['waste-sorting', 'water-simulator', 'energy-challenge', 'ar-waste', 'ar-tree']
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    xpEarned: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    level: {
        type: Number,
        required: true,
        min: 1
    },
    completed: {
        type: Boolean,
        default: false
    },
    achievements: [{
            type: String,
            enum: [
                'perfect_score',
                'speed_demon',
                'eco_master',
                'first_completion',
                'high_accuracy',
                'time_efficient'
            ]
        }],
    gameData: {
        itemsSorted: Number,
        waterSaved: Number,
        energyEfficient: Number,
        accuracy: Number,
        itemsRecognized: Number,
        treeId: String,
        treeName: String
    }
}, {
    timestamps: true
});
// Index for user game history
GameSessionSchema.index({ userId: 1, createdAt: -1 });
GameSessionSchema.index({ gameType: 1, score: -1 });
exports.default = mongoose_1.default.model('GameSession', GameSessionSchema);
//# sourceMappingURL=GameSession.js.map