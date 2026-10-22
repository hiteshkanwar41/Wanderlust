require("dotenv").config();
const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected successfully");

    await initDb();

    await mongoose.connection.close();
    console.log("Connection closed");
}

async function initDb() {
    try {
        
        
        await Listing.insertMany(initdata.data);
        console.log("Successfully saved");
    } catch (err) {
        console.log(err);
    }
}

main().catch((err) => {
    console.log(err);
    process.exitCode = 1;
});