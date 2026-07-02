import { app } from "./app.js";
import { connectDB, env } from "./config/index.js";

connectDB()
.then(()=>{
    app.listen(env.PORT, ()=>{
        console.log(`App is Running @ http://localhost:${env.PORT}`)
    })
})
.catch((err)=>{
    console.error(`MongoDB connection error : ${err.message}`);
})