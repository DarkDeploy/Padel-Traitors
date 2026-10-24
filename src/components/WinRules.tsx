/** The win condition, worded identically wherever it appears. */
export default function WinRules() {
  return (
    <section className="rules">
      <p className="label">Who won?</p>
      <p>
        <strong>Traitors win</strong> only if both are true:
      </p>
      <ul>
        <li>they pulled off one of their dares, and</li>
        <li>the suspect is not a Traitor.</li>
      </ul>
      <p>
        Anything else — a Traitor named, or no dare pulled off — and the <strong>Faithful win</strong>.
      </p>
    </section>
  );
}
