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


// @desc Get all contests
// @route GET /api/contests
// @access Admins and Teachers
export const getContests = async (req, res) => {
    try{
        const db = getFirestore();
        const contestsSnapshot = await db.collection('contests').get();
        const contests = contestsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json({ contests });

    }
    catch(error){
        res.status(400).json({ message: "Error fetching contests", error: error.message });
    }
}

// @desc Add questions to a contest
// @route POST /api/contests/:contestId/add-questions
// @access Teachers only
export const addQuestionsToContest = async (req, res) => {
    try{
        const { contestId } = req.params;
        const { questions } = req.body; // Expecting an array of question IDs

        if(!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "Questions must be a non-empty array" });
        }
        const db = getFirestore();
        const contestRef = db.collection('contests').doc(contestId);
        if(!(await contestRef.get()).exists) {
            return res.status(404).json({ message: "Contest not found" });
        }
        await contestRef.update({
            questions: questions,
            updatedAt: new Date()
        });
        res.status(200).json({ message: "Questions added to contest successfully" });
    }
    catch(error){
        res.status(400).json({ message: "Error adding questions to contest", error: error.message });
    }
}

// @desc Get contest details by ID
// @route GET /api/contests/:contestId
// @access Admins and Teachers
export const getContestById = async (req, res) => {
    try{
        const { contestId } = req.params;   
        const db = getFirestore();
        const contestDoc = await db.collection('contests').doc(contestId).get();    
        if(!contestDoc.exists) {
            return res.status(404).json({ message: "Contest not found" });
        }
        res.status(200).json({
            id: contestDoc.id,
            ...contestDoc.data()
        });
    }  
    catch(error){
        res.status(400).json({ message: "Error fetching contest details", error: error.message });
    }
}