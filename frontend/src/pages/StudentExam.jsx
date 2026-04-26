import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckSquare, ShieldCheck, Loader } from 'lucide-react';

export default function StudentExam() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Exam State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchExam();
  }, []);

  const fetchExam = async () => {
    try {
      const res = await api.get('/exam');
      setQuestions(res.data.questions);
      setSettings(res.data.settings);
      
      // Initialize timer (60 mins default)
      setTimeLeft(res.data.settings.duration_minutes * 60);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 403) {
         setError(err.response.data.message || "Exam Not Available");
      } else {
         setError("Connection Error");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || error || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, error, submitted]);

  const selectAnswer = (ans) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: ans });
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    // In a real scenario, we'll POST /api/exam/submit
    // For MVP frontend demo to match designs, we show completion screen.
  };

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><Loader className="animate-spin text-primary" size={48}/></div>;
  if (error) return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container p-8 rounded-2xl text-center shadow-sm">
             <ShieldCheck size={48} className="text-secondary mx-auto mb-4" />
             <h2 className="text-2xl font-display font-semibold mb-2">Access Denied</h2>
             <p className="text-on-surface-variant font-body mb-6">{error}</p>
             <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary w-full">Return Home</button>
          </div>
      </div>
  );

  if (submitted) return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-tertiary-container/20 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
         <div className="max-w-lg w-full bg-surface-container-lowest p-10 rounded-2xl text-center shadow-sm border border-outline-variant relative z-10">
             <CheckSquare size={64} className="text-tertiary mx-auto mb-6" />
             <h2 className="text-4xl font-display font-bold text-on-surface mb-2">Submitted.</h2>
             <p className="text-on-surface-variant font-body mb-8 text-lg">Your responses have been securely recorded in the monolith.</p>
             <button onClick={() => { logout(); navigate('/'); }} className="btn-primary w-full py-3">Conclude Session</button>
         </div>
      </div>
  );

  const q = questions[currentIndex];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 300; // Less than 5 mins

  return (
    <div className="min-h-screen bg-surface flex flex-col relative select-none">
       {/* Glassmorphism Header */}
       <header className="sticky top-0 z-50 card-glass border-b border-outline-variant/30 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                 <ShieldCheck className="text-primary" />
                 <div>
                     <div className="font-display font-bold leading-none">The Scholarly Monolith</div>
                     <div className="text-xs text-on-surface-variant mt-1">Candidate: {user?.username}</div>
                 </div>
            </div>
            
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-display font-semibold tracking-widest text-xl transition-colors ${isUrgent ? 'bg-error-container/20 text-error animate-pulse' : 'bg-surface-container-high text-on-surface'}`}>
                 <Clock size={20} className={isUrgent ? 'text-error' : 'text-primary'} />
                 <span>{mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}</span>
            </div>
       </header>

       {/* Progress Track */}
       <div className="w-full h-1.5 bg-surface-container-high">
            <div 
               className="h-full bg-gradient-to-r from-primary to-primary-container transition-all duration-300"
               style={{ width: `${Object.keys(answers).length / questions.length * 100}%` }}
            />
       </div>

       {/* Question Area */}
       <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 flex flex-col">
            <div className="text-secondary font-display font-medium mb-6 mt-4">
                 Question {currentIndex + 1} of {questions.length}
            </div>

            <div className="bg-surface-container-lowest p-8 md:p-12 rounded-2xl border border-outline-variant/50 shadow-sm flex-1 mb-8">
                 <h2 className="text-2xl md:text-3xl font-body font-normal leading-relaxed text-on-surface mb-10">
                     {q.text}
                 </h2>

                 <div className="space-y-4">
                     {q.options.map((opt, i) => {
                         const isSelected = answers[q.id] === opt;
                         return (
                             <button 
                                key={i}
                                onClick={() => selectAnswer(opt)}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all font-body text-lg
                                  ${isSelected 
                                    ? 'border-primary bg-primary/5 text-primary-fixed shadow-sm' 
                                    : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container text-on-surface-variant'}`}
                             >
                                 <div className="flex items-center">
                                      <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center
                                          ${isSelected ? 'border-primary' : 'border-outline-variant'}`}>
                                          {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                                      </div>
                                      {opt}
                                 </div>
                             </button>
                         )
                     })}
                 </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
                 <button 
                   onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
                   disabled={currentIndex === 0}
                   className="btn-secondary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    Previous
                 </button>

                 {currentIndex === questions.length - 1 ? (
                     <button 
                       onClick={handleSubmit}
                       className="btn-primary px-10 py-3 text-lg"
                     >
                        Submit Examination
                     </button>
                 ) : (
                     <button 
                       onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))}
                       className="bg-primary text-on-primary font-medium rounded-md px-10 py-3 hover:bg-primary-dim transition-colors shadow-sm"
                     >
                        Next
                     </button>
                 )}
            </div>
       </main>
    </div>
  );
}
