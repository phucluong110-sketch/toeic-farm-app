'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';

export default function DoExamPage() {
  const { id } = useParams();

  const [questionGroups, setQuestionGroups] = useState<any[][]>([]);
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPart, setSelectedPart] = useState<number | 'all'>(1);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  // Bộ nhớ đệm lưu danh sách ID câu hỏi vừa làm để TRÁNH TRÙNG LẶP khi bấm đổi câu
  const previousQuestionIds = useRef<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchExamData();
    }
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [id, selectedPart]);

  const shuffleArray = (array: any[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const fetchExamData = async () => {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const { data: examData } = await supabase.from('exams').select('*').eq('id', id).single();
    setExam(examData);

    let query = supabase.from('questions').select('*').eq('exam_id', id);
    if (selectedPart !== 'all') {
      query = query.eq('part', selectedPart);
    }

    const { data: qData } = await query;

    if (qData && qData.length > 0) {
      // 1. Gom nhóm câu hỏi
      const groupsMap: { [key: string]: any[] } = {};
      qData.forEach((q) => {
        const key = q.passage_text ? `passage_${q.passage_text.trim()}` : q.image_url ? `img_${q.image_url}` : `single_${q.id}`;
        if (!groupsMap[key]) groupsMap[key] = [];
        groupsMap[key].push(q);
      });

      let allGroups: any[][] = Object.values(groupsMap);

      // 2. LỌC TRÁNH TRÙNG LẶP CÂU HỎI VỪA LÀM
      let freshGroups = allGroups.filter(group => {
        const groupFirstId = group[0].id.toString();
        return !previousQuestionIds.current.includes(groupFirstId);
      });

      // Nếu kho đã bốc hết câu mới -> Reset lại danh sách để bốc lại từ đầu
      if (freshGroups.length === 0) {
        freshGroups = allGroups;
        previousQuestionIds.current = [];
      }

      // 3. Xáo trộn nhóm chưa làm
      let finalGroups = shuffleArray(freshGroups);

      // 4. Cắt giới hạn số lượng câu hiển thị mỗi lượt
      if (selectedPart === 1) finalGroups = finalGroups.slice(0, 2); 
      else if (selectedPart === 2) finalGroups = finalGroups.slice(0, 5); 
      else if (selectedPart === 5) finalGroups = finalGroups.slice(0, 3);
      else if ([3, 4, 6, 7].includes(selectedPart as number)) finalGroups = finalGroups.slice(0, 1);

      // Lưu các ID vừa bốc vào bộ nhớ đệm
      finalGroups.forEach(group => {
        previousQuestionIds.current.push(group[0].id.toString());
      });

      // 5. Tráo ngẫu nhiên thứ tự đáp án A, B, C, D
      finalGroups = finalGroups.map((group) => {
        return group.map((q) => {
          const rawOptions = [
            { key: 'A', text: q.option_a }, { key: 'B', text: q.option_b }, { key: 'C', text: q.option_c },
            ...(q.part !== 2 && q.option_d ? [{ key: 'D', text: q.option_d }] : [])
          ];
          const originalCorrectText = rawOptions.find(o => o.key === q.correct_option)?.text;
          const shuffledOpts = shuffleArray(rawOptions);
          const newQ = { ...q };

          shuffledOpts.forEach((optObj, idx) => {
            const optLetter = String.fromCharCode(65 + idx);
            if (optLetter === 'A') newQ.option_a = optObj.text;
            if (optLetter === 'B') newQ.option_b = optObj.text;
            if (optLetter === 'C') newQ.option_c = optObj.text;
            if (optLetter === 'D') newQ.option_d = optObj.text;
            if (optObj.text === originalCorrectText) newQ.correct_option = optLetter;
          });
          return newQ;
        });
      });

      setQuestionGroups(finalGroups);
    } else {
      setQuestionGroups([]);
    }
    setLoading(false);
  };

  const playSpeechForGroup = (passageText: string, groupQuestions: any[], groupId: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking === groupId) {
      setIsSpeaking(null);
      return;
    }

    let textToRead = '';
    if (passageText) textToRead += `${passageText}. `;
    groupQuestions.forEach((q, idx) => {
      textToRead += `Question ${idx + 1}: ${q.question_text}. `;
      if (q.part === 2) {
        textToRead += `Option A: ${q.option_a}. Option B: ${q.option_b}. Option C: ${q.option_c}. `;
      } else {
        textToRead += `Option A: ${q.option_a}. Option B: ${q.option_b}. Option C: ${q.option_c}. Option D: ${q.option_d || ''}. `;
      }
    });

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onstart = () => setIsSpeaking(groupId);
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const getTotalQuestionsCount = () => questionGroups.reduce((acc, g) => acc + g.length, 0);

  const calculateScore = () => {
    let correct = 0;
    questionGroups.forEach((g) => {
      g.forEach((q) => { if (answers[q.id] === q.correct_option) correct++; });
    });
    return correct;
  };

  const goToNextPart = () => {
    if (typeof selectedPart === 'number' && selectedPart < 7) {
      setSelectedPart(selectedPart + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50/60 font-black text-emerald-800 text-lg">
        🚜 Đang lọc câu hỏi mới cho bác...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-amber-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-emerald-300">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b-2 border-emerald-100 mb-6 gap-4">
          <div>
            <Link href="/exams" className="text-xs font-black text-emerald-600 uppercase no-underline hover:underline flex items-center gap-1">
              ← Quay lại danh sách đề
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-emerald-950 mt-1">
              {exam?.title || 'Luyện Thi TOEIC Từng Phần'} 🌾
            </h1>
          </div>

          {submitted && (
            <div className="bg-amber-100 border-2 border-amber-400 px-5 py-2.5 rounded-2xl text-amber-900 font-black shadow-sm">
              🎉 Kết quả: {calculateScore()} / {getTotalQuestionsCount()} Câu
            </div>
          )}
        </div>

        {/* Thanh chọn Part */}
        <div className="mb-8 p-4 bg-emerald-50/60 rounded-2xl border-2 border-emerald-200">
          <p className="text-xs font-black text-emerald-800 uppercase mb-2 tracking-wide">
            🎯 Chọn Part luyện tập:
          </p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((partNum) => (
              <button
                key={partNum}
                onClick={() => setSelectedPart(partNum)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  selectedPart === partNum ? 'bg-emerald-600 text-white shadow' : 'bg-white text-emerald-800 border border-emerald-300'
                }`}
              >
                Part {partNum}
              </button>
            ))}
          </div>
        </div>

        {questionGroups.length === 0 ? (
          <div className="p-8 text-center bg-amber-50 rounded-2xl border-2 border-amber-200">
            <p className="text-xl font-bold text-amber-900 mb-2">🌾 Đề này hiện chưa có câu hỏi Part {selectedPart}!</p>
            <p className="text-xs text-amber-700">Bác hãy thử bấm chọn sang Part khác ở thanh công cụ phía trên nhé.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {questionGroups.map((group, groupIdx) => {
              const firstQ = group[0];
              const groupId = `group_${groupIdx}_${firstQ.id}`;

              return (
                <div key={groupId} className="p-6 rounded-3xl border-2 border-emerald-300 bg-emerald-50/20 shadow-md">
                  
                  {/* Header Cụm */}
                  <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                    <span className="bg-emerald-700 text-white px-3.5 py-1 rounded-xl text-xs font-black uppercase shadow">
                      Part {firstQ.part} {group.length > 1 ? `- Cụm ${group.length} câu hỏi` : ''}
                    </span>
                    {firstQ.part <= 4 && (
                      <button
                        onClick={() => playSpeechForGroup(firstQ.passage_text, group, groupId)}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition shadow cursor-pointer ${
                          isSpeaking === groupId ? 'bg-rose-500 text-white animate-pulse' : 'bg-teal-600 hover:bg-teal-700 text-white'
                        }`}
                      >
                        {isSpeaking === groupId ? '🛑 Đang đọc (Bấm để Dừng)' : '🔊 Bấm để Nghe Audio'}
                      </button>
                    )}
                  </div>

                  {firstQ.image_url && (
                    <div className="mb-4 flex justify-center">
                      <img src={firstQ.image_url} alt="TOEIC Part 1" className="max-h-72 rounded-2xl border-4 border-white shadow-md object-cover" />
                    </div>
                  )}

                  {firstQ.passage_text && (submitted || firstQ.part >= 5) && (
                    <div className="mb-6 p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl text-amber-950 font-serif whitespace-pre-line text-sm leading-relaxed shadow-xs">
                      <p className="text-xs font-black text-amber-800 uppercase mb-2 tracking-wide font-sans">📜 Đoạn văn / Transcript bài nói:</p>
                      {firstQ.passage_text}
                    </div>
                  )}

                  {firstQ.passage_text && (firstQ.part === 3 || firstQ.part === 4) && !submitted && (
                    <div className="mb-6 p-4 bg-teal-50 border-l-4 border-teal-500 rounded-r-2xl text-teal-900 text-xs font-medium">
                      🎧 <b>Lưu ý:</b> Bấm nút nghe Audio để làm bài. Script bài nghe sẽ tự mở ra sau khi nộp bài để xem lại.
                    </div>
                  )}

                  <div className="space-y-6">
                    {group.map((q, qIdx) => {
                      const isSelected = (opt: string) => answers[q.id] === opt;
                      const isCorrect = (opt: string) => q.correct_option === opt;
                      const optionsList = q.part === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];

                      return (
                        <div key={q.id} className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs">
                          <p className="font-extrabold text-emerald-950 text-base mb-3 leading-relaxed">
                            <span className="text-emerald-700 font-black mr-2">Câu {q.question_number || (groupIdx + 1) * 3 - 2 + qIdx}:</span> 
                            {q.question_text}
                          </p>
                          <div className={`grid gap-2.5 mb-3 ${q.part === 2 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                            {optionsList.map((opt) => {
                              const optKey = `option_${opt.toLowerCase()}`;
                              let btnStyle = "bg-white border-2 border-emerald-100 text-emerald-900 hover:bg-emerald-50";

                              if (submitted) {
                                if (isCorrect(opt)) btnStyle = "bg-emerald-500 border-2 border-emerald-700 text-white font-bold shadow";
                                else if (isSelected(opt) && !isCorrect(opt)) btnStyle = "bg-rose-500 border-2 border-rose-700 text-white font-bold shadow";
                                else btnStyle = "bg-gray-100 border-gray-200 text-gray-400 opacity-60";
                              } else if (isSelected(opt)) {
                                btnStyle = "bg-emerald-600 text-white font-extrabold border-2 border-emerald-800 shadow-md";
                              }

                              return (
                                <button key={opt} onClick={() => handleSelectOption(q.id, opt)} className={`p-3 rounded-xl text-left transition flex items-center gap-2.5 cursor-pointer text-xs md:text-sm ${btnStyle}`}>
                                  <span className="font-black border px-2 py-0.5 rounded-lg bg-white/20">{opt}</span>
                                  <span>{(q.part === 1 || q.part === 2) && !submitted ? `(Nghe audio chọn ${opt})` : q[optKey]}</span>
                                </button>
                              );
                            })}
                          </div>
                          {submitted && (
                            <div className="mt-3 p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 text-xs leading-relaxed">
                              <p className="font-bold text-amber-900 mb-1">💡 Giải thích đáp án:</p>
                              <p>{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 space-y-3">
          {!submitted && getTotalQuestionsCount() > 0 && (
            <button onClick={() => setSubmitted(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-lg shadow-xl border-b-4 border-emerald-900 transition hover:scale-[1.01] cursor-pointer">
              Thu Hoạch Bài Làm (Xem Đáp Án) 🚜
            </button>
          )}

          {submitted && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={fetchExamData} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-3.5 rounded-2xl shadow-md border-b-4 border-amber-800 transition hover:scale-[1.01] cursor-pointer text-center">
                🔄 Đổi Bộ Câu Hỏi Khác (Không trùng)
              </button>
              {typeof selectedPart === 'number' && selectedPart < 7 && (
                <button onClick={goToNextPart} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-black py-3.5 rounded-2xl shadow-md border-b-4 border-teal-900 transition hover:scale-[1.01] cursor-pointer text-center">
                  ➡️ Chuyển sang Part {selectedPart + 1}
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}