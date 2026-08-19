export default async function handler(req, res) {
    const apiKey = process.env.JOBABA_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "JOBABA_API_KEY is not set in Vercel" });
    }
  
    const { page = 1, size = 20, query = "" } = req.query;
  
    // URL을 공식 경기도 오픈 API 규격에 맞는지 확인
    const url = new URL("https://adst.gg.go.kr/jobabaApi/v1.do");
    url.searchParams.set("authKey", apiKey);
    url.searchParams.set("type", "json");
    url.searchParams.set("pIndex", page);
    url.searchParams.set("pSize", size);
    if (query) {
      url.searchParams.set("query", query);
    }
  
    console.log("실제 요청 URL:", url.toString().replace(apiKey, "REDACTED_KEY"));

    try {
        const apiRes = await fetch(url.toString());
        const data = await apiRes.text();
        
        // 잡아바가 HTML(<br> 등)을 주면 그 내용을 무조건 서버 로그에 출력
        if (data.trim().startsWith("<")) {
            console.error("🚨 잡아바 API가 HTML을 반환함:", data);
            return res.status(500).json({ 
                error: "Jobaba API rejected the request", 
                rawHtml: data.substring(0, 300) // 에러 내용 일부를 응답으로 넘겨줌
            });
        }
        
        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}