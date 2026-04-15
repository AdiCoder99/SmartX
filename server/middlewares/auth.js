import { userDbSchema } from "../models/User.js";

export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        

        if(!user || !allowedRoles.includes(user.role)){
            return res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
        }
        next();
    };
}