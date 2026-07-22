"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Trình đọc phát âm tiếng Anh giọng Mỹ chuẩn qua Web Speech API
function playEnglishSpeech(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88; // Tốc độ tiêu chuẩn bài thi ETS
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Trình duyệt không hỗ trợ phát âm thanh tự động.");
  }
}

// BỘ DỮ LIỆU MẪU ĐA DẠNG NGUYÊN BẢN TOEIC ETS (MỖI PART CÓ NHIỀU BỘ CÂU HỎI)
const fullToeicDatabase: { [key: string]: any[] } = {
  PART1: [
    {
      id: 101,
      part: "PART1",
      question_text: "Look at the picture and select the best statement.",
      image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop",
      audio_script: "Statement A: A woman is typing on a laptop keyboard. Statement B: A woman is holding a cup of coffee. Statement C: The monitors are turned off. Statement D: She is talking on the phone.",
      option_a: "A woman is typing on a laptop keyboard.",
      option_b: "A woman is holding a cup of coffee.",
      option_c: "The monitors are turned off.",
      option_d: "She is talking on the phone.",
      correct_option: "A",
      explanation: "Trong hình người phụ nữ đang thao tác gõ bàn phím laptop."
    },
    {
      id: 102,
      part: "PART1",
      question_text: "Look at the picture and select the best statement.",
      image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop",
      audio_script: "Statement A: Some people are attending a meeting. Statement B: They are writing on a blackboard. Statement C: A man is closing the window. Statement D: The chairs are stacked against the wall.",
      option_a: "Some people are attending a meeting.",
      option_b: "They are writing on a blackboard.",
      option_c: "A man is closing the window.",
      option_d: "The chairs are stacked against the wall.",
      correct_option: "A",
      explanation: "Mọi người đang ngồi quanh bàn họp cùng thảo luận."
    },
    {
      id: 103,
      part: "PART1",
      question_text: "Look at the picture and select the best statement.",
      image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop",
      audio_script: "Statement A: They are inspecting some machinery. Statement B: They are looking at a laptop computer. Statement C: One of the men is wearing gloves. Statement D: They are walking outdoors.",
      option_a: "They are inspecting some machinery.",
      option_b: "They are looking at a laptop computer.",
      option_c: "One of the men is wearing gloves.",
      option_d: "They are walking outdoors.",
      correct_option: "B",
      explanation: "Nhóm đồng nghiệp đang cùng tập trung nhìn vào màn hình laptop."
    },
    {
      id: 104,
      part: "PART1",
      question_text: "Look at the picture and select the best statement.",
      image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop",
      audio_script: "Statement A: An engineer is working on a circuit board. Statement B: He is painting a wall green. Statement C: He is sweeping the workshop floor. Statement D: He is taking off his safety glasses.",
      option_a: "An engineer is working on a circuit board.",
      option_b: "He is painting a wall green.",
      option_c: "He is sweeping the workshop floor.",
      option_d: "He is taking off his safety glasses.",
      correct_option: "A",
      explanation: "Kỹ sư đang tỉ mỉ kiểm tra và sửa chữa bảng mạch điện tử."
    },
    {
      id: 105,
      part: "PART1",
      question_text: "Look at the picture and select the best statement.",
      image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
      audio_script: "Statement A: The office is completely empty. Statement B: People are eating in a cafeteria. Statement C: Some lights are turned on in the office. Statement D: Workers are assembling furniture.",
      option_a: "The office is completely empty.",
      option_b: "People are eating in a cafeteria.",
      option_c: "Some lights are turned on in the office.",
      option_d: "Workers are assembling furniture.",
      correct_option: "C",
      explanation: "Khung cảnh văn phòng làm việc với các hệ thống đèn trần đang bật sáng."
    }
  ],
  PART2: [
    {
      id: 201,
      part: "PART2",
      question_text: "Listen to the question and select the best response.",
      audio_script: "Question: Where is the monthly financial report? Response A: It's on Mr. David's desk. Response B: Yes, every single month. Response C: By train, usually.",
      option_a: "It's on Mr. David's desk.",
      option_b: "Yes, every single month.",
      option_c: "By train, usually.",
      option_d: null,
      correct_option: "A",
      explanation: "Câu hỏi 'Where' (Ở đâu?) -> Đáp án A chỉ vị trí 'On Mr. David's desk'."
    },
    {
      id: 202,
      part: "PART2",
      question_text: "Listen to the question and select the best response.",
      audio_script: "Question: Who is responsible for organizing the annual conference? Response A: At the Grand Hotel downtown. Response B: Ms. Sarah in the marketing team. Response C: Next Tuesday morning at nine.",
      option_a: "At the Grand Hotel downtown.",
      option_b: "Ms. Sarah in the marketing team.",
      option_c: "Next Tuesday morning at nine.",
      option_d: null,
      correct_option: "B",
      explanation: "Câu hỏi 'Who' (Ai chịu trách nhiệm?) -> Đáp án B chỉ người 'Ms. Sarah'."
    },
    {
      id: 203,
      part: "PART2",
      question_text: "Listen to the question and select the best response.",
      audio_script: "Question: When will the new safety guidelines be published? Response A: In the company cafeteria. Response B: Yes, I read them yesterday. Response C: By the end of this week.",
      option_a: "In the company cafeteria.",
      option_b: "Yes, I read them yesterday.",
      option_c: "By the end of this week.",
      option_d: null,
      correct_option: "C",
      explanation: "Câu hỏi 'When' (Khi nào?) -> Đáp án C chỉ thời gian 'By the end of this week'."
    },
    {
      id: 204,
      part: "PART2",
      question_text: "Listen to the question and select the best response.",
      audio_script: "Question: Why was yesterday's staff meeting canceled? Response A: Because the director was out sick. Response B: In Room 302 on the third floor. Response C: No, I didn't see him.",
      option_a: "Because the director was out sick.",
      option_b: "In Room 302 on the third floor.",
      option_c: "No, I didn't see him.",
      option_d: null,
      correct_option: "A",
      explanation: "Câu hỏi 'Why' (Tại sao?) -> Đáp án A giải thích lý do 'Because the director was out sick'."
    },
    {
      id: 205,
      part: "PART2",
      question_text: "Listen to the question and select the best response.",
      audio_script: "Question: Would you like to order lunch now or wait for John? Response A: Let's wait another ten minutes. Response B: Yes, I love Italian food. Response C: In the main conference room.",
      option_a: "Let's wait another ten minutes.",
      option_b: "Yes, I love Italian food.",
      option_c: "In the main conference room.",
      option_d: null,
      correct_option: "A",
      explanation: "Câu hỏi lựa chọn 'order now or wait?' -> Đáp án A đưa ra quyết định 'Let's wait'."
    }
  ],
  PART3: [
    {
      id: 301,
      part: "PART3",
      passage_text: "Man: Excuse me, do you know which gate the flight to Hanoi departs from?\nWoman: Yes, Flight VN-241 leaves from Gate 12B on the second level.\nMan: Thank you! Is it close to the duty-free shop?",
      audio_script: "Man: Excuse me, do you know which gate the flight to Hanoi departs from? Woman: Yes, Flight VN-241 leaves from Gate 12B on the second level. Man: Thank you! Is it close to the duty-free shop?",
      question_text: "1. Where are the speakers currently located?",
      option_a: "At a train station",
      option_b: "At an airport terminal",
      option_c: "At a bus stop",
      option_d: "At a hotel lobby",
      correct_option: "B",
      explanation: "Từ khóa 'flight to Hanoi' và 'Gate 12B' cho biết bối cảnh ở sân bay."
    },
    {
      id: 302,
      part: "PART3",
      passage_text: "Man: Excuse me, do you know which gate the flight to Hanoi departs from?\nWoman: Yes, Flight VN-241 leaves from Gate 12B on the second level.\nMan: Thank you! Is it close to the duty-free shop?",
      audio_script: "Man: Excuse me, do you know which gate the flight to Hanoi departs from? Woman: Yes, Flight VN-241 leaves from Gate 12B on the second level. Man: Thank you! Is it close to the duty-free shop?",
      question_text: "2. What gate does the flight depart from?",
      option_a: "Gate 2A",
      option_b: "Gate 10",
      option_c: "Gate 12B",
      option_d: "Gate 241",
      correct_option: "C",
      explanation: "Người phụ nữ khẳng định: 'leaves from Gate 12B'."
    },
    {
      id: 303,
      part: "PART3",
      passage_text: "Woman: Hi Tom, did you finish reviewing the financial budget for next quarter?\nMan: Almost! I just need to double-check the marketing expenses.\nWoman: Great, please email me the final PDF before 3 PM today.",
      audio_script: "Woman: Hi Tom, did you finish reviewing the financial budget for next quarter? Man: Almost! I just need to double-check the marketing expenses. Woman: Great, please email me the final PDF before 3 PM today.",
      question_text: "3. What is the man currently checking?",
      option_a: "Marketing expenses",
      option_b: "Flight schedules",
      option_c: "Client feedback",
      option_d: "Office inventory",
      correct_option: "A",
      explanation: "Người nam nói: 'I just need to double-check the marketing expenses'."
    },
    {
      id: 304,
      part: "PART3",
      passage_text: "Woman: Hi Tom, did you finish reviewing the financial budget for next quarter?\nMan: Almost! I just need to double-check the marketing expenses.\nWoman: Great, please email me the final PDF before 3 PM today.",
      audio_script: "Woman: Hi Tom, did you finish reviewing the financial budget for next quarter? Man: Almost! I just need to double-check the marketing expenses. Woman: Great, please email me the final PDF before 3 PM today.",
      question_text: "4. What does the woman ask the man to do before 3 PM?",
      option_a: "Call a client",
      option_b: "Email a final PDF file",
      option_c: "Print the hard copies",
      option_d: "Schedule a team meeting",
      correct_option: "B",
      explanation: "Người nữ nhắc: 'please email me the final PDF before 3 PM today'."
    },
    {
      id: 305,
      part: "PART3",
      passage_text: "Woman: Hi Tom, did you finish reviewing the financial budget for next quarter?\nMan: Almost! I just need to double-check the marketing expenses.\nWoman: Great, please email me the final PDF before 3 PM today.",
      audio_script: "Woman: Hi Tom, did you finish reviewing the financial budget for next quarter? Man: Almost! I just need to double-check the marketing expenses. Woman: Great, please email me the final PDF before 3 PM today.",
      question_text: "5. What department do the speakers likely work in?",
      option_a: "Human Resources",
      option_b: "Finance / Accounting",
      option_c: "Customer Support",
      option_d: "Legal Department",
      correct_option: "B",
      explanation: "Họ đang thảo luận về 'financial budget' (ngân sách tài chính)."
    }
  ],
  PART4: [
    {
      id: 401,
      part: "PART4",
      passage_text: "Attention all passengers on flight VN-241 to Hanoi. Due to maintenance at Gate 10, your departure gate has been moved to Gate 12B. Please head to Gate 12B immediately.",
      audio_script: "Attention all passengers on flight VN-241 to Hanoi. Due to maintenance at Gate 10, your departure gate has been moved to Gate 12B. Please head to Gate 12B immediately.",
      question_text: "1. What is the main purpose of this announcement?",
      option_a: "To announce a gate change",
      option_b: "To offer ticket discounts",
      option_c: "To inform about lost baggage",
      option_d: "To cancel all evening flights",
      correct_option: "A",
      explanation: "Thông báo nêu rõ 'departure gate has been moved to Gate 12B'."
    },
    {
      id: 402,
      part: "PART4",
      passage_text: "Attention all passengers on flight VN-241 to Hanoi. Due to maintenance at Gate 10, your departure gate has been moved to Gate 12B. Please head to Gate 12B immediately.",
      audio_script: "Attention all passengers on flight VN-241 to Hanoi. Due to maintenance at Gate 10, your departure gate has been moved to Gate 12B. Please head to Gate 12B immediately.",
      question_text: "2. Why was the gate changed?",
      option_a: "Bad weather conditions",
      option_b: "Routine maintenance",
      option_c: "Security inspection",
      option_d: "Overbooking of passengers",
      correct_option: "B",
      explanation: "Lý do nêu trong bài: 'Due to maintenance at Gate 10'."
    },
    {
      id: 303,
      part: "PART4",
      passage_text: "Welcome to the radio broadcast of Tech Today. Today we are joined by Dr. Alan Smith, who will discuss the future of renewable energy and battery technology.",
      audio_script: "Welcome to the radio broadcast of Tech Today. Today we are joined by Dr. Alan Smith, who will discuss the future of renewable energy and battery technology.",
      question_text: "3. Who is the guest on the radio broadcast?",
      option_a: "Dr. Alan Smith",
      option_b: "A flight technician",
      option_c: "A financial advisor",
      option_d: "A city mayor",
      correct_option: "A",
      explanation: "Bài phát thanh giới thiệu: 'joined by Dr. Alan Smith'."
    },
    {
      id: 404,
      part: "PART4",
      passage_text: "Welcome to the radio broadcast of Tech Today. Today we are joined by Dr. Alan Smith, who will discuss the future of renewable energy and battery technology.",
      audio_script: "Welcome to the radio broadcast of Tech Today. Today we are joined by Dr. Alan Smith, who will discuss the future of renewable energy and battery technology.",
      question_text: "4. What topic will the guest discuss?",
      option_a: "Stock market trends",
      option_b: "Renewable energy technology",
      option_c: "Healthcare reform",
      option_d: "International travel rules",
      correct_option: "B",
      explanation: "Chủ đề cuộc nói chuyện là 'future of renewable energy'."
    },
    {
      id: 405,
      part: "PART4",
      passage_text: "Welcome to the radio broadcast of Tech Today. Today we are joined by Dr. Alan Smith, who will discuss the future of renewable energy and battery technology.",
      audio_script: "Welcome to the radio broadcast of Tech Today. Today we are joined by Dr. Alan Smith, who will discuss the future of renewable energy and battery technology.",
      question_text: "5. What type of program is being broadcast?",
      option_a: "A radio talk show",
      option_b: "A television weather report",
      option_c: "A sports commentary",
      option_d: "A movie trailer",
      correct_option: "A",
      explanation: "Mở đầu bài nói ghi rõ: 'Welcome to the radio broadcast'."
    }
  ],
  PART5: [
    {
      id: 501,
      part: "PART5",
      question_text: "1. All department managers are requested to submit their quarterly reports _______ Friday afternoon.",
      option_a: "before",
      option_b: "prior",
      option_c: "earlier",
      option_d: "ahead",
      correct_option: "A",
      explanation: "Trước mốc thời gian 'Friday afternoon' sử dụng giới từ 'before'."
    },
    {
      id: 502,
      part: "PART5",
      question_text: "2. The new employee training session was _______ helpful than expected.",
      option_a: "more",
      option_b: "most",
      option_c: "much",
      option_d: "as",
      correct_option: "A",
      explanation: "Cấu trúc so sánh hơn với tính từ 'helpful' + than -> Dùng 'more'."
    },
    {
      id: 503,
      part: "PART5",
      question_text: "3. Ms. Davis _______ handles all customer feedback regarding product refunds.",
      option_a: "directly",
      option_b: "directs",
      option_c: "direction",
      option_d: "direct",
      correct_option: "A",
      explanation: "Bổ nghĩa cho động từ thường 'handles' cần dùng trạng từ 'directly'."
    },
    {
      id: 504,
      part: "PART5",
      question_text: "4. Please ensure that all lights are turned off _______ leaving the conference room.",
      option_a: "before",
      option_b: "during",
      option_c: "between",
      option_d: "opposite",
      correct_option: "A",
      explanation: "Cấu trúc giới từ + V-ing: 'before leaving' (trước khi rời khỏi)."
    },
    {
      id: 505,
      part: "PART5",
      question_text: "5. Construction of the new research facility is expected to be completed _______ next spring.",
      option_a: "by",
      option_b: "at",
      option_c: "on",
      option_d: "of",
      correct_option: "A",
      explanation: "Diễn tả mốc thời gian hoàn thành công việc trước khoảng nào dùng giới từ 'by'."
    }
  ],
  PART6: [
    {
      id: 601,
      part: "PART6",
      passage_text: "To All Staff:\nPlease note that the main cafeteria will be closed for renovation from Monday to Wednesday. During this time, free snacks and coffee will be provided in the 3rd-floor lounge.",
      question_text: "1. Why will the cafeteria be closed?",
      option_a: "For planned renovation work",
      option_b: "Due to bad weather",
      option_c: "For a private company celebration",
      option_d: "Because of electrical repairs",
      correct_option: "A",
      explanation: "Bài viết ghi rõ: 'closed for renovation'."
    },
    {
      id: 602,
      part: "PART6",
      passage_text: "To All Staff:\nPlease note that the main cafeteria will be closed for renovation from Monday to Wednesday. During this time, free snacks and coffee will be provided in the 3rd-floor lounge.",
      question_text: "2. How long will the closure last?",
      option_a: "One day",
      option_b: "Three days",
      option_c: "One week",
      option_d: "One month",
      correct_option: "B",
      explanation: "Từ thứ 2 đến thứ 4 (Monday to Wednesday) là 3 ngày."
    },
    {
      id: 603,
      part: "PART6",
      passage_text: "To All Staff:\nPlease note that the main cafeteria will be closed for renovation from Monday to Wednesday. During this time, free snacks and coffee will be provided in the 3rd-floor lounge.",
      question_text: "3. Where can employees get free snacks during this period?",
      option_a: "At the front desk",
      option_b: "In the 3rd-floor lounge",
      option_c: "At the outdoor garden",
      option_d: "In the basement garage",
      correct_option: "B",
      explanation: "Đoạn văn nêu rõ: 'provided in the 3rd-floor lounge'."
    },
    {
      id: 604,
      part: "PART6",
      passage_text: "Dear Valued Customer,\nThank you for choosing Apex Telecom. Your recent invoice is now available for review on your online portal. Please make sure to settle the outstanding payment before the due date.",
      question_text: "4. What is the main topic of this email?",
      option_a: "A monthly invoice notification",
      option_b: "A job application result",
      option_c: "A flight booking receipt",
      option_d: "A password reset request",
      correct_option: "A",
      explanation: "Thư thông báo về 'recent invoice' (hóa đơn thanh toán gần nhất)."
    },
    {
      id: 605,
      part: "PART6",
      passage_text: "Dear Valued Customer,\nThank you for choosing Apex Telecom. Your recent invoice is now available for review on your online portal. Please make sure to settle the outstanding payment before the due date.",
      question_text: "5. Where can the customer view their invoice?",
      option_a: "On their online portal",
      option_b: "In a printed newspaper",
      option_c: "At a local postal office",
      option_d: "Via text message only",
      correct_option: "A",
      explanation: "Thư hướng dẫn xem tại: 'on your online portal'."
    }
  ],
  PART7: [
    {
      id: 701,
      part: "PART7",
      passage_text: "MEMORANDUM\nTo: All Marketing Staff\nFrom: Sarah Jenkins, Regional Director\nSubject: Autumn Campaign Launch\n\nOur product launch has been officially rescheduled to October 15. All promotional materials must be finalized by the end of this week.",
      question_text: "1. When will the product launch take place?",
      option_a: "On October 15",
      option_b: "At the end of this week",
      option_c: "Next Monday morning",
      option_d: "In early November",
      correct_option: "A",
      explanation: "Đoạn văn ghi rõ: 'rescheduled to October 15'."
    },
    {
      id: 702,
      part: "PART7",
      passage_text: "MEMORANDUM\nTo: All Marketing Staff\nFrom: Sarah Jenkins, Regional Director\nSubject: Autumn Campaign Launch\n\nOur product launch has been officially rescheduled to October 15. All promotional materials must be finalized by the end of this week.",
      question_text: "2. What must be completed by the end of this week?",
      option_a: "Promotional materials",
      option_b: "Employee performance reviews",
      option_c: "Budget audit reports",
      option_d: "Office relocation plans",
      correct_option: "A",
      explanation: "Thông báo yêu cầu: 'All promotional materials must be finalized'."
    },
    {
      id: 703,
      part: "PART7",
      passage_text: "JOB OPENING: Senior Graphic Designer\nGlobal Media Corp is seeking an experienced Senior Graphic Designer with at least 5 years of industry experience in digital advertising and brand management.",
      question_text: "3. What job position is being advertised?",
      option_a: "Senior Graphic Designer",
      option_b: "Financial Accountant",
      option_c: "Software Engineer",
      option_d: "Human Resources Specialist",
      correct_option: "A",
      explanation: "Tiêu đề tuyển dụng nêu rõ: 'Senior Graphic Designer'."
    },
    {
      id: 704,
      part: "PART7",
      passage_text: "JOB OPENING: Senior Graphic Designer\nGlobal Media Corp is seeking an experienced Senior Graphic Designer with at least 5 years of industry experience in digital advertising and brand management.",
      question_text: "4. How many years of experience are required for this role?",
      option_a: "At least 1 year",
      option_b: "At least 3 years",
      option_c: "At least 5 years",
      option_d: "At least 10 years",
      correct_option: "C",
      explanation: "Yêu cầu kinh nghiệm: 'at least 5 years of industry experience'."
    },
    {
      id: 705,
      part: "PART7",
      passage_text: "JOB OPENING: Senior Graphic Designer\nGlobal Media Corp is seeking an experienced Senior Graphic Designer with at least 5 years of industry experience in digital advertising and brand management.",
      question_text: "5. What company is posting this job opening?",
      option_a: "Global Media Corp",
      option_b: "Apex Telecom",
      option_c: "Grand Hotel",
      option_d: "Tech Today Inc.",
      correct_option: "A",
      explanation: "Tên công ty tuyển dụng: 'Global Media Corp'."
    }
  ]
};

