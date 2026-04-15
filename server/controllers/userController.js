import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';


// @desc    Get all users with pagination
// @route   GET /api/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
	try {
		if (!admin.apps.length) {
			return res.status(500).json({
				success: false,
				message: 'Firebase app is not initialized.'
			});
		}

		const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
		const offset = (page - 1) * limit;

		const db = getFirestore();
		const usersRef = db.collection('users');
		const totalSnapshot = await usersRef.count().get();
		const totalUsers = totalSnapshot.data().count;

		const snapshot = await usersRef
			.orderBy('__name__')
			.offset(offset)
			.limit(limit)
			.get();

		const users = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		const totalPages = Math.max(Math.ceil(totalUsers / limit), 1);

		return res.status(200).json({
			success: true,
			count: users.length,
			pagination: {
				totalUsers,
				currentPage: page,
				limit,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1
			},
			users
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Failed to fetch users.',
			error: error.message
		});
	}
};


// @desc Create a new user (Admin only)
// @route POST /api/users/create
// @access Private (Super Admin only)
export const createUser = async (req, res) => {
	try {
		const { email, password, role } = req.body;
		if (!email || !password || !role) {
			return res.status(400).json({ message: 'Email, password, and role are required.' 
			});
		}
		const userRecord = await admin.auth().createUser({
			email,
			password,
			role
			});

		return res.status(201).json({
			success: true,
			message: 'User created successfully.',
			user: userRecord
			});


	} catch(error){
		return res.status(500).json({
			success: false,
			message: 'Failed to create user.',
			error: error.message
		});
	}
};