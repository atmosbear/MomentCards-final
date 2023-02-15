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
  return randoms;
}

let CURRENT_SCREEN = "Study";
function changeScreenTo(newScreenName) {
  if (["Study", "Create", "Edit"].includes(newScreenName)) {
    CURRENT_SCREEN = newScreenName;
    const screens = Array.from(document.querySelectorAll(".screen"));
    //@ts-expect-error - this is an HTMLElement, but JSDoc doesn't seem to allow the "as" that typescript does. Check later.
    screens.forEach((/**@type {HTMLElement}*/ s) => {
      if (s.id !== newScreenName + "-screen") {
        s.style.display = "none";
      }
    });
  } else {
    console.error("The screen '" + newScreenName + "' doesn't exist!");
  }
}
changeScreenTo("Study");
console.log(Card("fronti", "backi"));
