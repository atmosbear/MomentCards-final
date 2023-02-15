//@ts-check
/**
 *
 * @param {string} front
 * @param {string} back
 * @returns {{front: string, back: string, id: string}}
 */
function Card(front, back) {
  let number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let id = [Date.now(), front, back, getRandom(number, 3).join("")].join("_");
  return {
    front,
    back,
    id,
  };
}
/**
 * Returns random N entries from a given array.
 * @param {any[]} array
 * @returns {any[] | any}
 */
function getRandom(array, n = 1) {
  let randoms = [];
  for (let i = 0; i < n; i++) {
    randoms.push(array[Math.floor(Math.random() * array.length)]);
  }
  return randoms
}

console.log(Card("fronti", "backi"))