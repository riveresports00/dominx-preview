(() => {
  const config = window.DOMINX_CMS_CONFIG || {};
  const configured = config.supabaseUrl && !config.supabaseUrl.includes('YOUR-PROJECT') && config.supabaseAnonKey && !config.supabaseAnonKey.includes('YOUR-SUPABASE');
  const db = configured ? window.DOMINX_SUPABASE_CLIENT : null;
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const section = document.createElement('section');
  section.className = 'admin-management';
  section.innerHTML = `
    <div class="admin-extra-heading"><p class="eyebrow">MANAGEMENT CMS</p><h2>MANAGEMENT TEAM</h2><p>Add and edit team profiles shown on the public Management page. Role is free text.</p></div>
    <div class="admin-management-grid">
      <form id="management-form" class="admin-form">
        <h2 id="management-form-heading">ADD MEMBER</h2><input type="hidden" id="management-id">
        <label>Full name<input id="management-name" maxlength="80" required></label>
        <label>Role<input id="management-role" maxlength="80" required placeholder="Owner, Head Admin, Manager... (write anything)"></label>
        <label>Profile photo (image, max 5 MB)<input id="management-photo-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label>
        
        <label>Instagram URL (optional)<input id="management-instagram" type="url" placeholder="https://instagram.com/username"></label>
        <label>Email (optional)<input id="management-email" type="email" maxlength="160" placeholder="member@example.com"></label>
        <label>Display order<input id="management-order" type="number" value="0" step="1"></label>
        <label class="check-label"><input type="checkbox" id="management-published" checked> Visible on public page</label>
        <div class="admin-actions"><button class="admin-btn primary" type="submit">SAVE MEMBER</button><button class="admin-btn secondary" type="button" id="management-reset">CLEAR</button></div>
        <p class="admin-alert" id="management-message" role="status"></p>
      </form>
      <section class="admin-list"><h2>EXISTING MEMBERS</h2><div id="management-list"><p class="admin-muted">Configure Supabase to load profiles.</p></div></section>
    </div>`;
  dashboard.appendChild(section);
  const $ = id => document.getElementById(id);
  const note = text => { $('management-message').textContent = text; };
  let members = [];
  const bucket = 'management-photos';
  function resetForm(){ $('management-form').reset(); $('management-id').value=''; $('management-order').value='0'; $('management-published').checked=true; $('management-photo-file').dataset.existingPhoto=''; $('management-form-heading').textContent='ADD MEMBER'; }
  function render(){
    const list=$('management-list');
    if(!members.length){list.innerHTML='<p class="admin-muted">No management profiles added yet.</p>';return;}
    list.innerHTML=members.map(m=>`<article class="admin-event-item management-admin-item"><div class="management-admin-photo">${m.photo_url?`<img src="${esc(m.photo_url)}" alt="">`:''}</div><small>${m.published?'VISIBLE':'HIDDEN'} · ORDER ${esc(m.sort_order??0)}</small><h3>${esc(m.name)}</h3><p>${esc(m.role)}</p><p>${m.instagram_url?`Instagram: <a href="${esc(m.instagram_url)}" target="_blank" rel="noopener noreferrer">Open ↗</a>`:''}${m.email?`<br>Email: ${esc(m.email)}`:''}</p><div class="admin-item-actions"><button class="admin-btn secondary" data-management-edit="${esc(m.id)}">EDIT</button><button class="admin-btn secondary" data-management-toggle="${esc(m.id)}">${m.published?'HIDE':'SHOW'}</button><button class="admin-btn secondary" data-management-delete="${esc(m.id)}">DELETE</button></div></article>`).join('');
    list.querySelectorAll('[data-management-edit]').forEach(button=>button.onclick=()=>{const m=members.find(x=>String(x.id)===button.dataset.managementEdit);if(!m)return;$('management-id').value=m.id;$('management-name').value=m.name||'';$('management-role').value=m.role||'';$('management-photo-file').value='';$('management-photo-file').dataset.existingPhoto=m.photo_url||'';$('management-instagram').value=m.instagram_url||'';$('management-email').value=m.email||'';$('management-order').value=m.sort_order??0;$('management-published').checked=!!m.published;$('management-form-heading').textContent='EDIT MEMBER';$('management-form').scrollIntoView({behavior:'smooth'});});
    list.querySelectorAll('[data-management-toggle]').forEach(button=>button.onclick=async()=>{const m=members.find(x=>String(x.id)===button.dataset.managementToggle);if(!m)return;const {error}=await db.from('management_members').update({published:!m.published}).eq('id',m.id);note(error?error.message:(m.published?'Member hidden.':'Member published.'));if(!error)load();});
    list.querySelectorAll('[data-management-delete]').forEach(button=>button.onclick=async()=>{const m=members.find(x=>String(x.id)===button.dataset.managementDelete);if(!m||!confirm(`Delete ${m.name}?`))return;const {error}=await db.from('management_members').delete().eq('id',m.id);note(error?error.message:'Member deleted.');if(!error)load();});
  }
  async function load(){if(!db){$('management-list').innerHTML='<p class="admin-muted">Supabase is not configured. Configure it before managing profiles.</p>';return;}const {data,error}=await db.from('management_members').select('*').order('sort_order',{ascending:true}).order('created_at',{ascending:true});if(error){$('management-list').innerHTML=`<p class="admin-muted">${esc(error.message)}</p>`;return;}members=data||[];render();}
  $('management-reset').onclick=resetForm;
  $('management-form').onsubmit=async event=>{
    event.preventDefault();if(!db){note('Supabase is not configured.');return;}
    const name=$('management-name').value.trim(),role=$('management-role').value.trim(),instagram=$('management-instagram').value.trim(),email=$('management-email').value.trim(),photoInput=$('management-photo-file'),file=photoInput.files&&photoInput.files[0];
    if(!name||!role){note('Name and role are required.');return;}
    if(instagram&&!/^https:\/\/(www\.)?instagram\.com\//i.test(instagram)){note('Instagram link must be an Instagram HTTPS URL.');return;}
    if(file&&(!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)||file.size>5242880)){note('Photo must be JPG, PNG, WEBP or GIF, and no larger than 5 MB.');return;}
    let photo=$('management-photo-file').dataset.existingPhoto||null;
    if(file){note('Uploading photo...');const ext=file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';const path=`${crypto.randomUUID()}.${ext}`;const {error:uploadError}=await db.storage.from(bucket).upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});if(uploadError){note(`Photo upload failed: ${uploadError.message}`);return;}photo=db.storage.from(bucket).getPublicUrl(path).data.publicUrl;}
    const payload={name,role,photo_url:photo||null,instagram_url:instagram||null,email:email||null,sort_order:Number($('management-order').value)||0,published:$('management-published').checked};const id=$('management-id').value;const query=id?db.from('management_members').update(payload).eq('id',id):db.from('management_members').insert(payload);const {error}=await query;if(error){note(error.message);return;}note(id?'Member updated.':'Member added.');resetForm();load();
  };
  if(db){db.auth.onAuthStateChange((_event,session)=>{if(session)load();});if(!dashboard.hidden)load();}
})();
