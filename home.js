const itlabUrl = 'https://itlab.xyzh.me';
const status = document.querySelector('#auth-status');
let clerk;
let statusTimer;

function showStatus(message, linkLabel) {
  status.replaceChildren(document.createTextNode(message));
  if (linkLabel) {
    status.append(' ');
    const link = document.createElement('a');
    link.href = itlabUrl;
    link.textContent = linkLabel;
    status.append(link);
  }
  status.classList.add('show');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => status.classList.remove('show'), 6500);
}

async function ensureClerk() {
  const key = window.XYZH_CLERK_PUBLISHABLE_KEY?.trim();
  if (!key) {
    showStatus('Inloggen is nog niet gekoppeld. Vul de Clerk publishable key in config.js in.');
    return null;
  }
  if (!key.startsWith('pk_')) {
    showStatus('De Clerk publishable key in config.js lijkt niet geldig.');
    return null;
  }
  if (clerk) return clerk;
  try {
    const { Clerk } = await import('https://esm.sh/@clerk/clerk-js@latest');
    clerk = new Clerk(key);
    await clerk.load();
    clerk.addListener(renderAuthState);
    renderAuthState();
    return clerk;
  } catch {
    showStatus('Inloggen laden lukte niet. Probeer het straks opnieuw.');
    return null;
  }
}

function renderAuthState() {
  const signedIn = Boolean(clerk?.user);
  document.querySelector('#sign-in').hidden = signedIn;
  document.querySelector('#sign-up').hidden = signedIn;
  document.querySelector('#hero-signup').hidden = signedIn;
  const userMount = document.querySelector('#user-button');
  userMount.hidden = !signedIn;
  if (signedIn && !userMount.dataset.mounted) {
    clerk.mountUserButton(userMount);
    userMount.dataset.mounted = 'true';
  }
}

async function openAuth(mode) {
  const instance = await ensureClerk();
  if (!instance) return;
  if (mode === 'sign-up') instance.openSignUp();
  else instance.openSignIn();
}

document.querySelector('#sign-in').addEventListener('click', () => openAuth('sign-in'));
document.querySelector('#sign-up').addEventListener('click', () => openAuth('sign-up'));
document.querySelector('#hero-signup').addEventListener('click', () => openAuth('sign-up'));

const menuButton = document.querySelector('#mobile-menu');
menuButton.addEventListener('click', () => {
  const open = document.querySelector('.main-nav').classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
});
document.querySelectorAll('.main-nav a').forEach(link => link.addEventListener('click', () => {
  document.querySelector('.main-nav').classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

if (window.XYZH_CLERK_PUBLISHABLE_KEY?.startsWith('pk_')) {
  ensureClerk();
}
