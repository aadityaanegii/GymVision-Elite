import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';
import { Activity, ArrowRight, CheckCircle } from 'lucide-react';

export const Onboarding = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    age: userProfile?.age || 25,
    height: userProfile?.height || 170,
    weight: userProfile?.weight || 70,
    goal: userProfile?.goal || 'fat_loss',
    experience_level: userProfile?.experience_level || 'beginner',
    days_per_week: userProfile?.days_per_week || 3,
    available_time_per_session: userProfile?.available_time_per_session || 45,
    equipment: userProfile?.equipment || 'mixed',
    injuries: userProfile?.injuries || 'none'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['age', 'height', 'weight', 'days_per_week', 'available_time_per_session'].includes(name) 
        ? Number(value) 
        : value
    }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        onboardingCompleted: true,
        updatedAt: serverTimestamp()
      });
      await refreshProfile();
      navigate('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Activity className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Welcome to Dreamism Elite</h1>
          <p className="text-zinc-400">Let's personalize your fitness journey.</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= i ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                  {step > i ? <CheckCircle size={16} /> : i}
                </div>
                {i < 3 && (
                  <div className={`w-16 md:w-32 h-1 mx-2 rounded-full ${step > i ? 'bg-indigo-600' : 'bg-zinc-800'}`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-bold mb-6">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Age</label>
                    <input type="number" name="age" min="10" max="100" required value={formData.age} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Height (cm)</label>
                      <input type="number" name="height" min="100" max="250" required value={formData.height} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Weight (kg)</label>
                      <input type="number" name="weight" min="30" max="300" required value={formData.weight} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-bold mb-6">Fitness Goals</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Primary Goal</label>
                    <select name="goal" value={formData.goal} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
                      <option value="fat_loss">Fat Loss</option>
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="strength">Strength & Power</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Experience Level</label>
                    <select name="experience_level" value={formData.experience_level} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Equipment Access</label>
                    <select name="equipment" value={formData.equipment} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
                      <option value="home">Home (Bodyweight/Minimal)</option>
                      <option value="gym">Full Gym</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-bold mb-6">Availability & Health</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Days per Week</label>
                      <input type="number" name="days_per_week" min="1" max="7" required value={formData.days_per_week} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Mins per Session</label>
                      <input type="number" name="available_time_per_session" min="10" max="180" required value={formData.available_time_per_session} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Injuries or Limitations</label>
                    <input type="text" name="injuries" required placeholder="e.g., none, bad left knee, lower back pain" value={formData.injuries} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button type="button" onClick={handleBack} className="px-6 py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                  Back
                </button>
              ) : <div></div>}
              
              {step < 3 ? (
                <button type="button" onClick={handleNext} className="px-6 py-3 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-2 transition-colors">
                  <span>Next</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2 transition-colors disabled:opacity-50">
                  <span>{loading ? 'Saving...' : 'Complete Profile'}</span>
                  {!loading && <CheckCircle size={18} />}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
