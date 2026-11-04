const TEN_MINUTES_MS = 10 * 60 * 1000;

export const keepAlive = async () => {
  const baseUrl =
    process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;

  try {
    const response = await fetch(`${baseUrl}/api/me`);
    console.log(`[keepAlive] GET /api/me → ${response.status}`);
  } catch (error) {
    console.error("[keepAlive] Failed to ping server:", error);
  }

  setTimeout(keepAlive, TEN_MINUTES_MS);
};
