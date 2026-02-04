import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { Lock, Mail, User as UserIcon, Phone, Key, ArrowRight, Loader2, Store, Clock, CreditCard } from 'lucide-react';
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
  const [secretCount, setSecretCount] = useState(0);

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
  
  // Restaurant Details (Hours & UPI)
  const [restHours, setRestHours] = useState('10:00 AM - 10:00 PM');
  const [upiId, setUpiId] = useState('');

  const handleSecretClick = async () => {
    const newCount = secretCount + 1;
    setSecretCount(newCount);
    if (newCount === 5) {
      setLoading(true);
      await login('admin@campus.edu', 'password');
      setLoading(false);
      setSecretCount(0);
    }
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
    
    // Validation for Restaurant
    if (selectedGoogleRole === UserRole.RESTAURANT) {
        if (!restaurantName || !upiId || !restHours) {
            setError("Please fill all restaurant details");
            return;
        }
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
            hours: restHours,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'login') {
        const success = await login(email, password);
        if (!success) setError('Invalid credentials');
      } else if (view === 'signup') {
        await signup({ name, email, phone, role, password, securityQuestion, securityAnswer }, restaurantName);
        setView('login');
        setError('Account created! Please login.');
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

  // --- RENDER GOOGLE ONBOARDING ---
  if (googleOnboarding.active) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
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
                        
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input type="text" placeholder="Hours (e.g. 9 AM - 10 PM)" className="w-full pl-10 p-2 border rounded dark:bg-slate-800 dark:text-white" value={restHours} onChange={e => setRestHours(e.target.value)} />
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-8 border border-transparent dark:border-slate-800 transition-colors duration-200">
        <div className="text-center mb-8">
          <h1 
            onClick={handleSecretClick}
            className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 cursor-pointer select-none active:scale-95 transition-transform"
            title="Tap 5 times for Admin"
          >
            Grab&Go
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {view === 'login' ? 'Welcome back! Hungry?' : view === 'signup' ? 'Create your account' : 'Recover Password'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        {/* GOOGLE BUTTON */}
        {view === 'login' && (
             <div className="mb-6">
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Login Failed')}
                        theme="outline"
                        size="large"
                        width="100%"
                    />
                </div>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with email</span></div>
                </div>
             </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'signup' && (
            <>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                <input required type="text" placeholder="Full Name" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                <input required type="tel" placeholder="Phone Number" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
            <input required type="email" placeholder="Email Address" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          {view !== 'recover' && (
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input required type="password" placeholder="Password" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={password} onChange={e => setPassword(e.target.value)} />
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
                <input required type="text" placeholder="Security Answer" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input required type="password" placeholder="New Password" className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
            </>
          )}

          {view === 'signup' && (
            <>
               <div className="relative">
                <Key className="absolute left-3 top-3 text-slate-400" size={18} />
                <select className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)}>
                  <option value="Pet">Security Q: First Pet's Name?</option>
                  <option value="City">Security Q: Birth City?</option>
                  <option value="Color">Security Q: Favorite Color?</option>
                </select>
              </div>
              <input required type="text" placeholder="Security Answer" className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} />

              <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button type="button" onClick={() => setRole(UserRole.STUDENT)} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${role === UserRole.STUDENT ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>Student</button>
                <button type="button" onClick={() => setRole(UserRole.RESTAURANT)} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${role === UserRole.RESTAURANT ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>Restaurant</button>
              </div>

              {role === UserRole.RESTAURANT && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                  <input required type="text" placeholder="Restaurant Name" className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} />
                </div>
              )}
            </>
          )}

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Reset Password'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

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
      </div>
    </div>
  );
}