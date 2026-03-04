import Head from "next/head";
import { GameHeader } from "./GameHeader";
import { fmtCountdown } from "./types";

interface SubmittedScreenProps {
    now: Date;
    startTime: Date;
    endTime: Date;
    playerName: string;
}

export function SubmittedScreen({ now, startTime, endTime, playerName }: SubmittedScreenProps) {
    const msLeft = Math.max(0, endTime.getTime() - now.getTime());

    return (
        <>
            <Head><title>Viết Tiếp Câu Chuyện — Đã nộp bài!</title></Head>
            <div className="mesh-bg" />
            <div className="screen-layout">
                <GameHeader now={now} startTime={startTime} endTime={endTime} />
                <main className="screen-center screen-enter">

                    {/* <div className="pulse-ring pulse-success">🎉</div> */}

                    <div className="text-center">
                        <h1 className="heading-display">
                            Bạn đã hoàn thành
                            <br />
                            lượt viết của mình!
                        </h1>
                        <p className="subtext">
                            Câu chuyện đã được khoá đối với bạn,{" "}
                            <strong className="text-primary">{playerName}</strong>.
                            <br />
                            Hãy quay lại lúc{" "}
                            <strong className="text-accent">{endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong> để đọc toàn bộ tác phẩm của team nhé!
                        </p>
                    </div>

                    <div className="card card-elevated" style={{ textAlign: "center", padding: "2rem 3rem" }}>
                        <p className="card-eyebrow" style={{ color: "var(--success)" }}>Kết quả sau</p>
                        <div className="countdown" style={{ color: "var(--amber)" }}>{fmtCountdown(msLeft)}</div>
                    </div>

                    <p className="footer-note muted">
                        Bạn có thể tắt trang — chúng tôi sẽ tự động mở kết quả khi đến giờ!
                    </p>

                </main>
            </div>
        </>
    );
}
