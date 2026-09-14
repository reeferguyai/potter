window.PotGrowHubGuru = (() => {
  let previousResponseId = null;
  async function ask(message) {
    const response = await fetch('/api/guru/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, previousResponseId })
    });
    if (!response.ok) throw new Error(`GanjaGuru API error: ${response.status}`);
    const data = await response.json();
    previousResponseId = data.responseId || previousResponseId;
    return data.text || '';
  }
  return { ask };
})();
