import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { createUserSchema, updateUserSchema } from '../models/User.js';

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
		//  Validate input
		const parsedData = createUserSchema.parse(req.body);

		// Create Firebase Auth user
		const userRecord = await admin.auth().createUser({
			email: parsedData.email,
			password: parsedData.password
		});

		const db = getFirestore();
		const now = new Date();

		// Store in Firestore
		await db.collection('users').doc(userRecord.uid).set({
			uid: userRecord.uid,
			name: parsedData.name,
			email: parsedData.email,
			role: parsedData.role,
			createdAt: now,
			updatedAt: now
		});

		// 4. Set custom claims 
		await admin.auth().setCustomUserClaims(userRecord.uid, {
			role: parsedData.role
		});

		//
		return res.status(201).json({
			success: true,
			message: 'User created successfully',
			uid: userRecord.uid
		});

	} catch (error) {

		// Handle Zod errors properly
		if (error.name === 'ZodError') {
			return res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: error.errors
			});
		}

		// Firebase / other errors
		return res.status(500).json({
			success: false,
			message: 'Failed to create user',
			error: error.message
		});
	}
};

// @desc Update user details (Super Admin only)
// @route PUT /api/users/update/:id
// @access Private (Super Admin only)
export const updateUser = async (req, res) => {
	try{
		const userId = req.params.id;
		const parsedData = updateUserSchema.parse(req.body);

		const db = getFirestore();

		const userRef = db.collection('users').doc(userId);

		const userSnap = await userRef.get();
		if(!userSnap.exists){
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		const updateData = {
			updatedAt: new Date()
		}
		if(parsedData.name) updateData.name = parsedData.name;
		if(parsedData.email) updateData.email = parsedData.email;
		if(parsedData.role) updateData.role = parsedData.role;

		await userRef.update(updateData);

		// Firebase Auth Update if email or password is being updated
		if (parsedData.email || parsedData.password) {
			await admin.auth().updateUser(uid, {
				email: parsedData.email,
				password: parsedData.password
			});
		}

		if(parsedData.role){
			await admin.auth().setCustomUserClaims(uid, {
				role: parsedData.role
			})
		}

		return res.status(200).json({
			success: true,
			message: 'User updated successfully'
		});
	}
	catch(error){
		return res.status(500).json({
			success: false,
			message: 'Failed to update user',
			error: error.message
		});
	}
};