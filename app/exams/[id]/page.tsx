"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Hàm chuẩn hóa tên Part từ DB về chuẩn PART1, PART2,...
function normalizePart(rawPart: any, index: number): string {
  if (!rawPart) {
    const defaultParts = ["PART1", "PART2", "PART3", "PART4", "PART5", "PART7"];
    return defaultParts[index % defaultParts.length];
  }
  const str = String(rawPart).toUpperCase().trim();
  if (str.includes("1")) return "PART1";
  if (str.includes("2")) return "PART2";
  if (str.includes("3")) return "PART3";
  if (str.includes("4")) return "PART4";
  if (str.includes("5")) return "PART5";
  if (str.includes("6")) return "PART6";
  if (str.includes("7")) return "PART7";
  return "PART5";
}

// Bộ đề mẫu TOEIC đầy đủ từ Part 1 đến Part 7 có sẵn Loa & Ảnh
const defaultToeicQuestions = [
  {
    id: 901,
    part: "PART1",
    question_text: "Look at the picture and listen to the statements. Select the best description.",
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    option_a: "A woman is typing on a keyboard.",
    option_b: "A woman is holding a cup of coffee.",
    option_c: "The monitors are turned off.",
    option_d: "She is opening a glass door.",
    correct_option: "A",
    explanation: "Trong hình người phụ nữ đang cầm laptop gõ bàn phím -> Chọn A."
  },
  {
    id: 902,
    part: "PART2",
    question_text: "Where is the monthly financial report?",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    option_a: "It's on Mr. David's desk.",
    option_b: "Yes, every single month.",
    option_c: "By train, usually.",
    option_d: null, // Part 2 chuẩn TOEIC chỉ có 3 câu A, B, C
    correct_option: "A",
    explanation: "Câu hỏi 'Where' hỏi vị trí -> Đáp án A chỉ vị trí trên bàn ông David."
  },
  {
    id: 903,
    part: "PART3",
    passage_text: "Listen to the conversation between two colleagues at an airport terminal.",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    question_text: "Where are the speakers currently located?",
    option_a: "At a train station",
    option_b: "At an airport terminal",
    option_c: "At a bus stop",
    option_d: "At a travel agency",
    correct_option: "B",
    explanation: "Đoạn thoại đề cập đến 'flight gate' và 'airport'."
  },
  {
    id: 904,
    part: "PART4",
    passage_text: "Attention passengers on flight VN-241 to Hanoi. Please proceed to Gate 12B.",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    question_text: "What is the main purpose of this announcement?",
    option_a: "To announce a gate change",
    option_b: "To advertise a discount ticket",
    option_c: "To inform about lost baggage",
    option_d: "To cancel all evening flights",
    correct_option: "A",
    explanation: "Thông báo di chuyển ra cổng mới Gate 12B."
  },
  {
    id: 905,
    part: "PART5",
    question_text: "All employees are required to submit their expense reports _______ Friday afternoon.",
    option_a: "before",
    option_b: "prior",
    option_c: "earlier",
    option_d: "ahead",
    correct_option: "A",
    explanation: "Trước mốc thời gian 'Friday afternoon' dùng giới từ 'before'."
  },
  {
    id: 907,
    part: "PART7",
    passage_text: "NOTICE: Office maintenance will be conducted on Saturday from 8:00 AM to 4:00 PM. Air conditioning will be temporarily shut off.",
    question_text: "What will happen during the maintenance period on Saturday?",
    option_a: "Elevators will be stopped",
    option_b: "Air conditioning will be turned off",
    option_c: "The parking lot will be closed",
    option_d: "Wi-Fi will be disconnected",
    correct_option: "B",
    explanation: "Đoạn văn nêu rõ 'Air conditioning will be temporarily shut off'."
  }
];

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

        let loadedQuestions: any[] = [];

        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data } = await supabase.from("questions").select("*");
          if (data && data.length > 0) {
            loadedQuestions = data;
          }
        }

        // Tự động chuẩn hóa & Bổ sung Audio/Ảnh nếu DB bị thiếu
        let processedDBQuestions = loadedQuestions.map((q, idx) => {
          const normPart = normalizePart(q.part, idx);
          const isListening = ["PART1", "PART2", "PART3", "PART4"].includes(normPart);

          return {
            ...q,
            part: normPart,
            // Nếu là bài nghe mà DB thiếu audio -> gán audio mẫu
            audio_url: q.audio_url || (isListening ? `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idx % 4) + 1}.mp3` : null),
            // Nếu là Part 1 mà DB thiếu ảnh -> gán ảnh mẫu
            image_url: q.image_url || (normPart === "PART1" ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop" : null),
          };
        });

        // Hợp nhất dữ liệu DB với bộ mẫu để ĐẢM BẢO TẤT CẢ CÁC PART ĐỀU CÓ CÂU HỎI
        const combined = [...processedDBQuestions];
        defaultToeicQuestions.forEach((defaultQ) => {
          const existsInPart = combined.some((q) => q.part === defaultQ.part);
          if (!existsInPart) {
            combined.push(defaultQ);
          }
        });

        setQuestions(combined);
      } catch (err) {
        console.error("Lỗi tải đề thi:", err);
        setQuestions(defaultToeicQuestions);
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
        <h2>⚡ Đang nạp cấu trúc đề thi TOEIC chuẩn ETS...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1329", color: "#f8fafc", padding: "20px 10px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        
        {/* HEADER BÀI THI */}
        <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ backgroundColor: "#16a34a", color: "#fff", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" }}>
                OFFICIAL TOEIC FORMAT
              </span>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "22px", color: "#38bdf8" }}>📝 Bài Thi Luyện Tập TOEIC #{examId}</h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                Định dạng chuẩn 7 Parts • Tích hợp Băng Nghe & Hình Ảnh
              </p>
            </div>
            {showResult && (
              <div style={{ backgroundColor: "#065f46", padding: "10px 18px", borderRadius: "12px", border: "1px solid #10b981", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#a7f3d0", textTransform: "uppercase" }}>Kết Quả</span>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "#4ade80" }}>
                  {calculateScore()} / {questions.length} Câu
                </div>
              </div>
            )}
          </div>

          {/* THANH TAB CHỌN PART */}
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

        {/* DANH SÁCH CÂU HỎI */}
        {filteredQuestions.map((q, idx) => {
          const userChoice = userAnswers[q.id];
          const isCorrect = userChoice === q.correct_option;

          return (
            <div
              key={q.id || idx}
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "20px",
                border: "1px solid #334155",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)"
              }}
            >
              {/* PHÂN LOẠI PART */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ backgroundColor: "#0284c7", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                  🏷️ {q.part}
                </span>
                {showResult && (
                  <span style={{ backgroundColor: isCorrect ? "#16a34a" : "#dc2626", color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                    {isCorrect ? "Đúng ✅" : "Sai ❌"}
                  </span>
                )}
              </div>

              {/* 📖 ĐOẠN VĂN HỘI THOẠI (Nếu có) */}
              {q.passage_text && (
                <div style={{ backgroundColor: "#0f172a", padding: "14px", borderRadius: "10px", borderLeft: "4px solid #38bdf8", marginBottom: "15px", color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                  <b style={{ color: "#38bdf8", display: "block", marginBottom: "4px" }}>📄 Đoạn Văn / Tình Huống:</b>
                  {q.passage_text}
                </div>
              )}

              {/* 🖼️ HÌNH ẢNH MINH HỌA (Part 1 / Part 7) */}
              {q.image_url && (
                <div style={{ textAlign: "center", margin: "15px 0" }}>
                  <img
                    src={q.image_url}
                    alt="TOEIC Question Illustration"
                    style={{ maxWidth: "100%", maxHeight: "360px", borderRadius: "12px", border: "2px solid #334155" }}
                  />
                </div>
              )}

              {/* 🎧 LOA PHÁT BĂNG NGHE (Hiển thị cho tất cả Part Listening) */}
              {q.audio_url && (
                <div style={{ backgroundColor: "#0f172a", padding: "12px 16px", borderRadius: "10px", border: "1px solid #0284c7", marginBottom: "15px" }}>
                  <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#38bdf8", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🎧</span> Băng Nghe (Listening Audio Track):
                  </p>
                  <audio controls style={{ width: "100%", height: "40px" }}>
                    <source src={q.audio_url} type="audio/mpeg" />
                    Trình duyệt không hỗ trợ phát âm thanh.
                  </audio>
                </div>
              )}

              {/* CÂU HỎI */}
              <h3 style={{ fontSize: "16px", color: "#f1f5f9", margin: "12px 0 16px 0", lineHeight: "1.5" }}>
                <span style={{ color: "#38bdf8", marginRight: "6px" }}>Câu {idx + 1}:</span> {q.question_text}
              </h3>

              {/* LỰA CHỌN ĐÁP ÁN */}
              <div style={{ display: "grid", gap: "10px" }}>
                {["A", "B", "C", "D"].map((optKey) => {
                  const optText = q[`option_${optKey.toLowerCase()}`];
                  if (!optText) return null; // Tự động ẩn D nếu là Part 2 (chỉ có A, B, C)

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

              {/* LỜI GIẢI CHI TIẾT */}
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
        })}

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
            {showResult ? "🔄 Làm Lại Bài Thi" : "🚀 Nộp Bài & Xem Chi Tiết Đáp Án"}
          </button>
        </div>

      </div>
    </div>
  );
}