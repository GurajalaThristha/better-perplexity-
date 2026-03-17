import { useState } from "react";
import axios from "axios";

type Source = {
  id: number;
  title: string;
  url: string;
  content: string;
};

function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        query,
      });

      setAnswer(response.data.answer || "");
      setSources(response.data.sources || []);
    } catch (err) {
      console.error(err);
      setError("Failed to get answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "Inter, Arial, sans-serif",
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Better Perplexity
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: "24px",
            fontSize: "16px",
          }}
        >
          Ask anything. Get AI answers grounded in live web sources.
        </p>

        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "14px",
            marginBottom: "24px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          }}
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question..."
            rows={4}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "white",
              fontSize: "16px",
              resize: "vertical",
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          <div style={{ marginTop: "14px" }}>
            <button
              onClick={handleAsk}
              disabled={loading}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                background: loading ? "#475569" : "#6366f1",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              {loading ? "Thinking..." : "Ask"}
            </button>
          </div>

          {error && (
            <p style={{ color: "#f87171", marginTop: "12px" }}>{error}</p>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "14px",
              minHeight: "260px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "16px",
                fontSize: "24px",
              }}
            >
              Answer
            </h2>

            {loading ? (
              <p style={{ color: "#cbd5e1" }}>Generating answer...</p>
            ) : answer ? (
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.8",
                  color: "#e2e8f0",
                  margin: 0,
                }}
              >
                {answer}
              </p>
            ) : (
              <p style={{ color: "#94a3b8" }}>
                Your answer will appear here.
              </p>
            )}
          </div>

          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "14px",
              minHeight: "260px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "16px",
                fontSize: "24px",
              }}
            >
              Sources
            </h2>

            {sources.length > 0 ? (
              <div>
                {sources.map((source) => (
                  <div
                    key={source.id}
                    style={{
                      marginBottom: "18px",
                      paddingBottom: "14px",
                      borderBottom: "1px solid #334155",
                    }}
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#818cf8",
                        fontWeight: 700,
                        textDecoration: "none",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      [{source.id}] {source.title}
                    </a>

                    <p
                      style={{
                        color: "#cbd5e1",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        margin: 0,
                      }}
                    >
                      {source.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#94a3b8" }}>
                Source links will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;