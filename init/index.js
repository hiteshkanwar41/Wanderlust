const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    console.log("Database connected successfully");

    await initDb();

    await mongoose.connection.close();
    console.log("Connection closed");
}

async function initDb() {
    try {
        await Listing.deleteMany({});
        
        await Listing.insertMany(initdata.data);
        console.log("Successfully saved");
    } catch (err) {
        console.log(err);
    }
}

main().catch((err) => {
    console.log(err);
});