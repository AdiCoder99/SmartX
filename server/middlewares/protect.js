import admin from 'firebase-admin';

export const protect = async (req, res, next) => {
    let idToken;
    
    // 1. Check if the Authorization header exists and has the token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    }

    if (!idToken) {
        return res.status(401).json({ message: 'Not authorized: No token provided' });
    }

    try {
        // 2. Verify the token using Firebase Admin
        // This replaces jwt.verify()
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // 3. Fetch the user's profile from Firestore to check their role and status
        // (Assuming you stored their role in a 'users' collection during signup)
        const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
        
        if (!userDoc.exists) {
            return res.status(401).json({ message: 'Not authorized: User profile not found' });
        }

        const userData = userDoc.data();

        // Optional: Check if the admin deactivated this user (from your Mongoose logic)
        if (userData.isActive === false) {
            return res.status(403).json({ message: 'Account deactivated. Please contact an Admin.' });
        }

        // 4. Attach the user data to the request so the next middleware (like authorize) can use it
        req.user = { 
            id: decodedToken.uid, 
            role: userData.role,
            ...userData 
        };
        
        // 5. Let the user pass to the controller!
        next();

    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(401).json({ message: 'Not authorized: Invalid or expired token' });
    }
};