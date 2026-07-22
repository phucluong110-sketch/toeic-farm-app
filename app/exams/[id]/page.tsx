"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// 🎲 Thuật toán Fisher-Yates (Xáo trộn 100% không trùng lặp)
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

        // Bọc an toàn: Chỉ gọi Supabase khi đã có đủ Keys
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
        console.error("Lỗi kết nối:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [examId]);

  const handleSelectOption = (qIndex: number, option: string) => {
    setUserAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
        ⏳ Đang tải bộ đề thi #{examId}... Bác chờ xíu nhé!
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
        📭 Chưa có câu hỏi nào trong Database.<br /><br />
        Bác hãy truy cập trang <b>/admin</b> để bấm nút sinh câu hỏi từ Gemini AI nhé!
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>📝 Đề Thi TOEIC #{examId}</h1>
      <p style={{ color: "#666" }}>Tổng số câu hỏi: {questions.length} câu (Đã xáo trộn ngẫu nhiên)</p>
      <hr style={{ margin: "20px 0" }} />

      {questions.map((q, idx) => (
        <div
          key={q.id || idx}
          style={{
            marginBottom: "25px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fff",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Câu {idx + 1}: {q.question_text}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
            {["A", "B", "C", "D"].map((optKey) => {
              const optText = q[`option_${optKey.toLowerCase()}`];
              if (!optText) return null;
              const isSelected = userAnswers[idx] === optKey;

              return (
                <button
                  key={optKey}
                  onClick={() => handleSelectOption(idx, optKey)}
                  style={{
                    padding: "10px 15px",
                    textAlign: "left",
                    backgroundColor: isSelected ? "#e6f0ff" : "#f9f9f9",
                    border: isSelected ? "2px solid #0070f3" : "1px solid #ccc",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: isSelected ? "bold" : "normal",
                  }}
                >
                  <b>{optKey}.</b> {optText}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#f0fdf4", borderRadius: "6px" }}>
              <p style={{ margin: 0, color: "#166534", fontWeight: "bold" }}>
                Đáp án đúng: {q.correct_option}
              </p>
              <p style={{ margin: "5px 0 0 0", color: "#374151" }}>💡 {q.explanation}</p>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => setShowResult(!showResult)}
        style={{
          padding: "12px 24px",
          backgroundColor: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        {showResult ? "Ẩn đáp án" : "Nộp bài & Xem đáp án"}
      </button>
    </div>
  );
}