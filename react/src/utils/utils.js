export const createTopicId = () => {
  // Using 36 value alphabet for token generation
  // Collision expected every ~2B topics for 12 char token;
  // Let's use 16 char for collision ever ~2T
  const tokenSize = 16;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint8Array(tokenSize);
  window.crypto.getRandomValues(randomValues);

  let result = "";
  for (const c of randomValues) {
    result += characters[c % characters.length];
  }
  return result;
};

export const getTopicDisplayName = (id, name) => {
  if (name.includes(".....")) {
    name = name.split(".....")[1];
  }
  return name
    ? name.length > 100
      ? name.slice(0, 100) + "..."
      : name
    : `New Topic - ${id.slice(0, 3)}`;
};
