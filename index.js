const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
console.log("Sistem kontrol ediliyor...");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

let chatHistory = [];

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        console.log("Mesaj geldi:", message);
        
        const allProducts = JSON.parse(fs.readFileSync('products.json'));

        const rawKeywords = message.toLowerCase().split(' ');
        const stopWords = ['bana', 'için', 'öner', 'bir', 'gibi', 'ile', 'çok', 'en', 'hangi', 'var', 'mı'];

        const keywords = rawKeywords.filter(word => word.length > 2 && !stopWords.includes(word));

        const scoredProducts = allProducts.map(p => {
            let score = 0;
                const baslik = p.baslik.toLowerCase();
            const aciklama = p.aciklama.toLowerCase();

            keywords.forEach(keyword => {
                if (baslik.includes(keyword)) {
                    score += 10; 
                }
                else if (aciklama.includes(keyword)) {
                    score += 1; 
                }
            });
            return { ...p, score };
        });

            let filteredProducts = scoredProducts.filter(p => p.score > 0);
            filteredProducts.sort((a, b) => b.score - a.score);

        const relatedProducts = filteredProducts.length > 0 
             ? filteredProducts.slice(0, 20) 
             : allProducts.slice(0, 20);

        console.log("Filtreden geçen ürün sayısı:", relatedProducts.length);

        const combinedPrompt = `
            KİMLİK: Sen Akıllı Ürün Asistanısın. 
            ELİNDEKİ ÜRÜNLER: ${JSON.stringify(relatedProducts)}
            GÖREV: Sadece listedeki ürünleri öner.
            Kullanıcının mesajı: "${message}"
        `;

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(combinedPrompt);
        const text = result.response.text();

        console.log("AI yanıtı geldi");

        chatHistory.push({ role: "user", parts: [{ text: message }] });
        chatHistory.push({ role: "model", parts: [{ text: text }] });

        res.json({
            status: "success",
            ai_response: text,
            recommended_products: relatedProducts
        });


    } catch (error) {
        console.error("HATA:", error.message);
        res.status(500).json({ status: "error", message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde aktif.`);
});