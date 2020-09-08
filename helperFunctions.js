export const getNotMe = (obj, me) => {
  console.log("get not me", obj);
  let recipientId = Object.keys(obj).filter((p) => p !== me)[0];

  let recipient = obj[`${recipientId}`];

  return { url: recipient.photoURL, name: recipient.displayName };
};
