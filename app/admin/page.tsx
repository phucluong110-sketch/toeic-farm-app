"use client";
import { useState } from "react";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGenerate = async (part: string) => {
    setLoading(true);
    setMessage("🤖 Gemini AI đang suy nghĩ và tạo câu hỏi, bác chờ khoảng 5 giây nhé...");
    
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part, count: 5 }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ Lỗi: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`❌ Lỗi kết nối: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1>🛠️ Bảng Điều Khiển Admin</h1>
      <p>Bấm nút để AI tự động biên soạn và bơm 5 câu hỏi mới vào Database Supabase:</p>
      
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button
          onClick={() => handleGenerate("Part 5")}
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#ccc" : "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Đang tạo..." : "⚡ Bơm 5 câu Part 5"}
        </button>
      </div>

      {message && (
        <div style={{ marginTop: "20px", padding: "15px", borderRadius: "6px", backgroundColor: "#f0f0f0" }}>
          {message}
        </div>
      )}
    </div>
  );
}