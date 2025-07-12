import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';

const WS_URL = "ws://localhost:8080";

// Main Room Page
function MainRoomPage() {
  const [roomState, setRoomState] = useState({ slide: 0, sound: null });
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new window.WebSocket(WS_URL);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "state") {
        setRoomState(msg.data);
      }
    };
    return () => ws.current?.close();
  }, []);

  return (
    <div>
      <h1>Main Room State</h1>
      <p>Current Slide: {roomState.slide}</p>
      <p>Current Sound: {roomState.sound || "None"}</p>
      {/* TODO: Add slide image and sound playback here */}
      <Link to="/control">Go to Mobile Control</Link>
    </div>
  );
}

// Mobile Control Page
function MobileControlPage() {
  const [roomState, setRoomState] = useState({ slide: 0, sound: null });
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new window.WebSocket(WS_URL);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "state") {
        setRoomState(msg.data);
      }
    };
    return () => ws.current?.close();
  }, []);

  const nextSlide = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({ type: "update", data: { slide: roomState.slide + 1 } })
      );
    }
  };

  const playSound = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({ type: "update", data: { sound: "sound1.mp3" } })
      );
    }
  };

  return (
    <div>
      <h1>Mobile Control</h1>
      <p>Current Slide: {roomState.slide}</p>
      <p>Current Sound: {roomState.sound || "None"}</p>
      <button onClick={nextSlide}>Next Slide</button>
      <button onClick={playSound}>Play Sound</button>
      <Link to="/">Back to Main Room</Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainRoomPage />} />
        <Route path="/control" element={<MobileControlPage />} />
      </Routes>
    </Router>
  );
}

export default App;
