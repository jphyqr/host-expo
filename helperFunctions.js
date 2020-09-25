export const getNotMe = (obj, me) => {
  console.log("get not me", obj);
  let recipientId = Object.keys(obj).filter((p) => p !== me)[0];

  let recipient = obj[`${recipientId}`];

  return { url: recipient.photoURL, name: recipient.displayName };
};

export const renderPlayersStack = (borrowed = [], bought = []) => {
  let total = 0;

  for (const b of borrowed) {
    total = parseInt(total) + parseInt(b.amount);
  }
  for (const t of bought) {
    total = parseInt(total) + parseInt(t.amount);
  }

  return total;
};
