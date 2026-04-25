import admin from 'firebase-admin';
import { KYCRequest } from '../models/KYCRequest.js';

const db = admin.firestore();

// @desc Submit KYC details for verification
// @route POST /api/kyc/
// @access Students/Users
export const submitKYC = async (req, res) => {
    try{
        const userId = req.user.id;
        const { fullName, documentType, documentNumber, bankAccountNumber, ifscCode, documentUrl, dateOfBirth, address } = req.body;
        
        // Check if user already has a pending KYC request
        const exisitingKyc = await db.collection('kycRequests')
            .where('userId', '==', userId)
            .where('status', 'in', ['pending', 'approved'])
            .get();

            if(!exisitingKyc.empty) { 
                return res.status(400).json({ message: "You already have a pending or approved KYC request." });
            }   

            const kycData = new KYCRequest(req.body, userId);
            const docRef = await db.collection('kycRequests').add(kycData.toFirestore());

            res.status(201).json({ message: "KYC details submitted successfully", id: docRef.id });
    } catch (error) {
        console.error("Error submitting KYC details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}



// @desc To get all KYC requests for review
// @route POST /api/kyc/review/all
// @access Sub-Admin
export const getAllKYCRequests = async (req, res) => {
    try{
        const kycRequestsSnapshot = await db.collection('kycRequests')
        .where('status', '==', 'pending')
        .get()
        const kycRequests = [];
        kycRequestsSnapshot.forEach(doc => {
            kycRequests.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(kycRequests);
    } catch (error) {
        console.error("Error fetching KYC requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}




// @desc To get a specific KYC request for review
// @route POST /api/kyc/review/:id
// @access Sub-Admin
export const getKYCRequestById = async ( req, res ) => {
    try{
        const { id } = req.params;
        const kycRequestDoc = await db.collection('kycRequests').doc(id).get();
        if(!kycRequestDoc.exists){
            return res.status(404).json({ message: 'KYC request not found' })
        }
        res.status(200).json({ id: kycRequestDoc.id, ...kycRequestDoc.data() });    
    }
    catch(error) {
        console.error("Error fetching KYC request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}




//@desc To approve or reject a KYC request
//@route POST /api/kyc/review/:id/action
//@access Sub-Admin
export const reviewKYCRequest = async(req, res) => {
    try{
        const { id } = req.params;
        const { action } = req.body; // Expecting approve or reject
        if(!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'." });
        }
        const kycRequestRef = db.collection('kycRequests').doc(id);
        const kycRequestDoc = await kycRequestRef.get();
        if(!kycRequestDoc.exists){
            return res.status(404).json({ message: 'KYC request not found' });
        }

        const newStatus = action === 'approve' ? 'approved' : 'rejected';
    } catch (error) {
        console.error("Error reviewing KYC request:", error);
        res.status(500).json({ message: "Internal server error" });     
    }
}