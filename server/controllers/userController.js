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

