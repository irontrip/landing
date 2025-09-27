// Lightweight client-side gate for /landing/dev only.
// Compares SHA-256(passphrase) against a stored hash; stores a flag in localStorage on success.
(async function(){
  try {
    var p = location.pathname || '';
    if (!p.startsWith('/landing/dev')) return; // Only gate the permanent dev URL

    var KEY = 'irontrip_dev_access_v1';
    if (localStorage.getItem(KEY) === 'granted') return;

    var expectedHex = 'b662b3bec89022f0a1a78fc497842bd4197cd34aa642d2567041f05ae4b07fc3'; // SHA-256 of provided passphrase

    async function sha256Hex(text){
      const enc = new TextEncoder();
      const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
      const bytes = Array.from(new Uint8Array(buf));
      return bytes.map(b=>b.toString(16).padStart(2,'0')).join('');
    }

    for (let i=0;i<3;i++){
      var input = window.prompt('This preview is restricted. Enter access code:');
      if (input === null) break;
      var ok = (await sha256Hex(String(input).trim())) === expectedHex;
      if (ok){ localStorage.setItem(KEY, 'granted'); return; }
      alert('Incorrect code.');
    }

    // Block content if not granted
    document.documentElement.innerHTML = '<head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Restricted</title></head>'+
      '<body style="height:100vh;display:grid;place-items:center;background:#0b1220;color:#e5e7eb;font:16px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial,sans-serif">'+
      '<main style="text-align:center;max-width:520px;padding:24px">'+
      '<h1 style="margin:0 0 8px;font-size:24px">Restricted Preview</h1>'+
      '<p>Access code required for the dev environment.</p>'+
      '</main></body>';
  } catch(e){ console.warn('dev-gate error', e); }
})();
