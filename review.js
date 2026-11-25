(() => {
  const key = 'dominx-questions';
  const safeLoad = () => { try { const value=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(value)?value:[]; } catch { return []; } };
  const safeSave = rows => { try { localStorage.setItem(key, JSON.stringify(rows)); return true; } catch { return false; } };
  const escapeHTML = s => String(s).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const list = document.getElementById('question-list');
  const render = () => {
    if (!list) return;
    const rows = safeLoad();
    const welcome = '<div class="review-chat-welcome"><span class="review-chat-avatar">D</span><div class="review-chat-bubble"><strong>DOMINX</strong><p>Welcome! Send us your question here. We’ll reply when available.</p></div></div>';
    if (!rows.length) { list.innerHTML = welcome; return; }
    list.innerHTML = welcome + rows.map(row => `<div class="review-chat-thread"><div class="review-chat-user"><div class="review-chat-bubble"><p>${escapeHTML(row.message||'')}</p><small>${escapeHTML(row.name||'Guest')} · ${escapeHTML(row.date||'')}</small></div></div>${row.reply ? `<div class="review-chat-admin"><span class="review-chat-avatar">D</span><div class="review-chat-bubble"><strong>DOMINX</strong><p>${escapeHTML(row.reply)}</p></div></div>` : `<div class="review-chat-admin"><span class="review-chat-avatar">D</span><div class="review-chat-bubble review-chat-pending"><strong>DOMINX</strong><p>Message sent — reply pending.</p></div></div>`}</div>`).join('');
    list.scrollTop = list.scrollHeight;
  };
  const form = document.getElementById('question-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault(); const data = new FormData(form); const message = String(data.get('message')||'').trim(); if (!message) return;
    const rows = safeLoad(); rows.push({name:String(data.get('name')||'').trim(), message, date:new Date().toLocaleString(), reply:''});
    if (!safeSave(rows)) { const toast=document.querySelector('.toast'); if(toast){toast.textContent='Could not save message on this device.';toast.classList.add('show');} return; }
    render(); form.reset();
    const toast=document.querySelector('.toast'); if(toast){toast.textContent='Message saved on this device. Admin replies need the online setup.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3200);}
  });
  render();
})();
