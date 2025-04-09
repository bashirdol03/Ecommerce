import app from './app.js'
import mongoose from "mongoose";
import dotenv from "dotenv";
import connect from './database/mongo-connect.js'
import https from 'https'
import fs from 'fs'

dotenv.config();

/*
const cert = process.env.CERT
const certKey = process.env.CERT_KEY

const certificate = fs.readFileSync(`${cert}`);
const privateKey = fs.readFileSync(`${certKey}`);

const credentials = { key: privateKey, cert: certificate};
const httpsServer = https.createServer(credentials, app);

*/

mongoose.set("strictQuery", true);

const dbConnection = async ()=>{
    await connect(process.env.MONGO)
    console.log("CONNECTED TO THE MAIN DATABASE")
}
dbConnection()

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`SERVER STARTED ON PORT ${PORT}`);
  });

 