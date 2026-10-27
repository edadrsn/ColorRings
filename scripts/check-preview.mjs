// Used by the double-click launcher to reuse an already running game server.
try {
  const response = await fetch('http://127.0.0.1:5173/', {
    signal: AbortSignal.timeout(2000),
  });
  const html = await response.text();
  process.exitCode = response.ok && html.includes('<title>Spin Sort') ? 0 : 1;
} catch {
  process.exitCode = 1;
}
