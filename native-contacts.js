(function(){
  const area = document.getElementById('contactPickerArea');
  const button = document.getElementById('chooseContact');
  if (!button) return;
  if (area) area.hidden = false;

  const cap = window.Capacitor;
  const isNativeAndroid = !!cap && typeof cap.getPlatform === 'function' && cap.getPlatform() === 'android';

  function getContactsPlugin() {
    if (!cap) return null;
    // Capacitor 8 plugins should be obtained through registerPlugin. The
    // official @capacitor/contacts native plugin is registered as Contacts.
    if (typeof cap.registerPlugin === 'function') {
      try { return cap.registerPlugin('Contacts'); } catch (_) {}
    }
    // Compatibility fallback for older Capacitor bridges.
    return cap.Plugins && (cap.Plugins.Contacts || cap.Plugins.CapacitorContacts);
  }

  function applyContact(c) {
    if (!c) return;
    const name = c.displayName || c.fullName ||
      [c.givenName, c.middleName, c.familyName].filter(Boolean).join(' ') ||
      c.name?.display ||
      [c.name?.givenName, c.name?.middleName, c.name?.familyName].filter(Boolean).join(' ') ||
      (Array.isArray(c.name) ? c.name[0] : '');
    const phones = c.phoneNumbers || c.phones || c.tel || [];
    const firstPhone = Array.isArray(phones) ? phones[0] : phones;
    const phone = typeof firstPhone === 'string' ? firstPhone :
      (firstPhone?.value || firstPhone?.number || '');

    const customer = document.getElementById('customer');
    const cell = document.getElementById('customerCell');
    if (customer && name) customer.value = name;
    if (cell && phone) cell.value = phone;
    customer?.dispatchEvent(new Event('input', { bubbles:true }));
    cell?.dispatchEvent(new Event('input', { bubbles:true }));
    if (typeof render === 'function') render();
  }

  async function pickNativeContact() {
    const Contacts = getContactsPlugin();
    if (!Contacts || typeof Contacts.pickContact !== 'function') {
      throw new Error('Contacts native plugin bridge unavailable');
    }

    // Request read access first. This allows the selected contact to return
    // both its display name and phone number on current Android versions.
    if (typeof Contacts.checkPermissions === 'function' && typeof Contacts.requestPermissions === 'function') {
      const status = await Contacts.checkPermissions();
      if (status && status.readContacts !== 'granted' && status.readContacts !== 'limited') {
        const granted = await Contacts.requestPermissions({ permissions:['readContacts'] });
        if (granted && granted.readContacts !== 'granted' && granted.readContacts !== 'limited') {
          throw new Error('Contacts permission denied');
        }
      }
    }

    const picked = await Contacts.pickContact({
      fields:['displayName','fullName','givenName','familyName','phoneNumbers'],
      multiple:false
    });
    const c = picked && ((picked.contacts && picked.contacts[0]) || picked.contact || picked);
    applyContact(c);
  }

  async function pickWebContact() {
    if (!navigator.contacts || typeof navigator.contacts.select !== 'function') {
      throw new Error('Contact picker is not available on this device');
    }
    const selected = await navigator.contacts.select(['name','tel'], { multiple:false });
    if (!selected || !selected.length) return;
    applyContact(selected[0]);
  }

  button.addEventListener('click', async function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    button.disabled = true;
    try {
      if (isNativeAndroid) await pickNativeContact();
      else await pickWebContact();
      if (typeof scheduleShare === 'function') scheduleShare();
    } catch (e) {
      const msg = String(e?.message || e || '');
      if (!/cancel/i.test(msg)) {
        console.error('Ontboom contact picker failed', e);
        alert(/permission denied/i.test(msg)
          ? 'Contacts permission is required. Please allow Contacts access for Ontboom.'
          : 'Could not open Contacts. Please send a screenshot of this message if it happens again.');
      }
    } finally {
      button.disabled = false;
    }
  }, { passive:false });
})();
