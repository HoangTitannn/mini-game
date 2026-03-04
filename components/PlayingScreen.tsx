import Head from "next/head";
import { KeyboardEvent } from "react";
import { GameHeader } from "./GameHeader";
import { countWords } from "./types";

interface PlayingScreenProps {
    now: Date;
    startTime: Date;
    endTime: Date;
    playerName: string;
    participants: string[];
    lastSentence: string | null;
    sentence: string;
    setSentence: (v: string) => void;
    submitting: boolean;
    maxWords: number;
    onSubmit: () => void;
}

export function PlayingScreen({
    now,
    startTime,
    endTime,
    playerName,
    participants,
    lastSentence,
    sentence,
    setSentence,
    submitting,
    maxWords,
    onSubmit,
}: PlayingScreenProps) {
    const wordCount = countWords(sentence);
    const overLimit = wordCount > maxWords;

    // Color thresholds: normal → warning → danger
    const counterClass =
        wordCount >= maxWords
            ? "word-counter danger"
            : wordCount >= maxWords - 2
                ? "word-counter warning"
                : "word-counter";

    // Block further input once at maxWords (allow navigation keys)
    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        const allowed = [
            "Backspace", "Delete", "ArrowLeft", "ArrowRight",
            "ArrowUp", "ArrowDown", "Home", "End", "Tab",
        ];
        if (wordCount >= maxWords && !allowed.includes(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    }

    return (
        <>
            <Head><title>Viết Tiếp Câu Chuyện — Lượt của bạn!</title></Head>
            <div className="mesh-bg" />
            <div className="screen-layout">
                <GameHeader now={now} startTime={startTime} endTime={endTime} />
                <main className="playing-main screen-enter">

                    {/* Participants */}
                    {participants.length > 0 && (
                        <div className="card card-sm participants-card">
                            <p className="card-eyebrow">Danh sách người chơi</p>
                            <div className="chips-row">
                                {participants.map((p) => (
                                    <span key={p} className={`player-chip ${p === playerName ? "chip-you" : ""}`}>
                                        <span className="chip-dot" style={{ background: p === playerName ? "var(--primary)" : "var(--muted-fg)" }} />
                                        {p}{p === playerName ? " (bạn)" : ""}
                                    </span>
                                ))}
                                {!participants.includes(playerName) && (
                                    <span className="player-chip chip-you chip-next">
                                        <span className="chip-dot" />
                                        {playerName} (bạn) ← tiếp theo
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Last sentence */}
                    <div>
                        <p className="section-label">Câu cuối cùng</p>
                        {lastSentence ? (
                            <div className="quote-block" id="last-sentence-block">
                                <p className="quote-text">{lastSentence}</p>
                            </div>
                        ) : (
                            <div className="card card-sm empty-state">
                                <p>✨ Bạn là người đầu tiên! Hãy bắt đầu câu chuyện.</p>
                            </div>
                        )}
                    </div>

                    {/* Input area */}
                    <div className="card card-elevated writing-card">
                        <label className="field-label" htmlFor="sentence-input">
                            Câu của bạn — viết tiếp nhé ✏️
                        </label>
                        <textarea
                            id="sentence-input"
                            className={`field ${overLimit ? "field-danger" : ""}`}
                            rows={4}
                            placeholder="Tiếp tục câu chuyện bằng 1 câu ngắn..."
                            value={sentence}
                            onChange={(e) => setSentence(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ minHeight: 110 }}
                        />
                        <div className="writing-footer">
                            <span className={counterClass}>
                                {overLimit ? "⚠️ " : ""}
                                {wordCount}/{maxWords} chữ
                                {overLimit ? " — Vượt quá!" : wordCount >= maxWords - 2 && wordCount < maxWords ? " — Sắp đầy!" : ""}
                            </span>
                            <button
                                id="submit-btn"
                                className="btn-primary"
                                onClick={onSubmit}
                                disabled={submitting || overLimit || wordCount === 0}
                            >
                                {submitting ? (
                                    <><span className="btn-spinner" /> Đang gửi...</>
                                ) : (
                                    "GỬI CÂU CHUYỆN →"
                                )}
                            </button>
                        </div>
                    </div>

                </main>
            </div>
        </>
    );
}
