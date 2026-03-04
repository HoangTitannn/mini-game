import Head from "next/head";
import { useEffect, useRef } from "react";
import { GameHeader } from "./GameHeader";
import { AUTHOR_COLORS } from "./types";

interface StoryEntry {
    playerName: string;
    sentence: string;
}

interface ResultsScreenProps {
    now: Date;
    startTime: Date;
    endTime: Date;
    participants: string[];
    fullStory: StoryEntry[];
}

function useConfetti(active: boolean) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!active || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d")!;
        let animId: number;
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#0ea5e9"];
        const particles = Array.from({ length: 160 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            w: Math.random() * 12 + 5,
            h: Math.random() * 5 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 2.5,
            vy: Math.random() * 3 + 1.5,
            rot: Math.random() * 360,
            rotV: (Math.random() - 0.5) * 5,
        }));
        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const p of particles) {
                p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
                if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; }
                ctx.save();
                ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
                ctx.rotate((p.rot * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            }
            animId = requestAnimationFrame(tick);
        };
        tick();
        window.addEventListener("resize", resize);
        return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
    }, [active]);
    return canvasRef;
}

export function ResultsScreen({ now, startTime, endTime, participants, fullStory }: ResultsScreenProps) {
    const confettiRef = useConfetti(true);

    const authorList = [...new Set(fullStory.map((s) => s.playerName))];
    const authorColor = (name: string): [string, string] =>
        AUTHOR_COLORS[authorList.indexOf(name) % AUTHOR_COLORS.length];

    return (
        <>
            <Head><title>Viết Tiếp Câu Chuyện — Kết Quả!</title></Head>
            <div className="mesh-bg" />
            <canvas id="confetti-canvas" ref={confettiRef} />
            <div className="screen-layout">
                <GameHeader now={now} startTime={startTime} endTime={endTime} showClock={false} />
                <main className="results-main screen-enter">

                    {/* Hero */}
                    <div className="results-hero">
                        <div style={{ fontSize: "3rem" }}>📖</div>
                        <h1 className="heading-display">TOÀN BỘ CÂU CHUYỆN</h1>
                        <p className="subtext">
                            {participants.length} tác giả &middot; {fullStory.length} câu
                        </p>
                    </div>

                    {/* Author legend */}
                    {authorList.length > 0 && (
                        <div className="author-legend">
                            {authorList.map((author) => {
                                const [bg, clr] = authorColor(author);
                                return (
                                    <span
                                        key={author}
                                        className="author-badge"
                                        style={{ background: bg, borderColor: `${clr}44`, color: clr }}
                                    >
                                        <span className="author-dot" style={{ background: clr }} />
                                        {author}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Story prose */}
                    <div className="card card-elevated story-card">
                        {fullStory.length === 0 ? (
                            <p className="empty-state">Câu chuyện chưa có nội dung.</p>
                        ) : (
                            <p className="story-prose">
                                {fullStory.map(({ playerName: author, sentence: sent }, i) => {
                                    const [bg, clr] = authorColor(author);
                                    return (
                                        <span
                                            key={i}
                                            className="story-sentence"
                                            style={{ background: bg }}
                                        >
                                            {sent}{i < fullStory.length - 1 ? " " : ""}
                                            <span className="author-tooltip" style={{ color: clr, borderColor: `${clr}33` }}>
                                                ✍️ {author}
                                            </span>
                                        </span>
                                    );
                                })}
                            </p>
                        )}
                    </div>

                    {/* Per-sentence breakdown */}
                    {fullStory.length > 0 && (
                        <div className="breakdown-section">
                            <p className="section-label">Chi tiết từng câu</p>
                            <div className="breakdown-list">
                                {fullStory.map(({ playerName: author, sentence: sent }, i) => {
                                    const [bg, clr] = authorColor(author);
                                    return (
                                        <div
                                            key={i}
                                            className="breakdown-item"
                                            style={{ background: bg, borderLeft: `3px solid ${clr}` }}
                                        >
                                            <span className="breakdown-num" style={{ color: clr }}>
                                                #{i + 1}
                                            </span>
                                            <div className="breakdown-body">
                                                <p className="breakdown-sentence">{sent}</p>
                                                <p className="breakdown-author" style={{ color: clr }}>
                                                    — {author}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </>
    );
}
