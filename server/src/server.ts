
import { connectDB, env } from "./config/index.js";

connectDB()
.then(async ()=>{
    const { app } = await import("./app.js");
    app.listen(env.PORT, ()=>{
        console.log(`App is Running @ http://localhost:${env.PORT}`)
    })
})
.catch((err)=>{
    console.error(`MongoDB connection error : ${err.message}`);
})