// TODO: Probably load from environment variable or similar
const generateNonce = () => {
  const nonceLength = 16;
  const array = new Uint8Array(nonceLength);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(nonceLength).padStart(2, "0"))
    .join("");
};

const generateHash = async (userName, nonce, secretToken) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${userName} ${nonce} ${secretToken}`);
  const hashBuffer = await window.crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hash;
};

export const createAuthenticationParams = async () => {
  // TODO: Is there a clean way not to hardcode userName
  const userName = "Frontend_1";
  let secretToken = import.meta.env.VITE_Frontend_1;
  if (!secretToken) {
    throw new Error("Secret token is missing");
  }

  const nonce = generateNonce();
  const hash = await generateHash(userName, nonce, secretToken);
  return URLSearchParams({
    User: userName,
    Nonce: nonce,
    Hash: hash,
  }).toString();
};
