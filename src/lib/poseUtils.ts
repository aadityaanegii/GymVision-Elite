import { EXERCISES } from './exercises';

export const calculateAngle = (a: any, b: any, c: any) => {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
};

export type RepState = 'START' | 'MIDDLE';

export class RepCounter {
  private state: RepState = 'START';
  private count: number = 0;
  private exercise: string;
  private formScores: number[] = [];

  constructor(exercise: string) {
    this.exercise = exercise;
  }

  update(landmarks: any[]): { count: number; feedback: string; score: number } {
    if (!landmarks || landmarks.length === 0) return { count: this.count, feedback: 'No pose detected', score: 0 };

    const config = EXERCISES.find(e => e.id === this.exercise);
    if (!config) return { count: this.count, feedback: 'Unknown exercise', score: 0 };

    // Determine which side is more visible
    const leftVisibility = (landmarks[11]?.visibility || 0) + (landmarks[23]?.visibility || 0);
    const rightVisibility = (landmarks[12]?.visibility || 0) + (landmarks[24]?.visibility || 0);
    const isLeft = leftVisibility > rightVisibility;

    // Landmark indices
    const shoulderIdx = isLeft ? 11 : 12;
    const elbowIdx = isLeft ? 13 : 14;
    const wristIdx = isLeft ? 15 : 16;
    const hipIdx = isLeft ? 23 : 24;
    const kneeIdx = isLeft ? 25 : 26;
    const ankleIdx = isLeft ? 27 : 28;

    let p1, p2, p3;
    let angle = 0;
    let startThreshold = 0;
    let midThreshold = 0;
    let isStartGreater = true; // true if START angle > MID angle

    switch (config.pattern) {
      case 'knee_extension':
        p1 = landmarks[hipIdx]; p2 = landmarks[kneeIdx]; p3 = landmarks[ankleIdx];
        startThreshold = 160; midThreshold = 90; isStartGreater = true;
        break;
      case 'hip_hinge':
        p1 = landmarks[shoulderIdx]; p2 = landmarks[hipIdx]; p3 = landmarks[kneeIdx];
        startThreshold = 160; midThreshold = 110; isStartGreater = true;
        break;
      case 'elbow_flexion':
        p1 = landmarks[shoulderIdx]; p2 = landmarks[elbowIdx]; p3 = landmarks[wristIdx];
        startThreshold = 150; midThreshold = 60; isStartGreater = true;
        break;
      case 'elbow_extension':
        p1 = landmarks[shoulderIdx]; p2 = landmarks[elbowIdx]; p3 = landmarks[wristIdx];
        startThreshold = 150; midThreshold = 90; isStartGreater = true;
        break;
      case 'shoulder_abduction':
      case 'shoulder_flexion':
        p1 = landmarks[hipIdx]; p2 = landmarks[shoulderIdx]; p3 = landmarks[elbowIdx];
        startThreshold = 30; midThreshold = 80; isStartGreater = false;
        break;
      case 'core_flexion':
        p1 = landmarks[shoulderIdx]; p2 = landmarks[hipIdx]; p3 = landmarks[kneeIdx];
        startThreshold = 150; midThreshold = 110; isStartGreater = true;
        break;
      case 'vertical_pull':
        p1 = landmarks[shoulderIdx]; p2 = landmarks[elbowIdx]; p3 = landmarks[wristIdx];
        startThreshold = 150; midThreshold = 80; isStartGreater = true;
        break;
    }

    let feedback = 'Good form';
    let currentScore = 100;

    if (p1 && p2 && p3 && p1.visibility > 0.5 && p2.visibility > 0.5) {
      angle = calculateAngle(p1, p2, p3);

      if (isStartGreater) {
        if (angle > startThreshold && this.state === 'MIDDLE') {
          this.state = 'START';
          this.count++;
          this.formScores.push(currentScore);
        }
        if (angle < midThreshold) {
          this.state = 'MIDDLE';
        }
        
        // Feedback logic
        if (this.state === 'START' && angle < startThreshold && angle > midThreshold + 20) {
          feedback = 'Go lower/deeper for full range';
          currentScore = 80;
        }
      } else {
        if (angle < startThreshold && this.state === 'MIDDLE') {
          this.state = 'START';
          this.count++;
          this.formScores.push(currentScore);
        }
        if (angle > midThreshold) {
          this.state = 'MIDDLE';
        }

        // Feedback logic
        if (this.state === 'START' && angle > startThreshold && angle < midThreshold - 20) {
          feedback = 'Raise higher for full range';
          currentScore = 80;
        }
      }
    } else {
      feedback = 'Adjust camera to show full body';
      currentScore = 50;
    }

    return { count: this.count, feedback, score: currentScore };
  }

  getAverageScore(): number {
    if (this.formScores.length === 0) return 100;
    return Math.round(this.formScores.reduce((a, b) => a + b, 0) / this.formScores.length);
  }
}
