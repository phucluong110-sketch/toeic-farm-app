"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Hàm phát âm tiếng Anh giọng Mỹ chuẩn qua Web Speech API
function playEnglishAudio(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel(); // Dừng câu cũ
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9; // Tốc độ đọc chuẩn thi TOEIC
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Trình duyệt của bác không hỗ trợ đọc âm thanh tự động.");
  }
}

export default function ExamDetailPage() {
  const params = useParams();
  const examId = params?.id || "1";

  const [activePart, setActivePart] = useState<string>("ALL");
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

        let dbQuestions: any[] = [];
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data } = await supabase.from("questions").select("*");
          if (data) dbQuestions = data;
        }

        // Dữ liệu bộ đề mẫu chuẩn định dạng TOEIC ETS
        const realToeicDataset = [
          // PART 1: PHOTOGRAPHS
          {
            id: 101,
            part: "PART1",
            question_text: "Look at the picture and select the statement that best describes what you see.",
            image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop",
            audio_script: "Statement A: A woman is typing on a laptop keyboard. Statement B: A woman is holding a cup of coffee. Statement C: The monitors are turned off. Statement D: She is opening a glass door.",
            option_a: "A woman is typing on a laptop keyboard.",
            option_b: "A woman is holding a cup of coffee.",
            option_c: "The monitors are turned off.",
            option_d: "She is opening a glass door.",
            correct_option: "A",
            explanation: "Trong hình người phụ nữ đang tập trung gõ bàn phím laptop -> Chọn đáp án A."
          },
          // PART 2: QUESTION - RESPONSE
          {
            id: 102,
            part: "PART2",
            question_text: "Listen to the question and select the best response.",
            audio_script: "Question: Where is the monthly financial report? Response A: It's on Mr. David's desk. Response B: Yes, every single month. Response C: By train, usually.",
            option_a: "It's on Mr. David's desk.",
            option_b: "Yes, every single month.",
            option_c: "By train, usually.",
            option_d: null, // Part 2 chuẩn TOEIC chỉ có 3 lựa chọn
            correct_option: "A",
            explanation: "Câu hỏi 'Where' (Ở đâu?) -> Đáp án A trả lời vị trí 'On Mr. David's desk'."
          },
          // PART 3: SHORT CONVERSATIONS
          {
            id: 103,
            part: "PART3",
            passage_text: "Man: Excuse me, do you know which gate the flight to Hanoi departs from?\nWoman: Yes, Flight VN-241 leaves from Gate 12B on the second level.\nMan: Thank you! Is it close to the security checkpoint?",
            audio_script: "Man: Excuse me, do you know which gate the flight to Hanoi departs from? Woman: Yes, Flight VN-241 leaves from Gate 12B on the second level. Man: Thank you! Is it close to the security checkpoint?",
            question_text: "Where are the speakers currently located?",
            option_a: "At a train station",
            option_b: "At an airport terminal",
            option_c: "At a bus stop",
            option_d: "At a travel agency",
            correct_option: "B",
            explanation: "Hội thoại có nhắc tới 'flight to Hanoi', 'Gate 12B' -> Người nói đang ở sân bay (Airport terminal)."
          },
          // PART 4: SHORT TALKS
          {
            id: 104,
            part: "PART4",
            passage_text: "Attention all passengers on flight VN-241 to Hanoi. Due to routine maintenance at Gate 10, your departure gate has been moved to Gate 12B. Please head to Gate 12B immediately.",
            audio_script: "Attention all passengers on flight VN-241 to Hanoi. Due to routine maintenance at Gate 10, your departure gate has been moved to Gate 12B. Please head to Gate 12B immediately.",
            question_text: "What is the main purpose of this announcement?",
            option_a: "To announce a gate change for a flight",
            option_b: "To advertise a new ticket discount",
            option_c: "To inform passengers about lost baggage",
            option_d: "To cancel all evening flights",
            correct_option: "A",
            explanation: "Thông báo nêu rõ 'departure gate has been moved to Gate 12B' -> Thông báo đổi cổng lên máy bay."
          },
          // PART 5: INCOMPLETE SENTENCES
          {
            id: 105,
            part: "PART5",
            question_text: "All staff members are required to submit their expense reports _______ Friday afternoon.",
            option_a: "before",
            option_b: "prior",
            option_c: "earlier",
            option_d: "ahead",
            correct_option: "A",
            explanation: "Trước mốc thời gian 'Friday afternoon' dùng giới từ 'before'."
          },
          // PART 7: READING COMPREHENSION
          {
            id: 106,
            part: "PART7",
            passage_text: "NOTICE TO ALL EMPLOYEES:\nPlease be advised that the main office building will undergo HVAC maintenance this Saturday from 8:00 AM to 4:00 PM. Air conditioning services will be temporarily shut off during this timeframe. We apologize for any inconvenience.",
            question_text: "What will happen during the maintenance period on Saturday?",
            option_a: "Elevators will be out of service",
            option_b: "Air conditioning will be turned off",
            option_c: "The parking lot will be closed",
            option_d: "Internet access will be disconnected",
            correct_option: "B",
            explanation: "Bài đọc ghi rõ: 'Air conditioning services will be temporarily shut off' -> Điều hòa sẽ bị tắt."
          }
        ];

        setQuestions(dbQuestions.length > 0 ? dbQuestions : realToeicDataset);
      } catch (err) {
        console.error("Lỗi nạp bài thi:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [examId]);

  const handleSelectOption = (qId: number, option: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct_option) correct++;
    });
    return correct;
  };

  const partsList = [
    { key: "ALL", label: "Tất Cả Các Part" },
    { key: "PART1", label: "Part 1 (Hình Ảnh)" },
    { key: "PART2", label: "Part 2 (Hỏi-Đáp)" },
    { key: "PART3", label: "Part 3 (Hội Thoại)" },
    { key: "PART4", label: "Part 4 (Bài Nói)" },
    { key: "PART5", label: "Part 5 (Điền Câu)" },
    { key: "PART7", label: "Part 7 (Đọc Hiểu)" },
  ];

  const filteredQuestions = activePart === "ALL" 
    ? questions 
    : questions.filter((q) => q.part === activePart);

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center", backgroundColor: "#0b1329", minHeight: "100vh", color: "#38bdf8", fontFamily: "sans-serif" }}>
        <h2>⚡ Đang tải cấu trúc bài thi TOEIC chuẩn...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1329", color: "#f8fafc", padding: "20px 10px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        
        {/* HEADER BÀI THI */}
        <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ backgroundColor: "#16a34a", color: "#fff", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" }}>
                TOEIC OFFICIAL TEST FORMAT
              </span>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "22px", color: "#38bdf8" }}>📝 Đề Thi Luyện Tập TOEIC #{examId}</h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                Âm thanh phát âm TA-Mỹ • Lời thoại & Đáp án hiển thị sau khi Nộp bài
              </p>
            </div>
            {showResult && (
              <div style={{ backgroundColor: "#065f46", padding: "12px 20px", borderRadius: "12px", border: "1px solid #10b981", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#a7f3d0", textTransform: "uppercase" }}>KẾT QUẢ BÀI THI</span>
                <div style={{ fontSize: "22px", fontWeight: "bold", color: "#4ade80" }}>
                  {calculateScore()} / {questions.length} Câu
                </div>
              </div>
            )}
          </div>

          {/* TAB ĐIỀU HƯỚNG CÁC PART */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginTop: "18px", paddingBottom: "5px" }}>
            {partsList.map((p) => {
              const isActive = activePart === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setActivePart(p.key)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isActive ? "#0284c7" : "#0f172a",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    fontWeight: isActive ? "bold" : "normal",
                    fontSize: "13px",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DANH SÁCH CÂU HỎI */}
        {filteredQuestions.map((q, idx) => {
          const userChoice = userAnswers[q.id];
          const isCorrect = userChoice === q.correct_option;
          const isListening = ["PART1", "PART2", "PART3", "PART4"].includes(q.part);

          return (
            <div
              key={q.id || idx}
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px",
                border: "1px solid #334155",
              }}
            >
              {/* HEAD BADGE */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ backgroundColor: "#0284c7", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                  🏷️ {q.part}
                </span>
                {showResult && (
                  <span style={{ backgroundColor: isCorrect ? "#16a34a" : "#dc2626", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                    {isCorrect ? "Đúng ✅" : "Sai ❌"}
                  </span>
                )}
              </div>

              {/* 🖼️ PART 1: HÌNH ẢNH MINH HỌA */}
              {q.image_url && q.part === "PART1" && (
                <div style={{ textAlign: "center", margin: "15px 0" }}>
                  <img
                    src={q.image_url}
                    alt="TOEIC Part 1 Photo"
                    style={{ maxWidth: "100%", maxHeight: "350px", borderRadius: "12px", border: "2px solid #334155" }}
                  />
                </div>
              )}

              {/* 📖 PART 6 & 7: ĐOẠN VĂN ĐỌC HIỂU (Hiển thị ngay khi làm bài) */}
              {q.passage_text && !isListening && (
                <div style={{ backgroundColor: "#0f172a", padding: "16px", borderRadius: "10px", borderLeft: "4px solid #38bdf8", marginBottom: "16px", color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                  <b style={{ color: "#38bdf8", display: "block", marginBottom: "6px" }}>📄 Đoạn Văn Bài Đọc (Reading Text):</b>
                  {q.passage_text}
                </div>
              )}

              {/* 🎧 LOA PHÁT GIỌNG ĐỌC TIẾNG ANH CHUẨN TA-MỸ (PART 1, 2, 3, 4) */}
              {isListening && (
                <div style={{ backgroundColor: "#0f172a", padding: "14px", borderRadius: "12px", border: "1px solid #0284c7", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#38bdf8", fontWeight: "bold" }}>
                      🎧 Băng Nghe Tiếng Anh (Listening Track):
                    </p>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Bấm nút bên cạnh để nghe bài nói giọng TA-Mỹ</span>
                  </div>
                  <button
                    onClick={() => playEnglishAudio(q.audio_script || q.question_text)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#0284c7",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    🔊 Phát Âm Thanh (Play Audio)
                  </button>
                </div>
              )}

              {/* NỘI DUNG CÂU HỎI */}
              <h3 style={{ fontSize: "16px", color: "#f1f5f9", margin: "10px 0 16px 0", lineHeight: "1.5" }}>
                <span style={{ color: "#38bdf8", marginRight: "6px" }}>Câu {idx + 1}:</span> {q.question_text}
              </h3>

              {/* CÁC LỰA CHỌN A, B, C, D */}
              <div style={{ display: "grid", gap: "10px" }}>
                {["A", "B", "C", "D"].map((optKey) => {
                  const optText = q[`option_${optKey.toLowerCase()}`];
                  if (!optText) return null; // Ẩn câu D nếu là Part 2 (chỉ có A, B, C)

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
                      onClick={() => !showResult && handleSelectOption(q.id, optKey)}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        backgroundColor: btnBg,
                        border: `2px solid ${btnBorder}`,
                        color: btnColor,
                        borderRadius: "10px",
                        cursor: showResult ? "default" : "pointer",
                        fontWeight: isSelected ? "bold" : "normal",
                        fontSize: "14px",
                      }}
                    >
                      <b style={{ color: "#38bdf8", marginRight: "8px" }}>{optKey}.</b> {optText}
                    </button>
                  );
                })}
              </div>

              {/* 💡 CHỈ HIỂN THỊ LỜI THOẠI (TRANSCRIPT) VÀ GIẢI THÍCH SAU KHI NỘP BÀI */}
              {showResult && (
                <div style={{ marginTop: "18px", padding: "14px", backgroundColor: "#0f172a", borderRadius: "10px", borderLeft: "4px solid #10b981" }}>
                  {q.passage_text && isListening && (
                    <div style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px dashed #334155" }}>
                      <b style={{ color: "#38bdf8", fontSize: "13px" }}>📜 Lời Thoại Bài Nghe (Transcript):</b>
                      <p style={{ color: "#cbd5e1", fontSize: "13px", margin: "4px 0 0 0", whiteSpace: "pre-line" }}>{q.passage_text}</p>
                    </div>
                  )}
                  <div style={{ fontWeight: "bold", color: "#34d399", fontSize: "13px", marginBottom: "4px" }}>
                    💡 Lời Giải Chi Tiết (Đáp án {q.correct_option}):
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "13px" }}>{q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}

        {/* NÚT NỘP BÀI HOẶC LÀM LẠI */}
        <div style={{ textAlign: "center", margin: "30px 0 60px 0" }}>
          <button
            onClick={() => setShowResult(!showResult)}
            style={{
              padding: "14px 40px",
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
            {showResult ? "🔄 Làm Lại Bài Thi" : "🚀 Nộp Bài & Xem Chi Tiết Đáp Án"}
          </button>
        </div>

      </div>
    </div>
  );
}