# 🛍️ Smart Product Assistant

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini API](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![React Native](https://img.shields.io/badge/Mobile-React_Native_%2F_Expo-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An AI-powered e-commerce recommendation system combining a **lightweight RAG (Retrieval-Augmented Generation)** pipeline with the **Google Gemini API** (`gemini-flash`). The application processes natural-language product queries, performs weighted lexical retrieval against an internal product catalog, injects grounded candidate data into the LLM context to prevent hallucinations, and delivers conversational recommendations accompanied by structured product cards.

---

## 🌟 Key Features

* **🧠 Context-Aware Recommendations:** Interprets open-ended user requests (e.g., *"What do you suggest for harsh winter camping?"*) and provides contextually relevant product advice.
* **🔍 Custom RAG Pipeline:**
  * **Lexical Query Parsing:** Filters Turkish conversational stop-words (`bana`, `için`, `öner`, `en`, `hangi`, etc.) and extracts high-signal keywords.
  * **Weighted Relevance Scoring:** Scores items in `products.json` by matching query terms against product titles (10× weight) and descriptions (1× weight).
  * **Top-K Retrieval:** Passes the most relevant product candidates directly to the Gemini model prompt to anchor suggestions on verifiable inventory.
* **💬 Multi-Turn Conversation History:** Preserves chat context across interactions (`chatHistory`), allowing iterative follow-ups (e.g., *"Show me cheaper alternatives to the first one"*).
* **📱 Cross-Platform Mobile Client:** Features a companion **React Native & Expo** mobile interface for real-time mobile chatting and browsing.
* **⚡ RESTful JSON API:** Standardized API schema delivering both conversational reasoning (`ai_response`) and structured product objects (`recommended_products`).

---

## 🏗️ System Architecture & RAG Pipeline

```
  User Query (Mobile App / HTTP Client)
                  │
                  ▼
  ┌──────────────────────────────────┐
  │     Query Parser & Cleaner       │  ◄── Strips stop-words & normalizes terms
  └───────────────┬──────────────────┘
                  │
                  ▼
  ┌──────────────────────────────────┐
  │   Weighted Scoring & Filtering   │  ◄── Scans products.json (10x Title, 1x Desc)
  └───────────────┬──────────────────┘
                  │
                  ▼
  ┌──────────────────────────────────┐
  │      Top-K Grounded Context      │  ◄── Injects Top-20 matching products
  └───────────────┬──────────────────┘
                  │
                  ▼
  ┌──────────────────────────────────┐
  │       Google Gemini Engine       │  ◄── Formulates contextual recommendation
  │      (gemini-flash-latest)       │      without inventing non-existent items
  └───────────────┬──────────────────┘
                  │
                  ▼
  Structured JSON Response:
  • Natural Language Explanation
  • Verified Product Cards (ID, Title, Price)
```

---

## 🛠️ Tech Stack

### Backend (`/`)
* **Runtime:** Node.js (v18+)
* **Framework:** Express.js (v5)
* **AI Provider:** Google Generative AI SDK (`@google/generative-ai`)
* **Configuration & Security:** `dotenv`, `cors`
* **Data Store:** In-memory JSON dataset (`products.json`)

### Frontend (`/frontend`)
* **Framework:** React Native, Expo (SDK 55)
* **Web & Mobile Support:** `react-native-web`
* **Networking:** Fetch API with ngrok tunneling support (`@expo/ngrok`)

---

## 🚀 Getting Started

### Prerequisites
* [Node.js (v18+)](https://nodejs.org/) & `npm`
* A [Google AI Studio API Key](https://aistudio.google.com/)

---

### 1. Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yagizcngz/smart-product-assistant.git
   cd smart-product-assistant
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start the API server:**
   ```bash
   npm start
   ```
   *The backend will start at `http://localhost:3000`.*

---

### 2. Frontend Setup (Optional - Mobile App)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo development server:**
   ```bash
   npm start
   ```
   *Scan the QR code with the **Expo Go** app (iOS/Android) or press `w` to run in a web browser.*

---

## 🔌 API Reference

### Send Chat Query

* **URL:** `/api/chat`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "message": "Zorlu kış şartlarında kamp yapmak için hangi ekipmanları önerirsin?"
}
```

#### Response Example
```json
{
  "status": "success",
  "ai_response": "Zorlu kış koşullarında kamp yapabilmeniz için rüzgar direnci yüksek ve su geçirmez modelleri öneriyorum. Özellikle aşağıdaki ürünler ihtiyaçlarınızı karşılayacaktır:",
  "recommended_products": [
    {
      "id": 12,
      "baslik": "ZirvePro 4 Mevsim Dağcılık Çadırı",
      "kategori": "Kamp Ekipmanları",
      "fiyat": 4850.00,
      "score": 21
    },
    {
      "id": 27,
      "baslik": "Termal Kaz Tüyü Uyku Tulumu (-20°C)",
      "kategori": "Kamp Ekipmanları",
      "fiyat": 3200.00,
      "score": 11
    }
  ]
}
```

---

## 🔒 Security & Privacy

* **Secrets Isolation:** `.env` is ignored by Git, ensuring API keys and credentials are never checked into source control.
* **CORS Configured:** Configurable Cross-Origin Resource Sharing for secure communication between frontend and backend.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Yağız Cengiz**
* GitHub: [@yagizcngz](https://github.com/yagizcngz)
* Email: [yagizcengiz55@gmail.com](mailto:yagizcengiz55@gmail.com)
