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

export function BallToast({ balls }) {

    return (

        <>

            {

                balls.map(ball => (

                    <div
                        key={ball.id}
                        className="ball-toast"
                        style={{

                            left: `${ball.left}%`,
                            width: ball.size,

                            height: ball.size

                        }}
                    >

                        ⚽

                    </div>

                ))

            }

        </>

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