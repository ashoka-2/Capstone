import { Router } from "express";
import passport from "passport";
import UserModel from "../models/user.model.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/",
  }),
  async (req, res) => {
    try {
      const { id, displayName, emails, photos } = req.user;
      const email = emails?.[0]?.value;
      const avatar = photos?.[0]?.value;

      let user = await UserModel.findOne({
        $or: [{ googleId: id }, ...(email ? [{ email }] : [])],
      });

      if (!user) {
        user = new UserModel({
          name: displayName,
          email,
          googleId: id,
          ...(avatar ? { avatar } : {}),
        });
        await user.save();
      } else if (!user.googleId) {
        user.googleId = id;
        if (avatar && !user.avatar) {
          user.avatar = avatar;
        }
        await user.save();
      }

      const token = user.generateAuthToken();
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect("/");
    } catch (error) {
      console.error("Error during Google Authentication :", error);
      res.redirect("/");
    }
  },
);

export default router;
