import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Thiếu GEMINI_API_KEY trên Vercel Environment Variables!" },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Thiếu cấu hình Supabase URL / Key!" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const part = body.part || "Part 5";
    const count = body.count || 5;
    const examId = body.examId || null;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Bạn là chuyên gia biên soạn đề thi TOEIC chuẩn ETS. 
      Hãy sinh ngẫu nhiên ${count} câu hỏi TOEIC ${part}.
      
      Yêu cầu bắt buộc: Chỉ trả về mảng JSON thuần túy, không dùng cú pháp markdown codeblock.
      Cấu trúc:
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
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // Làm sạch chuỗi nếu AI tự động chèn ký tự markdown ```json
    responseText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

    let generatedQuestions;
    try {
      generatedQuestions = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: `AI trả về định dạng chưa chuẩn: ${responseText}` },
        { status: 500 }
      );
    }

    const questionsToInsert = generatedQuestions.map((q: any) => ({
      question_text: q.question_text || "",
      option_a: q.option_a || "",
      option_b: q.option_b || "",
      option_c: q.option_c || "",
      option_d: q.option_d || "",
      correct_option: q.correct_option || "A",
      explanation: q.explanation || "",
      exam_id: examId,
    }));

    const { data, error } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: `Lỗi Supabase: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã sinh thành công ${data?.length || 0} câu hỏi TOEIC mới vào Supabase!`,
      questions: data,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Lỗi không xác định" }, { status: 500 });
  }
}