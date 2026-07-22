"use client";
import Link from "next/link";

export default function ExamsMainPage() {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>📚 Danh Sách Đề Thi TOEIC</h1>
      <p>Bấm vào đề bên dưới để bắt đầu làm bài:</p>
      <div style={{ marginTop: "20px" }}>
        <Link
          href="/exams/1"
          style={{
            padding: "12px 24px",
            backgroundColor: "#0070f3",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
            display: "inline-block",
          }}
        >
          📝 Vào Đề Thi #1
        </Link>
      </div>
    </div>
  );
}