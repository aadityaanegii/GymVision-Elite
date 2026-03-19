import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Activity, TrendingUp, Calendar, Target, Award, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export const PerformanceTracker = () => {
  const { user, userProfile } = useAuth();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'workoutSessions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWorkouts(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'workoutSessions');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, [user]);

  // Calculate personalized metrics
  const calculateScore = () => {
    if (!userProfile || workouts.length === 0) return 0;
    
    // Base score from form
    const avgFormScore = workouts.reduce((acc, w) => acc + (w.formScore || 0), 0) / workouts.length;
    
    // Adjust based on experience
    let experienceMultiplier = 1.0;
    if (userProfile.experience_level === 'beginner') experienceMultiplier = 1.2; // Beginners get a boost
    if (userProfile.experience_level === 'advanced') experienceMultiplier = 0.9; // Advanced are judged harder

    // Adjust based on goal and weight
    let goalBonus = 0;
    if (userProfile.goal === 'fat_loss' && workouts.length >= userProfile.days_per_week) {
      goalBonus = 10;
    } else if (userProfile.goal === 'muscle_gain' && workouts.length >= userProfile.days_per_week) {
      goalBonus = 15;
    }

    return Math.min(100, Math.round((avgFormScore * experienceMultiplier) + goalBonus));
  };

  const calculateCaloriesBurned = () => {
    if (!userProfile) return 0;
    // Rough estimate based on weight, time, and experience
    const weightKg = userProfile.weight || 70;
    const totalMinutes = workouts.reduce((acc, w) => acc + ((w.durationSeconds || 0) / 60), 0);
    
    let metValue = 5; // Moderate effort
    if (userProfile.experience_level === 'advanced') metValue = 8; // Vigorous effort
    if (userProfile.experience_level === 'beginner') metValue = 4; // Light effort

    // Calories = MET * weight(kg) * time(hrs)
    return Math.round(metValue * weightKg * (totalMinutes / 60));
  };

  if (loading) return <div className="text-center text-zinc-400 py-12">Loading performance data...</div>;

  const score = calculateScore();
  const calories = calculateCaloriesBurned();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center space-x-3 mb-2">
          <TrendingUp className="text-indigo-500" />
          <span>Performance Tracker</span>
        </h1>
        <p className="text-zinc-400">Personalized insights based on your profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Overall Score</h3>
            <Award className="text-yellow-500" />
          </div>
          <p className="text-4xl font-bold">{score}<span className="text-lg text-zinc-500">/100</span></p>
          <p className="text-sm text-zinc-500 mt-2">Adjusted for {userProfile?.experience_level} level</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Est. Calories Burned</h3>
            <Activity className="text-orange-500" />
          </div>
          <p className="text-4xl font-bold">{calories} <span className="text-lg text-zinc-500">kcal</span></p>
          <p className="text-sm text-zinc-500 mt-2">Based on {userProfile?.weight}kg weight</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Workouts Completed</h3>
            <Target className="text-emerald-500" />
          </div>
          <p className="text-4xl font-bold">{workouts.length}</p>
          <p className="text-sm text-zinc-500 mt-2">Goal: {userProfile?.days_per_week} days/week</p>
        </motion.div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">Recent History</h2>
        </div>
        {workouts.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {workouts.map((workout) => (
              <div key={workout.id} className="p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold capitalize">{workout.exerciseName?.replace('_', ' ')}</h3>
                    <p className="text-sm text-zinc-400 flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>{workout.createdAt?.toDate().toLocaleDateString()}</span>
                      <span>•</span>
                      <Clock size={14} />
                      <span>{Math.floor(workout.durationSeconds / 60)}m {workout.durationSeconds % 60}s</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{workout.reps}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Reps</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500">
            No workouts recorded yet. Head to the AI Form Check to start!
          </div>
        )}
      </div>
    </div>
  );
};
