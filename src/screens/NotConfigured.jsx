export default function NotConfigured() {
  return (
    <div className="screen">
      <div className="hero">
        <div className="brand">À l’unisson</div>
      </div>
      <div className="card stack">
        <h2>Configuration Firebase manquante</h2>
        <p className="muted">
          L’application a besoin d’un projet Firebase pour fonctionner en temps réel.
        </p>
        <ul className="muted">
          <li>Copie <code>.env.example</code> en <code>.env</code> et renseigne tes clés Firebase, <b>ou</b></li>
          <li>Lance en mode émulateur : <code>npm run dev:emulator</code> (avec <code>npm run emulators</code> à côté).</li>
        </ul>
        <p className="muted">Voir le <code>README.md</code> pour le guide pas-à-pas.</p>
      </div>
    </div>
  )
}
