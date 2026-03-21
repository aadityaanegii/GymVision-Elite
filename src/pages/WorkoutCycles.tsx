import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Dumbbell, AlertCircle, Target, Play, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WorkoutCycles = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userProfile) return;

    const fetchActivePlan = async () => {
      try {
        const qPlan = query(
          collection(db, 'workoutPlans'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const planSnap = await getDocs(qPlan);
        
        if (!planSnap.empty) {
          const planData = planSnap.docs[0].data();
          
          // Group exercises by day
          const exercisesByDay = planData.exercises?.reduce((acc: any, ex: any) => {
            const day = ex.day || 1;
            if (!acc[day]) acc[day] = [];
            acc[day].push(ex);
            return acc;
          }, {});

          // Format into the cycle structure expected by the UI
          if (exercisesByDay) {
            const formattedCycle = Object.keys(exercisesByDay).map(dayNum => ({
              day: `Day ${dayNum}`,
              focus: 'Daily Workout', // Could be enhanced if focus is saved in DB
              exercises: exercisesByDay[dayNum]
            }));
            setPlan(formattedCycle);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'workoutPlans');
      } finally {
        setLoading(false);
      }
    };

    fetchActivePlan();
  }, [user, userProfile]);

  if (!userProfile || loading) return <div className="text-center text-zinc-400 py-12">Loading workout cycle...</div>;

  const toggleDay = (index: number) => {
    setExpandedDay(expandedDay === index ? null : index);
  };

  const startWorkout = (dayIndex: number) => {
    // In a real app, this would set the active workout in global state and navigate to a tracking screen
    // For now, we'll just navigate to the dashboard where the active plan is displayed
    navigate('/');
  };

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

      <div className="space-y-4">
        {plan.map((day, index) => {
          const isExpanded = expandedDay === index;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-zinc-900 border ${isExpanded ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'border-zinc-800'} rounded-2xl overflow-hidden transition-all duration-300`}
            >
              <div 
                onClick={() => toggleDay(index)}
                className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-900/10' : 'hover:bg-zinc-800/50'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-colors ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    D{index + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{day.day}</h2>
                    <p className={`text-sm ${isExpanded ? 'text-indigo-400' : 'text-zinc-400'}`}>{day.focus}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-zinc-500 hidden sm:inline-block">{day.exercises.length} exercises</span>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className={isExpanded ? 'text-indigo-400' : 'text-zinc-500'} />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="border-t border-zinc-800/50 bg-zinc-950/50 p-4 sm:p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-zinc-300">Workout Details</h3>
                        <button 
                          onClick={(e) => { e.stopPropagation(); startWorkout(index); }}
                          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                          <Play size={16} />
                          <span>Start Day {index + 1}</span>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {day.exercises.map((ex: any, exIndex: number) => (
                          <div key={exIndex} className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between hover:border-zinc-700 transition-colors">
                            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 text-sm font-medium">
                                {exIndex + 1}
                              </div>
                              <div>
                                <h4 className="font-bold text-white">{ex.name}</h4>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 sm:space-x-8 text-sm bg-zinc-950/50 p-2 sm:p-3 rounded-lg sm:bg-transparent sm:p-0">
                              <div className="text-center flex-1 sm:flex-none">
                                <p className="text-zinc-500 uppercase tracking-wider text-[10px] mb-1">Sets</p>
                                <p className="font-bold text-white">{ex.sets}</p>
                              </div>
                              <div className="text-center flex-1 sm:flex-none">
                                <p className="text-zinc-500 uppercase tracking-wider text-[10px] mb-1">Reps</p>
                                <p className="font-bold text-white">{ex.reps}</p>
                              </div>
                              <div className="text-center flex-1 sm:flex-none">
                                <p className="text-zinc-500 uppercase tracking-wider text-[10px] mb-1">Rest</p>
                                <p className="font-bold text-white">{ex.restSeconds || ex.rest}s</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
