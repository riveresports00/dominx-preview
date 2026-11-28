(() => {
 const cfg=window.DOMINX_CMS_CONFIG||{};
 const ok=cfg.supabaseUrl&&!cfg.supabaseUrl.includes('YOUR-PROJECT')&&cfg.supabaseAnonKey&&!cfg.supabaseAnonKey.includes('YOUR-SUPABASE')&&window.supabase;
 if(!ok)return;
 const client=window.DOMINX_SUPABASE_CLIENT;
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const platformNames={instagram:'INSTAGRAM',discord:'DISCORD',youtube:'YOUTUBE',x:'X / TWITTER',whatsapp:'WHATSAPP',facebook:'FACEBOOK'};
 async function links(){const {data,error}=await client.from('social_links').select('platform,url,label,sort_order').order('sort_order');if(error||!data)return;
 document.querySelectorAll('[data-social]').forEach(a=>{const p=a.dataset.social,rec=data.find(x=>x.platform===p);if(rec&&rec.url){a.href=rec.url;a.target='_blank';a.rel='noopener noreferrer';}});
 const host=document.getElementById('cms-social-destinations');if(host){host.innerHTML=data.map(d=>`<a class="social-card cms-social-destination" href="${safe(d.url)}" target="_blank" rel="noopener noreferrer"><div class="info"><h2>${safe(d.label||platformNames[d.platform]||d.platform)}</h2><p>Official DOMINX channel</p><span class="open">OPEN CHANNEL ↗</span></div></a>`).join('');}
 }
 async function posts(){const host=document.getElementById('cms-shared-posts');if(!host)return;const {data,error}=await client.from('shared_posts').select('*').eq('published',true).order('created_at',{ascending:false});if(error||!data||!data.length)return;
 host.innerHTML=data.map(p=>`<article class="social-card cms-shared-post">${p.image_url?`<img class="cms-shared-post-image" src="${safe(p.image_url)}" alt="${safe(p.title)} thumbnail" loading="lazy">`:''}<div class="info"><small class="eyebrow">DOMINX UPDATE</small><h2>${safe(p.title)}</h2><p>${safe(p.body||'')}</p>${p.url?`<a class="open" href="${safe(p.url)}" target="_blank" rel="noopener noreferrer">OPEN SHARED LINK ↗</a>`:''}</div></article>`).join('');const fallback=document.getElementById('social-fallback-posts');if(fallback)fallback.hidden=true;
 }
 async function newsAndRoster(){
  const newsTarget=document.querySelector('#news .news-feature-info');
  const rosterCards=[...document.querySelectorAll('.roster-page-grid .player-card')];
  const tasks=[];
  if(newsTarget)tasks.push(client.from('news_feature').select('*').eq('id',1).maybeSingle().then(({data,error})=>{if(error||!data)return;const title=newsTarget.querySelector('h3'),desc=newsTarget.querySelector('p'),cta=newsTarget.querySelector('.news-coming');if(title)title.textContent=data.title||'LATEST UPDATE';if(desc)desc.textContent=data.body||'';const imageHost=document.querySelector('#news .news-image');if(imageHost&&data.image_url)imageHost.innerHTML=`<img class="cms-news-image" src="${safe(data.image_url)}" alt="Dominx news" loading="lazy">`;if(cta){if(data.url){cta.outerHTML=`<a class="news-coming cms-news-link" href="${safe(data.url)}" target="_blank" rel="noopener noreferrer">OPEN UPDATE ↗</a>`;}else cta.textContent='LATEST FROM DOMINX';}}));
  if(rosterCards.length)tasks.push(client.from('roster_players').select('*').order('slot').then(({data,error})=>{if(error||!data)return;data.forEach(r=>{const card=rosterCards[r.slot-1];if(!card)return;const name=card.querySelector('.player-info h3'),role=card.querySelector('.player-role'),bio=card.querySelector('.profile-placeholder');if(name)name.textContent=r.player_name||`PLAYER ${r.slot}`;if(role)role.textContent=r.role||'TEAM MEMBER';if(bio)bio.textContent=r.bio||'';if(r.profile_url&&bio){const link=document.createElement('a');link.href=r.profile_url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='PROFILE LINK ↗';link.className='text-link';bio.appendChild(link);}});}));
  await Promise.all(tasks);
 }
 document.addEventListener('DOMContentLoaded',()=>{links();posts();newsAndRoster();});
})();
