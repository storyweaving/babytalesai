
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ToastType } from '../../types';

const Auth: React.FC = () => {
    const { signUp, signIn, dispatch } = useAppContext();
    const [isLogin, setIsLogin] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { data, error } = await signIn({ email, password });
                if (error) throw error;
                if (data.session) {
                    dispatch({ type: 'ADD_TOAST', payload: { message: `Welcome back!`, type: ToastType.Success } });
                }
            } else { // Sign up
                // First, create the user account.
                const { error: signUpError } = await signUp({
                    email,
                    password,
                    options: { data: { name } },
                });

                if (signUpError) {
                    throw signUpError;
                }

                // Immediately attempt to sign in the new user.
                // This provides a seamless experience if email verification is off.
                const { data: signInData, error: signInError } = await signIn({ email, password });

                if (signInError) {
                    // If sign-in fails (e.g., due to email verification being on),
                    // Supabase returns "Email not confirmed". We intercept this to avoid
                    // mentioning verification, as requested.
                    throw signInError;
                }
                
                if (signInData.session) {
                    dispatch({ type: 'ADD_TOAST', payload: { message: `Welcome ${name}! Your account is ready.`, type: ToastType.Success } });
                } else {
                    // This is an unlikely fallback.
                    throw new Error('Account created, but an unexpected error occurred during login.');
                }
            }
        } catch (err: any) {
            let message = err.message || 'An unexpected error occurred.';
            // As requested, replace the specific email confirmation error with a generic one.
            if (message === 'Email not confirmed') {
                message = 'Invalid login credentials.';
            }
            setError(message);
            dispatch({ type: 'ADD_TOAST', payload: { message, type: ToastType.Error } });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isLogin ? 'Sign in to continue your story.' : 'Start your writing journey today.'}
                    </p>
                </div>

                {error && (
                     <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 dark:disabled:bg-green-800"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                        </button>
                    </div>
                </form>

                <div className="mt-2 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
                    >
                        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;