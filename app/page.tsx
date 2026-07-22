'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ExamsListPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'listening' | 'reading'>('all');

  // Danh sách 4 bộ đề chuẩn tương ứng với dữ liệu trong Supabase
  const examsList = [
    {
      id: 1,
      title: 'Luyện Tai Part 1 & Part 2',
      category: 'listening',
      badge: 'Dễ trúng',
      badgeColor: 'bg-blue-500 text-white',
      borderColor: 'border-blue-300 hover:border-blue-500',
      typeText: 'Listening (30 câu)',
      timeText: '20 phút',
      statsText: '3,100 bác nông dân đã thu hoạch',
      icon: '🐄'
    },
    {
      id: 2,
      title: 'Hội thoại & Đoạn nói Part 3 & Part 4',
      category: 'listening',
      badge: 'Tăng tốc',
      badgeColor: 'bg-cyan-500 text-white',
      borderColor: 'border-cyan-300 hover:border-cyan-500',
      typeText: 'Listening (39 câu)',
      timeText: '30 phút',
      statsText: '1,850 bác nông dân đã thu hoạch',
      icon: '🐥'
    },
    {
      id: 3,
      title: 'Mini Test Ngữ Pháp Part 5 & Part 6',
      category: 'reading',
      badge: 'Ôn nhanh',
      badgeColor: 'bg-purple-500 text-white',
      borderColor: 'border-purple-300 hover:border-purple-500',
      typeText: 'Reading (50 câu)',
      timeText: '30 phút',
      statsText: '2,150 bác nông dân đã thu hoạch',
      icon: '🐕'
    },
    {
      id: 4,
      title: 'Đọc Hiểu Đoạn Văn Part 7',
      category: 'reading',
      badge: 'Bứt phá 800+',
      badgeColor: 'bg-rose-500 text-white',
      borderColor: 'border-rose-300 hover:border-rose-500',
      typeText: 'Reading (54 câu)',
      timeText: '50 phút',
      statsText: '1,620 bác nông dân đã thu hoạch',
      icon: '🐎'
    }
  ];

  // Lọc đề thi theo Tab
  const filteredExams = examsList.filter(exam => {
    if (activeTab === 'listening') return exam.category === 'listening';
    if (activeTab === 'reading') return exam.category === 'reading';
    return true;
  });

  return (
    <div className="min-h-screen bg-emerald-50/50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Banner Nông Trại */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="bg-amber-400 text-emerald-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
              🌾 Kho Đề Thi Nông Trại
            </span>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              Cánh Đồng Đề Thi TOEIC 🌾
            </h1>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
              Chọn một mảnh đất đề thi, cày cuốc hoàn thành bài làm và gặt hái điểm số thật cao ngay hôm nay!
            </p>
          </div>
        </div>

        {/* Thanh Lọc Bộ Đề (Đã bỏ nút Full Test 200 câu) */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            🌾 Tất cả đề thi ({examsList.length})
          </button>
          <button
            onClick={() => setActiveTab('listening')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition cursor-pointer ${
              activeTab === 'listening'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            🎧 Part 1-4 (Listening)
          </button>
          <button
            onClick={() => setActiveTab('reading')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition cursor-pointer ${
              activeTab === 'reading'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            🦅 Part 5-7 (Reading)
          </button>
        </div>

        {/* Lưới Danh Sách Đề (Chỉ còn 4 thẻ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className={`bg-white rounded-3xl p-6 border-2 transition shadow-sm hover:shadow-md flex flex-col justify-between ${exam.borderColor}`}
            >
              <div>
                {/* Header Thẻ đề */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-3xl">{exam.icon}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${exam.badgeColor}`}>
                    {exam.badge}
                  </span>
                </div>

                {/* Tên đề */}
                <h2 className="text-xl font-extrabold text-gray-900 mb-3">
                  {exam.title}
                </h2>

                {/* Thời gian & Số câu */}
                <div className="flex gap-2 mb-4">
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-lg font-medium">
                    📄 {exam.typeText}
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-lg font-medium">
                    ⏱️ {exam.timeText}
                  </span>
                </div>
              </div>

              {/* Thống kê & Nút Bắt đầu */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 font-medium">
                  👨‍🌾 {exam.statsText}
                </span>
                <Link
                  href={`/exams/${exam.id}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1 no-underline"
                >
                  Bắt đầu cày đề 🚜
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}