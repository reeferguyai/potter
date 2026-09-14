(() => {
  const routes = {
    'GURU AI':'/ai/','3D POD':'/3dpod/','STRAINS':'/strains/','STORE':'/marketplace/','GROW':'/cultivation/','AR/VR':'/immersive/','CIRCLE':'/community/',
    'KNOWLEDGE':'/knowledge/','STUDIO':'/design-studio/','GHOST COMMERCE':'/ghost-commerce/'
  };

  const normalize = value => String(value || '').replace(/\s+/g,' ').trim().toUpperCase();
  const routeFor = value => routes[normalize(value)] || null;

  function wireOrbit() {
    document.querySelectorAll('a,button,[role="button"]').forEach(el => {
      const label = normalize(el.textContent || el.getAttribute('aria-label'));
      const url = routeFor(label);
      if (!url || el.dataset.potgrowhubRouteWired) return;
      el.dataset.potgrowhubRouteWired = '1';
      el.addEventListener('click', event => { event.preventDefault(); window.location.href = url; });
    });
  }

  async function guru(message) {
    return window.PotGrowHubGuru.ask(message);
  }

  function findPrompt() {
    return document.querySelector('textarea[placeholder*="Ask" i], textarea[placeholder*="prompt" i], input[placeholder*="Ask" i], textarea, input[type="text"]');
  }

  function renderGuru(text) {
    const stream = document.querySelector('#chat-stream,.chat-stream,.messages,.chat-messages,[data-chat-stream]');
    if (!stream) return false;
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble ai potgrowhub-live-guru';
    bubble.innerHTML = '<h4>🌿 GanjaGuru</h4><p></p>';
    bubble.querySelector('p').textContent = text;
    stream.appendChild(bubble);
    stream.scrollTop = stream.scrollHeight;
    return true;
  }

  async function submitLivePrompt() {
    const input = findPrompt();
    if (!input || !input.value.trim()) return;
    const message = input.value.trim();
    input.value = '';
    try {
      renderGuru('GanjaGuru is thinking…');
      const answer = await guru(message);
      const live = document.querySelector('.potgrowhub-live-guru:last-child');
      if (live) live.querySelector('p').textContent = answer || 'GanjaGuru returned an empty response.';
    } catch (error) {
      const live = document.querySelector('.potgrowhub-live-guru:last-child');
      if (live) live.querySelector('p').textContent = 'GanjaGuru is unavailable. Check the API connection and server configuration.';
      console.error(error);
    }
  }

  function wirePrompt() {
    const input = findPrompt();
    if (!input || input.dataset.potgrowhubLiveWired) return;
    input.dataset.potgrowhubLiveWired = '1';
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submitLivePrompt(); }
    });
    const form = input.closest('form');
    if (form) form.addEventListener('submit', event => { event.preventDefault(); submitLivePrompt(); });
  }

  async function warmKnowledge() {
    try { window.PotGrowHubKnowledge = await fetch('/api/knowledge').then(r => r.ok ? r.json() : null); } catch (_) {}
  }

  function init() { wireOrbit(); wirePrompt(); warmKnowledge(); }
  window.PotGrowHubRuntime = { init, guru, routes };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  new MutationObserver(init).observe(document.documentElement, { childList:true, subtree:true });
})();
