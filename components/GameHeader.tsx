import { fmtCountdown } from "./types";

interface GameHeaderProps {
    now: Date;
    startTime?: Date;
    endTime?: Date;
    showClock?: boolean;
}

export function GameHeader({ now, startTime, endTime, showClock = true }: GameHeaderProps) {
    // If config not loaded, show loading or hide clock
    if (!startTime || !endTime) {
        return (
            <header className="game-header">
                <div className="header-brand">
                    <span className="header-icon">✍️</span>
                    <span className="header-title">Mini Game from FireAnt</span>
                </div>
                {showClock && (
                    <div className="header-clock">
                        <span className="clock-label">Đang tải...</span>
                    </div>
                )}
            </header>
        );
    }

    const isBeforeStart = now < startTime;
    const isPlaying = now >= startTime && now < endTime;
    const isEnded = now >= endTime;

    return (
        <header className="game-header">
            <div className="header-brand">
                <span className="header-icon">✍️</span>
                <span className="header-title">Mini Game from FireAnt</span>
            </div>
            {showClock && (
                <div className="header-clock">
                    <span className="clock-label">
                        {isBeforeStart ? "Bắt đầu sau" : isPlaying ? "Kết thúc sau" : "Đã kết thúc"}
                    </span>
                    {!isEnded && (
                        <span className="countdown-badge">
                            {fmtCountdown(Math.max(0, (isBeforeStart ? startTime.getTime() : endTime.getTime()) - now.getTime()))}
                        </span>
                    )}
                </div>
            )}
        </header>
    );
}
