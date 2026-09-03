import "dotenv/config";
import express from express
import morgan from morgan
import Redis from "ioredis"
import mongoose from "mongoose";



const app = express()


const DbConnect = async () => {

        try{
            await mongoose.connect(process.env.MONGO_URI)
            console.log("Database is connectedd")

        }catch(err){
            console.log(`Error in db connecting , Error: ${err}`)
        }
}

DbConnect()

const redis = new Redis(process.env.REDIS)

app.get("/user",async (req,res) => {



}
)
