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
        // 방화벽 차단을 우회하기 위해 브라우저 헤더를 추가합니다.
        const apiRes = await fetch(url.toString(), {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "application/json, application/xml, text/xml, */*"
            }
        });
        
        const data = await apiRes.text();
        
        if (data.trim().startsWith("<")) {
            console.error("🚨 여전히 방화벽에 막힘:", data.substring(0, 200));
            return res.status(500).json({ error: "Firewall block", rawHtml: data.substring(0, 300) });
        }
        
        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}