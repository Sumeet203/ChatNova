import jwt from "jsonwebtoken"
import userModel from "../models/user.model.js";

export async function authMiddleware(req,res,next){
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({
            message : "Unauthorized",
            success : false,
            err : "No token provided"
        });
    };
     try {
         const decoded = jwt.verify(token,process.env.JWT_SECRET);
         req.user = decoded;
         next();
    } catch (error) {
        return res.status(401).json({
            message : "Unauthorized",
            success : false,
            err : "Invalid token"
        });
    }
}

export async function verifiedAuthMiddleware(req, res, next) {
    const user = await userModel.findById(req.user.id).select("verified");
    if (!user?.verified) {
        return res.status(403).json({
            message: "Please verify your email before accessing chat",
            success: false,
            err: "Email not verified"
        });
    }
    next();
}
