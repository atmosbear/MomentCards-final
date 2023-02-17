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
  if (cards.filter((c) => c.front === front && c.back === back).length === 0) cards.push(card);
  let entryEl = document.createElement("div")
  let listEntry = document.getElementById("card-list")
  entryEl.classList.add("card-list-entry")
  addLabelToCardEntries(entryEl, front, back)
  if (listEntry) {
    listEntry.appendChild(entryEl)
  }
  return card;
}

/**
   * @param {HTMLElement} entryEl
   * @param {string} front 
   * @param {string} back 
   */
function addLabelToCardEntries(entryEl, front, back) {
  let fText = innerWidth > 500 ? "Front:" : "F:"
  let bText = innerWidth > 500 ? "Back:" : "B:"
  entryEl.innerText = fText + front + "\n" + bText + back
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
  if (newScreenName.includes("-screen")) newScreenName = newScreenName.replace("-screen", "");
  if (["Study", "Create", "Edit"].includes(newScreenName)) {
    CURRENT_SCREEN = newScreenName;
    const screens = Array.from(document.querySelectorAll(".screen"));
    //@ts-expect-error - this is an HTMLElement, but JSDoc doesn't seem to allow the "as" that typescript does. Check later.
    screens.forEach((/**@type {HTMLElement}*/ s) => {
      if (s.id !== newScreenName + "-screen") {
        s.style.display = "none";
      } else {
        s.style.display = "grid";
      }
    });
  } else {
    console.error("The screen '" + newScreenName + "' doesn't exist!");
  }
}
window.addEventListener("click", (e) => {
  let arrowHolderElement = document.getElementById("answer-bar-arrow-holder");
  if (e.target === document.getElementById("answer-bar")) {
    alert("Ok");
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
      answerCard(getDueCards()[0], result);
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
    rating /= 2;
  }
  const previousDueDistance = card.dueDistance;
  const newDueDistance = previousDueDistance + previousDueDistance * rating;
  card.dueDistance = newDueDistance;
  card.dueMS = Date.now() + newDueDistance;
}
/**
 * Returns all cards that are overdue.
 * @returns {Card[]}
 */
function getDueCards() {
  let dues = cards.filter((c) => {
    console.log(c.dueMS <= Date.now());
    return c.dueMS <= Date.now();
  });
  return dues;
}
function setup() {
  document.querySelectorAll(".navbar-entry").forEach((screen) => {
    screen.addEventListener("click", () => {
      changeScreenTo(screen.innerHTML);
    });
  });
  document.getElementById("flip-button")?.addEventListener("click", () => {
    flip()
  });
  let studyCardEl = document.getElementById("study-card");
  if (studyCardEl && getDueCards()[0]) studyCardEl.innerHTML = getDueCards()[0].front;
}

function flip() {
  let studyCardEl = document.getElementById("study-card");
  if (studyCardEl) {
    if (getDueCards()[0])
      if (getDueCards()[0].front === studyCardEl.innerText) studyCardEl.innerText = getDueCards()[0].back;
      else studyCardEl.innerText = getDueCards()[0].front;
  }
}
const cards = [];
makeCard("hello", "goobie");
setup();
let CURRENT_SCREEN = "Study";
changeScreenTo("Create");
console.log(cards);
console.log(Date.now());