"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Trình đọc phát âm tiếng Anh giọng Mỹ chuẩn qua Web Speech API
function playEnglishSpeech(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.88; // Tốc độ chuẩn thi TOEIC ETS
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Trình duyệt không hỗ trợ phát âm thanh tự động.");
  }
}

// Thuật toán tráo ngẫu nhiên danh sách (Fisher-Yates Shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// NGÂN HÀNG DỮ LIỆU MỞ RỘNG TOÀN BỘ CÁC PART 1 - 7
const fullToeicDatabase: { [key: string]: any[] } = {
  PART1: [
    {
      id: 101,
      part: "PART1",
      image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop",
      options: [
        { text: "A woman is typing on a laptop keyboard.", isCorrect: true },
        { text: "A woman is holding a cup of coffee.", isCorrect: false },
        { text: "The monitors are turned off.", isCorrect: false },
        { text: "She is talking on the phone.", isCorrect: false },
      ],
      explanation: "Trong hình người phụ nữ đang thao tác gõ bàn phím laptop."
    },
    {
      id: 102,
      part: "PART1",
      image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop",
      options: [
        { text: "Some people are attending a meeting.", isCorrect: true },
        { text: "They are writing on a blackboard.", isCorrect: false },
        { text: "A man is closing the window.", isCorrect: false },
        { text: "The chairs are stacked against the wall.", isCorrect: false },
      ],
      explanation: "Mọi người đang ngồi quanh bàn họp cùng thảo luận công việc."
    },
    {
      id: 103,
      part: "PART1",
      image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop",
      options: [
        { text: "They are looking at a laptop computer.", isCorrect: true },
        { text: "They are inspecting some heavy machinery.", isCorrect: false },
        { text: "One of the men is wearing safety gloves.", isCorrect: false },
        { text: "They are walking outdoors in a park.", isCorrect: false },
      ],
      explanation: "Nhóm đồng nghiệp đang cùng tập trung nhìn vào màn hình laptop."
    },
    {
      id: 104,
      part: "PART1",
      image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop",
      options: [
        { text: "An engineer is working on a circuit board.", isCorrect: true },
        { text: "He is painting a wall green.", isCorrect: false },
        { text: "He is sweeping the workshop floor.", isCorrect: false },
        { text: "He is taking off his safety glasses.", isCorrect: false },
      ],
      explanation: "Kỹ sư đang tỉ mỉ kiểm tra và sửa chữa bảng mạch điện tử."
    },
    {
      id: 105,
      part: "PART1",
      image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
      options: [
        { text: "Some lights are turned on in the office.", isCorrect: true },
        { text: "The office is completely empty of furniture.", isCorrect: false },
        { text: "People are eating lunch in a cafeteria.", isCorrect: false },
        { text: "Workers are assembling wooden desks.", isCorrect: false },
      ],
      explanation: "Khung cảnh văn phòng làm việc với hệ thống đèn trần đang bật sáng."
    },
    {
      id: 106,
      part: "PART1",
      image_url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop",
      options: [
        { text: "A chef is preparing food in a kitchen.", isCorrect: true },
        { text: "A waiter is serving drinks to customers.", isCorrect: false },
        { text: "The restaurant is closed for the night.", isCorrect: false },
        { text: "Some plates are being washed in a sink.", isCorrect: false },
      ],
      explanation: "Đầu bếp đang tập trung chế biến món ăn trong bếp nhà hàng."
    },
    {
      id: 107,
      part: "PART1",
      image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop",
      options: [
        { text: "Boxes are stacked on warehouse shelves.", isCorrect: true },
        { text: "A forklift is loading a delivery truck.", isCorrect: false },
        { text: "Workers are signing shipping documents.", isCorrect: false },
        { text: "The warehouse doors are wide open.", isCorrect: false },
      ],
      explanation: "Các hộp hàng hóa được chất xếp gọn gàng trên giá kho."
    }
  ],
  PART2: [
    {
      id: 201,
      part: "PART2",
      question_prompt: "Where is the monthly financial report?",
      options: [
        { text: "It's on Mr. David's desk.", isCorrect: true },
        { text: "Yes, every single month.", isCorrect: false },
        { text: "By train, usually.", isCorrect: false },
      ],
      explanation: "Câu hỏi 'Where' (Ở đâu?) -> Đáp án chọn vị trí 'On Mr. David's desk'."
    },
    {
      id: 202,
      part: "PART2",
      question_prompt: "Who is responsible for organizing the annual conference?",
      options: [
        { text: "Ms. Sarah in the marketing team.", isCorrect: true },
        { text: "At the Grand Hotel downtown.", isCorrect: false },
        { text: "Next Tuesday morning at nine.", isCorrect: false },
      ],
      explanation: "Câu hỏi 'Who' (Ai chịu trách nhiệm?) -> Đáp án chọn người 'Ms. Sarah'."
    },
    {
      id: 203,
      part: "PART2",
      question_prompt: "When will the new safety guidelines be published?",
      options: [
        { text: "By the end of this week.", isCorrect: true },
        { text: "In the company cafeteria.", isCorrect: false },
        { text: "Yes, I read them yesterday.", isCorrect: false },
      ],
      explanation: "Câu hỏi 'When' (Khi nào?) -> Đáp án chỉ thời gian 'By the end of this week'."
    },
    {
      id: 204,
      part: "PART2",
      question_prompt: "Why was yesterday's staff meeting canceled?",
      options: [
        { text: "Because the director was out sick.", isCorrect: true },
        { text: "In Room 302 on the third floor.", isCorrect: false },
        { text: "No, I didn't see him there.", isCorrect: false },
      ],
      explanation: "Câu hỏi 'Why' (Tại sao?) -> Đáp án đưa ra lý do 'Because director was out sick'."
    },
    {
      id: 205,
      part: "PART2",
      question_prompt: "Would you like to order lunch now or wait for John?",
      options: [
        { text: "Let's wait another ten minutes.", isCorrect: true },
        { text: "Yes, I love Italian food.", isCorrect: false },
        { text: "In the main conference room.", isCorrect: false },
      ],
      explanation: "Câu hỏi lựa chọn 'order now or wait?' -> Đáp án đưa ra lựa chọn 'Let's wait'."
    },
    {
      id: 206,
      part: "PART2",
      question_prompt: "How long will the flight to Tokyo take?",
      options: [
        { text: "Approximately five hours.", isCorrect: true },
        { text: "To attend an international trade show.", isCorrect: false },
        { text: "Yes, I bought my ticket online.", isCorrect: false },
      ],
      explanation: "Câu hỏi 'How long' (Bao lâu?) -> Đáp án trả lời thời lượng 'Five hours'."
    },
    {
      id: 207,
      part: "PART2",
      question_prompt: "Why don't we take a short break for coffee?",
      options: [
        { text: "That sounds like a great idea.", isCorrect: true },
        { text: "Two cups with sugar, please.", isCorrect: false },
        { text: "At the corner cafe near the station.", isCorrect: false },
      ],
      explanation: "Câu đề xuất 'Why don't we...?' -> Đáp án đồng ý 'That sounds like a great idea'."
    }
  ],
  PART3: [
    {
      id: 301,
      part: "PART3",
      audio_script: "Man: Excuse me, do you know which gate the flight to Hanoi departs from? Woman: Yes, Flight VN-241 leaves from Gate 12B on the second level. Man: Thank you! Is it close to the duty-free shop?",
      question_text: "1. Where are the speakers currently located?",
      options: [
        { text: "At an airport terminal", isCorrect: true },
        { text: "At a train station", isCorrect: false },
        { text: "At a bus stop", isCorrect: false },
        { text: "At a hotel lobby", isCorrect: false },
      ],
      explanation: "Từ khóa 'flight to Hanoi' và 'Gate 12B' cho biết bối cảnh ở sân bay."
    },
    {
      id: 302,
      part: "PART3",
      audio_script: "Man: Excuse me, do you know which gate the flight to Hanoi departs from? Woman: Yes, Flight VN-241 leaves from Gate 12B on the second level. Man: Thank you! Is it close to the duty-free shop?",
      question_text: "2. What gate does the flight depart from?",
      options: [
        { text: "Gate 12B", isCorrect: true },
        { text: "Gate 2A", isCorrect: false },
        { text: "Gate 10", isCorrect: false },
        { text: "Gate 241", isCorrect: false },
      ],
      explanation: "Người phụ nữ khẳng định: 'leaves from Gate 12B'."
    },
    {
      id: 303,
      part: "PART3",
      audio_script: "Woman: Hi Tom, did you finish reviewing the financial budget for next quarter? Man: Almost! I just need to double-check the marketing expenses. Woman: Great, please email me the final PDF before 3 PM today.",
      question_text: "3. What is the man currently checking?",
      options: [
        { text: "Marketing expenses", isCorrect: true },
        { text: "Flight schedules", isCorrect: false },
        { text: "Client feedback", isCorrect: false },
        { text: "Office inventory", isCorrect: false },
      ],
      explanation: "Người nam nói: 'I just need to double-check the marketing expenses'."
    },
    {
      id: 304,
      part: "PART3",
      audio_script: "Woman: Hi Tom, did you finish reviewing the financial budget for next quarter? Man: Almost! I just need to double-check the marketing expenses. Woman: Great, please email me the final PDF before 3 PM today.",
      question_text: "4. What does the woman ask the man to do before 3 PM?",
      options: [
        { text: "Email a final PDF file", isCorrect: true },
        { text: "Call a client", isCorrect: false },
        { text: "Print hard copies", isCorrect: false },
        { text: "Schedule a team meeting", isCorrect: false },
      ],
      explanation: "Người nữ nhắc: 'please email me the final PDF before 3 PM today'."
    },
    {
      id: 305,
      part: "PART3",
      audio_script: "Woman: Hi Tom, did you finish reviewing the financial budget for next quarter? Man: Almost! I just need to double-check the marketing expenses. Woman: Great, please email me the final PDF before 3 PM today.",
      question_text: "5. What department do the speakers likely work in?",
      options: [
        { text: "Finance / Accounting", isCorrect: true },
        { text: "Human Resources", isCorrect: false },
        { text: "Customer Support", isCorrect: false },
        { text: "Legal Department", isCorrect: false },
      ],
      explanation: "Họ đang thảo luận về 'financial budget' (ngân sách tài chính)."
    },
    {
      id: 306,
      part: "PART3",
      audio_script: "Man: Hello, I'm calling to inquire about my recent printer order. Order number is #9082. Woman: Let me check our warehouse system... Yes, it was shipped yesterday morning and should arrive by tomorrow.",
      question_text: "6. Why is the man calling?",
      options: [
        { text: "To check the status of an order", isCorrect: true },
        { text: "To apply for a job position", isCorrect: false },
        { text: "To cancel a flight reservation", isCorrect: false },
        { text: "To request a software refund", isCorrect: false },
      ],
      explanation: "Người nam nói: 'calling to inquire about my recent printer order'."
    }
  ],
  PART4: [
    {
      id: 401,
      part: "PART4",
      audio_script: "Attention all passengers on flight VN-241 to Hanoi. Due to maintenance at Gate 10, your departure gate has been moved to Gate 12B. Please head to Gate 12B immediately.",
      question_text: "1. What is the main purpose of this announcement?",
      options: [
        { text: "To announce a gate change", isCorrect: true },
        { text: "To offer ticket discounts", isCorrect: false },
        { text: "To inform about lost baggage", isCorrect: false },
        { text: "To cancel all evening flights", isCorrect: false },
      ],
      explanation: "Thông báo nêu rõ 'departure gate has been moved to Gate 12B'."
    },
    {
      id: 402,
      part: "PART4",
      audio_script: "Attention all passengers on flight VN-241 to Hanoi. Due to maintenance at Gate 10, your departure gate has been moved to Gate 12B. Please head to Gate 12B immediately.",
      question_text: "2. Why was the gate changed?",
      options: [
        { text: "Routine maintenance work", isCorrect: true },
        { text: "Bad weather conditions", isCorrect: false },
        { text: "Security inspection", isCorrect: false },
        { text: "Overbooking of passengers", isCorrect: false },
      ],
      explanation: "Lý do nêu trong bài: 'Due to maintenance at Gate 10'."
    },
    {
      id: 403,
      part: "PART4",
      audio_script: "Welcome to the radio broadcast of Tech Today. Today we are joined by Dr. Alan Smith, who will discuss the future of renewable energy and battery technology.",
      question_text: "3. Who is the guest on the radio broadcast?",
      options: [
        { text: "Dr. Alan Smith", isCorrect: true },
        { text: "A flight technician", isCorrect: false },
        { text: "A financial advisor", isCorrect: false },
        { text: "A city mayor", isCorrect: false },
      ],
      explanation: "Bài phát thanh giới thiệu: 'joined by Dr. Alan Smith'."
    },
    {
      id: 404,
      part: "PART4",
      audio_script: "Welcome to the radio broadcast of Tech Today. Today we are joined by Dr. Alan Smith, who will discuss the future of renewable energy and battery technology.",
      question_text: "4. What topic will the guest discuss?",
      options: [
        { text: "Renewable energy technology", isCorrect: true },
        { text: "Stock market trends", isCorrect: false },
        { text: "Healthcare reform", isCorrect: false },
        { text: "International travel rules", isCorrect: false },
      ],
      explanation: "Chủ đề cuộc nói chuyện là 'future of renewable energy'."
    },
    {
      id: 405,
      part: "PART4",
      audio_script: "Welcome to the radio broadcast of Tech Today. Today we are joined by Dr. Alan Smith, who will discuss the future of renewable energy and battery technology.",
      question_text: "5. What type of program is being broadcast?",
      options: [
        { text: "A radio talk show", isCorrect: true },
        { text: "A television weather report", isCorrect: false },
        { text: "A sports commentary", isCorrect: false },
        { text: "A movie trailer", isCorrect: false },
      ],
      explanation: "Mở đầu bài nói ghi rõ: 'Welcome to the radio broadcast'."
    }
  ],
  PART5: [
    {
      id: 501,
      part: "PART5",
      question_text: "1. All department managers are requested to submit their quarterly reports _______ Friday afternoon.",
      options: [
        { text: "before", isCorrect: true },
        { text: "prior", isCorrect: false },
        { text: "earlier", isCorrect: false },
        { text: "ahead", isCorrect: false },
      ],
      explanation: "Trước mốc thời gian 'Friday afternoon' sử dụng giới từ 'before'."
    },
    {
      id: 502,
      part: "PART5",
      question_text: "2. The new employee training session was _______ helpful than expected.",
      options: [
        { text: "more", isCorrect: true },
        { text: "most", isCorrect: false },
        { text: "much", isCorrect: false },
        { text: "as", isCorrect: false },
      ],
      explanation: "Cấu trúc so sánh hơn với tính từ dài 'helpful' + than -> Dùng 'more'."
    },
    {
      id: 503,
      part: "PART5",
      question_text: "3. Ms. Davis _______ handles all customer feedback regarding product refunds.",
      options: [
        { text: "directly", isCorrect: true },
        { text: "directs", isCorrect: false },
        { text: "direction", isCorrect: false },
        { text: "direct", isCorrect: false },
      ],
      explanation: "Bổ nghĩa cho động từ thường 'handles' cần dùng trạng từ 'directly'."
    },
    {
      id: 504,
      part: "PART5",
      question_text: "4. Please ensure that all lights are turned off _______ leaving the conference room.",
      options: [
        { text: "before", isCorrect: true },
        { text: "during", isCorrect: false },
        { text: "between", isCorrect: false },
        { text: "opposite", isCorrect: false },
      ],
      explanation: "Cấu trúc giới từ + V-ing: 'before leaving' (trước khi rời khỏi)."
    },
    {
      id: 505,
      part: "PART5",
      question_text: "5. Construction of the new research facility is expected to be completed _______ next spring.",
      options: [
        { text: "by", isCorrect: true },
        { text: "at", isCorrect: false },
        { text: "on", isCorrect: false },
        { text: "of", isCorrect: false },
      ],
      explanation: "Diễn tả mốc thời gian hoàn thành công việc trước khoảng nào dùng giới từ 'by'."
    },
    {
      id: 506,
      part: "PART5",
      question_text: "6. Due to his exceptional performance, Mr. Lee was _______ promoted to Senior Manager.",
      options: [
        { text: "recently", isCorrect: true },
        { text: "recent", isCorrect: false },
        { text: "recency", isCorrect: false },
        { text: "more recent", isCorrect: false },
      ],
      explanation: "Bổ nghĩa cho động từ phân từ 'promoted' dùng trạng từ thời gian 'recently'."
    },
    {
      id: 507,
      part: "PART5",
      question_text: "7. The annual budget proposal must be approved by the board _______ implementation.",
      options: [
        { text: "prior to", isCorrect: true },
        { text: "except for", isCorrect: false },
        { text: "in case of", isCorrect: false },
        { text: "according to", isCorrect: false },
      ],
      explanation: "Cụm 'prior to' có nghĩa là 'trước khi' (trước sự việc implementation)."
    }
  ],
  PART6: [
    {
      id: 601,
      part: "PART6",
      passage_text: "To All Staff:\nPlease note that the main cafeteria will be closed for renovation from Monday to Wednesday. During this time, free snacks and coffee will be provided in the 3rd-floor lounge.",
      question_text: "1. Why will the cafeteria be closed?",
      options: [
        { text: "For planned renovation work", isCorrect: true },
        { text: "Due to bad weather conditions", isCorrect: false },
        { text: "For a private company party", isCorrect: false },
        { text: "Because of electrical repairs", isCorrect: false },
      ],
      explanation: "Bài viết ghi rõ: 'closed for renovation'."
    },
    {
      id: 602,
      part: "PART6",
      passage_text: "To All Staff:\nPlease note that the main cafeteria will be closed for renovation from Monday to Wednesday. During this time, free snacks and coffee will be provided in the 3rd-floor lounge.",
      question_text: "2. How long will the closure last?",
      options: [
        { text: "Three days", isCorrect: true },
        { text: "One day", isCorrect: false },
        { text: "One week", isCorrect: false },
        { text: "One month", isCorrect: false },
      ],
      explanation: "Từ thứ 2 đến thứ 4 (Monday to Wednesday) là 3 ngày."
    },
    {
      id: 603,
      part: "PART6",
      passage_text: "To All Staff:\nPlease note that the main cafeteria will be closed for renovation from Monday to Wednesday. During this time, free snacks and coffee will be provided in the 3rd-floor lounge.",
      question_text: "3. Where can employees get free snacks during this period?",
      options: [
        { text: "In the 3rd-floor lounge", isCorrect: true },
        { text: "At the front desk", isCorrect: false },
        { text: "At the outdoor garden", isCorrect: false },
        { text: "In the basement garage", isCorrect: false },
      ],
      explanation: "Đoạn văn nêu rõ: 'provided in the 3rd-floor lounge'."
    },
    {
      id: 604,
      part: "PART6",
      passage_text: "Dear Valued Customer,\nThank you for choosing Apex Telecom. Your recent invoice is now available for review on your online portal. Please make sure to settle the outstanding payment before the due date.",
      question_text: "4. What is the main topic of this email?",
      options: [
        { text: "A monthly invoice notification", isCorrect: true },
        { text: "A job application result", isCorrect: false },
        { text: "A flight booking receipt", isCorrect: false },
        { text: "A password reset request", isCorrect: false },
      ],
      explanation: "Thư thông báo về 'recent invoice' (hóa đơn thanh toán gần nhất)."
    },
    {
      id: 605,
      part: "PART6",
      passage_text: "Dear Valued Customer,\nThank you for choosing Apex Telecom. Your recent invoice is now available for review on your online portal. Please make sure to settle the outstanding payment before the due date.",
      question_text: "5. Where can the customer view their invoice?",
      options: [
        { text: "On their online portal", isCorrect: true },
        { text: "In a printed newspaper", isCorrect: false },
        { text: "At a local postal office", isCorrect: false },
        { text: "Via text message only", isCorrect: false },
      ],
      explanation: "Thư hướng dẫn xem tại: 'on your online portal'."
    }
  ],
  PART7: [
    {
      id: 701,
      part: "PART7",
      passage_text: "MEMORANDUM\nTo: All Marketing Staff\nFrom: Sarah Jenkins, Regional Director\nSubject: Autumn Campaign Launch\n\nOur product launch has been officially rescheduled to October 15. All promotional materials must be finalized by the end of this week.",
      question_text: "1. When will the product launch take place?",
      options: [
        { text: "On October 15", isCorrect: true },
        { text: "At the end of this week", isCorrect: false },
        { text: "Next Monday morning", isCorrect: false },
        { text: "In early November", isCorrect: false },
      ],
      explanation: "Đoạn văn ghi rõ: 'rescheduled to October 15'."
    },
    {
      id: 702,
      part: "PART7",
      passage_text: "MEMORANDUM\nTo: All Marketing Staff\nFrom: Sarah Jenkins, Regional Director\nSubject: Autumn Campaign Launch\n\nOur product launch has been officially rescheduled to October 15. All promotional materials must be finalized by the end of this week.",
      question_text: "2. What must be completed by the end of this week?",
      options: [
        { text: "Promotional materials", isCorrect: true },
        { text: "Employee performance reviews", isCorrect: false },
        { text: "Budget audit reports", isCorrect: false },
        { text: "Office relocation plans", isCorrect: false },
      ],
      explanation: "Thông báo yêu cầu: 'All promotional materials must be finalized'."
    },
    {
      id: 703,
      part: "PART7",
      passage_text: "JOB OPENING: Senior Graphic Designer\nGlobal Media Corp is seeking an experienced Senior Graphic Designer with at least 5 years of industry experience in digital advertising and brand management.",
      question_text: "3. What job position is being advertised?",
      options: [
        { text: "Senior Graphic Designer", isCorrect: true },
        { text: "Financial Accountant", isCorrect: false },
        { text: "Software Engineer", isCorrect: false },
        { text: "Human Resources Specialist", isCorrect: false },
      ],
      explanation: "Tiêu đề tuyển dụng nêu rõ: 'Senior Graphic Designer'."
    },
    {
      id: 704,
      part: "PART7",
      passage_text: "JOB OPENING: Senior Graphic Designer\nGlobal Media Corp is seeking an experienced Senior Graphic Designer with at least 5 years of industry experience in digital advertising and brand management.",
      question_text: "4. How many years of experience are required for this role?",
      options: [
        { text: "At least 5 years", isCorrect: true },
        { text: "At least 1 year", isCorrect: false },
        { text: "At least 3 years", isCorrect: false },
        { text: "At least 10 years", isCorrect: false },
      ],
      explanation: "Yêu cầu kinh nghiệm: 'at least 5 years of industry experience'."
    },
    {
      id: 705,
      part: "PART7",
      passage_text: "JOB OPENING: Senior Graphic Designer\nGlobal Media Corp is seeking an experienced Senior Graphic Designer with at least 5 years of industry experience in digital advertising and brand management.",
      question_text: "5. What company is posting this job opening?",
      options: [
        { text: "Global Media Corp", isCorrect: true },
        { text: "Apex Telecom", isCorrect: false },
        { text: "Grand Hotel", isCorrect: false },
        { text: "Tech Today Inc.", isCorrect: false },
      ],
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

  // Nạp & Xáo Trộn Ngẫu Nhiên 5 Câu Hỏi + Đáp Án A,B,C,D
  useEffect(() => {
    setShowResult(false);
    setUserAnswers({});

    // 1. Lấy toàn bộ câu hỏi của Part hiện tại
    const pool = fullToeicDatabase[activePart] || [];

    // 2. Tráo câu hỏi ngẫu nhiên và chọn 5 câu
    const shuffledQuestions = shuffleArray(pool).slice(0, 5);

    // 3. Với từng câu hỏi, tráo ngẫu nhiên thứ tự các lựa chọn A, B, C, D
    const processed = shuffledQuestions.map((q) => {
      const shuffledOptions = shuffleArray(q.options).map((opt: any, idx: number) => ({
        label: String.fromCharCode(65 + idx), // Gán "A", "B", "C", "D"
        text: opt.text,
        isCorrect: opt.isCorrect,
      }));

      // Tìm vị trí câu đúng sau khi xáo
      const correctOpt = shuffledOptions.find((o) => o.isCorrect);

      return {
        ...q,
        shuffledOptions,
        correctOptionLabel: correctOpt ? correctOpt.label : "A",
      };
    });

    setQuestions(processed);
  }, [activePart, refreshSeed]);

  const handleSelectOption = (qId: number, label: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: label }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctOptionLabel) correct++;
    });
    return correct;
  };

  const handleNextPart = () => {
    const currentIndex = partsList.findIndex((p) => p.key === activePart);
    if (currentIndex < partsList.length - 1) {
      setActivePart(partsList[currentIndex + 1].key);
    } else {
      setActivePart("PART1");
    }
  };

  const handleRefreshPart = () => {
    setRefreshSeed((prev) => prev + 1);
  };

  // Phát âm thanh linh hoạt dựa trên thứ tự đáp án A, B, C, D đã xáo trộn
  const playDynamicQuestionAudio = (q: any) => {
    let audioText = "";
    if (q.part === "PART1") {
      audioText = q.shuffledOptions
        .map((opt: any) => `Statement ${opt.label}: ${opt.text}`)
        .join(". ");
    } else if (q.part === "PART2") {
      const responses = q.shuffledOptions
        .map((opt: any) => `Response ${opt.label}: ${opt.text}`)
        .join(". ");
      audioText = `Question: ${q.question_prompt}. ${responses}`;
    } else {
      audioText = q.audio_script || q.passage_text || q.question_text || "";
    }
    playEnglishSpeech(audioText);
  };

  const getPartTitle = (partKey: string) => {
    switch (partKey) {
      case "PART1": return "Part 1: Photographs (Hình Ảnh - 5 Câu)";
      case "PART2": return "Part 2: Question-Response (Hỏi Đáp - 5 Câu)";
      case "PART3": return "Part 3: Short Conversations (Hội Thoại - 5 Câu)";
      case "PART4": return "Part 4: Short Talks (Bài Nói - 5 Câu)";
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
                Tự động tráo ngẫu nhiên câu hỏi & đáp án A/B/C/D • Nộp bài để xem kết quả & giải thích
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

        {/* DANH SÁCH CÂU HỎI */}
        {questions.map((q, idx) => {
          const userChoice = userAnswers[q.id];
          const isCorrect = userChoice === q.correctOptionLabel;
          const isListening = ["PART1", "PART2", "PART3", "PART4"].includes(q.part);
          const isAudioHiddenOptions = q.part === "PART1" || q.part === "PART2";

          return (
            <div
              key={`${q.id}-${idx}`}
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
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Âm thanh tự động khớp với các câu trả lời A, B, C, D đã tráo</span>
                  </div>
                  <button
                    onClick={() => playDynamicQuestionAudio(q)}
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
                <span style={{ color: "#38bdf8", marginRight: "6px" }}>Câu {idx + 1}:</span> 
                {isAudioHiddenOptions && !showResult 
                  ? (q.part === "PART1" ? "Look at the picture and select the best statement." : "Listen to the question and select the best response.") 
                  : (q.question_text || q.question_prompt)}
              </h3>

              {/* NÚT CHỌN ĐÁP ÁN ĐÃ TRÁO NGẪU NHIÊN */}
              <div style={{ display: "grid", gap: "10px" }}>
                {q.shuffledOptions.map((opt: any) => {
                  const optKey = opt.label;
                  const isSelected = userChoice === optKey;

                  let btnBg = "#0f172a";
                  let btnBorder = "#334155";
                  let btnColor = "#cbd5e1";

                  if (showResult) {
                    if (opt.isCorrect) {
                      btnBg = "#064e3b";
                      btnBorder = "#10b981";
                      btnColor = "#6ee7b7";
                    } else if (isSelected && !opt.isCorrect) {
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
                      {isAudioHiddenOptions && !showResult 
                        ? `Đáp án ${optKey}` 
                        : opt.text}
                    </button>
                  );
                })}
              </div>

              {/* 💡 LỜI THOẠI & GIẢI THÍCH CHỈ HIỆN KHI NỘP BÀI */}
              {showResult && (
                <div style={{ marginTop: "18px", padding: "14px", backgroundColor: "#0f172a", borderRadius: "10px", borderLeft: "4px solid #10b981" }}>
                  {isListening && (
                    <div style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px dashed #334155" }}>
                      <b style={{ color: "#38bdf8", fontSize: "13px" }}>📜 Lời Thoại Băng Nghe (Transcript):</b>
                      <p style={{ color: "#cbd5e1", fontSize: "13px", margin: "4px 0 0 0", whiteSpace: "pre-line" }}>
                        {q.part === "PART1" 
                          ? q.shuffledOptions.map((o: any) => `(${o.label}) ${o.text}`).join("\n") 
                          : q.part === "PART2" 
                          ? `Question: ${q.question_prompt}\n` + q.shuffledOptions.map((o: any) => `(${o.label}) ${o.text}`).join("\n") 
                          : q.audio_script}
                      </p>
                    </div>
                  )}
                  <div style={{ fontWeight: "bold", color: "#34d399", fontSize: "13px", marginBottom: "4px" }}>
                    💡 Lời Giải Chi Tiết (Đáp án đúng: {q.correctOptionLabel}):
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "13px" }}>{q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}

        {/* NÚT NỘP BÀI / ĐỔI BỘ 5 CÂU HỎI MỚI / SANG PART MỚI */}
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
                🔄 Đổi 5 Câu Hỏi Ngẫu Nhiên Mới ({activePart})
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