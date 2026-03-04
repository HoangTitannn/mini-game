import Head from "next/head";
import { GameHeader } from "./GameHeader";
import { fmtCountdown } from "./types";

interface WelcomeScreenProps {
    now: Date;
    startTime: Date;
    endTime: Date;
    maxWords: number;
    nameInput: string;
    setNameInput: (v: string) => void;
    loading: boolean;
    onStart: () => void;
}

export function WelcomeScreen({
    now,
    startTime,
    endTime,
    maxWords,
    nameInput,
    setNameInput,
    loading,
    onStart,
}: WelcomeScreenProps) {
    return (
        <>
            <Head><title>Viết Tiếp Câu Chuyện — Đăng ký</title></Head>
            <div className="mesh-bg" />
            <div className="screen-layout">
                <GameHeader now={now} startTime={startTime} endTime={endTime} />
                <main className="screen-center screen-enter">
                    <div className="card card-elevated welcome-card">
                        {/* Hero */}
                        <div className="welcome-hero">
                            <div className="hero-badge">✍️</div>
                            <h1 className="heading-display">
                                VIẾT TIẾP
                                <br />
                                CÂU CHUYỆN
                            </h1>
                            <p className="hero-desc">
                                Bạn chỉ thấy câu gần nhất trước đó.
                                <br />
                                Mỗi người viết 1 câu tối đa{" "}
                                <strong className="text-primary">{maxWords} chữ</strong> nối tiếp.
                                <br />
                                Câu chuyện đầy đủ sẽ được tiết lộ lúc{" "}
                                <strong className="text-accent">{endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>.
                            </p>
                        </div>

                        <div className="divider" />

                        {/* Form */}
                        <div className="form-group">
                            <label className="field-label" htmlFor="player-name-input">
                                Tên của bạn
                            </label>
                            <input
                                id="player-name-input"
                                className="field"
                                placeholder="VD: Quang Không Ngọt, Diệu Xinh..."
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && onStart()}
                                maxLength={40}
                                autoFocus
                            />
                        </div>

                        <button
                            id="start-btn"
                            className="btn-primary btn-full"
                            onClick={onStart}
                            disabled={loading}
                        >
                            {loading ? (
                                <><span className="btn-spinner" /> Đang tải...</>
                            ) : (
                                "BẮT ĐẦU →"
                            )}
                        </button>

                        <div className="divider" />

                        <p className="footer-note">
                            <span className="countdown-badge countdown-sm">
                                {fmtCountdown(Math.max(0, endTime.getTime() - now.getTime()))}
                            </span>{" "}
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}
