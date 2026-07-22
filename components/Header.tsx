'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Kiểm tra & Lắng nghe trạng thái đăng nhập
  useEffect(() => {
    // 1. Kiểm tra session hiện tại khi load trang
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkUser();

    // 2. Lắng nghe sự kiện Đăng nhập/Đăng xuất ngay lập tức
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        router.refresh(); // Tải lại dữ liệu trang khi đăng nhập
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Đóng menu khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý Đăng xuất
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
    alert('Bác nông dân đã đăng xuất!');
    router.push('/');
    router.refresh();
  };

  // Xử lý Đổi tài khoản
  const handleSwitchAccount = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
    router.push('/login');
  };

  // Lấy tên nông dân hiển thị
  const displayName = 
    user?.user_metadata?.full_name || 
    user?.email?.split('@')[0] || 
    'Bác Nông Dân';

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b-2 border-emerald-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo Nông Trại */}
        <Link href="/" className="text-2xl font-black text-emerald-700 flex items-center gap-2 no-underline hover:text-emerald-600 transition">
          <span className="text-3xl">🚜</span>
          <span>Nông Trại Luyện Tập TOEIC</span>
        </Link>
        
        {/* Điều hướng Menu */}
        <nav className="flex items-center gap-8 font-bold">
          <Link href="/" className="text-emerald-900 hover:text-emerald-600 no-underline transition">
            Trang chủ
          </Link>
          <Link href="/exams" className="text-emerald-900 hover:text-emerald-600 no-underline transition">
            Luyện đề
          </Link>

          {/* KIỂM TRA ĐĂNG NHẬP */}
          {user ? (
            /* ĐÃ ĐĂNG NHẬP: Hiện Icon Bông Hoa 🌸 + Tên hiển thị + Menu Xổ Xuống */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="bg-emerald-100 border-2 border-emerald-300 text-emerald-800 font-extrabold px-4 py-2 rounded-full hover:bg-emerald-200 transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="text-xl">🌸</span>
                <span>{displayName}</span>
                <span className="text-xs text-emerald-600">▼</span>
              </button>

              {/* Menu xổ xuống khi click vào tên */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border-2 border-emerald-200 py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-emerald-100">
                    <p className="text-xs text-emerald-600 font-bold uppercase">Bác nông dân</p>
                    <p className="text-sm font-black text-emerald-900 truncate">{displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={handleSwitchAccount}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 cursor-pointer transition"
                  >
                    🔄 Đổi tài khoản
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* CHƯA ĐĂNG NHẬP: Hiện nút Đăng Nhập */
            <Link 
              href="/login" 
              className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-full hover:bg-emerald-700 no-underline transition shadow-md"
            >
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}