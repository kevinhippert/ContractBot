const generateNonce = () => {
  const nonceLength = 16;
  const array = new Uint8Array(nonceLength);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const generateHash = async (nonce, secretToken) => {
  console.log("nonce: ", nonce);
  console.log("st: ", secretToken);
  const encoder = new TextEncoder();
  const data = encoder.encode(nonce + secretToken);
  console.log("data: ", data);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

export const createAuthenticationParams = async () => {
  let secretToken = import.meta.env.VITE_Frontend_1;
  // TODO UNHACk
  secretToken = "abc123";

  if (!secretToken) {
    throw new Error("secret token is missing");
  }

  const nonce = generateNonce();
  const hash = await generateHash(nonce, secretToken);

  const authParams = new URLSearchParams({
    User: "Frontend_1",
    Nonce: nonce,
    Hash: hash,
  }).toString();

  return authParams;
};
