(function(){
  const area = document.getElementById('contactPickerArea');
  const button = document.getElementById('chooseContact');
  if (!button) return;

  const isAndroid = !!window.Capacitor && Capacitor.getPlatform && Capacitor.getPlatform() === 'android';
  if (area) area.hidden = false;

  async function pickNativeContact() {
    const Contacts = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Contacts;
    if (!Contacts || typeof Contacts.pickContact !== 'function') {
      throw new Error('Native Contacts plugin is not available in this build.');
    }

    const picked = await Contacts.pickContact();
    const c = picked && (picked.contact || (picked.contacts && picked.contacts[0]) || picked);
    if (!c) return;

    const name = c.displayName || c.name?.display || [c.name?.givenName, c.name?.middleName, c.name?.familyName].filter(Boolean).join(' ') || (Array.isArray(c.name) ? c.name[0] : '');
    const phones = c.phoneNumbers || c.phones || c.tel || [];
    const firstPhone = Array.isArray(phones) ? phones[0] : phones;
    const phone = typeof firstPhone === 'string' ? firstPhone : (firstPhone?.number || firstPhone?.value || '');

    if (name) document.getElementById('customer').value = name;
    if (phone) document.getElementById('customerCell').value = phone;
    if (typeof render === 'function') render();
  }

  async function pickWebContact() {
    if (!navigator.contacts || typeof navigator.contacts.select !== 'function') {
      throw new Error('Contact picker is not available on this device.');
    }
    const selected = await navigator.contacts.select(['name','tel'], { multiple:false });
    if (!selected || !selected.length) return;
    const c = selected[0];
    if (c.name && c.name[0]) document.getElementById('customer').value = c.name[0];
    if (c.tel && c.tel[0]) document.getElementById('customerCell').value = c.tel[0];
    if (typeof render === 'function') render();
  }

  button.onclick = async function(ev) {
    ev.preventDefault();
    try {
      if (isAndroid) await pickNativeContact();
      else await pickWebContact();
      if (typeof scheduleShare === 'function') scheduleShare();
    } catch (e) {
      const msg = String(e?.message || e || '');
      if (/cancel/i.test(msg)) return;
      console.error('Ontboom contact picker failed', e);
      alert('Could not open your Contacts. Please install the latest Ontboom app build and try again.');
    }
  };
})();
