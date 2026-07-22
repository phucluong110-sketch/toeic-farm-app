import "./globals.css";

export const metadata = {
  title: "TOEIC Farm App",
  description: "Nông Trại Luyện Thi TOEIC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, padding: 0, fontFamily: "sans-serif", backgroundColor: "#f8fafc" }}>
        {children}
      </body>
    </html>
  );
}