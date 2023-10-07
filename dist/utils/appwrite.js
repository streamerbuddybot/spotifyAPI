"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.client = void 0;
const node_appwrite_1 = require("node-appwrite");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new node_appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
exports.client = client;
const database = new node_appwrite_1.Databases(client);
exports.database = database;
