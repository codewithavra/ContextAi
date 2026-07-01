import { app } from "./app";
import { connectDB, env } from "./config";

connectDB()
.then(()=>{
    app.listen(env.PORT, ()=>{
        console.log(`App is Running @ http://localhost:${env.PORT}`)
    })
})
.catch((err)=>{
    console.error(`MongoDB connection error : ${err.message}`);
})