export default function ApiHomePage() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>API Service</h1>
      <ul>
        <li>
          <a href="/api/tasks">/api/tasks</a>
        </li>
        <li>
          <a href="/api/test/error">/api/test/error</a>
        </li>
      </ul>
    </main>
  );
}

