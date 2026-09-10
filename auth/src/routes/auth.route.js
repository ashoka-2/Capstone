import { Router } from "express";
import passport from "passport";
import UserModel from "../models/user.model.js";

const router = Router();


router.get("/google", passport.authenticate("google", {
    session:false,
    scope: ["profile", "email"],
}));


router.get("/google/callback",passport.authenticate("google",{
    session:false,
    failureRedirect:"/"}),async (req,res)=>{
    try {
        const {id,displayName,emails,photos} = req.user;
        let user = await UserModel.findOne({googleId:id});
        if(!user){
            user = new UserModel({
                name:displayName,
                email:emails[0].value,
                googleId:id,
                avatar:photos[0].value,
            });
            await user.save();
        }

        const token = user.generateAuthToken();
        res.cookie("jwt",token,{
            httpOnly:true,
            secure:true,
            sameSite:"strict",
            maxAge:7*24*60*60*1000,
        });

        res.redirect("/");


    } catch (error) {
        console.error("Error during Google Authentication :", error);
        res.redirect("/") 
    }
})



export default router;