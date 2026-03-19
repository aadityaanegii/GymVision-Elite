import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { EXERCISES } from '../lib/exercises';
import { motion } from 'motion/react';
import { Calendar, Clock, Dumbbell, AlertCircle, CheckCircle2, ChevronRight, Target } from 'lucide-react';

export const WorkoutCycles = () => {
  const { userProfile } = useAuth();
  const [plan, setPlan] = useState<any[]>([]);

  useEffect(() => {
    if (!userProfile) return;

    // Generate personalized workout plan based on profile
    const generatePlan = () => {
      const { goal, experience_level, days_per_week, equipment, injuries } = userProfile;
      
      // Filter exercises based on injuries
      let availableExercises = EXERCISES.filter(ex => {
        if (injuries && injuries !== 'none' && ex.category.toLowerCase().includes(injuries.toLowerCase())) return false;
        return true;
      });

      // Adjust intensity/volume based on experience and goal
      let sets = 3;
      let reps = 10;
      let rest = 60;

      if (experience_level === 'beginner') {
        sets = 2;
        reps = 12;
        rest = 90;
      } else if (experience_level === 'advanced') {
        sets = 4;
        reps = 8;
        rest = 45;
      }

      if (goal === 'strength') {
        reps = 5;
        sets = 5;
        rest = 120;
      } else if (goal === 'fat_loss') {
        reps = 15;
        rest = 30;
      }

      // Create a weekly cycle
      const cycle = [];
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      
      // Simple split logic based on days_per_week
      const splits = {
        1: ['Full Body'],
        2: ['Upper Body', 'Lower Body'],
        3: ['Push', 'Pull', 'Legs'],
        4: ['Upper Body', 'Lower Body', 'Upper Body', 'Lower Body'],
        5: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'],
        6: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'],
        7: ['Full Body', 'Active Recovery', 'Full Body', 'Active Recovery', 'Full Body', 'Active Recovery', 'Full Body']
      };

      const currentSplit = splits[days_per_week as keyof typeof splits] || splits[3];

      for (let i = 0; i < days_per_week; i++) {
        const dayFocus = currentSplit[i % currentSplit.length];
        
        // Select exercises for the day focus
        const dayExercises = availableExercises
          .filter(ex => {
            if (dayFocus === 'Upper Body' || dayFocus === 'Push' || dayFocus === 'Pull' || dayFocus === 'Chest' || dayFocus === 'Back' || dayFocus === 'Shoulders' || dayFocus === 'Arms') {
              return ['chest', 'back', 'shoulders', 'arms'].includes(ex.category);
            }
            if (dayFocus === 'Lower Body' || dayFocus === 'Legs') {
              return ex.category === 'legs';
            }
            return true; // Full body
          })
          .slice(0, 5); // 5 exercises per day

        cycle.push({
          day: days[i],
          focus: dayFocus,
          exercises: dayExercises.map(ex => ({
            ...ex,
            sets,
            reps,
            rest
          }))
        });
      }

      setPlan(cycle);
    };

    generatePlan();
  }, [userProfile]);

  if (!userProfile) return <div className="text-center text-zinc-400 py-12">Loading profile data...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center space-x-3 mb-2">
          <Calendar className="text-emerald-500" />
          <span>Personalized Workout Cycle</span>
        </h1>
        <p className="text-zinc-400">Tailored to your {userProfile.goal.replace('_', ' ')} goal and {userProfile.experience_level} level.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider">Goal</p>
            <p className="font-bold capitalize">{userProfile.goal.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider">Duration</p>
            <p className="font-bold">{userProfile.available_time_per_session} min/session</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider">Frequency</p>
            <p className="font-bold">{userProfile.days_per_week} days/week</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Dumbbell size={24} />
          </div>
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider">Equipment</p>
            <p className="font-bold capitalize">{userProfile.equipment}</p>
          </div>
        </div>
      </div>

      {userProfile.injuries && userProfile.injuries !== 'none' && (
        <div className="mb-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start space-x-3 text-rose-400">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold">Injury Accommodation Active</h4>
            <p className="text-sm opacity-80">Exercises targeting "{userProfile.injuries}" have been removed or modified from your plan.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {plan.map((day, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/20">
              <div>
                <h2 className="text-xl font-bold text-white">{day.day}</h2>
                <p className="text-zinc-400">{day.focus}</p>
              </div>
              <button className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors">
                <span className="text-sm font-medium">Start Workout</span>
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {day.exercises.map((ex: any, exIndex: number) => (
                <div key={exIndex} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                      {exIndex + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{ex.name}</h3>
                      <p className="text-sm text-zinc-500 capitalize">{ex.category.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="text-zinc-500 uppercase tracking-wider text-xs mb-1">Sets</p>
                      <p className="font-bold text-white">{ex.sets}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-zinc-500 uppercase tracking-wider text-xs mb-1">Reps</p>
                      <p className="font-bold text-white">{ex.reps}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-zinc-500 uppercase tracking-wider text-xs mb-1">Rest</p>
                      <p className="font-bold text-white">{ex.rest}s</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
