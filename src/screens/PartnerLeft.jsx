export default function PartnerLeft({ game }) {
  const { leaveGame } = game

  return (
    <div className="screen center">
      <div className="hero">
        <div className="brand small">À l’unisson</div>
      </div>
      <div className="card stack center">
        <span style={{ fontSize: 40 }}>💔</span>
        <h2>Ton binôme a quitté la partie</h2>
        <p className="muted">Vous pourrez relancer une partie dès que vous serez de nouveau deux.</p>
        <button className="btn btn-primary" onClick={leaveGame}>Retour à l’accueil</button>
      </div>
    </div>
  )
}
