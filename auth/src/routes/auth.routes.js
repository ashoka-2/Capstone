import { Router } from "express";
import UserModel from "../models/user.model.js";
import passport from "passport";


const router = Router();

router.get('/google',passport.authenticate('google',{scope:['profile','email']}));

router.get('/google/callback',passport.authenticate('google',{failureRedirect:'/'}), async (req,res)=>{
    try {
        const {id, displayName, emails,photos} = req.user;
        let user = await UserModel.findOne({googleId: id});

        if(!user){
            user = new UserModel({
                googleId: id,
                email: emails[0].value,
                name: displayName,
                avatar: photos[0].value
            });
            await user.save();
        }
        
        const token = JsonWebTokenError.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, {httpOnly: true});
        res.redirect('/');

    } catch (error) {
        console.error("Error during Google authentication: ", err);
        res.redirect('/')
    }
});


export default router;
