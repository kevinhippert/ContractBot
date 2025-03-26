export const createTopicId = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = 12;
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters[randomValues[i] % charactersLength];
  }
  return result;
};
