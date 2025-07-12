import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';
import jungleEntrance from "./images/01-jungle-entrance.png";
import bloominator from "./images/02-bloominator.png";
import puzzleSolveSound from "./sounds/puzzle-solve.mp3";

const WS_URL = "ws://localhost:8080";

// Slide data: image, title, and overlay text
const SLIDES = [
  {
    image: jungleEntrance,
    title: "The Garden",
    text: "The garden once bloomed with harmony, but something has gone wrong.\nYour journey begins here.",
  },
  {
    image: bloominator,
    title: "The Strange Machine",
    text: "The Bloominator has powered the garden for centuries.\nBut it’s miswired and confused. Restore the circuits. Solve the system. Reboot the flow.",
  },
  {
    image: "/slide2.jpg",
    title: "",
    text: "",
  },
  {
    image: "/slide3.jpg",
    title: "",
    text: "",
  },
];

// Main Room Page
function MainRoomPage() {
  const [roomState, setRoomState] = useState({ slide: 0, sound: null });
  const ws = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Track previous sound to avoid replaying on unrelated state changes
  const prevSoundRef = useRef<string | null>(null);

  useEffect(() => {
    ws.current = new window.WebSocket(WS_URL);
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "state") {
        // Only play sound if sound is 'puzzle-solve' and it changed
        if (
          msg.data.sound === "puzzle-solve" &&
          prevSoundRef.current !== "puzzle-solve" &&
          audioRef.current
        ) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        prevSoundRef.current = msg.data.sound;
        setRoomState(msg.data);
      }
    };
    return () => ws.current?.close();
  }, []);

  const slide = SLIDES[roomState.slide] || SLIDES[0];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
        src={slide.image}
        alt={`Slide ${roomState.slide + 1}`}
        style={{
          maxWidth: "100vw",
          maxHeight: "100vh",
          objectFit: "cover",
          width: "100vw",
          height: "100vh",
          // Removed filter for full brightness and sharpness
          transition: "filter 0.3s",
        }}
      />
      {slide.title && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            color: "#ffe08a", // legendary gold
            textAlign: "center",
            fontSize: 72,
            fontWeight: 700,
            fontFamily: "'UnifrakturCook', serif",
            textShadow: "0 6px 32px #7c5a1a, 0 2px 16px #000, 0 0 48px #7c5a1a, 0 0 32px #000, 0 0 2px #222",
            whiteSpace: "pre-line",
            padding: "64px 8vw 32px 8vw",
            letterSpacing: 1.6,
            lineHeight: 1.1,
            boxSizing: "border-box",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            zIndex: 2,
            textTransform: "none",
            background: "none",
          }}
        >
          {slide.title}
        </div>
      )}
      {slide.text && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            color: "#ffe8b0", // softer gold
            textAlign: "center",
            fontSize: 56,
            fontWeight: 400,
            fontFamily: "'IM Fell English SC', serif",
            textShadow: "0 8px 48px #3a2300, 0 4px 32px #7c5a1a, 0 2px 24px #000, 0 0 64px #7c5a1a, 0 0 48px #000, 0 0 4px #222",
            whiteSpace: "pre-line",
            padding: "48px 8vw 64px 8vw",
            letterSpacing: 1.3,
            lineHeight: 1.25,
            boxSizing: "border-box",
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            zIndex: 2,
            textTransform: "none",
            background: "none",
          }}
        >
          {slide.text}
        </div>
      )}
      {/* Audio element for puzzle-solve sound */}
      <audio ref={audioRef} src={puzzleSolveSound} preload="auto" />
    </div>
  );
}

// Mobile Control Page
function MobileControlPage() {
  const [roomState, setRoomState] = useState({ slide: 0, sound: null });
  const ws = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const prevSlide = () => {
    if (ws.current?.readyState === WebSocket.OPEN && roomState.slide > 0) {
      ws.current.send(
        JSON.stringify({ type: "update", data: { slide: roomState.slide - 1 } })
      );
    }
  };

  const playSound = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({ type: "update", data: { sound: "puzzle-solve" } })
      );
    }
    // Play sound locally
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return (
    <div>
      <h1>Mobile Control</h1>
      <p>Current Slide: {roomState.slide}</p>
      <p>Current Sound: {roomState.sound || "None"}</p>
      <button onClick={prevSlide} disabled={roomState.slide === 0}>
        Previous Slide
      </button>
      <button onClick={nextSlide}>Next Slide</button>
      <button onClick={playSound}>Play Sound</button>
      <Link to="/">Back to Main Room</Link>
      {/* Audio element for puzzle-solve sound (for local playback) */}
      <audio ref={audioRef} src={puzzleSolveSound} preload="auto" />
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
