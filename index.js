//@ts-check

/**
 * @typedef {Object} Card
 * @property {string} front
 * @property {string} back
 * @property {string} id
 * @property {number} dueDistance
 * @property {number} dueMS
 */

/**
 *
 * @param {string} front
 * @param {string} back
 * @returns {Card}
 */
function makeCard(front, back) {
  const number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const creationMS = Date.now();
  const id = [creationMS, front, back, getRandom(number, 3).join("")].join("_");
  const creationDueDistance = 300;
  let card = {
    front,
    back,
    id,
    dueDistance: creationDueDistance,
    dueMS: creationDueDistance + creationMS,
  };
  if (cards.filter(c => c.front === front && c.back === back).length === 0)
  cards.push(card)
  return card
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

/**
 *
 * @param {string} newScreenName
 */
function changeScreenTo(newScreenName) {
  if (newScreenName.includes("-screen")) newScreenName = newScreenName.replace("-screen", "")
  if (["Study", "Create", "Edit"].includes(newScreenName)) {
    CURRENT_SCREEN = newScreenName;
    const screens = Array.from(document.querySelectorAll(".screen"));
    //@ts-expect-error - this is an HTMLElement, but JSDoc doesn't seem to allow the "as" that typescript does. Check later.
    screens.forEach((/**@type {HTMLElement}*/ s) => {
      if (s.id !== newScreenName + "-screen") {
        s.style.display = "none";
      } else {
        s.style.display = "block"
      }
    });
  } else {
    console.error("The screen '" + newScreenName + "' doesn't exist!");
  }
}
window.addEventListener("click", (e) => {
  let arrowHolderElement = document.getElementById("answer-bar-arrow-holder");
  if (e.target === document.getElementById("answer-bar")) {
    alert("Ok")
    let AB = document.getElementById("answer-bar");
    // @ts-ignore
    if (AB && arrowHolderElement) {
      arrowHolderElement.style.translate = `${e.clientX - 0.5 * innerWidth}px`;
      let current = e.clientX - 0.5 * innerWidth;
      let minMax = AB.clientWidth;
      let result = (current / minMax) * 2;
      if (e.clientX > innerWidth / 2) {
        result = Math.abs(result);
      } else {
        result = -Math.abs(result);
      }
      answerCard(CURRENT_CARD, result);
    }
  }
});

/**
 *
 * @param {Card} card
 * @param {number} rating
 */
function answerCard(card, rating) {
  if (rating < -0.2) {
    rating /= 2
  }
  const previousDueDistance = card.dueDistance;
  const newDueDistance = previousDueDistance + previousDueDistance * rating;
  card.dueDistance = newDueDistance;
  card.dueMS = Date.now() + newDueDistance;
}
const cards = []
let CURRENT_SCREEN = "Study";
let CURRENT_CARD = makeCard("testing front", "testing back");
changeScreenTo("Study");
function getDueCards() {
  return cards.map(c => c.dueMS < Date.now())
}
console.log(cards)

document.querySelectorAll(".navbar-entry").forEach(screen => {
  console.log(screen)
  screen.addEventListener("click", () => {
    changeScreenTo(screen.innerHTML)
  })
})