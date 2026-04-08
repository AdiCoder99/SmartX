import z, { email } from 'zod'

const UserSchema = z.object({
    uid: z.string(),  //The ID provided by Firebase Auth after signup
    email: z.string().email(),
    role: z.enum(['super-admin','admin', 'sub-admin', 'teacher']),
    name: z.string().min(2),
    createdAt: z.date(),
    updatedAt: z.date()
})


class User {
    constructor(data) {
        this.uid = data.uid;
        this.email = data.email;
        this.role = data.role;
        this.name = data.name;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        // Default permissions based on the SmartX Spec
        this.permissions = this._assignDefaultPermissions(data.role);
    }

    // Internal helper to set permissions based on the role provided in your image
  _assignDefaultPermissions(role) {
    const permissions = {
      super_admin: ['all_access', 'financial_oversight', 'audit_logs'],
      admin: ['contest_management', 'payout_approvals', 'financial_approvals'],
      sub_admin: ['quiz_acceptance', 'kyc_verification', 'content_moderation'],
      teacher: ['question_bank_management', 'doubt_resolution', 'curriculum_feedback'],
    };
    return permissions[role] || [];
  }


    /**
    * Cleans the object for Firestore storage
    */
  toFirestore() {
    return {
      uid: this.uid,
      email: this.email,
      role: this.role,
      displayName: this.displayName,
      phoneNumber: this.phoneNumber,
      permissions: this.permissions,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}


export { User, UserSchema };