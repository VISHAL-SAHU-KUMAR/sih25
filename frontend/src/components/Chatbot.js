import { useState } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    
    // Clear input
    const userMessage = input;
    setInput("");

    // Simulate AI response (replace with real AI call later)
    setTimeout(() => {
      const botReply = `You said: "${userMessage}". I am processing your symptoms.`;
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    }, 1000);
  };

  return (
    <div style={{ width: "400px", border: "1px solid #ccc", borderRadius: "8px", padding: "10px", fontFamily: "Arial" }}>
      <h3>Health AI Chatbot</h3>
      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #eee",
          padding: "10px",
          marginBottom: "10px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "15px",
                backgroundColor: msg.sender === "user" ? "#61dafb" : "#e0e0e0",
                color: msg.sender === "user" ? "#fff" : "#000",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your symptoms..."
          style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleSend}
          style={{ padding: "8px 12px", marginLeft: "5px", borderRadius: "5px", backgroundColor: "#61dafb", color: "#fff", border: "none" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;