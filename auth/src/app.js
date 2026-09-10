import "dotenv/config";
import express from "express";
import morgan from "morgan";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import authRoutes from "../src/routes/auth.route.js";


const app = express();
app.use(morgan("dev"));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// Passport configuration

app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    
},(accessToken, refreshToken, profile, done)=>{
   return done(null, profile);
}));


app.get("/api/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"],
}));
app.get("/api/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/dashboard",
}));



app.get("/_status/healthz",(req,res)=>{
    res.status(200).json({
        status:"ok"
    })
})

app.get("/_status/readyz",(req,res)=>{
    res.status(200).json({
        status:"ready"
    })
})

app.use("/api/auth",authRoutes);

export default app;
