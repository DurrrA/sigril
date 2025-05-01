'use client';
import { useState } from 'react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  async function handleRegister() {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    alert(data.message);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl mb-4">Register</h1>
        {Object.keys(form).map((key) => (
            <input
            key={key}
            type={key === 'password' ? 'password' : 'text'}
            placeholder={key}
            value={form[key as keyof typeof form]}
            onChange={e => setForm({ ...form, [key]: key === 'role_id' ? Number(e.target.value) : e.target.value })}
            className="border p-2 mb-2"
            />
        ))}
        <button onClick={handleRegister} className="bg-green-500 text-white p-2">Register</button>
        <button onClick={() => window.location.href = '/api/auth/google/redirect'}>
            Login with Google
        </button>
    </div>
  );
}
