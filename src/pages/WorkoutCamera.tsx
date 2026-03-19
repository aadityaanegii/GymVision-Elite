import React, { useEffect, useRef, useState } from 'react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera as MediaPipeCamera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { RepCounter } from '../lib/poseUtils';
import { EXERCISES } from '../lib/exercises';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Camera, Save, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export const WorkoutCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  
  const [exercise, setExercise] = useState('squat');
  
  // Group exercises by category
  const categories = Array.from(new Set(EXERCISES.map(e => e.category)));
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState('Initializing camera...');
  const [score, setScore] = useState(100);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const counterRef = useRef<RepCounter | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<any>(null);
  const isRecordingRef = useRef(isRecording);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    counterRef.current = new RepCounter(exercise);
    setReps(0);
    setScore(100);
    setFeedback('Ready. Start when you are.');
  }, [exercise]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults((results) => {
      if (!canvasRef.current || !videoRef.current) return;
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw video frame
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#4f46e5', lineWidth: 4 });
        drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#10b981', lineWidth: 2, radius: 4 });

        if (isRecordingRef.current && counterRef.current) {
          const { count, feedback: newFeedback, score: newScore } = counterRef.current.update(results.poseLandmarks);
          setReps(count);
          setFeedback(newFeedback);
          setScore(newScore);
        }
      }
      canvasCtx.restore();
    });

    cameraRef.current = new MediaPipeCamera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          try {
            await pose.send({ image: videoRef.current });
          } catch (e) {
            console.error("Pose send error:", e);
          }
        }
      },
      width: 640,
      height: 480
    });

    cameraRef.current.start();

    return () => {
      cameraRef.current?.stop();
      try {
        pose.close();
      } catch (e) {
        console.error("Pose close error:", e);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      clearInterval(timerRef.current);
      setIsRecording(false);
    } else {
      setReps(0);
      setDuration(0);
      counterRef.current = new RepCounter(exercise);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      setIsRecording(true);
    }
  };

  const saveWorkout = async () => {
    if (!user || reps === 0) return;
    try {
      await addDoc(collection(db, 'workoutSessions'), {
        userId: user.uid,
        exerciseName: exercise,
        reps,
        formScore: counterRef.current?.getAverageScore() || score,
        durationSeconds: duration,
        createdAt: serverTimestamp()
      });
      alert('Workout saved successfully!');
      setReps(0);
      setDuration(0);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'workoutSessions');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center space-x-3">
          <Camera className="text-indigo-500" />
          <span>AI Form Check</span>
        </h1>
        <select 
          value={exercise} 
          onChange={(e) => setExercise(e.target.value)}
          disabled={isRecording}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500"
        >
          {categories.map(cat => (
            <optgroup key={cat} label={cat}>
              {EXERCISES.filter(e => e.category === cat).map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 aspect-video">
          <video ref={videoRef} className="hidden" playsInline />
          <canvas ref={canvasRef} className="w-full h-full object-cover" width={640} height={480} />
          
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className={`px-4 py-2 rounded-xl backdrop-blur-md font-medium ${isRecording ? 'bg-red-500/80 text-white' : 'bg-zinc-900/80 text-zinc-300'}`}>
              {isRecording ? `Recording • ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : 'Ready'}
            </div>
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-xl text-center border border-zinc-700/50">
              <p className="text-xs text-zinc-400 uppercase tracking-wider">Form Score</p>
              <p className={`text-2xl font-bold ${score > 85 ? 'text-emerald-400' : score > 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                {score}
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 bg-zinc-900/90 backdrop-blur-md rounded-xl p-4 border border-zinc-700/50">
            <p className="text-sm text-zinc-400 mb-1">AI Feedback</p>
            <p className="font-medium text-lg">{feedback}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <p className="text-zinc-400 uppercase tracking-wider text-sm font-medium mb-2">Rep Count</p>
            <p className="text-7xl font-bold text-indigo-500 font-mono">{reps}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={toggleRecording}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-colors ${
                isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <RefreshCw className={isRecording ? 'animate-spin' : ''} />
              <span>{isRecording ? 'Stop Workout' : 'Start Workout'}</span>
            </button>
            
            {!isRecording && reps > 0 && (
              <button
                onClick={saveWorkout}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Save />
                <span>Save Session</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
