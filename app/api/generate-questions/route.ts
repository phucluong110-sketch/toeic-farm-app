import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// Khởi tạo Gemini & Supabase Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { examId, part = "Part 5", count = 5 } = await req.json();

    // Dùng model gemini-1.5-flash siêu nhanh và miễn phí
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      Bạn là chuyên gia biên soạn đề thi TOEIC chuẩn ETS. 
      Hãy sinh ngẫu nhiên ${count} câu hỏi TOEIC ${part}.
      
      Yêu cầu đầu ra bắt buộc là một MẢNG JSON thuần túy chứa các object với cấu trúc chính xác như sau:
      [
        {
          "question_text": "Nội dung câu hỏi TOEIC (tiếng Anh)",
          "option_a": "Lựa chọn A",
          "option_b": "Lựa chọn B",
          "option_c": "Lựa chọn C",
          "option_d": "Lựa chọn D",
          "correct_option": "A", 
          "explanation": "Giải thích chi tiết đáp án bằng tiếng Việt"
        }
      ]
      Chú ý: "correct_option" chỉ được nhận 1 trong 4 giá trị viết hoa: "A", "B", "C", hoặc "D".
    `;

    // Gọi Gemini AI sinh câu hỏi
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const generatedQuestions = JSON.parse(responseText);

    // Gán exam_id nếu có
    const questionsToInsert = generatedQuestions.map((q: any) => ({
      ...q,
      exam_id: examId || null,
    }));

    // Bơm trực tiếp câu hỏi vừa tạo vào bảng 'questions' của Supabase
    const { data, error } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã sinh thành công ${data.length} câu hỏi TOEIC mới vào Supabase!`,
      questions: data,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}