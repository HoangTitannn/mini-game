import { useEffect, useState, useCallback } from "react";

import {
  Screen,
  GamePayload,
  ToastItem,
  countWords,
} from "@/components/types";

import { PreloadScreen } from "@/components/PreloadScreen";
import { CountdownScreen } from "@/components/CountdownScreen";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { PlayingScreen } from "@/components/PlayingScreen";
import { SubmittedScreen } from "@/components/SubmittedScreen";
import { ResultsScreen } from "@/components/ResultsScreen";
import { ToastStack } from "@/components/ToastStack";

let toastCounter = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  // ── Clock ──────────────────────────────────────────────────────────────
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  // ── Game state ─────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>("pre-load");
  const [nameInput, setNameInput] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [lastSentence, setLastSentence] = useState<string | null>(null);
  const [fullStory, setFullStory] = useState<{ playerName: string; sentence: string }[]>([]);
  const [sentence, setSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // ── Game config from database ──────────────────────────────────────────
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [maxWords, setMaxWords] = useState<number>(20); // default fallback

  // ── Toast system ────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: ToastItem["type"] = "error") => {
    const id = ++toastCounter;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3_500);
  }, []);

  // ── API helpers ──────────────────────────────────────────────────────────
  const fetchGameData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game");
      const data: GamePayload = await res.json();
      setParticipants(data.participants);
      setLastSentence(data.lastSentence);
      setStartTime(new Date(data.startTime));
      setEndTime(new Date(data.endTime));
      setMaxWords(data.maxWords);
    } catch {
      addToast("Không thể tải dữ liệu game. Thử lại nhé!", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game");
      const data: GamePayload = await res.json();
      setParticipants(data.participants);
      setLastSentence(data.lastSentence);
      setFullStory(data.fullStory);
      setStartTime(new Date(data.startTime));
      setEndTime(new Date(data.endTime));
      setMaxWords(data.maxWords);
      setScreen("results");
    } catch {
      addToast("Không thể tải kết quả. Thử lại nhé!", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // ── Fetch initial config on mount ──────────────────────────────────────
  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  // ── Restore from localStorage on mount ─────────────────────────────────
  useEffect(() => {
    if (!now || !startTime || !endTime) return;

    // Only restore screen state if we're in initial loading state
    // Don't override if user has already progressed through the flow
    if (screen !== "pre-load") return;

    try {
      const saved = localStorage.getItem("story-game");
      if (saved) {
        const { playerName: savedName, isSubmitted } = JSON.parse(saved) as {
          playerName: string;
          isSubmitted: boolean;
        };
        if (savedName) {
          setPlayerName(savedName);
          if (now >= startTime && now < endTime && isSubmitted) {
            setScreen("submitted");
            return;
          }
        }
      }
    } catch {
      // ignore
    }

    if (now >= endTime) {
      fetchResults();
    } else if (now >= startTime) {
      setScreen("welcome");
    } else {
      setScreen("countdown");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now !== null, startTime, endTime, screen]);

  // ── Auto-advance countdown → welcome at start time ────────────────────
  useEffect(() => {
    if (!now || !startTime || screen !== "countdown") return;
    if (now >= startTime) setScreen("welcome");
  }, [now, startTime, screen]);

  // ── Auto-advance playing/submitted → results at end time ──────────────
  useEffect(() => {
    if (!now || !endTime) return;
    if ((screen === "playing" || screen === "submitted") && now >= endTime) {
      fetchResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, endTime, screen]);

  // ── Real-time polling: refresh participant list every 10 seconds while playing ──
  useEffect(() => {
    if (screen !== "playing") return;
    const id = setInterval(() => {
      fetch("/api/game")
        .then((r) => r.json())
        .then((data: GamePayload) => {
          setParticipants(data.participants);
          // Only update lastSentence if it changed (avoid flickering input area)
          setLastSentence((prev) => (data.lastSentence !== prev ? data.lastSentence : prev));
        })
        .catch(() => {/* silent */ });
    }, 10_000);
    return () => clearInterval(id);
  }, [screen]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function handleStart() {
    const name = nameInput.trim();
    if (!name) { addToast("Bạn chưa nhập tên!", "warning"); return; }

    // Check if name already exists in current participants
    if (participants.includes(name)) {
      addToast("Tên này đã được sử dụng! Hãy chọn tên khác.", "warning");
      return;
    }

    setPlayerName(name);
    localStorage.setItem("story-game", JSON.stringify({ playerName: name, isSubmitted: false }));

    // Fetch latest data and check again to be sure
    try {
      const res = await fetch("/api/game");
      const data = await res.json();
      setParticipants(data.participants);
      setLastSentence(data.lastSentence);
      setStartTime(new Date(data.startTime));
      setEndTime(new Date(data.endTime));
      setMaxWords(data.maxWords);

      // Double-check with latest participants
      if (data.participants.includes(name)) {
        addToast("Tên này vừa được ai đó sử dụng! Hãy chọn tên khác.", "warning");
        setPlayerName(""); // Reset player name
        localStorage.removeItem("story-game");
        return;
      }
      setScreen("playing");
    } catch {
      addToast("Không thể kiểm tra tên. Thử lại nhé!", "error");
    }
  }

  async function handleSubmit() {
    const words = countWords(sentence);
    if (words === 0) { addToast("Câu chuyện không được để trống!", "warning"); return; }
    if (words > maxWords) { addToast(`Tối đa ${maxWords} chữ thôi nhé!`, "warning"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, sentence: sentence.trim(), previousSentence: lastSentence }),
      });

      if (res.status === 201) {
        localStorage.setItem("story-game", JSON.stringify({ playerName, isSubmitted: true }));
        setScreen("submitted");
        return;
      }

      if (res.status === 409) {
        const body = await res.json() as { error: string; latestSentence: string };
        setLastSentence(body.latestSentence);
        addToast("Có người vừa viết trước bạn! Hãy viết lại câu nối tiếp.", "warning");
        return;
      }

      const body = await res.json() as { error: string };
      addToast(body.error ?? "Có lỗi xảy ra, thử lại nhé!", "error");
    } catch {
      addToast("Lỗi kết nối. Thử lại nhé!", "error");
    } finally {
      setSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  if (screen === "pre-load" || !now) return <PreloadScreen />;

  // Only render screens when config is loaded
  if (!startTime || !endTime) return <PreloadScreen />;

  if (screen === "countdown") return <CountdownScreen now={now} startTime={startTime} endTime={endTime} maxWords={maxWords} />;

  if (screen === "welcome") {
    return (
      <>
        <ToastStack toasts={toasts} />
        <WelcomeScreen
          now={now}
          startTime={startTime}
          endTime={endTime}
          maxWords={maxWords}
          nameInput={nameInput}
          setNameInput={setNameInput}
          loading={loading}
          onStart={handleStart}
        />
      </>
    );
  }

  if (screen === "playing") {
    return (
      <>
        <ToastStack toasts={toasts} />
        <PlayingScreen
          now={now}
          startTime={startTime}
          endTime={endTime}
          playerName={playerName}
          participants={participants}
          lastSentence={lastSentence}
          sentence={sentence}
          setSentence={setSentence}
          submitting={submitting}
          maxWords={maxWords}
          onSubmit={handleSubmit}
        />
      </>
    );
  }

  if (screen === "submitted") {
    return <SubmittedScreen now={now} startTime={startTime} endTime={endTime} playerName={playerName} />;
  }

  if (screen === "results") {
    return (
      <ResultsScreen
        now={now}
        startTime={startTime}
        endTime={endTime}
        participants={participants}
        fullStory={fullStory}
      />
    );
  }

  return null;
}
