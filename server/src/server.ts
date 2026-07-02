import { app } from "./app";
import { connectDB, env } from "./config";
import { initAuth } from "./utils";

connectDB()
.then(()=>{
    initAuth()
    app.listen(env.PORT, ()=>{
        console.log(`App is Running @ http://localhost:${env.PORT}`)
    })
})
.catch((err)=>{
    console.error(`MongoDB connection error : ${err.message}`);
})