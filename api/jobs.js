export default async function handler(req, res) {
    const apiKey = process.env.JOBABA_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "JOBABA_API_KEY is not set in Vercel" });
    }
  
    const { page = 1, size = 20, query = "" } = req.query;
  
    const url = new URL("https://adst.gg.go.kr/jobabaApi/v1.do");
    url.searchParams.set("authKey", apiKey);
    url.searchParams.set("type", "json");
    url.searchParams.set("pIndex", page);
    url.searchParams.set("pSize", size);
    if (query) {
      url.searchParams.set("query", query);
    }
  
    try {
        const apiRes = await fetch(url.toString());
        const data = await apiRes.text();
        
        // 만약 잡아바가 에러 페이지(HTML)를 주면 서버 로그에 찍어라!
        if (data.trim().startsWith("<")) {
          console.error("잡아바 API 에러 HTML 응답:", data);
        }
        
        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
} // <-- 이 부분이 함수를 닫아주는 최종 중괄호입니다!