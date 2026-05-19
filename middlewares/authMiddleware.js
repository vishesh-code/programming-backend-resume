// import jwt from 'jsonwebtoken';

// export default function(req, res, next) {
//     const token = req.header('auth-token');
//     if (!token) return res.status(401).send('Access Denied');

//     try {
//         const verified = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = verified; // Adds user ID to the request object
//         next();
//     } catch (err) {
//         res.status(400).send('Invalid Token');
//     }
// }

// fileName: auth.js
import jwt from 'jsonwebtoken';

export default function(req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied'); // Changed to 401

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        // If token is expired or invalid, jwt.verify throws an error
        // We MUST return 401 so the frontend knows to logout
        res.status(401).send('Invalid Token'); 
    }
}