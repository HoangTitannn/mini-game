import Head from "next/head";
import { GameHeader } from "./GameHeader";
import { fmtCountdown, msUntilHour } from "./types";

interface CountdownScreenProps {
    now: Date;
    startTime: Date;
    endTime: Date;
    maxWords: number;
}

export function CountdownScreen({ now, startTime, endTime, maxWords }: CountdownScreenProps) {
    const ms = Math.max(0, startTime.getTime() - now.getTime()); // Ensure non-negative
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const totalMs = startTime.getTime() - midnight; // total duration from midnight to start time
    // Progress = how far through 00:00→startTime we are
    const elapsed = now.getTime() - midnight;
    const progress = Math.min(100, Math.max(0, (elapsed / totalMs) * 100));

    return (
        <>
            <Head><title>Viết Tiếp Câu Chuyện — Sắp Bắt Đầu</title></Head>
            <div className="mesh-bg" />
            <div className="screen-layout">
                <GameHeader now={now} startTime={startTime} endTime={endTime} showClock={false} />
                <main className="screen-center screen-enter">
                    <div className="pulse-ring">⏳</div>

                    <div className="text-center">
                        <h1 className="heading-display">Game chưa bắt đầu</h1>
                        <p className="subtext">
                            Trò chơi sẽ khởi động lúc{" "}
                            <strong className="text-accent">{startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong> hôm nay
                        </p>
                    </div>

                    {/* Countdown card */}
                    <div className="card card-elevated" style={{ textAlign: "center", padding: "2rem 3rem" }}>
                        <p className="card-eyebrow">Đếm ngược</p>
                        <div className="countdown">{fmtCountdown(ms)}</div>
                        {/* Progress bar */}
                        <div className="progress-track" style={{ marginTop: "1.25rem" }}>
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    {/* Rules card */}
                    <div className="card card-sm info-card">
                        <p className="info-text">
                            📖 Mỗi người viết{" "}
                            <strong>1 câu tối đa {maxWords} chữ</strong> nối tiếp câu của người trước.
                            <br />
                            Bạn sẽ không nhìn thấy toàn bộ câu chuyện cho đến{" "}
                            <strong className="text-accent">{endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>.
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}
