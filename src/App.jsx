import { useState, useEffect, useRef } from 'react';
import { QUESTIONS_GENERAL, QUESTIONS_BY_YEAR, YEARS, shuffle } from './data/questions.js';
import { useBalls } from './hooks/useBalls.js';
import { Scoreboard, BallToast, CupOverlay } from './components';

const PENAL_STEPS = 5;

function getTitleForScore(score) {
  if (score >= 101) return 'LEYENDA MUNDIALISTA';
  if (score >= 51) return 'ANALISTA DEPORTIVO';
  return 'HINCHA CASUAL';
}

export default function App() {
  // ---- navegación de pantallas ----
  const [screen, setScreen] = useState('home'); // home | playerCount | names | game | end
  const [mode, setMode] = useState(null);
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState(['JUGADOR 1', 'JUGADOR 2']);

  // ---- estado de juego compartido ----
  const [scores, setScores] = useState([0, 0]);
  const [turn, setTurn] = useState(0);
  const [pool, setPool] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [answered, setAnswered] = useState(null); // índice elegido, o null
  const [feedback, setFeedback] = useState(null);

  // ---- estado específico por modo ----
  const [energy, setEnergy] = useState(60);
  const energyTimerRef = useRef(null);

  const [varDoublePending, setVarDoublePending] = useState([false, false]);
  const [isVarQuestion, setIsVarQuestion] = useState(false);

  const [yearIndex, setYearIndex] = useState(0);
  const [yearPool, setYearPool] = useState([]);
  const [yearQIndex, setYearQIndex] = useState(0);

  const [streak, setStreak] = useState([0, 0]);

  const [penalProgress, setPenalProgress] = useState([0, 0]);
  const [showGoalScreen, setShowGoalScreen] = useState(false);

  // ---- sistema de pelotas / Copa del Mundo (transversal) ----
  const balls = useBalls(numPlayers);

  function switchTurn() {
    if (numPlayers === 1) return;
    setTurn(t => 1 - t);
  }

  function nextQuestionFromPool(currentPool, currentIndex, setPoolFn, setIndexFn) {
    let p = currentPool;
    let i = currentIndex;
    if (i >= p.length) {
      p = shuffle(p);
      i = 0;
      setPoolFn(p);
    }
    const q = p[i];
    setIndexFn(i + 1);
    return q;
  }

  // ============================================================
  // NAVEGACIÓN
  // ============================================================
  function goHome() {
    clearInterval(energyTimerRef.current);
    setScreen('home');
  }

  function pickMode(m) {
    setMode(m);
    setScreen('playerCount');
  }

  function pickPlayerCount(n) {
    setNumPlayers(n);
    setScreen('names');
  }

  function confirmNames(p1, p2) {
    const name1 = (p1 || 'JUGADOR 1').toUpperCase().slice(0, 12);
    const name2 = numPlayers === 1 ? 'JUGADOR 2' : (p2 || 'JUGADOR 2').toUpperCase().slice(0, 12);
    setPlayers([name1, name2]);
    startMode(mode);
  }

  function startMode(m) {
    clearInterval(energyTimerRef.current);
    setMode(m);
    setScores([0, 0]);
    setTurn(0);
    setQIndex(0);
    setStreak([0, 0]);
    setPenalProgress([0, 0]);
    setVarDoublePending([false, false]);
    setYearIndex(0);
    setYearPool([]);
    setYearQIndex(0);
    setAnswered(null);
    setFeedback(null);
    setShowGoalScreen(false);
    balls.resetBalls();

    if (m === 'muerte') {
      setEnergy(60);
      const p = shuffle(QUESTIONS_GENERAL);
      setPool(p);
      setCurrentQ(p[0]);
      setQIndex(1);
    } else if (m === 'var') {
      const p = shuffle(QUESTIONS_GENERAL);
      setPool(p);
      setCurrentQ(p[0]);
      setQIndex(1);
      setIsVarQuestion(false);
    } else if (m === 'viaje') {
      const yp = shuffle(QUESTIONS_BY_YEAR[YEARS[0]]);
      setYearPool(yp);
      setYearQIndex(1);
      setCurrentQ(yp[0]);
    } else if (m === 'racha') {
      const p = shuffle(QUESTIONS_GENERAL);
      setPool(p);
      setCurrentQ(p[0]);
      setQIndex(1);
    } else if (m === 'penales') {
      const p = shuffle(QUESTIONS_GENERAL);
      setPool(p);
      setCurrentQ(p[0]);
      setQIndex(1);
    }

    setScreen('game');
  }

  // ============================================================
  // TIMER DE ENERGÍA (Muerte Súbita)
  // ============================================================
  useEffect(() => {
    if (screen !== 'game' || mode !== 'muerte') return;
    energyTimerRef.current = setInterval(() => {
      setEnergy(e => {
        if (e <= 1) {
          clearInterval(energyTimerRef.current);
          setTimeout(() => endGame(), 50);
          return 0;
        }
        return e - 1;
      });
    }, 1000);
    return () => clearInterval(energyTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, mode, turn]); // se reinicia si cambia turno para mantener referencia fresca de endGame

  // ============================================================
  // RESPONDER PREGUNTA (genérico para muerte / racha / penales / var, distinto handling)
  // ============================================================

  function handleAnswerMuerte(i) {
    if (answered !== null) return;
    setAnswered(i);
    const correct = i === currentQ.correct;
    balls.registerAnswer(turn, correct);

    setScores(prev => {
      const next = [...prev];
      if (correct) next[turn] += 10;
      return next;
    });

    setEnergy(e => {
      let ne = correct ? e + 3 : e - 5;
      if (ne > 60) ne = 60;
      if (ne < 0) ne = 0;
      return ne;
    });

    setTimeout(() => {
      setEnergy(curEnergy => {
        if (curEnergy <= 0) {
          clearInterval(energyTimerRef.current);
          endGame();
        } else {
          switchTurn();
          const q = nextQuestionFromPool(pool, qIndex, setPool, setQIndex);
          setCurrentQ(q);
          setAnswered(null);
        }
        return curEnergy;
      });
    }, 700);
  }

  function handleAnswerVar(i) {
    if (answered !== null) return;
    setAnswered(i);
    const correct = i === currentQ.correct;
    balls.registerAnswer(turn, correct);

    let msg = '';
    if (isVarQuestion) {
      if (correct) {
        setScores(prev => { const n = [...prev]; n[turn] += 10; return n; });
        setVarDoublePending(prev => { const n = [...prev]; n[turn] = true; return n; });
        msg = '✅ VAR confirma: ¡la próxima jugada vale el doble!';
      } else {
        setScores(prev => { const n = [...prev]; n[turn] = Math.max(0, n[turn] - 5); return n; });
        msg = '❌ VAR anula la jugada: perdés puntos esta vez.';
      }
    } else {
      if (correct) {
        const mult = varDoublePending[turn] ? 2 : 1;
        setScores(prev => { const n = [...prev]; n[turn] += 10 * mult; return n; });
        if (mult === 2) msg = '⭐ ¡Puntos dobles aplicados!';
      }
      setVarDoublePending(prev => { const n = [...prev]; n[turn] = false; return n; });
    }
    setFeedback(msg ? { ok: correct, text: msg } : null);

    setTimeout(() => {
      setQIndex(curIndex => {
        if (curIndex >= 16) {
          endGame();
          return curIndex;
        }
        switchTurn();
        const nextIsVar = curIndex % 5 === 0;
        const q = nextQuestionFromPool(pool, curIndex, setPool, setQIndex);
        setCurrentQ(q);
        setIsVarQuestion(nextIsVar);
        setAnswered(null);
        setFeedback(null);
        return curIndex;
      });
    }, 1100);
  }

  function handleAnswerViaje(i) {
    if (answered !== null) return;
    setAnswered(i);
    const correct = i === currentQ.correct;
    balls.registerAnswer(turn, correct);
    if (correct) {
      setScores(prev => { const n = [...prev]; n[turn] += 10; return n; });
    }

    setTimeout(() => {
      switchTurn();
      setYearQIndex(curYQ => {
        const newYQ = curYQ;
        if (newYQ >= yearPool.length) {
          // pasar al siguiente mundial
          setYearIndex(curYearIdx => {
            const nextYearIdx = curYearIdx + 1;
            if (nextYearIdx >= YEARS.length) {
              setTimeout(() => endGame(), 50);
              return curYearIdx;
            }
            const newPool = shuffle(QUESTIONS_BY_YEAR[YEARS[nextYearIdx]]);
            setYearPool(newPool);
            setCurrentQ(newPool[0]);
            setAnswered(null);
            return nextYearIdx;
          });
          return 1;
        } else {
          setCurrentQ(yearPool[newYQ]);
          setAnswered(null);
          return newYQ + 1;
        }
      });
    }, 700);
  }

  function handleAnswerRacha(i) {
    if (answered !== null) return;
    setAnswered(i);
    const correct = i === currentQ.correct;
    balls.registerAnswer(turn, correct);

    setStreak(prev => {
      const n = [...prev];
      if (correct) {
        const mult = Math.min(5, n[turn] + 1);
        setScores(s => { const ns = [...s]; ns[turn] += 10 * mult; return ns; });
        n[turn] = mult;
      } else {
        n[turn] = 0;
      }
      return n;
    });

    setTimeout(() => {
      setQIndex(curIndex => {
        if (curIndex >= 15) {
          endGame();
          return curIndex;
        }
        switchTurn();
        const q = nextQuestionFromPool(pool, curIndex, setPool, setQIndex);
        setCurrentQ(q);
        setAnswered(null);
        return curIndex;
      });
    }, 700);
  }

  function handleAnswerPenal(i) {
    if (answered !== null) return;
    setAnswered(i);
    const correct = i === currentQ.correct;
    balls.registerAnswer(turn, correct);

    if (correct) {
      setScores(prev => { const n = [...prev]; n[turn] += 10; return n; });
      setPenalProgress(prev => {
        const n = [...prev];
        n[turn] += 1;
        if (n[turn] >= PENAL_STEPS) {
          setTimeout(() => setShowGoalScreen(true), 500);
        } else {
          setTimeout(() => advancePenales(), 700);
        }
        return n;
      });
    } else {
      setPenalProgress(prev => { const n = [...prev]; n[turn] = 0; return n; });
      setTimeout(() => advancePenales(), 700);
    }
  }

  function advancePenales() {
    setQIndex(curIndex => {
      if (curIndex >= 20) {
        endGame();
        return curIndex;
      }
      switchTurn();
      const q = nextQuestionFromPool(pool, curIndex, setPool, setQIndex);
      setCurrentQ(q);
      setAnswered(null);
      return curIndex;
    });
  }

  function continueAfterGoal() {
    setScores(prev => { const n = [...prev]; n[turn] += 30; return n; });
    setPenalProgress(prev => { const n = [...prev]; n[turn] = 0; return n; });
    setShowGoalScreen(false);
    setTimeout(() => advancePenales(), 50);
  }

  // ============================================================
  // FIN DE PARTIDA
  // ============================================================
  function endGame() {
    clearInterval(energyTimerRef.current);
    setScreen('end');
  }

  // ============================================================
  // RENDER: HOME
  // ============================================================
  if (screen === 'home') {
    return (
      <Cabinet>
        <div className="pixel-title" style={{ textAlign: 'center', fontSize: 15, marginBottom: 4 }}>
          TRIVIA MUNDIALISTA
        </div>
        <div className="pixel-title" style={{ textAlign: 'center', fontSize: 11, color: 'var(--led-green)', marginBottom: 14 }}>
          USA · MÉXICO · CANADÁ 2026
        </div>
        <p style={{ textAlign: 'center', fontSize: 16, opacity: 0.85, marginBottom: 4 }}>
          Elegí un modo de juego. Se juega de 1 o 2 personas.
        </p>
        <p style={{ textAlign: 'center', fontSize: 13, opacity: 0.65, marginBottom: 10 }}>
          ⚽ Cada 5 aciertos seguidos suma una pelota. ¡5 pelotas = Copa del Mundo!
        </p>
        <div className="mode-grid">
          <ModeCard icon="🔥" title="MUERTE SÚBITA" desc="60s de energía. Acertar suma, fallar resta. Gana quien más sume." onClick={() => pickMode('muerte')} />
          <ModeCard icon="📺" title="MODO VAR" desc="Cada 5 preguntas, una jugada especial puede duplicar tus puntos." onClick={() => pickMode('var')} />
          <ModeCard icon="🌎" title="VIAJE POR MUNDIALES" desc="De México 86 a Qatar 2022, viajando en el tiempo edición por edición." onClick={() => pickMode('viaje')} />
          <ModeCard icon="🎯" title="RACHA MUNDIALISTA" desc="Multiplicador x1 a x5. Una racha de aciertos vale oro." onClick={() => pickMode('racha')} />
          <ModeCard icon="🥅" title="PENALES" desc="5 aciertos seguidos acercan la pelota al arco. ¡Definí a los penales!" onClick={() => pickMode('penales')} />
        </div>
      </Cabinet>
    );
  }

  // ============================================================
  // RENDER: ELEGIR CANTIDAD DE JUGADORES
  // ============================================================
  if (screen === 'playerCount') {
    return (
      <Cabinet>
        <div className="pixel-title" style={{ textAlign: 'center', fontSize: 13, marginBottom: 18 }}>
          ¿CUÁNTOS JUEGAN?
        </div>
        <div className="mode-grid">
          <ModeCard icon="🧍" title="1 JUGADOR" desc="Modo individual, contra tu propio récord." onClick={() => pickPlayerCount(1)} />
          <ModeCard icon="🧍🧍" title="2 JUGADORES" desc="Por turnos, cara a cara en la misma pantalla." onClick={() => pickPlayerCount(2)} />
        </div>
        <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={goHome}>← VOLVER</button>
      </Cabinet>
    );
  }

  // ============================================================
  // RENDER: NOMBRES
  // ============================================================
  if (screen === 'names') {
    return <NamesScreen numPlayers={numPlayers} mode={mode} onBack={() => setScreen('playerCount')} onConfirm={confirmNames} />;
  }

  // ============================================================
  // RENDER: JUEGO
  // ============================================================
  if (screen === 'game') {
    const turnBanner =
      numPlayers === 1
        ? (showGoalScreen ? `${players[0]} VA AL PENAL` : `¡A JUGAR, ${players[0]}!`)
        : (showGoalScreen ? `${players[turn]} VA AL PENAL` : `TURNO DE ${players[turn]}`);

    return (
      <Cabinet>
        <BallToast toast={balls.toast} players={players} />
        <CupOverlay cupWinner={balls.cupWinner} players={players} onContinue={balls.dismissToast} />

        <div className="turn-banner">{turnBanner}</div>
        <Scoreboard players={players} scores={scores} turn={turn} numPlayers={numPlayers} balls={balls.balls} cupWinner={balls.cupWinner} />

        {mode === 'muerte' && !showGoalScreen && (
          <MuerteSubitaView energy={energy} currentQ={currentQ} answered={answered} onAnswer={handleAnswerMuerte} />
        )}

        {mode === 'var' && (
          <VarView qIndex={qIndex} isVarQuestion={isVarQuestion} varDoublePending={varDoublePending[turn]} currentQ={currentQ} answered={answered} feedback={feedback} onAnswer={handleAnswerVar} />
        )}

        {mode === 'viaje' && (
          <ViajeView year={YEARS[yearIndex]} yearIndex={yearIndex} currentQ={currentQ} answered={answered} onAnswer={handleAnswerViaje} />
        )}

        {mode === 'racha' && (
          <RachaView qIndex={qIndex} streak={streak[turn]} currentQ={currentQ} answered={answered} onAnswer={handleAnswerRacha} />
        )}

        {mode === 'penales' && !showGoalScreen && (
          <PenalesView progress={penalProgress[turn]} currentQ={currentQ} answered={answered} onAnswer={handleAnswerPenal} />
        )}

        {mode === 'penales' && showGoalScreen && (
          <GoalScreen playerName={players[turn]} onContinue={continueAfterGoal} />
        )}
      </Cabinet>
    );
  }

  // ============================================================
  // RENDER: FIN DE PARTIDA
  // ============================================================
  if (screen === 'end') {
    const s1 = scores[0];
    const s2 = scores[1];
    const modeUsesTitles = mode === 'muerte';

    if (numPlayers === 1) {
      return (
        <Cabinet>
          <div className="trophy">🏆</div>
          <div className="title-result">FIN DE LA PARTIDA</div>
          <div className="winner-tag">¡Buen partido, {players[0]}!</div>
          <div className="final-scores">
            <FinalCard name={players[0]} score={s1} winner title={modeUsesTitles ? getTitleForScore(s1) : null} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 16, marginBottom: 14 }}>
            ⚽ Pelotas conseguidas: {balls.balls[0]}/5 {balls.cupWinner === 0 ? '🏆 ¡Copa del Mundo!' : ''}
          </div>
          <div className="btn-row">
            <button className="btn btn-secondary" onClick={goHome}>MENÚ PRINCIPAL</button>
            <button className="btn" onClick={() => startMode(mode)}>JUGAR DE NUEVO ▶</button>
          </div>
        </Cabinet>
      );
    }

    let winnerText = '';
    if (s1 === s2) winnerText = '¡EMPATE! Vamos a alargue 😉';
    else winnerText = `🏆 ${players[s1 > s2 ? 0 : 1]} GANA EL PARTIDO`;

    return (
      <Cabinet>
        <div className="trophy">🏆</div>
        <div className="title-result">FIN DEL PARTIDO</div>
        <div className="winner-tag">{winnerText}</div>
        <div className="final-scores">
          <FinalCard name={players[0]} score={s1} winner={s1 >= s2} title={modeUsesTitles ? getTitleForScore(s1) : null} />
          <FinalCard name={players[1]} score={s2} winner={s2 >= s1} title={modeUsesTitles ? getTitleForScore(s2) : null} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 15, marginBottom: 14 }}>
          ⚽ {players[0]}: {balls.balls[0]}/5{balls.cupWinner === 0 ? ' 🏆' : ''} &nbsp;|&nbsp; {players[1]}: {balls.balls[1]}/5{balls.cupWinner === 1 ? ' 🏆' : ''}
        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={goHome}>MENÚ PRINCIPAL</button>
          <button className="btn" onClick={() => startMode(mode)}>REVANCHA ▶</button>
        </div>
      </Cabinet>
    );
  }

  return null;
}

