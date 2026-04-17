import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { UserModel } from '../models/user.js';
import { HttpError } from '../utils/http-error.js';
import { toSafeUser } from '../utils/presenters.js';
export async function requireAuth(req, _res, next) {
    try {
        const token = req.cookies?.access_token;
        if (!token) {
            throw new HttpError(401, 'Unauthorized');
        }
        const payload = jwt.verify(token, config.jwtSecret);
        const user = await UserModel.findById(payload.sub);
        if (!user) {
            throw new HttpError(401, 'User no longer exists');
        }
        req.user = toSafeUser(user);
        next();
    }
    catch (error) {
        next(error);
    }
}
