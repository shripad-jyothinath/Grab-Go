import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { Lock, Mail, User as UserIcon, Phone, Key, ArrowRight, Loader2, Store, Clock, CreditCard, ShieldAlert } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../services/api';

export default function Auth() {
  const { login, signup, recoverPassword } = useStore();
  const [view, setView] = useState<'login' | 'signup' | 'recover'>('login');
  
  // Google Onboarding State
  const [googleOnboarding, setGoogleOnboarding] = useState<{ active: boolean, email?: string, name?: string, sub?: string }>({ active: false });
  const [selectedGoogleRole, setSelectedGoogleRole] = useState<UserRole | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Admin Mode State
  const [secretCount, setSecretCount] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [restaurantName, setRestaurantName] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('Pet');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Restaurant Details (Hours as separate times)
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [upiId, setUpiId] = useState('');
  
  // Rate Limit State
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Helper to format time (09:00 -> 9:00 AM)
  const formatTime = (time: string) => {
     if(!time) return '';
     const [h, m] = time.split(':');
     const hour = parseInt(h);
     const ampm = hour >= 12 ? 'PM' : 'AM';
     const hour12 = hour % 12 || 12;
     return `${hour12}:${m} ${ampm}`;
  };

  // 1. Google Success Handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { token: credentialResponse.credential });
      
      if (res.isNewUser) {
        // Start Onboarding Flow
        setGoogleOnboarding({ active: true, email: res.email, name: res.name, sub: res.googleSub });
        setError('');
      } else {
        // Log in immediately
        localStorage.setItem('grabgo_user', JSON.stringify(res.user));
        localStorage.setItem('grabgo_token', res.token);
        window.location.reload(); // Simple reload to refresh context
      }
    } catch (err: any) {
      setError(err.message || 'Google Auth failed');
    } finally {
      setLoading(false);
    }
  };

  // 2. Google Role Selection & Completion
  const completeGoogleSignup = async () => {
    if (!selectedGoogleRole) return;
    
    let hoursStr = '';
    // Validation for Restaurant
    if (selectedGoogleRole === UserRole.RESTAURANT) {
        if (!restaurantName || !upiId || !openTime || !closeTime) {
            setError("Please fill all restaurant details");
            return;
        }
        hoursStr = `${formatTime(openTime)} - ${formatTime(closeTime)}`;
    }

    setLoading(true);
    try {
        const res = await api.post('/auth/google/complete', {
            email: googleOnboarding.email,
            name: googleOnboarding.name,
            role: selectedGoogleRole,
            googleSub: googleOnboarding.sub,
            // Restaurant specifics
            restaurantName,
            hours: hoursStr,
            upiId
        });
        
        localStorage.setItem('grabgo_user', JSON.stringify(res.user));
        localStorage.setItem('grabgo_token', res.token);
        window.location.reload();
    } catch (err) {
        setError('Failed to complete signup');
    } finally {
        setLoading(false);
    }
  };

  // Handles both secret admin trigger AND normal submission
  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Secret Admin Trigger Logic
    if (!isAdminMode) {
        const newCount = secretCount + 1;
        setSecretCount(newCount);
        
        if (newCount === 5) {
            setIsAdminMode(true);
            setView('login');
            setEmail('');
            setPassword('');
            setError("Enter Admin Credentials");
            setSecretCount(0);
            return;
        }
    }

    // 2. Normal Validation Logic
    if (view === 'login') {
        if (!email || !password) {
            if (isAdminMode || secretCount === 1) setError('Please enter email and password');
            return;
        }
    } else if (view === 'signup') {
         // Should not happen if button is hidden, but safety check
         return;
    }

    // 3. Submission (Login/Signup)
    setError('');
    setLoading(true);
    setIsRateLimited(false);

    try {
      if (view === 'login') {
        const success = await login(email, password);
        if (!success) setError('Invalid credentials');
      } else if (view === 'recover') {
        const success = await recoverPassword(email, securityAnswer, newPassword);
        if (success) {
          alert('Password reset successful. Please login.');
          setView('login');
        } else {
          setError('Verification failed. Check your email and security answer.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- THEME CLASSES ---
  const containerClass = isAdminMode 
    ? "min-h-screen bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-slate-950 flex items-center justify-center p-4 transition-all duration-500"
    : "min-h-screen bg-gradient-to-br from-indigo-100 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-all duration-500";

  const buttonClass = isAdminMode
    ? "w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-orange-200 dark:shadow-none"
    : "w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 active:scale-95";

  const textAccent = isAdminMode ? "text-orange-600 dark:text-orange-500" : "text-indigo-600 dark:text-indigo-400";
  const iconColor = isAdminMode ? "text-orange-500" : "text-slate-400";

  // --- RENDER GOOGLE ONBOARDING ---
  if (googleOnboarding.active) {
      return (
        <div className={containerClass}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome, {googleOnboarding.name}!</h2>
                <p className="text-slate-500 mb-6">Let's finish setting up your account.</p>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                {!selectedGoogleRole ? (
                    <div className="space-y-4">
                        <p className="font-medium text-slate-700 dark:text-slate-300">I am a...</p>
                        <button onClick={() => setSelectedGoogleRole(UserRole.STUDENT)} className="w-full p-4 border rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition flex items-center gap-4">
                            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600"><UserIcon /></div>
                            <div className="text-left"><div className="font-bold text-slate-900 dark:text-white">Student</div><div className="text-xs text-slate-500">I want to order food</div></div>
                        </button>
                        <button onClick={() => setSelectedGoogleRole(UserRole.RESTAURANT)} className="w-full p-4 border rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition flex items-center gap-4">
                            <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Store /></div>
                            <div className="text-left"><div className="font-bold text-slate-900 dark:text-white">Restaurant</div><div className="text-xs text-slate-500">I want to sell food</div></div>
                        </button>
                    </div>
                ) : selectedGoogleRole === UserRole.RESTAURANT ? (
                    <div className="space-y-4 animate-in slide-in-from-right">
                        <h3 className="font-bold text-indigo-600">Restaurant Details</h3>
                        <input type="text" placeholder="Restaurant Name" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} />
                        
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label className="text-xs text-slate-500 block mb-1">Opens At</label>
                                <input type="time" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white" value={openTime} onChange={e => setOpenTime(e.target.value)} />
                             </div>
                             <div>
                                <label className="text-xs text-slate-500 block mb-1">Closes At</label>
                                <input type="time" className="w-full p-2 border rounded dark:bg-slate-800 dark:text-white" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
                             </div>
                        </div>

                        <div className="relative">
                            <CreditCard className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input type="text" placeholder="UPI ID (e.g. shop@okicici)" className="w-full pl-10 p-2 border rounded dark:bg-slate-800 dark:text-white" value={upiId} onChange={e => setUpiId(e.target.value)} />
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setSelectedGoogleRole(null)} className="flex-1 py-2 text-slate-500">Back</button>
                            <button onClick={completeGoogleSignup} disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded">{loading ? 'Saving...' : 'Complete Setup'}</button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4 animate-in slide-in-from-right">
                         <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-indigo-800 dark:text-indigo-200 text-sm">
                            Creating your Student account linked to <b>{googleOnboarding.email}</b>.
                         </div>
                         <div className="flex gap-2 mt-4">
                            <button onClick={() => setSelectedGoogleRole(null)} className="flex-1 py-2 text-slate-500">Back</button>
                            <button onClick={completeGoogleSignup} disabled={loading} className="flex-1 bg-indigo-600 text-white py-2 rounded">{loading ? 'Creating...' : 'Confirm'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )
  }

  // --- RENDER STANDARD AUTH ---
  return (
    <div className={containerClass}>
      <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8 border transition-all duration-300 ${isAdminMode ? 'border-orange-500 shadow-orange-500/20' : 'border-transparent dark:border-slate-800'} ${isRateLimited ? 'ring-4 ring-red-200 dark:ring-red-900' : ''}`}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            {isAdminMode && <ShieldAlert size={48} className="text-orange-500 animate-bounce" />}
          </div>
          <h1 
            className={`text-3xl font-bold ${textAccent} mb-2 cursor-pointer select-none`}
          >
            {isAdminMode ? 'Admin Portal' : 'Grab&Go'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isAdminMode 
                ? 'Authorized Personnel Only' 
                : (view === 'login' ? 'Welcome back! Hungry?' : view === 'signup' ? 'Create your account' : 'Recover Password')
            }
          </p>
        </div>

        {error && (
          <div className={`p-3 rounded-lg text-sm mb-6 text-center animate-pulse ${isAdminMode ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300'}`}>
            {error}
          </div>
        )}

        {/* GOOGLE BUTTON (Hide in Admin Mode, show in Login AND Signup) */}
        {(view === 'login' || view === 'signup') && !isAdminMode && (
             <div className={`mb-6 p-1 rounded-lg transition ${isRateLimited ? 'bg-indigo-100 dark:bg-indigo-900/40 p-2 scale-105 shadow-md' : ''}`}>
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        theme="outline"
                        size="large"
                        width="100%"
                        text={view === 'signup' ? "signup_with" : "signin_with"}
                    />
                </div>
                {isRateLimited && (
                    <p className="text-xs text-center text-indigo-600 dark:text-indigo-400 mt-2 font-bold">
                        Please use Google Sign-In to continue.
                    </p>
                )}
                {/* Only show "continue with email" separator on Login screen */}
                {view === 'login' && (
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with email</span></div>
                    </div>
                )}
             </div>
        )}

        {/* Manual Auth Form - Only for Login and Recover, NOT Signup */}
        <form className="space-y-4">
          
          {/* Message for Signup View */}
          {view === 'signup' && (
              <div className="text-center text-slate-500 dark:text-slate-400 py-4 px-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm">
                  <p>We now exclusively use Google for secure account creation.</p>
                  <p className="mt-2 text-xs">Existing email users can still log in below.</p>
              </div>
          )}

          {/* Input Fields (Hidden on Signup) */}
          {view !== 'signup' && (
            <>
                <div className="relative">
                    <Mail className={`absolute left-3 top-3 ${iconColor}`} size={18} />
                    <input type="email" placeholder="Email Address" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                {view !== 'recover' && (
                    <div className="relative">
                    <Lock className={`absolute left-3 top-3 ${iconColor}`} size={18} />
                    <input type="password" placeholder="Password" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                )}

                {view === 'recover' && (
                    <>
                    <div className="relative">
                        <Key className="absolute left-3 top-3 text-slate-400" size={18} />
                        <select className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)}>
                        <option value="Pet">Security Question: First Pet's Name?</option>
                        <option value="City">Security Question: Birth City?</option>
                        <option value="Color">Security Question: Favorite Color?</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Key className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="text" placeholder="Security Answer" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input type="password" placeholder="New Password" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    </>
                )}

                <button 
                    type="button" 
                    onClick={handleSmartSubmit}
                    disabled={loading} 
                    className={buttonClass}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                        {view === 'login' ? (isAdminMode ? 'Admin Login' : 'Sign In') : 'Reset Password'}
                        <ArrowRight size={18} />
                    </>
                    )}
                </button>
            </>
          )}
        </form>
        
        {isAdminMode ? (
            <div className="mt-6 text-center">
                <button onClick={() => { setIsAdminMode(false); setError(''); }} className="text-sm text-slate-500 hover:text-orange-600 underline">
                    Exit Admin Mode
                </button>
            </div>
        ) : (
            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 space-y-2">
              {view === 'login' ? (
                <>
                  <p>New here? <button onClick={() => setView('signup')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign up</button></p>
                  <p>Forgot password? <button onClick={() => setView('recover')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Reset it</button></p>
                </>
              ) : (
                <p>Already have an account? <button onClick={() => setView('login')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Log in</button></p>
              )}
            </div>
        )}
      </div>
    </div>
  );
}