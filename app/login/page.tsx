'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase'; // Kết nối công cụ Supabase vừa tạo

export default function LoginPage() {
  const router = useRouter();

  // Trạng thái Form
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Dữ liệu người dùng nhập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Xử lý gửi Form Đăng nhập / Đăng ký thật lên Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (isLogin) {
        // 1. Xử lý ĐĂNG NHẬP
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        alert('🎉 Đăng nhập thành công! Chào mừng bác nông dân quay trở lại.');
        router.push('/'); // Tự động đưa bác nông dân về Trang chủ
        router.refresh();

      } else {
        // 2. Xử lý ĐĂNG KÝ
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName, // Lưu tên nông dân
            },
          },
        });

        if (error) throw error;

        alert('🌱 Đăng ký thành công! Bạn đã có tài khoản Nông dân mới.');
        setIsLogin(true); // Chuyển sang giao diện Đăng nhập
      }
    } catch (error: any) {
      // Hiển thị thông báo lỗi thân thiện
      setErrorMessage(error.message || 'Đã có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Nền trang trí */}
      <div className="absolute top-10 left-10 text-6xl opacity-40 select-none animate-pulse">☀️</div>
      <div className="absolute top-12 right-20 text-5xl opacity-40 select-none">☁️</div>
      <div className="absolute bottom-6 left-16 text-6xl opacity-30 select-none">🐄</div>
      <div className="absolute bottom-8 right-16 text-6xl opacity-30 select-none">🐕</div>

      {/* Card Form */}
      <div className="bg-white/95 backdrop-blur-md w-full max-w-md rounded-3xl p-8 shadow-2xl border-4 border-emerald-400 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-amber-100 border-4 border-amber-400 rounded-full flex items-center justify-center mx-auto text-4xl mb-3 shadow-inner">
            {isLogin ? '🧑‍🌾' : '🐣'}
          </div>
          <h1 className="text-3xl font-black text-emerald-800">
            {isLogin ? 'Cổng Vào Nông Trại' : 'Gia Nhập Nông Trại'}
          </h1>
          <p className="text-sm font-semibold text-emerald-600 mt-1">
            {isLogin 
              ? 'Đăng nhập để tiếp tục tích điểm & cày đề!' 
              : 'Tạo tài khoản nông dân để lưu trữ kết quả nhé!'}
          </p>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 font-bold p-3 rounded-2xl mb-4 text-xs text-center">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Tab Chuyển đổi */}
        <div className="flex bg-emerald-100 p-1.5 rounded-2xl mb-6 border border-emerald-300">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl text-sm font-extrabold transition cursor-pointer ${
              isLogin 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-emerald-800 hover:bg-emerald-200/50'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-xl text-sm font-extrabold transition cursor-pointer ${
              !isLogin 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-emerald-800 hover:bg-emerald-200/50'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Form điền thông tin */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div>
              <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider mb-1">
                Tên Bác Nông Dân 🌾
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nông Dân Cày TOEIC"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none font-medium text-emerald-900 bg-emerald-50/30"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider mb-1">
              Địa Chỉ Email 📩
            </label>
            <input
              type="email"
              required
              placeholder="nongdan@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none font-medium text-emerald-900 bg-emerald-50/30"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-emerald-900 uppercase tracking-wider mb-1">
              Mật Khẩu 🔑
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:outline-none font-medium text-emerald-900 bg-emerald-50/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 rounded-2xl shadow-lg border-b-4 border-amber-700 text-base transition hover:scale-[1.02] cursor-pointer mt-2 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : isLogin ? 'Mở Cổng Vô Nông Trại 🚜' : 'Tạo Thẻ Nông Dân Mới 🐣'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-emerald-100 pt-4">
          <Link href="/" className="text-xs font-bold text-emerald-700 hover:text-emerald-900 no-underline">
            ← Quay lại Trang Chủ
          </Link>
        </div>

      </div>
    </main>
  );
}