"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function ExamDetailPage() {
  const params = useParams();
  const examId = params?.id || "1";

  const [activePart, setActivePart] = useState<string>("PART1");
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

        // Dữ liệu mẫu chuẩn TOEIC cấu trúc đầy đủ nếu DB chưa phân loại
        const sampleToeicData = [
          // --- PART 1: PHOTOGRAPHS ---
          {
            id: 101,
            part: "PART1",
            part_name: "Part 1: Photographs (Hình Ảnh)",
            question_text: "Look at the picture and listen to the four statements. Select the best description.",
            image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop",
            audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            option_a: "(A) She is typing on a laptop keyboard.",
            option_b: "(B) She is writing in a notebook.",
            option_c: "(C) She is speaking on a mobile phone.",
            option_d: "(D) She is closing her office window.",
            correct_option: "A",
            explanation: "Trong hình người phụ nữ đang ngồi gõ bàn phím máy tính -> Đáp án A chính xác."
          },
          // --- PART 2: QUESTION - RESPONSE ---
          {
            id: 102,
            part: "PART2",
            part_name: "Part 2: Question - Response (Hỏi & Đáp)",
            question_text: "Listen to the question and the three responses: 'Where is the monthly financial report?'",
            audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            option_a: "(A) It's on Mr. David's desk.",
            option_b: "(B) Yes, every single month.",
            option_c: "(C) By train, usually.",
            option_d: null, // Part 2 chuẩn TOEIC chỉ có 3 câu A, B, C
            correct_option: "A",
            explanation: "Câu hỏi 'Where' (Ở đâu?) -> Đáp án A đưa ra địa điểm 'On Mr. David's desk'."
          },
          // --- PART 3: SHORT CONVERSATIONS ---
          {
            id: 103,
            part: "PART3",
            part_name: "Part 3: Short Conversations (Đoạn Hội Thoại Short)",
            passage_text: "Listen to the conversation between two colleagues at an airport terminal.",
            audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            question_text: "Where are the speakers currently located?",
            option_a: "At a train station",
            option_b: "At an airport terminal",
            option_c: "At a bus stop",
            option_d: "At a hotel reception",
            correct_option: "B",
            explanation: "Trong hội thoại người nói đề cập đến 'flight gate' và 'airport'."
          },
          // --- PART 4: SHORT TALKS ---
          {
            id: 104,
            part: "PART4",
            part_name: "Part 4: Short Talks (Bài Nói Short)",
            passage_text: "Attention all passengers on flight VN-241 to Hanoi...",
            audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            question_text: "What is the main purpose of this announcement?",
            option_a: "To announce a gate change for a flight",
            option_b: "To advertise a new ticket discount",
            option_c: "To inform about lost baggage",
            option_d: "To cancel all evening flights",
            correct_option: "A",
            explanation: "Thông báo hướng dẫn hành khách di chuyển sang Cổng 12B."
          },
          // --- PART 5: INCOMPLETE SENTENCES ---
          {
            id: 105,
            part: "PART5",
            part_name: "Part 5: Incomplete Sentences (Điền Câu)",
            question_text: "All employees are required to submit their expense reports _______ Friday afternoon.",
            option_a: "before",
            option_b: "prior",
            option_c: "earlier",
            option_d: "ahead",
            correct_option: "A",
            explanation: "Trước mốc thời gian 'Friday afternoon' ta dùng giới từ 'before'."
          },
          // --- PART 7: READING COMPREHENSION ---
          {
            id: 106,
            part: "PART7",
            part_name: "Part 7: Reading Comprehension (Đọc Hiểu Đoạn Văn)",
            passage_text: "NOTICE: The office building will undergo HVAC maintenance on Saturday from 8:00 AM to 4:00 PM. Air conditioning will be temporarily shut off during this window.",
            question_text: "What will happen during the maintenance period on Saturday?",
            option_a: "The elevators will be out of service",
            option_b: "Air conditioning will be turned off",
            option_c: "The parking lot will be closed",
            option_d: "Internet access will be disconnected",
            correct_option: "B",
            explanation: "Đoạn văn nêu rõ: 'Air conditioning will be temporarily shut off'."
          }
        ];

        // Ưu tiên dùng dữ liệu DB nếu đã gắn part, nếu chưa sẽ merged mẫu chuẩn TOEIC
        if (dbQuestions.length > 0 && dbQuestions[0].part) {
          setQuestions(dbQuestions);
        } else {
          setQuestions(sampleToeicData);
        }
      } catch (err) {
        console.error("Lỗi tải đề thi:", err);
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
    { key: "ALL", label: "Tất Cả Câu" },
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
        <h2>⚡ Đang tải cấu trúc đề thi TOEIC chuẩn ETS...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1329", color: "#f8fafc", padding: "20px 10px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* HEADER ĐỀ THI */}
        <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ backgroundColor: "#16a34a", color: "#fff", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" }}>
                OFFICIAL TOEIC FORMAT
              </span>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "22px", color: "#38bdf8" }}>📝 Bài Thi Luyện Tập TOEIC #{examId}</h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                Định dạng chuẩn 7 Parts • Có Loa Listening & Bài Đọc Reading
              </p>
            </div>
            {showResult && (
              <div style={{ backgroundColor: "#065f46", padding: "10px 18px", borderRadius: "12px", border: "1px solid #10b981", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#a7f3d0", textTransform: "uppercase" }}>Điểm Số</span>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#4ade80" }}>
                  {calculateScore()} / {questions.length} Câu
                </div>
              </div>
            )}
          </div>

          {/* THANH TAB CHỌN PART THI */}
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
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease"
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* DANH SÁCH CÂU HỎI THEO CẤU TRÚC PART */}
        {filteredQuestions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", backgroundColor: "#1e293b", borderRadius: "16px", color: "#94a3b8" }}>
            <p>Chưa có câu hỏi nào thuộc phần thi này.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const userChoice = userAnswers[q.id];
            const isCorrect = userChoice === q.correct_option;

            return (
              <div
                key={q.id}
                style={{
                  backgroundColor: "#1e293b",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "20px",
                  border: "1px solid #334155",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)"
                }}
              >
                {/* HEAD PART BADGE */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ backgroundColor: "#3b82f6", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                    {q.part_name || q.part}
                  </span>
                  {showResult && (
                    <span style={{ backgroundColor: isCorrect ? "#16a34a" : "#dc2626", color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                      {isCorrect ? "Đúng ✅" : "Sai ❌"}
                    </span>
                  )}
                </div>

                {/* 📖 ĐOẠN VĂN / THÔNG BÁO (Part 3, 4, 6, 7) */}
                {q.passage_text && (
                  <div style={{ backgroundColor: "#0f172a", padding: "14px", borderRadius: "10px", borderLeft: "4px solid #38bdf8", marginBottom: "15px", color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                    <b style={{ color: "#38bdf8", display: "block", marginBottom: "4px" }}>📄 Đoạn Văn / Tình Huống:</b>
                    {q.passage_text}
                  </div>
                )}

                {/* 🖼️ HÌNH ẢNH MINH HỌA (Part 1 & Part 7) */}
                {q.image_url && (
                  <div style={{ textAlign: "center", margin: "15px 0" }}>
                    <img
                      src={q.image_url}
                      alt="TOEIC Question Illustration"
                      style={{ maxWidth: "100%", maxHeight: "360px", borderRadius: "12px", border: "2px solid #334155" }}
                    />
                  </div>
                )}

                {/* 🎧 LOA PHÁT TỰ ĐỘNG (Part 1, 2, 3, 4) */}
                {q.audio_url && (
                  <div style={{ backgroundColor: "#0f172a", padding: "12px 16px", borderRadius: "10px", border: "1px solid #0284c7", marginBottom: "15px" }}>
                    <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#38bdf8", fontWeight: "bold" }}>
                      🎧 Loa Băng Nghe (Audio Track):
                    </p>
                    <audio controls style={{ width: "100%", height: "40px" }}>
                      <source src={q.audio_url} type="audio/mpeg" />
                      Trình duyệt không hỗ trợ nghe nhạc.
                    </audio>
                  </div>
                )}

                {/* NỘI DUNG CÂU HỎI */}
                <h3 style={{ fontSize: "16px", color: "#f1f5f9", margin: "12px 0 16px 0", lineHeight: "1.5" }}>
                  <span style={{ color: "#38bdf8", marginRight: "6px" }}>Câu {idx + 1}:</span> {q.question_text}
                </h3>

                {/* DÁNH SÁCH ĐÁP ÁN (A, B, C, D) */}
                <div style={{ display: "grid", gap: "10px" }}>
                  {["A", "B", "C", "D"].map((optKey) => {
                    const optText = q[`option_${optKey.toLowerCase()}`];
                    if (!optText) return null; // Tự động ẩn câu D nếu là Part 2 (Chỉ có A, B, C)

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

                {/* GIẢI THÍCH CHI TIẾT */}
                {showResult && (
                  <div style={{ marginTop: "16px", padding: "12px 14px", backgroundColor: "#0f172a", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
                    <div style={{ fontWeight: "bold", color: "#34d399", fontSize: "13px", marginBottom: "4px" }}>
                      💡 Lời Giải Chi Tiết (Đáp án {q.correct_option}):
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "13px" }}>{q.explanation}</div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* NÚT NỘP BÀI */}
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
            {showResult ? "🔄 Làm Lại Bài Thi" : "🚀 Nộp Bài & Xem Chi Tiết"}
          </button>
        </div>

      </div>
    </div>
  );
}