// ============================================================
// COMPONENTES DE LAYOUT / PRESENTACIÓN
// ============================================================

function Cabinet({ children }) {
  return (
    <div className="cabinet">
      <div className="cabinet-header">⚽ TRIVIA ARCADE ⚽</div>
      <div className="screen">
        <div className="view">{children}</div>
      </div>
    </div>
  );
}

function ModeCard({ icon, title, desc, onClick }) {
  return (
    <div className="mode-card" onClick={onClick}>
      <div className="icon">{icon}</div>
      <div className="info">
        <div className="mtitle">{title}</div>
        <div className="mdesc">{desc}</div>
      </div>
    </div>
  );
}

function NamesScreen({ numPlayers, mode, onBack, onConfirm }) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  return (
    <Cabinet>
      <div className="pixel-title" style={{ textAlign: 'center', fontSize: 13, marginBottom: 16 }}>
        ANTES DE EMPEZAR
      </div>
      <p style={{ textAlign: 'center', fontSize: 16, marginBottom: 6 }}>
        {numPlayers === 1 ? 'Tu nombre' : 'Nombre Jugador 1'}
      </p>
      <input
        maxLength={12}
        placeholder="JUGADOR 1"
        value={p1}
        onChange={e => setP1(e.target.value)}
        style={inputStyle}
      />
      {numPlayers === 2 && (
        <>
          <p style={{ textAlign: 'center', fontSize: 16, marginBottom: 6 }}>Nombre Jugador 2</p>
          <input
            maxLength={12}
            placeholder="JUGADOR 2"
            value={p2}
            onChange={e => setP2(e.target.value)}
            style={{ ...inputStyle, marginBottom: 20 }}
          />
        </>
      )}
      {numPlayers === 1 && <div style={{ marginBottom: 20 }} />}
      <div className="btn-row">
        <button className="btn btn-secondary" onClick={onBack}>← VOLVER</button>
        <button className="btn" onClick={() => onConfirm(p1, p2)}>EMPEZAR ▶</button>
      </div>
    </Cabinet>
  );
}