export default function ExamDetailPage() {
  const params = useParams();
  const examId = params?.id || "1";

  const [activePart, setActivePart] = useState<string>("PART1");
  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResult, setShowResult] = useState(false);
  const [refreshSeed, setRefreshSeed] = useState(0);

  const partsList = [
    { key: "PART1", label: "Part 1 (Hình Ảnh)" },
    { key: "PART2", label: "Part 2 (Hỏi-Đáp)" },
    { key: "PART3", label: "Part 3 (Hội Thoại)" },
    { key: "PART4", label: "Part 4 (Bài Nói)" },
    { key: "PART5", label: "Part 5 (Điền Câu)" },
    { key: "PART6", label: "Part 6 (Điền Đoạn)" },
    { key: "PART7", label: "Part 7 (Đọc Hiểu)" },
  ];

  // Nạp 5 câu hỏi của Part đang chọn
  useEffect(() => {
    setShowResult(false);
    setUserAnswers({});

    // Lấy tập câu hỏi của Part hiện tại từ Database
    const pool = fullToeicDatabase[activePart] || [];
    // Đảm bảo lấy đúng 5 câu
    setQuestions(pool.slice(0, 5));
  }, [activePart, refreshSeed]);

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

  const handleNextPart = () => {
    const currentIndex = partsList.findIndex((p) => p.key === activePart);
    if (currentIndex < partsList.length - 1) {
      setActivePart(partsList[currentIndex + 1].key);
    } else {
      setActivePart("PART1"); // Quay về Part 1 nếu đã ở Part 7
    }
  };

  const handleRefreshPart = () => {
    setRefreshSeed((prev) => prev + 1);
  };

  const getPartTitle = (partKey: string) => {
    switch (partKey) {
      case "PART1": return "Part 1: Photographs (Hình Ảnh - 5 Câu)";
      case "PART2": return "Part 2: Question-Response (Hỏi Đáp - 5 Câu)";
      case "PART3": return "Part 3: Short Conversations (Hội Thoại Short - 5 Câu)";
      case "PART4": return "Part 4: Short Talks (Bài Nói Short - 5 Câu)";
      case "PART5": return "Part 5: Incomplete Sentences (Điền Câu - 5 Câu)";
      case "PART6": return "Part 6: Text Completion (Điền Đoạn Văn - 5 Câu)";
      case "PART7": return "Part 7: Reading Comprehension (Đọc Hiểu - 5 Câu)";
      default: return partKey;
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1329", color: "#f8fafc", padding: "20px 10px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        
        {/* HEADER ĐỀ THI */}
        <div style={{ backgroundColor: "#1e293b", padding: "20px", borderRadius: "16px", border: "1px solid #334155", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ backgroundColor: "#16a34a", color: "#fff", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "bold" }}>
                TOEIC OFFICIAL TEST PRACTICE
              </span>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "22px", color: "#38bdf8" }}>📝 Luyện Tập {getPartTitle(activePart)}</h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                Làm 5 câu/Part • Part 1&2 ẩn text đáp án • Nộp bài để xem điểm & lời giải
              </p>
            </div>
            {showResult && (
              <div style={{ backgroundColor: "#065f46", padding: "12px 20px", borderRadius: "12px", border: "1px solid #10b981", textAlign: "center" }}>
                <span style={{ fontSize: "11px", color: "#a7f3d0", textTransform: "uppercase" }}>KẾT QUẢ {activePart}</span>
                <div style={{ fontSize: "22px", fontWeight: "bold", color: "#4ade80" }}>
                  {calculateScore()} / {questions.length} Câu
                </div>
              </div>
            )}
          </div>

          {/* TAB CHỌN TỪNG PART */}
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

        {/* DANH SÁCH 5 CÂU HỎI */}
        {questions.map((q, idx) => {
          const userChoice = userAnswers[q.id];
          const isCorrect = userChoice === q.correct_option;
          const isListening = ["PART1", "PART2", "PART3", "PART4"].includes(q.part);
          const isAudioHiddenOptions = q.part === "PART1" || q.part === "PART2";

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
              {/* BADGE HIỂN THỊ */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ backgroundColor: "#0284c7", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>
                  🏷️ {q.part} - Câu {idx + 1}/5
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

              {/* 📖 PART 6 & 7: ĐOẠN VĂN ĐỌC HIỂU */}
              {q.passage_text && !isListening && (
                <div style={{ backgroundColor: "#0f172a", padding: "16px", borderRadius: "10px", borderLeft: "4px solid #38bdf8", marginBottom: "16px", color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
                  <b style={{ color: "#38bdf8", display: "block", marginBottom: "6px" }}>📄 Đoạn Văn Bài Đọc (Reading Text):</b>
                  <div style={{ whiteSpace: "pre-line" }}>{q.passage_text}</div>
                </div>
              )}

              {/* 🎧 LOA BĂNG NGHE CHO PART 1, 2, 3, 4 */}
              {isListening && (
                <div style={{ backgroundColor: "#0f172a", padding: "14px", borderRadius: "12px", border: "1px solid #0284c7", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#38bdf8", fontWeight: "bold" }}>
                      🎧 Băng Nghe Tiếng Anh (Listening Track):
                    </p>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Bấm nút bên cạnh để nghe bài đọc giọng Mỹ chuẩn</span>
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

              {/* NỘI DUNG CÂU HỎI (PART 1 & 2 ẨN CÂU HỎI CHỮ TRÊN ĐỀ THI) */}
              <h3 style={{ fontSize: "16px", color: "#f1f5f9", margin: "10px 0 16px 0", lineHeight: "1.5" }}>
                <span style={{ color: "#38bdf8", marginRight: "6px" }}>Câu {idx + 1}:</span> 
                {isAudioHiddenOptions && !showResult 
                  ? (q.part === "PART1" ? "Look at the picture and select the best statement." : "Listen to the question and select the best response.") 
                  : q.question_text}
              </h3>

              {/* NÚT CHỌN ĐÁP ÁN A, B, C, D */}
              <div style={{ display: "grid", gap: "10px" }}>
                {["A", "B", "C", "D"].map((optKey) => {
                  const optText = q[`option_${optKey.toLowerCase()}`];
                  
                  // Part 2 chuẩn TOEIC chỉ có 3 câu A, B, C (không có D)
                  if (q.part === "PART2" && optKey === "D") return null;
                  if (!optText && showResult) return null;

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
                      <b style={{ color: "#38bdf8", marginRight: "8px" }}>({optKey})</b>
                      
                      {/* BẢO MẬT TEXT ĐÁP ÁN: PART 1 & 2 LÚC LÀM BÀI CHỈ HIỆN A, B, C, D! NỘP BÀI MỚI HIỆN CHỮ */}
                      {isAudioHiddenOptions && !showResult 
                        ? `Đáp án ${optKey}` 
                        : optText}
                    </button>
                  );
                })}
              </div>

              {/* 💡 CHỈ HIỂN THỊ LỜI THOẠI (TRANSCRIPT) VÀ GIẢI THÍCH SAU KHI NỘP BÀI */}
              {showResult && (
                <div style={{ marginTop: "18px", padding: "14px", backgroundColor: "#0f172a", borderRadius: "10px", borderLeft: "4px solid #10b981" }}>
                  {isListening && q.audio_script && (
                    <div style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px dashed #334155" }}>
                      <b style={{ color: "#38bdf8", fontSize: "13px" }}>📜 Lời Thoại Băng Nghe (Transcript):</b>
                      <p style={{ color: "#cbd5e1", fontSize: "13px", margin: "4px 0 0 0", whiteSpace: "pre-line" }}>{q.audio_script}</p>
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

        {/* NÚT NỘP BÀI VÀ CÁC NÚT ĐIỀU HƯỚNG TỚI CÂU HỎI MỚI / PART TIẾP THEO */}
        <div style={{ textAlign: "center", margin: "30px 0 60px 0" }}>
          {!showResult ? (
            <button
              onClick={() => setShowResult(true)}
              style={{
                padding: "14px 40px",
                backgroundColor: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                boxShadow: "0 4px 14px rgba(22, 163, 74, 0.4)",
              }}
            >
              🚀 Nộp Bài {activePart} & Xem Đáp Án
            </button>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
              <button
                onClick={handleRefreshPart}
                style={{
                  padding: "14px 28px",
                  backgroundColor: "#0284c7",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "bold",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.4)",
                }}
              >
                🔄 Làm Bộ 5 Câu Hỏi Khác ({activePart})
              </button>

              <button
                onClick={handleNextPart}
                style={{
                  padding: "14px 28px",
                  backgroundColor: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "bold",
                  boxShadow: "0 4px 14px rgba(22, 163, 74, 0.4)",
                }}
              >
                ➡️ Chuyển Sang Part Tiếp Theo
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}