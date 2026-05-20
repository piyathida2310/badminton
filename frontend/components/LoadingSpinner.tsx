"use client";

export default function LoadingSpinner() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Shuttlecock image with hit-bounce animation */}
      <div className="shuttlecock-wrap">
        <img
          src="/images/loadingbad.png"
          alt="Loading..."
          className="shuttlecock-img"
          draggable={false}
        />
        {/* Shadow below shuttlecock */}
        <div className="shuttlecock-shadow" />
      </div>

      {/* Loading text with animated dots */}
      <div className="loading-label">
        <span className="loading-text">Loading</span>
        <span className="dots-wrap">
          <span className="dot d1" />
          <span className="dot d2" />
          <span className="dot d3" />
        </span>
      </div>

      <style jsx>{`
        .shuttlecock-wrap {
          position: relative;
          animation: hitBounce 1.6s ease-in-out infinite;
        }

        .shuttlecock-img {
          width: 90px;
          height: 90px;
          object-fit: contain;
          filter: drop-shadow(0 6px 20px rgba(25, 65, 133, 0.25));
          animation: spin 1.6s ease-in-out infinite;
        }

        .shuttlecock-shadow {
          position: absolute;
          bottom: -14px;
          left: 50%;
          width: 50px;
          height: 10px;
          background: rgba(25, 65, 133, 0.12);
          border-radius: 50%;
          animation: shadowPulse 1.6s ease-in-out infinite;
        }

        .loading-label {
          margin-top: 1.75rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .loading-text {
          font-size: 1.125rem;
          font-weight: 600;
          color: #194185;
          letter-spacing: 0.04em;
        }

        .dots-wrap {
          display: flex;
          gap: 3px;
          align-items: center;
          padding-top: 2px;
        }

        .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #2ED3B7;
        }

        .d1 { animation: dotBounce 1.2s ease-in-out infinite 0s; }
        .d2 { animation: dotBounce 1.2s ease-in-out infinite 0.2s; }
        .d3 { animation: dotBounce 1.2s ease-in-out infinite 0.4s; }

        /* Hit bounce — like being smashed then floating back */
        @keyframes hitBounce {
          0% {
            transform: translateY(0);
          }
          8% {
            transform: translateY(10px);
          }
          20% {
            transform: translateY(-60px);
          }
          35% {
            transform: translateY(-30px);
          }
          50% {
            transform: translateY(-50px);
          }
          65% {
            transform: translateY(-20px);
          }
          80% {
            transform: translateY(-35px);
          }
          100% {
            transform: translateY(0);
          }
        }

        /* Subtle rotation — tilting from hit impact */
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          8% {
            transform: rotate(10deg);
          }
          20% {
            transform: rotate(-15deg);
          }
          35% {
            transform: rotate(8deg);
          }
          50% {
            transform: rotate(-10deg);
          }
          65% {
            transform: rotate(5deg);
          }
          80% {
            transform: rotate(-5deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes shadowPulse {
          0% {
            transform: translateX(-50%) scale(1);
            opacity: 0.15;
          }
          8% {
            transform: translateX(-50%) scale(1.2);
            opacity: 0.2;
          }
          20% {
            transform: translateX(-50%) scale(0.3);
            opacity: 0.03;
          }
          50% {
            transform: translateX(-50%) scale(0.5);
            opacity: 0.06;
          }
          100% {
            transform: translateX(-50%) scale(1);
            opacity: 0.15;
          }
        }

        @keyframes dotBounce {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
      `}</style>
    </div>
  );
}
