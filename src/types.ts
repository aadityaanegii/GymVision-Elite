export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  createdAt: any;
  updatedAt: any;
  
  // Personalization Data
  onboardingCompleted?: boolean;
  age?: number;
  height?: number;
  weight?: number;
  goal?: 'fat_loss' | 'muscle_gain' | 'strength';
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
  days_per_week?: number;
  available_time_per_session?: number;
  equipment?: 'home' | 'gym' | 'mixed';
  injuries?: string;
}