const inputStyle = {
  width: '100%',
  marginBottom: 14,
  padding: 10,
  fontFamily: "'VT323', monospace",
  fontSize: 18,
  background: 'rgba(0,0,0,0.4)',
  border: '2px solid var(--chalk)',
  borderRadius: 8,
  color: 'var(--chalk)',
  textAlign: 'center',
};

function OptionsList({ currentQ, answered, onAnswer }) {
  if (!currentQ) return null;
  return (
    <div className="options">
      {currentQ.options.map((opt, i) => {
        let cls = 'option-btn';
        if (answered !== null) {
          if (i === currentQ.correct) cls += ' correct';
          else if (i === answered) cls += ' wrong';
        }
        return (
          <button key={i} className={cls} disabled={answered !== null} onClick={() => onAnswer(i)}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// VISTAS POR MODO
// ============================================================

function MuerteSubitaView({ energy, currentQ, answered, onAnswer }) {
  const pct = Math.max(0, Math.min(100, (energy / 60) * 100));
  return (
    <>
      <div className="energy-wrap">
        <div className="energy-label">{energy} / 60</div>
        <div className="energy-bar-outer">
          <div className="energy-bar-inner" style={{ width: pct + '%' }} />
        </div>
      </div>
      <div className="question-box"><p>{currentQ?.q}</p></div>
      <OptionsList currentQ={currentQ} answered={answered} onAnswer={onAnswer} />
    </>
  );
}

function VarView({ qIndex, isVarQuestion, varDoublePending, currentQ, answered, feedback, onAnswer }) {
  return (
    <>
      <div className="qcounter">
        Pregunta {qIndex} {varDoublePending ? '· ⭐ PUNTOS DOBLES ACTIVOS' : ''}
      </div>
      {isVarQuestion && (
        <div className="var-banner">🚨 JUGADA DE VAR — ¡ACIERTO DOBLE O PIERDES TIEMPO! 🚨</div>
      )}
      <div className="question-box"><p>{currentQ?.q}</p></div>
      <OptionsList currentQ={currentQ} answered={answered} onAnswer={onAnswer} />
      {feedback && (
        <div className={'feedback ' + (feedback.ok ? 'ok' : 'bad')}>{feedback.text}</div>
      )}
    </>
  );
}

function ViajeView({ year, yearIndex, currentQ, answered, onAnswer }) {
  return (
    <>
      <div className="year-badge">🌎 MUNDIAL {year}</div>
      <div className="year-track">
        {YEARS.map((y, idx) => (
          <div key={y} className={'dot' + (idx < yearIndex ? ' done' : '') + (idx === yearIndex ? ' now' : '')} />
        ))}
      </div>
      <div className="question-box"><p>{currentQ?.q}</p></div>
      <OptionsList currentQ={currentQ} answered={answered} onAnswer={onAnswer} />
    </>
  );
}

function RachaView({ qIndex, streak, currentQ, answered, onAnswer }) {
  const mult = Math.min(5, streak + 1);
  return (
    <>
      <div className="streak-display">
        <div className="mult">x{mult}</div>
        <div className="streak-dots">
          {[1, 2, 3, 4, 5].map(n => (
            <span key={n} className={n <= streak ? 'lit' : ''} />
          ))}
        </div>
      </div>
      <div className="qcounter">Pregunta {qIndex}/15</div>
      <div className="question-box"><p>{currentQ?.q}</p></div>
      <OptionsList currentQ={currentQ} answered={answered} onAnswer={onAnswer} />
    </>
  );
}

function PenalesView({ progress, currentQ, answered, onAnswer }) {
  const leftPct = 4 + (progress / PENAL_STEPS) * 86;
  return (
    <>
      <div className="qcounter">Aciertos seguidos: {progress}/{PENAL_STEPS}</div>
      <div className="penal-track">
        <div className="yard-line" style={{ left: '25%' }} />
        <div className="yard-line" style={{ left: '50%' }} />
        <div className="yard-line" style={{ left: '75%' }} />
        <div className="ball" style={{ left: leftPct + '%' }}>⚽</div>
        <div className="goal">🥅</div>
      </div>
      <div className="question-box"><p>{currentQ?.q}</p></div>
      <OptionsList currentQ={currentQ} answered={answered} onAnswer={onAnswer} />
    </>
  );
}

function GoalScreen({ playerName, onContinue }) {
  return (
    <>
      <div style={{ textAlign: 'center', fontSize: 60, margin: '30px 0' }}>⚽➡️🥅</div>
      <div className="pixel-title" style={{ textAlign: 'center', fontSize: 20, color: 'var(--led-green)' }}>
        ¡GOOOL!
      </div>
      <p style={{ textAlign: 'center', fontSize: 17, marginTop: 8 }}>+30 puntos extra por la definición</p>
      <button className="btn" style={{ marginTop: 20 }} onClick={onContinue}>SEGUIR JUGANDO ▶</button>
    </>
  );
}

function FinalCard({ name, score, winner, title }) {
  return (
    <div className={'final-card' + (winner ? ' winner' : '')}>
      <div className="fname">{name}</div>
      <div className="fscore">{score}</div>
      {title && <div style={{ fontSize: 12, marginTop: 6, color: 'var(--gold-bright)' }}>{title}</div>}
    </div>
  );
}
