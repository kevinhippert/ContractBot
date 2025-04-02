// TODO: Probably load from environment variable or similar
const user = "Frontend_1";

const generateNonce = () => {
  const nonceLength = 16;
  const array = new Uint8Array(nonceLength);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(nonceLength).padStart(2, "0"))
    .join("");
};

const generateHash = async (user, nonce, secret) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${user} ${nonce} ${secret}`);
  const hashBuffer = await window.crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hash;
};

export const createAuthenticationParams = async () => {
  // TODO: Is there a clean way not to hardcode user
  let secret = import.meta.env.VITE_Frontend_1;
  if (!secret) {
    throw new Error("secret token is missing");
  }
  const nonce = generateNonce();
  const hash = await generateHash(user, nonce, secret);
  return URLSearchParams({
    User: user,
    Nonce: nonce,
    Hash: hash,
  }).toString();
};
