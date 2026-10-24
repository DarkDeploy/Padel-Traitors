export default function CorruptDataScreen({ onStartFresh }: { onStartFresh: () => void }) {
  return (
    <main className="screen screen-center">
      <div className="panel">
        <p className="eyebrow">Something went wrong</p>
        <h1>We couldn't read the saved session</h1>
        <p className="muted">
          The game saved in this browser is damaged or from an older version of the app, so it can't be restored safely.
          Starting fresh clears it — you'll need to add the players again.
        </p>
        <button className="btn btn-primary btn-block" onClick={onStartFresh}>
          Start a fresh session
        </button>
      </div>
    </main>
  );
}
