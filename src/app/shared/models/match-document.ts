import { User } from './user';

export interface MatchDocument {
  id: number;
  matchId: number;
  documentType: string;          // ARBITRAL_REPORT, PHOTO, VIDEO
  filePath: string;
  uploadedBy: User;
  verifiedBy?: User;
  status: string;                // PENDING, VERIFIED, REJECTED
  created_at: Date;
}


