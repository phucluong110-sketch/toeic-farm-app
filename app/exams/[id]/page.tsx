"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// 🎲 Thuật toán Fisher-Yates (Xáo trộn chuẩn không bao giờ lặp)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ExamDetailPage() {
  const params = useParams();
  const examId = params?.id || "1";

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          setLoading(false);
          return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase.from("questions").select("*");

        if (data && data.length > 0) {
          setQuestions(shuffleArray(data));
        }
      } catch (err) {
        console.error("Lỗi tải câu hỏi:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [examId]);

  const handleSelectOption = (qIndex: number, option: string) => {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_option) correct++;
    });
    return correct;
  };

  if (loading) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", fontFamily: "sans-serif", backgroundColor: "#0f172a", minHeight: "100vh", color: "#94a3b8" }}>
        <div style={{ fontSize: "32px", marginBottom: "10px" }}>⚡</div>
        <p style={{ fontSize: "18px", fontWeight: "600" }}>Đang tải bộ đề thi TOEIC #{examId}...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", fontFamily: "sans-serif", backgroundColor: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>📭</div>
        <h2>Chưa có câu hỏi nào trong đề thi này</h2>
        <p style={{ color: "#94a3b8" }}>Bác hãy vào trang <b>/admin</b> để bấm nút sinh câu hỏi mới nhé!</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "#f8fafc", padding: "30px 15px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "850px", margin: "0 auto" }}>
        
        {/* Header Đề Thi */}
        <div style={{ backgroundColor: "#1e293b", padding: "24px", borderRadius: "16px", marginBottom: "25px", border: "1px solid #334155" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ backgroundColor: "#16a34a", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                TOEIC PRACTICE
              </span>
              <h1 style={{ margin: "10px 0 5px 0", fontSize: "24px", color: "#38bdf8" }}>📝 Đề Thi TOEIC #{examId}</h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
                Tổng số câu hỏi: <b>{questions.length} câu</b> (Đã xáo trộn ngẫu nhiên)
              </p>
            </div>
            {showResult && (
              <div style={{ backgroundColor: "#065f46", padding: "12px 20px", borderRadius: "12px", textAlign: "center", border: "1px solid #10b981" }}>
                <div style={{ fontSize: "12px", textTransform: "uppercase", opacity: 0.8, color: "#a7f3d0" }}>Kết Quả Luyện Tập</div>
                <div style={{ fontSize: "22px", fontWeight: "bold", color: "#4ade80" }}>
                  {calculateScore()} / {questions.length} Câu
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách các câu hỏi */}
        {questions.map((q, idx) => {
          const userChoice = userAnswers[idx];
          const isCorrect = userChoice === q.correct_option;

          return (
            <div
              key={q.id || idx}
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "20px",
                border: "1px solid #334155",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
              }}
            >
              {/* Nhãn Part & Trạng Thái Đáp Án */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <span style={{ backgroundColor: "#0284c7", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                  {q.part || `Part ${idx % 2 === 0 ? "5" : "7"}`}
                </span>
                {showResult && (
                  <span style={{ backgroundColor: isCorrect ? "#16a34a" : "#dc2626", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                    {isCorrect ? "Đúng ✅" : "Sai ❌"}
                  </span>
                )}
              </div>

              {/* 🎧 Loa phát Audio MP3 (Nếu câu hỏi có trường audio_url) */}
              {q.audio_url && (
                <div style={{ margin: "15px 0", padding: "14px", backgroundColor: "#0f172a", borderRadius: "12px", border: "1px solid #0284c7" }}>
                  <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#38bdf8", fontWeight: "bold" }}>
                    🎧 Băng Nghe (Listening Audio):
                  </p>
                  <audio controls style={{ width: "100%" }}>
                    <source src={q.audio_url} type="audio/mpeg" />
                    Trình duyệt không hỗ trợ phát âm thanh.
                  </audio>
                </div>
              )}

              {/* 🖼️ Hình ảnh đề thi (Nếu câu hỏi có trường image_url) */}
              {q.image_url && (
                <div style={{ margin: "15px 0", textAlign: "center" }}>
                  <img
                    src={q.image_url}
                    alt={`Minh họa câu hỏi ${idx + 1}`}
                    style={{ maxWidth: "100%", maxHeight: "380px", borderRadius: "12px", border: "1px solid #475569" }}
                  />
                </div>
              )}

              {/* Nội dung câu hỏi */}
              <h3 style={{ fontSize: "16px", color: "#f1f5f9", lineHeight: "1.6", marginTop: "10px", marginBottom: "18px" }}>
                <span style={{ color: "#38bdf8", marginRight: "6px" }}>Câu {idx + 1}:</span> {q.question_text}
              </h3>

              {/* Lựa chọn A, B, C, D */}
              <div style={{ display: "grid", gap: "10px" }}>
                {["A", "B", "C", "D"].map((optKey) => {
                  const optText = q[`option_${optKey.toLowerCase()}`];
                  if (!optText) return null;

                  const isSelected = userChoice === optKey;
                  let btnBg = "#0f172a";
                  let btnBorder = "#334155";
                  let btnColor = "#cbd5e1";

                  if (showResult) {
                    if (optKey === q.correct_option) {
                      btnBg = "#064e3b";
                      btnBorder = "#10b981";
                      btnColor = "#6ee7b7";
                    } else if (isSelected && !isCorrect) {
                      btnBg = "#7f1d1d";
                      btnBorder = "#ef4444";
                      btnColor = "#fca5a5";
                    }
                  } else if (isSelected) {
                    btnBg = "#1e3a8a";
                    btnBorder = "#3b82f6";
                    btnColor = "#93c5fd";
                  }

                  return (
                    <button
                      key={optKey}
                      onClick={() => !showResult && handleSelectOption(idx, optKey)}
                      style={{
                        padding: "12px 18px",
                        textAlign: "left",
                        backgroundColor: btnBg,
                        border: `2px solid ${btnBorder}`,
                        color: btnColor,
                        borderRadius: "10px",
                        cursor: showResult ? "default" : "pointer",
                        fontWeight: isSelected ? "bold" : "normal",
                        fontSize: "15px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <b style={{ color: "#38bdf8", marginRight: "8px" }}>{optKey}.</b> {optText}
                    </button>
                  );
                })}
              </div>

              {/* Giải thích chi tiết đáp án */}
              {showResult && (
                <div style={{ marginTop: "18px", padding: "14px", backgroundColor: "#0f172a", borderRadius: "10px", borderLeft: "4px solid #10b981" }}>
                  <div style={{ fontWeight: "bold", color: "#34d399", marginBottom: "4px" }}>
                    💡 Lời Giải Chi Tiết (Đáp án {q.correct_option}):
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" }}>
                    {q.explanation || "Chưa có lời giải thích chi tiết cho câu hỏi này."}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Nút Nộp Bài / Xáo Trộn Lại */}
        <div style={{ textAlign: "center", marginTop: "30px", marginBottom: "60px" }}>
          <button
            onClick={() => setShowResult(!showResult)}
            style={{
              padding: "14px 36px",
              backgroundColor: showResult ? "#475569" : "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0 4px 14px rgba(22, 163, 74, 0.4)",
            }}
          >
            {showResult ? "🔄 Đóng Lời Giải & Làm Lại" : "🚀 Nộp Bài & Xem Chi Tiết Đáp Án"}
          </button>
        </div>

      </div>
    </div>
  );
}