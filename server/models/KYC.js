import { z } from 'zod';

// Input Schema
export const KYCSchema = z.object({
    fullName: z.string().min(3, "Full name must match government ID"),
    documentType: z.enum(['passport', 'PAN', 'Aadhar', 'Other']),
    documentNumber: z.string().min(5, "Document number must be valid"),
    bankAccountNumber: z.string().min(5, "Bank account number must be valid"),
    ifscCode: z.string().min(11, "IFSC code must be 11 characters"),
    documentUrl: z.string().url("Document URL must be a valid URL"),
    dateOfBirth: z.coerce.date(),
    address: z.string().min(10)
});

// Class Model
export class KYC{
    constructor(data, userId){
        this.userId = userId;
        this.fullName = data.fullName;
        this.documentType = data.documentType;
        this.documentNumber = data.documentNumber;
        this.bankAccountNumber = data.bankAccountNumber;
        this.ifscCode = data.ifscCode;
        this.documentUrl = data.documentUrl;
        
        this.status = "pending"; // 'pending', 'approved', 'rejected'
        this.reviewedBy = null;  // Will store the Sub-Admin's ID later
        this.reviewNotes = "";   // For rejection reasons
        
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();

    }

    toFirestore(){
        return { ...this };
    }
}

export const KYCReviewSchema = z.object({
    status: z.enum(['aprroved', 'rejected']),
    reviewNotes: z.string().optional()
})

