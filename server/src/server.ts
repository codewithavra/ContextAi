import { app } from "./app.js";
import { connectDB, env } from "./config/index.js";
import { initAuth } from "./utils/index.js";

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