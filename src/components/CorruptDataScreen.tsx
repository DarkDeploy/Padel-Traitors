export default function CorruptDataScreen({ onStartFresh }: { onStartFresh: () => void }) {
  return (
    <main className="screen screen-center">
      <h1>Saved game couldn't be loaded</h1>
      <button className="btn btn-primary btn-block" onClick={onStartFresh}>
        Start fresh
      </button>
    </main>
  );
}
