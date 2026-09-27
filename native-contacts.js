(function(){
  const area = document.getElementById('contactPickerArea');
  const button = document.getElementById('chooseContact');
  if (!button) return;
  if (area) area.hidden = false;

  const cap = window.Capacitor;
  const isNativeAndroid = !!cap && typeof cap.getPlatform === 'function' && cap.getPlatform() === 'android';

  function getContactsPlugin() {
    if (!cap) return null;
    if (typeof cap.registerPlugin === 'function') {
      try { return cap.registerPlugin('Contacts'); } catch (_) {}
    }
    return cap.Plugins && cap.Plugins.Contacts;
  }

  function contactName(c) {
    return c?.displayName || c?.fullName || c?.name?.formatted ||
      [c?.name?.givenName, c?.name?.middleName, c?.name?.familyName].filter(Boolean).join(' ') ||
      [c?.givenName, c?.middleName, c?.familyName].filter(Boolean).join(' ') || 'Unnamed contact';
  }

  function contactPhone(c) {
    const phones = c?.phoneNumbers || c?.phones || c?.tel || [];
    const first = Array.isArray(phones) ? phones[0] : phones;
    return typeof first === 'string' ? first : (first?.value || first?.number || '');
  }

  function applyContact(c) {
    if (!c) return;
    const name = contactName(c);
    const phone = contactPhone(c);
    const customer = document.getElementById('customer');
    const cell = document.getElementById('customerCell');
    if (customer && name && name !== 'Unnamed contact') customer.value = name;
    if (cell && phone) cell.value = phone;
    customer?.dispatchEvent(new Event('input', { bubbles:true }));
    cell?.dispatchEvent(new Event('input', { bubbles:true }));
    if (typeof render === 'function') render();
    if (typeof scheduleShare === 'function') scheduleShare();
  }

  function closeChooser() {
    document.getElementById('ontboomContactChooser')?.remove();
  }

  function showChooser(contacts) {
    closeChooser();
    const overlay = document.createElement('div');
    overlay.id = 'ontboomContactChooser';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;';

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#fff;width:100%;max-width:720px;height:82vh;border-radius:22px 22px 0 0;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 -8px 30px rgba(0,0,0,.2);';
    panel.innerHTML = '<div style="padding:18px 18px 10px;display:flex;align-items:center;justify-content:space-between;gap:12px"><strong style="font-size:22px">Choose from Contacts</strong><button type="button" id="ontboomCloseContacts" style="border:0;background:#eee;border-radius:50%;width:42px;height:42px;font-size:24px">×</button></div><div style="padding:0 18px 12px"><input id="ontboomContactSearch" type="search" placeholder="Search name or number" style="width:100%;box-sizing:border-box;padding:14px 16px;border:1px solid #bbb;border-radius:12px;font-size:18px"></div><div id="ontboomContactList" style="overflow:auto;flex:1;border-top:1px solid #eee"></div>';
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const list = panel.querySelector('#ontboomContactList');
    const search = panel.querySelector('#ontboomContactSearch');
    const sorted = contacts.slice().sort((a,b) => contactName(a).localeCompare(contactName(b)));

    function draw(filter) {
      const q = String(filter || '').trim().toLowerCase();
      list.innerHTML = '';
      const matches = sorted.filter(c => {
        const n = contactName(c).toLowerCase();
        const p = contactPhone(c).toLowerCase();
        return !q || n.includes(q) || p.includes(q);
      });
      if (!matches.length) {
        list.innerHTML = '<div style="padding:24px;text-align:center;color:#666">No contacts found</div>';
        return;
      }
      matches.forEach(c => {
        const row = document.createElement('button');
        row.type = 'button';
        row.style.cssText = 'display:block;width:100%;text-align:left;padding:14px 18px;border:0;border-bottom:1px solid #eee;background:#fff;';
        const name = document.createElement('div');
        name.textContent = contactName(c);
        name.style.cssText = 'font-size:18px;font-weight:700;color:#111;';
        const phone = document.createElement('div');
        phone.textContent = contactPhone(c) || 'No phone number';
        phone.style.cssText = 'font-size:15px;color:#666;margin-top:3px;';
        row.append(name, phone);
        row.addEventListener('click', function(){ applyContact(c); closeChooser(); });
        list.appendChild(row);
      });
    }

    panel.querySelector('#ontboomCloseContacts').addEventListener('click', closeChooser);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeChooser(); });
    search.addEventListener('input', () => draw(search.value));
    draw('');
    setTimeout(() => search.focus(), 100);
  }

  async function chooseNativeContact() {
    const Contacts = getContactsPlugin();
    if (!Contacts) throw new Error('Contacts native plugin bridge unavailable');

    // Use find() instead of repeatedly launching Android's native picker.
    // The official plugin requests READ_CONTACTS itself and this path remains
    // reliable after permission has already been granted.
    if (typeof Contacts.find === 'function') {
      const result = await Contacts.find({
        fields: ['*'],
        filter: '',
        multiple: true,
        hasPhoneNumber: true,
        desiredFields: ['displayName','name','phoneNumbers']
      });
      const contacts = Array.isArray(result?.contacts) ? result.contacts : [];
      showChooser(contacts);
      return;
    }

    // Fallback for an older bridge.
    if (typeof Contacts.pickContact === 'function') {
      const picked = await Contacts.pickContact();
      applyContact(picked);
      return;
    }
    throw new Error('Contacts plugin methods unavailable');
  }

  async function chooseWebContact() {
    if (!navigator.contacts || typeof navigator.contacts.select !== 'function') {
      throw new Error('Contact picker is not available on this device');
    }
    const selected = await navigator.contacts.select(['name','tel'], { multiple:false });
    if (selected?.length) applyContact(selected[0]);
  }

  button.addEventListener('click', async function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    button.classList.add('is-pressed');
    const originalText = button.textContent;
    button.textContent = 'Opening Contacts…';
    try {
      if (isNativeAndroid) await chooseNativeContact();
      else await chooseWebContact();
    } catch (e) {
      const msg = String(e?.message || e || '');
      const code = String(e?.code || '');
      console.error('Ontboom contacts failed', e);
      if (code === 'OS-PLUG-CONT-0020' || /permission denied/i.test(msg)) {
        alert('Contacts permission is required. Please allow Contacts access for Ontboom.');
      } else if (!/cancel/i.test(msg) && code !== 'OS-PLUG-CONT-0006') {
        alert('Could not open Contacts. Please take a screenshot of this message.');
      }
    } finally {
      button.textContent = originalText;
      button.classList.remove('is-pressed');
    }
  }, { passive:false });
})();
