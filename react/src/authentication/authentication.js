// TODO: Probably load from environment variable or similar
const userName = "Frontend_1";

const generateNonce = () => {
  const nonceLength = 8;
  const array = new Uint8Array(nonceLength);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const generateHash = async (userName, nonce, secretToken) => {
  const dataString = `${userName} ${nonce} ${secretToken}`;
  const data = new TextEncoder().encode(dataString);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexDigest = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hexDigest;
};

export const createAuthenticationParams = async () => {
  let secret = import.meta.env[`VITE_${userName}`];
  if (!secret) {
    throw new Error("Secret token/password is missing");
  }
  const nonce = generateNonce();
  const hash = await generateHash(userName, nonce, secret);
  return new URLSearchParams({
    User: userName,
    Nonce: nonce,
    Hash: hash,
  }).toString();
};

export const createAuthenicateUserParams = async (user, password) => {
  const nonce = generateNonce();
  const hash = await generateHash(user, nonce, password);
  return new URLSearchParams({
    User: user,
    Nonce: nonce,
    Hash: hash,
  }).toString();
};
