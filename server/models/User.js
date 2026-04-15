import { z } from 'zod';


// INPUT SCHEMA (for API)
export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['super-admin', 'admin', 'sub-admin', 'teacher'])
});


// DB SCHEMA (for Firestore)
export const userDbSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  role: z.enum(['super-admin', 'admin', 'sub-admin', 'teacher']),
  name: z.string().min(2),
  permissions: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['super-admin', 'admin', 'sub-admin', 'teacher']).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional()
})
.refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided"
});


// USER CLASS
class User {
  constructor(data) {
    this.uid = data.uid;
    this.email = data.email;
    this.role = data.role;
    this.name = data.name;

    this.createdAt = data.createdAt || new Date(); // ✅ use Date object
    this.updatedAt = new Date();

    this.permissions = this._assignDefaultPermissions(data.role);
  }

  // FIXED role keys
  _assignDefaultPermissions(role) {
    const permissions = {
      'super-admin': ['all_access', 'financial_oversight', 'audit_logs'],
      'admin': ['contest_management', 'payout_approvals', 'financial_approvals'],
      'sub-admin': ['quiz_acceptance', 'kyc_verification', 'content_moderation'],
      'teacher': ['question_bank_management', 'doubt_resolution', 'curriculum_feedback'],
    };

    return permissions[role] || [];
  }

  /**
  * Clean Firestore object
   */
  toFirestore() {
    return {
      uid: this.uid,
      email: this.email,
      role: this.role,
      name: this.name,
      permissions: this.permissions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export { User };