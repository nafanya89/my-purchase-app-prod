import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ADMIN_EMAIL } from '../../config/firebase';

export const AuthScreen = ({ auth }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError("Будь ласка, введіть email та пароль."); return; }
        try {
            if (isLogin) { 
                await signInWithEmailAndPassword(auth, email, password); 
            } else { 
                if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
                    setError("Реєстрація наразі закрита для нових користувачів.");
                    return;
                }
                await createUserWithEmailAndPassword(auth, email, password); 
            }
        } catch (err) {
            console.error("Auth error:", err.code);
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-credential': setError('Неправильний email або пароль.'); break;
                case 'auth/email-already-in-use': setError('Цей email вже використовується. Спробуйте увійти.'); break;
                case 'auth/weak-password': setError('Пароль занадто слабкий (мінімум 6 символів).'); break;
                default: setError('Помилка автентифікації. Спробуйте ще раз.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white">{isLogin ? 'Вхід' : 'Реєстрація'}</h1>
                <div className="flex justify-center border-b border-slate-200 dark:border-slate-600">
                    <button onClick={() => setIsLogin(true)} className={`px-4 py-2 text-lg font-medium ${isLogin ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>Вхід</button>
                    <button onClick={() => setIsLogin(false)} className={`px-4 py-2 text-lg font-medium ${!isLogin ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>Реєстрація</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />} {isLogin ? 'Увійти' : 'Створити акаунт'}
                    </button>
                </form>
            </div>
        </div>
    );
};
