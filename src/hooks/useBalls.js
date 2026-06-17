import { useEffect, useState, useRef } from 'react';

export function useBalls(numPlayers = 2) {
    const [balls, setBalls] = useState(() => Array(numPlayers).fill(0));
    const [toast, setToast] = useState(null);
    const [cupWinner, setCupWinner] = useState(null);
    const toastTimer = useRef(null);

    useEffect(() => {
        setBalls(Array(numPlayers).fill(0));
        setCupWinner(null);
    }, [numPlayers]);

    function resetBalls() {
        setBalls(Array(numPlayers).fill(0));
        setCupWinner(null);
    }

    function dismissToast() {
        setToast(null);
        if (toastTimer.current) {
            clearTimeout(toastTimer.current);
            toastTimer.current = null;
        }
    }

    function registerAnswer(playerIndex, correct) {
        if (!correct) return;
        setBalls(prev => {
            const n = [...prev];
            n[playerIndex] = (n[playerIndex] || 0) + 1;
            // si alcanza 5, declara ganador de copa
            if (n[playerIndex] >= 5 && cupWinner === null) {
                setCupWinner(playerIndex);
                setToast({ player: playerIndex, text: '¡Pelota conseguida! Copa obtenida 🏆' });
            } else {
                setToast({ player: playerIndex, text: '¡Pelota conseguida! ⚽' });
            }
            if (toastTimer.current) clearTimeout(toastTimer.current);
            toastTimer.current = setTimeout(() => setToast(null), 1400);
            return n;
        });
    }

    return {
        balls,
        toast,
        cupWinner,
        registerAnswer,
        resetBalls,
        dismissToast
    };
}

export default useBalls;
