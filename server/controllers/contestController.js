import { createContestSchema } from "../models/Contest";
import { getFirestore } from "firebase-admin/firestore";

// @desc Create a new contest
// @route POST /api/contests/create
// @access Admins only
export const createContest = async (req, res) => {
    try {
        // Validate input data
        const parsedData = createContestSchema.parse(req.body);

        const db = getFirestore();
        const now = new Date();

        const contestData = {
            ...parsedData,
            createdAt: now,
            updatedAt: now
        }
        // Save to Firestore 
        const contestRef = await db.collection('contests').add(contestData);
        res.status(201).json({ 
            message: "Contest created successfully", 
            contestId: contestRef.id 
        });

    }
    catch (error) {
        if(error.name === 'ZodError') {
            return res.status(400).json({ 
                message: "Validation failed",
                errors: error.errors
            });
        }
        res.status(400).json({ message: "Error creating contest", error: error.message });
    }

}
