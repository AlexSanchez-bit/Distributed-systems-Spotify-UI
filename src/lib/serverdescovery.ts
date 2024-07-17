async function isServerActive(url: any) {
  try {
    const response = await fetch(url, {
      method: "GET",
      timeout: 2000, // 2 segundos de timeout
    });

    // Verificar si la respuesta tiene un código de estado exitoso (200-299)
    return response.ok;
  } catch (error) {
    return false; // Manejar errores de red u otros errores
  }
}
async function discoverServer() {
  const basePort = 8080;
  const maxPorts = 10; // Por ejemplo, intentar hasta 8089

  for (let i = 0; i < maxPorts; i++) {
    const port = basePort + i;
    const url = `http://localhost:${port}`;
    const isActive = await isServerActive(url);
    if (isActive) {
      return url;
    }
  }

  throw new Error("No active server found");
}

export async function getServerUrl(lastUrl: any) {
  const isActive = await isServerActive(lastUrl);
  if (isActive) {
    return lastUrl;
  } else {
    console.log("Last URL not active, discovering new server...");
    return await discoverServer();
  }
}
