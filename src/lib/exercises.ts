export type MovementPattern = 
  | 'knee_extension' 
  | 'hip_hinge' 
  | 'elbow_flexion' 
  | 'elbow_extension' 
  | 'shoulder_abduction' 
  | 'shoulder_flexion' 
  | 'core_flexion'
  | 'vertical_pull';

export interface ExerciseConfig {
  id: string;
  name: string;
  category: string;
  pattern: MovementPattern;
}

export const EXERCISES: ExerciseConfig[] = [
  // Legs (14)
  { id: 'squat', name: 'Squat', category: 'Legs', pattern: 'knee_extension' },
  { id: 'lunge', name: 'Lunge', category: 'Legs', pattern: 'knee_extension' },
  { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', category: 'Legs', pattern: 'knee_extension' },
  { id: 'leg_press', name: 'Leg Press (Simulated)', category: 'Legs', pattern: 'knee_extension' },
  { id: 'jump_squat', name: 'Jump Squat', category: 'Legs', pattern: 'knee_extension' },
  { id: 'sumo_squat', name: 'Sumo Squat', category: 'Legs', pattern: 'knee_extension' },
  { id: 'pistol_squat', name: 'Pistol Squat', category: 'Legs', pattern: 'knee_extension' },
  { id: 'deadlift', name: 'Deadlift', category: 'Legs', pattern: 'hip_hinge' },
  { id: 'rdl', name: 'Romanian Deadlift', category: 'Legs', pattern: 'hip_hinge' },
  { id: 'good_morning', name: 'Good Morning', category: 'Legs', pattern: 'hip_hinge' },
  { id: 'glute_bridge', name: 'Glute Bridge', category: 'Legs', pattern: 'hip_hinge' },
  { id: 'calf_raise', name: 'Calf Raise', category: 'Legs', pattern: 'knee_extension' },
  { id: 'step_up', name: 'Step-up', category: 'Legs', pattern: 'knee_extension' },
  { id: 'curtsy_lunge', name: 'Curtsy Lunge', category: 'Legs', pattern: 'knee_extension' },
  
  // Chest (10)
  { id: 'pushup', name: 'Push-up', category: 'Chest', pattern: 'elbow_extension' },
  { id: 'wide_pushup', name: 'Wide Push-up', category: 'Chest', pattern: 'elbow_extension' },
  { id: 'diamond_pushup', name: 'Diamond Push-up', category: 'Chest', pattern: 'elbow_extension' },
  { id: 'incline_pushup', name: 'Incline Push-up', category: 'Chest', pattern: 'elbow_extension' },
  { id: 'decline_pushup', name: 'Decline Push-up', category: 'Chest', pattern: 'elbow_extension' },
  { id: 'pike_pushup', name: 'Pike Push-up', category: 'Chest', pattern: 'elbow_extension' },
  { id: 'spiderman_pushup', name: 'Spiderman Push-up', category: 'Chest', pattern: 'elbow_extension' },
  { id: 'bench_press', name: 'Bench Press (Simulated)', category: 'Chest', pattern: 'elbow_extension' },
  { id: 'chest_dip', name: 'Chest Dip', category: 'Chest', pattern: 'elbow_extension' },
  { id: 'dumbbell_fly', name: 'Dumbbell Fly (Simulated)', category: 'Chest', pattern: 'shoulder_flexion' },
  
  // Back (9)
  { id: 'pullup', name: 'Pull-up', category: 'Back', pattern: 'vertical_pull' },
  { id: 'chinup', name: 'Chin-up', category: 'Back', pattern: 'vertical_pull' },
  { id: 'lat_pulldown', name: 'Lat Pulldown', category: 'Back', pattern: 'vertical_pull' },
  { id: 'bent_over_row', name: 'Bent-over Row', category: 'Back', pattern: 'elbow_flexion' },
  { id: 't_bar_row', name: 'T-Bar Row', category: 'Back', pattern: 'elbow_flexion' },
  { id: 'seated_row', name: 'Seated Cable Row', category: 'Back', pattern: 'elbow_flexion' },
  { id: 'renegade_row', name: 'Renegade Row', category: 'Back', pattern: 'elbow_flexion' },
  { id: 'superman', name: 'Superman', category: 'Back', pattern: 'hip_hinge' },
  { id: 'back_extension', name: 'Back Extension', category: 'Back', pattern: 'hip_hinge' },
  
  // Shoulders (8)
  { id: 'overhead_press', name: 'Overhead Press', category: 'Shoulders', pattern: 'elbow_extension' },
  { id: 'lateral_raise', name: 'Lateral Raise', category: 'Shoulders', pattern: 'shoulder_abduction' },
  { id: 'front_raise', name: 'Front Raise', category: 'Shoulders', pattern: 'shoulder_flexion' },
  { id: 'reverse_fly', name: 'Reverse Fly', category: 'Shoulders', pattern: 'shoulder_abduction' },
  { id: 'upright_row', name: 'Upright Row', category: 'Shoulders', pattern: 'elbow_flexion' },
  { id: 'arnold_press', name: 'Arnold Press', category: 'Shoulders', pattern: 'elbow_extension' },
  { id: 'shrugs', name: 'Shrugs', category: 'Shoulders', pattern: 'shoulder_flexion' },
  { id: 'handstand_pushup', name: 'Handstand Push-up', category: 'Shoulders', pattern: 'elbow_extension' },
  
  // Arms (7)
  { id: 'bicep_curl', name: 'Bicep Curl', category: 'Arms', pattern: 'elbow_flexion' },
  { id: 'hammer_curl', name: 'Hammer Curl', category: 'Arms', pattern: 'elbow_flexion' },
  { id: 'preacher_curl', name: 'Preacher Curl', category: 'Arms', pattern: 'elbow_flexion' },
  { id: 'concentration_curl', name: 'Concentration Curl', category: 'Arms', pattern: 'elbow_flexion' },
  { id: 'tricep_extension', name: 'Tricep Extension', category: 'Arms', pattern: 'elbow_extension' },
  { id: 'tricep_dip', name: 'Tricep Dip', category: 'Arms', pattern: 'elbow_extension' },
  { id: 'skull_crusher', name: 'Skull Crusher', category: 'Arms', pattern: 'elbow_extension' },
  
  // Core (8)
  { id: 'crunch', name: 'Crunch', category: 'Core', pattern: 'core_flexion' },
  { id: 'situp', name: 'Sit-up', category: 'Core', pattern: 'core_flexion' },
  { id: 'leg_raise', name: 'Leg Raise', category: 'Core', pattern: 'core_flexion' },
  { id: 'russian_twist', name: 'Russian Twist', category: 'Core', pattern: 'core_flexion' },
  { id: 'v_up', name: 'V-up', category: 'Core', pattern: 'core_flexion' },
  { id: 'bicycle_crunch', name: 'Bicycle Crunch', category: 'Core', pattern: 'core_flexion' },
  { id: 'mountain_climber', name: 'Mountain Climber', category: 'Core', pattern: 'knee_extension' },
  { id: 'plank', name: 'Plank', category: 'Core', pattern: 'core_flexion' },
];
