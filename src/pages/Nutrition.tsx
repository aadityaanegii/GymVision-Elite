import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateNutritionPlan } from '../lib/gemini';
import { collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Apple, Plus, Loader2, Utensils, CheckCircle, Circle } from 'lucide-react';
import { motion } from 'motion/react';

export const Nutrition = () => {
  const { user, userProfile } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchPlan = async () => {
      try {
        const q = query(
          collection(db, 'nutritionPlans'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const nutData = snapshot.docs[0].data();
          const today = new Date().toISOString().split('T')[0];
          let meals = nutData.meals || [];
          let lastUpdatedDate = nutData.lastUpdatedDate;
          
          if (lastUpdatedDate !== today) {
            meals = meals.map((m: any) => ({ ...m, completed: false }));
            await updateDoc(doc(db, 'nutritionPlans', snapshot.docs[0].id), {
              meals,
              lastUpdatedDate: today
            });
          }
          
          setPlan({ id: snapshot.docs[0].id, ...nutData, meals, lastUpdatedDate: today });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'nutritionPlans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [user]);

  const handleGeneratePlan = async () => {
    if (!userProfile) return;
    setGenerating(true);
    try {
      const newPlan = await generateNutritionPlan(
        userProfile.goal || 'maintenance',
        userProfile.weight || 70,
        userProfile.height || 175
      );
      
      const planData = {
        userId: user!.uid,
        dailyCalories: Number(newPlan.dailyCalories) || 2000,
        proteinGrams: Number(newPlan.proteinGrams) || 150,
        carbsGrams: Number(newPlan.carbsGrams) || 200,
        fatsGrams: Number(newPlan.fatsGrams) || 70,
        meals: (newPlan.meals || []).map((meal: any) => ({
          name: meal.name || 'Meal',
          description: meal.description || 'Healthy meal',
          calories: Number(meal.calories) || 500,
          protein: Number(meal.protein) || 30,
          carbs: Number(meal.carbs) || 40,
          fats: Number(meal.fats) || 15,
          completed: false
        })),
        lastUpdatedDate: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'nutritionPlans'), planData);
      setPlan({ id: docRef.id, ...planData });
    } catch (error) {
      console.error("Error generating nutrition plan:", error);
      try {
        handleFirestoreError(error, OperationType.CREATE, 'nutritionPlans');
      } catch (e) {
        // Ignore thrown error from handleFirestoreError
      }
    } finally {
      setGenerating(false);
    }
  };

  const toggleMeal = async (index: number) => {
    if (!plan || !plan.id) return;
    const updated = [...plan.meals];
    updated[index].completed = !updated[index].completed;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      await updateDoc(doc(db, 'nutritionPlans', plan.id), { 
        meals: updated,
        lastUpdatedDate: today
      });
      setPlan({ ...plan, meals: updated, lastUpdatedDate: today });
      if (updated[index].completed) {
        alert(`Meal logged: ${updated[index].name}! 🥗`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Apple className="text-emerald-500" />
            <span>Nutrition & Diet</span>
          </h1>
          <p className="text-zinc-400 mt-1">AI-generated meal plans tailored to your goals.</p>
        </div>
        <button
          onClick={handleGeneratePlan}
          disabled={generating}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
        >
          {generating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          <span>{generating ? 'Generating...' : 'New Plan'}</span>
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-zinc-900 rounded-2xl" />
          <div className="h-64 bg-zinc-900 rounded-2xl" />
        </div>
      ) : plan ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MacroCard 
              label="Calories" 
              value={plan.meals?.filter((m: any) => m.completed).reduce((acc: number, m: any) => acc + (m.calories || 0), 0)} 
              target={plan.dailyCalories} 
              unit="kcal" 
              color="text-orange-500" 
            />
            <MacroCard 
              label="Protein" 
              value={plan.meals?.filter((m: any) => m.completed).reduce((acc: number, m: any) => acc + (m.protein || 0), 0)} 
              target={plan.proteinGrams} 
              unit="g" 
              color="text-red-500" 
            />
            <MacroCard 
              label="Carbs" 
              value={plan.meals?.filter((m: any) => m.completed).reduce((acc: number, m: any) => acc + (m.carbs || 0), 0)} 
              target={plan.carbsGrams} 
              unit="g" 
              color="text-blue-500" 
            />
            <MacroCard 
              label="Fats" 
              value={plan.meals?.filter((m: any) => m.completed).reduce((acc: number, m: any) => acc + (m.fats || 0), 0)} 
              target={plan.fatsGrams} 
              unit="g" 
              color="text-yellow-500" 
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <Utensils className="text-zinc-400" />
              <span>Daily Meals</span>
            </h2>
            <div className="space-y-4">
              {plan.meals?.map((meal: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => toggleMeal(idx)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${meal.completed ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-zinc-950 border-zinc-800 hover:border-emerald-500/50'}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="shrink-0">
                      {meal.completed ? <CheckCircle className="text-emerald-500" /> : <Circle className="text-zinc-600" />}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${meal.completed ? 'text-emerald-400 line-through opacity-70' : 'text-zinc-100'}`}>{meal.name}</h3>
                      <p className="text-zinc-400 text-sm mt-1">{meal.description}</p>
                      <p className="text-zinc-500 text-xs mt-1">{meal.protein || 0}g P • {meal.carbs || 0}g C • {meal.fats || 0}g F</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-xl font-bold text-emerald-400">{meal.calories}</span>
                    <span className="text-sm text-zinc-500 ml-1">kcal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <Apple size={48} className="mx-auto text-zinc-600 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Nutrition Plan Found</h2>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            Generate a personalized AI nutrition plan based on your height, weight, and fitness goals.
          </p>
          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Generate Your First Plan
          </button>
        </div>
      )}
    </motion.div>
  );
};

const MacroCard = ({ label, value, target, unit, color }: any) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
    <p className="text-zinc-400 uppercase tracking-wider text-xs font-medium mb-2">{label}</p>
    <p className={`text-3xl font-bold font-mono ${color}`}>
      {value} <span className="text-sm font-normal text-zinc-500">/ {target}{unit}</span>
    </p>
  </div>
);
