// GET /api/token: pide a ElevenLabs un token de conversación (WebRTC).
// La API key vive solo en el servidor; el navegador recibe un token de corta vida.
// ponytail: sin rate limit propio, el gasto lo acotan los límites del agente
// (300 s, concurrencia 2, 20 por día). Agregar límite por IP si el enlace sale de prospectos.
export async function GET() {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${process.env.AGENT_ID}`,
    { headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "" }, cache: "no-store" },
  );

  if (!res.ok) {
    // El detalle de upstream va al log del servidor, nunca al navegador.
    console.error("token upstream", res.status, await res.text());
    return Response.json({ error: "no_token" }, { status: 500 });
  }

  const { token } = await res.json();
  return Response.json({ token });
}
