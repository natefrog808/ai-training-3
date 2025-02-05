import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Brain, Trophy, Users, LineChart, Star, Target, AlertCircle, CheckCircle2, Loader } from 'lucide-react';

// Constants
const CHALLENGE_TYPES = {
  PATTERN: 'pattern',
  OPTIMIZATION: 'optimization'
};

const PATTERN_TYPES = {
  ARITHMETIC: 'arithmetic',
  GEOMETRIC: 'geometric',
  QUADRATIC: 'quadratic',
  EXPONENTIAL: 'exponential'
};

const LEARNING_TRACKS = {
  PATTERN_RECOGNITION: 'PATTERN_RECOGNITION'
};

const TrainingEnvironment = () => {
  const [showProgress, setShowProgress] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [aiThoughts, setAiThoughts] = useState([]);
  const [isAISolving, setIsAISolving] = useState(false);
  const [experience, setExperience] = useState(0);
  const [level, setLevel] = useState(1);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  const generateNewChallenge = () => {
    const sequence = Array.from({ length: 5 }, (_, i) => Math.floor(Math.random() * 10) + i * 2);
    const nextNumber = sequence[sequence.length - 1] * 2;
    
    setCurrentChallenge({
      type: 'pattern',
      data: {
        sequence,
        nextNumber,
        pattern: { type: 'arithmetic' }
      },
      startTime: Date.now()
    });
    setUserAnswer('');
    setFeedback(null);
    setAiThoughts([]);
  };

  const handleAISolve = async () => {
    if (!currentChallenge || isAISolving) return;

    setIsAISolving(true);
    setAiThoughts([]);
    
    try {
      setAiThoughts(prev => [...prev, "Analyzing sequence pattern..."]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAiThoughts(prev => [...prev, "Detecting pattern type..."]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const nextValue = currentChallenge.data.nextNumber;
      setAiThoughts(prev => [...prev, `Predicted next value: ${nextValue.toFixed(2)}`]);
      setUserAnswer(nextValue.toFixed(2));
    } catch (error) {
      setFeedback({
        status: 'error',
        message: 'AI solving failed: ' + error.message
      });
    } finally {
      setIsAISolving(false);
    }
  };

  const handleSuccess = (score) => {
    const newExperience = experience + score;
    const levelThreshold = level * 1000;
    
    if (newExperience >= levelThreshold) {
      setLevel(prev => prev + 1);
      setExperience(newExperience - levelThreshold);
    } else {
      setExperience(newExperience);
    }

    setCompletedChallenges(prev => [...prev, {
      score,
      timestamp: Date.now(),
      success: true
    }]);
  };

  const submitAnswer = () => {
    if (!currentChallenge) return;

    try {
      const numAnswer = Number(userAnswer);
      if (!Number.isFinite(numAnswer)) {
        throw new Error('Please enter a valid number');
      }

      const isCorrect = Math.abs(numAnswer - currentChallenge.data.nextNumber) < 0.001;
      
      if (isCorrect) {
        const timeTaken = (Date.now() - currentChallenge.startTime) / 1000;
        const score = Math.max(0, 100 - timeTaken / 10);
        handleSuccess(score);
        setCurrentChallenge(null);
        setFeedback({
          status: 'success',
          message: `Correct! Score: ${score.toFixed(1)}`
        });
      } else {
        setFeedback({
          status: 'error',
          message: 'Not quite right. Try again!'
        });
      }
    } catch (error) {
      setFeedback({
        status: 'error',
        message: error.message
      });
    }
  };

  const progressReport = useMemo(() => ({
    currentLevel: `Level ${level}`,
    experiencePoints: experience,
    levelProgress: experience / (level * 1000),
    successRate: completedChallenges.filter(c => c.success).length / Math.max(1, completedChallenges.length),
    challengesCompleted: completedChallenges.length,
    recentHistory: completedChallenges.slice(-5)
  }), [level, experience, completedChallenges]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-500" />
            <span>AI Training Environment</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowProgress(!showProgress)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              {showProgress ? 'Return to Training' : 'View Progress'}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">{progressReport.experiencePoints} XP</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {currentChallenge && !showProgress && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Pattern Challenge</h3>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(currentChallenge.data.sequence, null, 2)}
                </pre>
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your answer..."
                  disabled={isAISolving}
                />
                <button
                  onClick={submitAnswer}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  disabled={isAISolving}
                >
                  Submit
                </button>
                <button
                  onClick={handleAISolve}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
                  disabled={isAISolving}
                >
                  {isAISolving && <Loader className="w-4 h-4 animate-spin" />}
                  Let AI Solve
                </button>
              </div>
            </div>
          )}

          {showProgress && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Current Level</div>
                  <div className="text-xl font-bold mt-1">{progressReport.currentLevel}</div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${progressReport.levelProgress * 100}%` }}
                    />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Success Rate</div>
                  <div className="text-xl font-bold mt-1">
                    {(progressReport.successRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">Recent Challenges</h3>
                {progressReport.recentHistory.map((challenge, i) => (
                  <div key={i} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {challenge.success ? (
                        <Star className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">Challenge Completed</span>
                    </div>
                    <span className="text-sm font-medium">{challenge.score} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!currentChallenge && !showProgress && (
            <div className="text-center py-8">
              <button
                onClick={generateNewChallenge}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start New Challenge
              </button>
            </div>
          )}

          {aiThoughts.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h4 className="font-medium text-gray-700">AI Analysis:</h4>
              {aiThoughts.map((thought, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Brain className="w-4 h-4 mt-1 text-blue-500" />
                  <p className="text-sm text-gray-600">{thought}</p>
                </div>
              ))}
            </div>
          )}

          {feedback && (
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              feedback.status === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {feedback.status === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <p className="text-sm">{feedback.message}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingEnvironment;
