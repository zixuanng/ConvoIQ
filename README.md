# ConvoIQ - AI Relationship Intelligence

> **"The AI-powered relationship strategist that reads between the lines."**

ConvoIQ is a sophisticated web application that treats your chat history as a dataset for emotional intelligence. By leveraging Google's Gemini API, it analyzes conversation logs to decode attachment styles, predict breakup risks, and provide actionable psychological insights to improve human connection.

## 🧠 Key Features

*   **Psychological Profiling:** Automatically detects **Attachment Styles** (Secure, Anxious, Avoidant), **Love Languages**, and **Hidden Emotional Needs** based on linguistic patterns.
*   **Relationship Momentum:** Visualizes the velocity and emotional reciprocity of your connection over the last 7 days.
*   **Conflict Rewind:** A unique feature that identifies specific arguments, explains *why* they happened, and uses AI to generate alternative, de-escalating responses you *could* have sent.
*   **Future Predictions:** forecasts the trajectory of the relationship (e.g., "Cooling Off Period", "Deepening Connection") with probability scores.
*   **AI Relationship Coach:** An integrated chatbot context-aware of your specific analysis, ready to answer questions like "How do I bring up this topic?" or "Why did they react that way?"
*   **Privacy First:** Your data is processed for analysis and then discarded; it is not stored permanently on our servers.

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript
*   **Styling:** Tailwind CSS (Inter font family)
*   **Visualization:** Recharts, D3.js
*   **AI Logic:** Google Gemini API (`gemini-3-flash-preview` and `gemini-3-pro-preview`) via `@google/genai` SDK
*   **Icons:** Lucide React
*   **Module Loading:** Native ES Modules via `esm.sh` (No heavy bundler required)

## 🚀 Getting Started

### Prerequisites

*   A Google Cloud Project with the **Gemini API** enabled.
*   A valid API Key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/convoiq.git
    cd convoiq
    ```

2.  **Configure API Key:**
    The application requires the `API_KEY` environment variable.
    *   If running in a local development environment that supports `.env`, create a file named `.env` and add:
        ```
        API_KEY=your_google_gemini_api_key_here
        ```

3.  **Run the Application:**
    Since this project uses modern ES modules directly in the browser via `importmap`, you can serve it using any static file server.

    *   Using Python: `python3 -m http.server`
    *   Using Node `http-server`: `npx http-server .`
    *   Using VS Code: Right-click `index.html` and select "Open with Live Server".

## 📂 Project Structure

```
/
├── components/         # UI Components (Charts, Modals, Chatbot)
├── services/           # API integration (Gemini Service)
├── views/              # Main Page Views (Upload, Dashboard)
├── types.ts            # TypeScript interfaces for Analysis Reports
├── constants.ts        # Demo data and configuration
├── App.tsx             # Main routing logic
├── index.html          # Entry point & Tailwind config
└── index.tsx           # React root mount
```

## 🛡️ Disclaimer

ConvoIQ is an AI-powered analysis tool designed for entertainment and self-reflection purposes. It is **not** a substitute for professional couples therapy, psychological counseling, or medical advice.
