"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Trình phát âm thanh tiếng Anh giọng TA-Mỹ chuẩn bằng Web Speech API
function playEnglishSpeech(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel(); // Tắt câu đang đọc dở nếu có
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9; // Tốc độ đọc tiêu chuẩn thi TOEIC
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Trình duyệt của bạn không hỗ trợ tính năng phát âm thanh.");
  }
}

// BỘ ĐỀ MẪU ĐẦY ĐỦ 7 PARTS (ĐẢM BẢO KHÔNG BẠO BỊ TRỐNG TAB)
const fallbackToeicDataset = [
  {
    id: 101,
    part: "PART1",
    question_text: "Look at the picture and select the best description.",
    image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop",
    audio_script: "Statement A: A woman is typing on a laptop keyboard. Statement B: A woman is holding a cup of coffee. Statement C: The monitors are turned off. Statement D: She is talking on the phone.",
    option_a: "A woman is typing on a laptop keyboard.",
    option_b: "A woman is holding a cup of coffee.",
    option_c: "The monitors are turned off.",
    option_d: "She is talking on the phone.",
    correct_option: "A",
    explanation: "Trong hình người phụ nữ đang thao tác gõ bàn phím laptop -> Chọn A."
  },
  {
    id: 102,
    part: "PART2",
    question_text: "Listen to the question and select the best response.",
    audio_script: "Question: Where is the monthly financial report? Response A: It's on Mr. David's desk. Response B: Yes, every single month. Response C: By train, usually.",
    option_a: "It's on Mr. David's desk.",
    option_b: "Yes, every single month.",
    option_c: "By train, usually.",
    option_d: null, // Part 2 chuẩn TOEIC chỉ có 3 câu A, B, C
    correct_option: "A",
    explanation: "Câu hỏi 'Where' (Ở đâu?) -> Đáp án A chỉ vị trí trên bàn ông David."
  },
  {
    id: 103,
    part: "PART3",
    passage_text: "Man: Excuse me, do you know which gate the flight to Hanoi departs from?\nWoman: Yes, Flight VN-241 leaves from Gate 12B on the second level.\nMan: Thank you! Is it close to the duty-free shop?",
    audio_script: "Man: Excuse me, do you know which gate the flight to Hanoi departs from? Woman: Yes, Flight VN-241 leaves from Gate 12B on the second level. Man: Thank you! Is it close to the duty-free shop?",
    question_text: "Where are the speakers currently located?",
    option_a: "At a train station",
    option_b: "At an airport terminal",
    option_c: "At a bus stop",
    option_d: "At a hotel lobby",
    correct_option: "B",
    explanation: "Đoạn thoại có từ khóa 'flight to Hanoi' và 'Gate 12B' -> Người nói đang ở sân bay (Airport)."
  },
  {
    id: 104,
    part: "PART4",
    passage_text: "Attention all passengers on flight VN-241 to Hanoi. Due to maintenance at Gate 10, your departure gate has been changed to Gate 12B. Please proceed to Gate 12B immediately.",
    audio_script: "Attention all passengers on flight VN-241 to Hanoi. Due to maintenance at Gate 10, your departure gate has been changed to Gate 12B. Please proceed to Gate 12B immediately.",
    question_text: "What is the main purpose of this announcement?",
    option_a: "To announce a gate change",
    option_b: "To advertise a new ticket discount",
    option_c: "To inform about lost luggage",
    option_d: "To cancel all evening flights",
    correct_option: "A",
    explanation: "Thông báo hướng dẫn hành khách đổi sang Cổng 12B -> Chọn A."
  },
  {
    id: 105,
    part: "PART5",
    question_text: "All department managers are requested to submit their quarterly reports _______ Friday afternoon.",
    option_a: "before",
    option_b: "prior",
    option_c: "earlier",
    option_d: "ahead",
    correct_option: "A",
    explanation: "Trước mốc thời gian 'Friday afternoon' sử dụng giới từ 'before'."
  },
  {
    id: 106,
    part: "PART6",
    passage_text: "To All Staff:\nPlease note that the main cafeteria will be closed for renovation from Monday to Wednesday. During this time, free snacks and beverages will be provided in the 3rd-floor lounge.",
    question_text: "Why will the cafeteria be closed?",
    option_a: "For scheduled renovation work",
    option_b: "Due to a power outage",
    option_c: "For a private company party",
    option_d: "Because of health inspection",
    correct_option: "A",
    explanation: "Bài thông báo ghi rõ 'closed for renovation' (đóng cửa để sửa chữa)."
  },
  {
    id: 107,
    part: "PART7",
    passage_text: "MEMORANDUM\nTo: Marketing Team\nFrom: Sarah Jenkins, Director\nSubject: New Product Campaign\n\nOur autumn product launch has been rescheduled to October 15. All promotional materials must be finalized by the end of this week.",
    question_text: "When is the new product launch scheduled to take place?",
    option_a: "On October 15",
    option_b: "At the end of this week",
    option_c: "In early September",
    option_d: "Next Monday morning",
    correct_option: "A",
    explanation: "Đoạn văn ghi rõ 'rescheduled to October 15' -> Đáp án A."
  }
];

