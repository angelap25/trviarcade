export function Scoreboard({
    players,
    scores,
    turn
}) {

    return (

        <div className="scoreboard">

            {players.map((name, idx) => (

                <div
                    key={idx}
                    className={`player-led ${
                        idx === turn
                            ? "active"
                            : ""
                    }`}
                >

                    <div className="pname">
                        {name}
                    </div>

                    <div className="pscore">
                        {scores[idx]}
                    </div>

                </div>

            ))}

        </div>

    );

}

export function BallToast({ toast = null, players = [] }) {
  if (!toast) return null;
  const playerName = players[toast.player] || `Jugador ${toast.player + 1}`;
  return (
    <div className="ball-toast-global">
      <div className="ball-toast-content">{playerName}: {toast.text}</div>
    </div>
  );
}


export function CupOverlay({

    show,

    text

}) {

    if (!show)
        return null;

    return (

        <div className="cup-overlay">

            <div className="cup-content">

                <div className="cup-icon">

                    🏆

                </div>

                <div className="cup-text">

                    {text}

                </div>

            </div>

        </div>

    );

}