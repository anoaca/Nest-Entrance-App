import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Settings, Users, Database, LogOut, Loader, KeySquare, LayoutDashboard, Activity, CheckCircle, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState(null);
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  // New entry states
  const [newEmail, setNewEmail] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionOptions, setNewQuestionOptions] = useState(['', '', '', '']);
  const [newQuestionAnswer, setNewQuestionAnswer] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const s = await api.get('/exam-settings');
    setSettings(s.data);
    const stu = await api.get('/students');
    setStudents(stu.data);
    const q = await api.get('/questions');
    setQuestions(q.data);
  };

  const toggleExam = async () => {
    const res = await api.put('/exam-settings', { is_enabled: !settings.is_enabled });
    setSettings(res.data);
  };

  const inviteStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students/invite', { email: newEmail });
      setNewEmail('');
      fetchData();
      alert("Credentials sent!");
    } catch(err) {
      alert("Error inviting student");
    }
  };

  const addQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/questions', { 
         text: newQuestionText, 
         options: newQuestionOptions,
         correct_answer: newQuestionOptions[newQuestionAnswer]
      });
      setNewQuestionText('');
      setNewQuestionOptions(['', '', '', '']);
      fetchData();
    } catch(err) {
      alert("Error adding question");
    }
  };

  const deleteQuestion = async (id) => {
      await api.delete(`/questions/${id}`);
      fetchData();
  };

  if(!settings) return <div className="p-10 flex justify-center"><Loader className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-surface-container-low flex">
      {/* Sidebar */}
      <div className="w-64 bg-surface-container border-r border-outline-variant/50 shadow-sm flex flex-col">
        <div className="p-6">
            <h1 className="text-xl font-display font-bold text-primary tracking-tight">The Academic<br/>Sanctuary</h1>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
            {[
                { id: 'overview', icon: LayoutDashboard, label: 'Dashboard Overview' },
                { id: 'students', icon: Users, label: 'Candidate Access' },
                { id: 'questions', icon: Database, label: 'Question Bank' },
                { id: 'settings', icon: Settings, label: 'Exam Global Rules' }
            ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm
                    ${activeTab === tab.id ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant/50'}`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-outline-variant/30">
             <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-2 text-error hover:bg-error-container/20 rounded-lg transition-colors">
                <LogOut size={18} />
                <span className="font-medium text-sm">Terminate Session</span>
             </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-surface">
        <div className="max-w-5xl mx-auto p-10">
           
           <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-3xl font-display font-semibold mb-1">
                      {activeTab === 'overview' && 'System Overview'}
                      {activeTab === 'students' && 'Candidate Records'}
                      {activeTab === 'questions' && 'The Question Monolith'}
                      {activeTab === 'settings' && 'Global Parameters'}
                  </h2>
                  <p className="text-on-surface-variant text-sm font-body">Logged in as Administrator: {user?.username}</p>
               </div>

               {/* Global Status Chip */}
               <div className="flex items-center space-x-3 bg-surface-container-highest px-4 py-2 rounded-xl border border-outline-variant/20">
                   <div className="text-sm font-medium">Entrance Exam Status:</div>
                   <div className={settings.is_enabled ? 'status-enabled' : 'status-disabled'}>
                       {settings.is_enabled ? 'Active / Receiving' : 'Halted / Disabled'}
                   </div>
               </div>
           </div>

           {/* --- TAB CONTENT --- */}
           
           {activeTab === 'overview' && (
               <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {/* Metric Cards */}
                       <div className="bg-surface-container-lowest p-6 rounded-xl admin-panel-shadow">
                           <div className="flex items-center space-x-3 text-secondary mb-2">
                               <Users size={20} />
                               <h3 className="font-medium font-body">Total Candidates</h3>
                           </div>
                           <div className="text-4xl font-display font-bold text-on-surface">{students.length}</div>
                       </div>
                       
                       <div className="bg-surface-container-lowest p-6 rounded-xl admin-panel-shadow">
                           <div className="flex items-center space-x-3 text-tertiary mb-2">
                               <Database size={20} />
                               <h3 className="font-medium font-body">Monolith Questions</h3>
                           </div>
                           <div className="text-4xl font-display font-bold text-on-surface">{questions.length}</div>
                       </div>
                       
                       <div className="bg-surface-container-lowest p-6 rounded-xl admin-panel-shadow">
                           <div className="flex items-center space-x-3 text-primary mb-2">
                               <Activity size={20} />
                               <h3 className="font-medium font-body">System Integrity</h3>
                           </div>
                           <div className="text-4xl font-display font-bold text-on-surface">100%</div>
                       </div>
                   </div>

                   <div className="bg-surface-container-lowest p-8 rounded-xl admin-panel-shadow">
                       <h3 className="text-xl font-display font-semibold mb-6 flex items-center">
                           <BarChart3 className="mr-3 text-primary" /> Examination Analytics
                       </h3>
                       <div className="h-48 border-b border-surface-variant flex items-end justify-around pb-4 relative">
                           {/* Mock Bar Chart */}
                           <div className="w-16 bg-primary/20 rounded-t-md h-[40%] flex items-center justify-center text-xs text-primary-dim font-medium hover:bg-primary transition-colors hover:text-white cursor-pointer relative group">
                                <span className="absolute -top-8 bg-surface-container-high px-2 py-1 rounded text-on-surface hidden group-hover:block whitespace-nowrap">Q1 Grade</span>
                           </div>
                           <div className="w-16 bg-primary/40 rounded-t-md h-[60%] flex items-center justify-center text-xs text-primary-dim font-medium hover:bg-primary transition-colors hover:text-white cursor-pointer relative group">
                                <span className="absolute -top-8 bg-surface-container-high px-2 py-1 rounded text-on-surface hidden group-hover:block whitespace-nowrap">Q2 Grade</span>
                           </div>
                           <div className="w-16 bg-primary/60 rounded-t-md h-[80%] flex items-center justify-center text-xs text-white font-medium hover:bg-primary transition-colors cursor-pointer relative group">
                                <span className="absolute -top-8 bg-surface-container-high px-2 py-1 rounded text-on-surface hidden group-hover:block whitespace-nowrap">Q3 Grade</span>
                           </div>
                           <div className="w-16 bg-primary/80 rounded-t-md h-[50%] flex items-center justify-center text-xs text-white font-medium hover:bg-primary transition-colors cursor-pointer relative group">
                                <span className="absolute -top-8 bg-surface-container-high px-2 py-1 rounded text-on-surface hidden group-hover:block whitespace-nowrap">Q4 Grade</span>
                           </div>
                           <div className="absolute top-0 left-0 w-full h-full border-l border-surface-variant/50 pointer-events-none" />
                       </div>
                       <p className="text-center text-sm text-on-surface-variant mt-4 font-body">Simulated Candidate Performance Curve</p>
                   </div>
               </div>
           )}
           
           {activeTab === 'students' && (
               <div className="space-y-8">
                   <div className="bg-surface-container-lowest p-6 rounded-xl admin-panel-shadow">
                       <h3 className="text-lg font-semibold font-display mb-4 flex items-center"><KeySquare size={20} className="mr-2 text-primary"/> Dispense Credentials</h3>
                       <form onSubmit={inviteStudent} className="flex gap-4">
                           <input 
                             type="email" 
                             required 
                             placeholder="candidate@university.edu" 
                             className="input-academic flex-1"
                             value={newEmail} onChange={e => setNewEmail(e.target.value)}
                           />
                           <button type="submit" className="btn-primary whitespace-nowrap">Issue Secure Key</button>
                       </form>
                   </div>

                   <div>
                       <h3 className="text-lg font-semibold font-display mb-4">Authorized Candidates</h3>
                       <div className="bg-surface-container-lowest rounded-xl admin-panel-shadow overflow-hidden">
                           {students.length === 0 ? (
                               <div className="p-8 text-center text-on-surface-variant">No candidates provisioned yet.</div>
                           ) : (
                               <table className="w-full text-left border-collapse">
                                   <thead>
                                       <tr className="bg-surface-container-low text-on-surface-variant text-sm border-b border-surface-variant">
                                           <th className="font-medium p-4 py-3">Candidate ID (Email)</th>
                                           <th className="font-medium p-4 py-3 w-32 text-center">Status</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {students.map(s => (
                                           <tr key={s.id} className="border-b border-surface-variant/50 last:border-0 hover:bg-surface-container/20">
                                               <td className="p-4 font-body text-on-surface font-medium">{s.username}</td>
                                               <td className="p-4 text-center">
                                                   <span className="bg-secondary-container text-on-secondary px-2 py-1 rounded text-xs">Awaiting</span>
                                               </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           )}
                       </div>
                   </div>
               </div>
           )}

           {activeTab === 'questions' && (
               <div className="space-y-8">
                    <div className="bg-surface-container-lowest p-6 rounded-xl admin-panel-shadow">
                         <h3 className="text-lg font-semibold font-display mb-4">Formulate New Question</h3>
                         <form onSubmit={addQuestion} className="space-y-4">
                             <div>
                                 <label className="block text-sm font-medium mb-1">Question Body</label>
                                 <textarea 
                                    className="input-academic min-h-[100px]" 
                                    required 
                                    value={newQuestionText}
                                    onChange={e => setNewQuestionText(e.target.value)}
                                 />
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                  {newQuestionOptions.map((opt, i) => (
                                       <div key={i} className="flex items-center space-x-2">
                                            <input 
                                                type="radio" 
                                                name="correct" 
                                                checked={newQuestionAnswer === i} 
                                                onChange={() => setNewQuestionAnswer(i)}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder={`Option ${i+1}`} 
                                                required
                                                className="input-academic py-1"
                                                value={opt}
                                                onChange={e => {
                                                    const newOpts = [...newQuestionOptions];
                                                    newOpts[i] = e.target.value;
                                                    setNewQuestionOptions(newOpts);
                                                }}
                                            />
                                       </div>
                                  ))}
                             </div>
                             <button type="submit" className="btn-primary mt-2">Append to Monolith</button>
                         </form>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold font-display">Current Monolith Database</h3>
                        {questions.length === 0 && <p className="text-on-surface-variant italic">No questions formulated.</p>}
                        {questions.map((q, i) => (
                            <div key={q.id} className="bg-surface-container-lowest p-6 rounded-xl admin-panel-shadow relative">
                                <button onClick={() => deleteQuestion(q.id)} className="absolute top-4 right-4 text-error hover:bg-error-container/20 p-2 rounded-full cursor-pointer transition-colors text-sm font-medium">Remove</button>
                                <div className="flex gap-4">
                                     <div className="text-2xl font-display font-light text-primary/50">{(i+1).toString().padStart(2, '0')}</div>
                                     <div className="flex-1">
                                          <p className="font-body text-lg mb-4 text-on-surface">{q.text}</p>
                                          <ul className="grid grid-cols-2 gap-2">
                                              {q.options.map((opt, j) => (
                                                  <li key={j} className={`p-2 rounded border ${opt === q.correct_answer ? 'border-tertiary-container bg-tertiary-container/10 text-on-surface font-medium' : 'border-outline-variant/30 text-on-surface-variant'}`}>
                                                      {opt}
                                                  </li>
                                              ))}
                                          </ul>
                                     </div>
                                </div>
                            </div>
                        ))}
                    </div>
               </div>
           )}

           {activeTab === 'settings' && (
               <div className="bg-surface-container-lowest p-8 rounded-xl admin-panel-shadow max-w-2xl">
                   <h3 className="text-2xl font-semibold font-display mb-6 border-b border-surface-variant pb-4">Exam State Control</h3>
                   
                   <div className="flex items-center justify-between py-4">
                       <div>
                           <div className="font-medium text-lg text-on-surface">Master Toggle</div>
                           <div className="text-on-surface-variant text-sm max-w-md">When disabled, no candidate can access the exam interface, regardless of credentials. Use this to prepare the environment.</div>
                       </div>
                       <button onClick={toggleExam} className={`px-6 py-2 rounded-lg font-medium shadow-sm transition-all ${settings.is_enabled ? 'bg-error text-on-error hover:bg-error/80' : 'bg-primary text-on-primary hover:bg-primary-dim'}`}>
                           {settings.is_enabled ? 'HALT EXAM' : 'ENABLE EXAM'}
                       </button>
                   </div>
                   
               </div>
           )}

        </div>
      </div>
    </div>
  );
}