// Hàm chuẩn hóa dữ liệu từ Supabase về định dạng chuẩn TOEIC
function normalizeQuestionData(q: any, index: number) {
  let rawPart = String(q.part || "").toUpperCase().trim();
  let cleanPart = "PART5";

  if (rawPart.includes("1")) cleanPart = "PART1";
  else if (rawPart.includes("2")) cleanPart = "PART2";
  else if (rawPart.includes("3")) cleanPart = "PART3";
  else if (rawPart.includes("4")) cleanPart = "PART4";
  else if (rawPart.includes("5")) cleanPart = "PART5";
  else if (rawPart.includes("6")) cleanPart = "PART6";
  else if (rawPart.includes("7")) cleanPart = "PART7";

  // Tự động gán hình ảnh cho Part 1 nếu DB thiếu
  let imageUrl = q.image_url;
  if (cleanPart === "PART1" && !imageUrl) {
    imageUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop";
  }

  // Tự động tạo kịch bản phát âm (Speech Script) cho các Part nghe nếu DB thiếu
  let audioScript = q.audio_script || q.passage_text;
  if (!audioScript) {
    if (cleanPart === "PART1") {
      audioScript = `Statement A: ${q.option_a || "A woman is typing on a keyboard."} Statement B: ${q.option_b || "A woman is holding a cup."} Statement C: ${q.option_c || "Monitors are off."} Statement D: ${q.option_d || "She is closing the door."}`;
    } else if (cleanPart === "PART2") {
      audioScript = `Question: ${q.question_text}. Option A: ${q.option_a || ""}. Option B: ${q.option_b || ""}. Option C: ${q.option_c || ""}.`;
    } else {
      audioScript = q.question_text;
    }
  }

  return {
    ...q,
    id: q.id || index + 1000,
    part: cleanPart,
    image_url: imageUrl,
    audio_script: audioScript,
    option_a: q.option_a || q.option_A,
    option_b: q.option_b || q.option_B,
    option_c: q.option_c || q.option_C,
    option_d: cleanPart === "PART2" ? null : (q.option_d || q.option_D),
  };
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
          if (data && data.length > 0) dbQuestions = data;
        }

        // 1. Chuẩn hóa dữ liệu từ DB
        const processedDBQuestions = dbQuestions.map((q, idx) => normalizeQuestionData(q, idx));

        // 2. Kết hợp với bộ mẫu để ĐẢM BẢO TẤT CẢ CÁC PART ĐỀU CÓ CÂU HỎI
        const mergedQuestions = [...processedDBQuestions];
        fallbackToeicDataset.forEach((fallbackQ) => {
          const exists = mergedQuestions.some((q) => q.part === fallbackQ.part);
          if (!exists) {
            mergedQuestions.push(fallbackQ);
          }
        });

        // Sắp xếp câu hỏi theo thứ tự Part 1 -> Part 7
        mergedQuestions.sort((a, b) => a.part.localeCompare(b.part));
        setQuestions(mergedQuestions);

      } catch (err) {
        console.error("Lỗi tải đề thi:", err);
        setQuestions(fallbackToeicDataset);
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
    { key: "PART6", label: "Part 6 (Điền Đoạn)" },
    { key: "PART7", label: "Part 7 (Đọc Hiểu)" },
  ];

  const filteredQuestions = activePart === "ALL" 
    ? questions 
    : questions.filter((q) => q.part === activePart);

  const getPartLabel = (partKey: string) => {
    switch (partKey) {
      case "PART1": return "Part 1: Photographs (Hình Ảnh)";
      case "PART2": return "Part 2: Question-Response (Hỏi-Đáp)";
      case "PART3": return "Part 3: Short Conversations (Hội Thoại Short)";
      case "PART4": return "Part 4: Short Talks (Bài Nói Short)";
      case "PART5": return "Part 5: Incomplete Sentences (Điền Câu)";
      case "PART6": return "Part 6: Text Completion (Điền Đoạn Văn)";
      case "PART7": return "Part 7: Reading Comprehension (Đọc Hiểu)";
      default: return partKey;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center", backgroundColor: "#0b1329", minHeight: "100vh", color: "#38bdf8", fontFamily: "sans-serif" }}>
        <h2>⚡ Đang nạp hệ thống đề thi TOEIC chuẩn ETS...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1329", color: "#f8fafc", padding: "20px 10px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        
        {/* HEADER ĐỀ THI */}
        <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ backgroundColor: "#16a34a", color: "#fff", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" }}>
                TOEIC OFFICIAL TEST FORMAT
              </span>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "22px", color: "#38bdf8" }}>📝 Đề Thi Luyện Tập TOEIC #{examId}</h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                Phát âm Tiếng Anh Giọng Mỹ • Lời thoại & Giải thích hiển thị sau khi Nộp bài
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

          {/* THANH TAB LỌC PART */}
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
        {filteredQuestions.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#1e293b", borderRadius: "16px", color: "#94a3b8" }}>
            Đang cập nhật câu hỏi cho phần thi này...
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
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
                  <span style={{ backgroundColor: "#0284c7", color: "#fff", padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                    🏷️ {getPartLabel(q.part)}
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
                      style={{ maxWidth: "100%", maxHeight: "360px", borderRadius: "12px", border: "2px solid #334155" }}
                    />
                  </div>
                )}

                {/* 📖 PART 6 & 7: ĐOẠN VĂN ĐỌC HIỂU (Hiển thị ngay khi làm bài) */}
                {q.passage_text && !isListening && (
                  <div style={{ backgroundColor: "#0f172a", padding: "16px", borderRadius: "10px", borderLeft: "4px solid #38bdf8", marginBottom: "16px", color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                    <b style={{ color: "#38bdf8", display: "block", marginBottom: "6px" }}>📄 Đoạn Văn Bài Đọc (Reading Text):</b>
                    <div style={{ whiteSpace: "pre-line" }}>{q.passage_text}</div>
                  </div>
                )}

                {/* 🎧 BĂNG NGHE CHO PART 1, 2, 3, 4 */}
                {isListening && (
                  <div style={{ backgroundColor: "#0f172a", padding: "14px", borderRadius: "12px", border: "1px solid #0284c7", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", color: "#38bdf8", fontWeight: "bold" }}>
                        🎧 Băng Nghe Tiếng Anh (Listening Track):
                      </p>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>Bấm nút bên cạnh để nghe giọng đọc Mỹ chuẩn</span>
                    </div>
                    <button
                      onClick={() => playEnglishSpeech(q.audio_script || q.question_text)}
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

                {/* CÂU HỎI */}
                <h3 style={{ fontSize: "16px", color: "#f1f5f9", margin: "10px 0 16px 0", lineHeight: "1.5" }}>
                  <span style={{ color: "#38bdf8", marginRight: "6px" }}>Câu {idx + 1}:</span> {q.question_text}
                </h3>

                {/* CÁC ĐÁP ÁN A, B, C, D */}
                <div style={{ display: "grid", gap: "10px" }}>
                  {["A", "B", "C", "D"].map((optKey) => {
                    const optText = q[`option_${optKey.toLowerCase()}`];
                    if (!optText) return null; // Tự động ẩn D nếu là Part 2 (Chỉ có A, B, C)

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
                    <div style={{ color: "#94a3b8", fontSize: "13px" }}>{q.explanation || "Chưa có giải thích chi tiết."}</div>
                  </div>
                )}
              </div>
            );
          })
        )}

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