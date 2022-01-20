export const capitalizeWord = (word) => {
  if (!word) return;
  return word.charAt(0).toUpperCase() + word.slice(1);
};
export const formatID = (id) => {
  if (!id) return;
  let idLength = id.toString().length;
  if (idLength == 1) return "#00" + id;
  if (idLength == 2) return "#0" + id;
  if (idLength >= 3) return "#" + id;
};
