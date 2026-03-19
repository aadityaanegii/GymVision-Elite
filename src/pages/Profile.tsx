import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { User, Save, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Profile = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<UserProfile>>(userProfile || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['age', 'height', 'weight', 'days_per_week', 'available_time_per_session'].includes(name) 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        updatedAt: new Date()
      });
      await refreshProfile();
      setSuccess('Profile updated successfully! Your workout plans and performance metrics have been recalculated.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    } finally {
      setSaving(false);
    }
  };

  if (!userProfile) return <div className="text-center text-zinc-400 py-12">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center space-x-3 mb-2">
          <User className="text-indigo-500" />
          <span>Edit Profile</span>
        </h1>
        <p className="text-zinc-400">Update your information to personalize your fitness journey.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center space-x-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 flex items-center space-x-2">
          <Save size={20} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Age</label>
              <input
                type="number"
                name="age"
                min="10"
                max="100"
                required
                value={formData.age || ''}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Height (cm)</label>
              <input
                type="number"
                name="height"
                min="100"
                max="250"
                required
                value={formData.height || ''}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                min="30"
                max="300"
                required
                value={formData.weight || ''}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-4">Fitness Goals & Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Primary Goal</label>
              <select
                name="goal"
                required
                value={formData.goal || ''}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="fat_loss">Fat Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="strength">Strength</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Experience Level</label>
              <select
                name="experience_level"
                required
                value={formData.experience_level || ''}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-4">Availability & Equipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Days per Week</label>
              <input
                type="number"
                name="days_per_week"
                min="1"
                max="7"
                required
                value={formData.days_per_week || ''}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Time per Session (min)</label>
              <input
                type="number"
                name="available_time_per_session"
                min="10"
                max="180"
                required
                value={formData.available_time_per_session || ''}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Equipment Available</label>
              <select
                name="equipment"
                required
                value={formData.equipment || ''}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="home">Home (Bodyweight/Dumbbells)</option>
                <option value="gym">Full Gym</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold border-b border-zinc-800 pb-4">Health & Injuries</h2>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Injuries or Limitations</label>
            <input
              type="text"
              name="injuries"
              placeholder="e.g., lower back, knees, or 'none'"
              required
              value={formData.injuries || ''}
              onChange={handleChange}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-xs text-zinc-500 mt-2">This helps us avoid recommending exercises that might aggravate existing conditions.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
