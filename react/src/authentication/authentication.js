const generateNonce = () => {
  const nonceLength = 16;
  const array = new Uint8Array(nonceLength);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const generateHash = async (nonce, secretToken) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(nonce + secretToken);

  let hash;
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    console.log("I'm running in a browser environment!");
    // Browser environment
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    // Node.js environment
    console.log("I'm running on node");
    const crypto = await import("crypto");
    const { Buffer } = await import("buffer");
    hash = crypto.createHash("sha256").update(Buffer.from(data)).digest("hex");
  }
  console.log("hash: ", hash);
  return hash;
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
