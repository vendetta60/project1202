/**
 * "Məni xatırla" üçün parolu localStorage-da açıq mətn kimi saxlamaq əvəzinə
 * şifrələyirik. DevTools-da görünsə belə, parol oxuna bilməz (şifrəli mətn).
 * Açar kodu tətbiqdə sabitdir — tam təhlükə deyil, amma açıq parol yoxdur.
 */

const SALT = 'mq_remember_v1_salt';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const ITERATIONS = 100000;

async function getKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SALT),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT + 'v2'),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptPassword(plain: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plain);
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    encoded
  );
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptPassword(encryptedBase64: string): Promise<string> {
  try {
    const combined = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, IV_LENGTH);
    const cipher = combined.slice(IV_LENGTH);
    const key = await getKey();
    const dec = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      key,
      cipher
    );
    return new TextDecoder().decode(dec);
  } catch {
    return '';
  }
}
