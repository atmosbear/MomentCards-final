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
  const creationDueDistance = 5000;
  let card = {
    front,
    back,
    id,
    dueDistance: creationDueDistance,
    dueMS: creationDueDistance + creationMS,
  };
  if (cards.find((c) => c.front === front && c.back === back) === undefined) cards.push(card);
  let entryEl = document.createElement("div");
  let listEntry = document.getElementById("card-list");
  entryEl.classList.add("card-list-entry");
  addLabelToCardEntries(entryEl, card);
  if (listEntry) {
    listEntry.appendChild(entryEl);
  }
  return card;
}

/**
 * @param {HTMLElement} entryEl
 * @param {Card} card
 */
function addLabelToCardEntries(entryEl, card) {
  if (entryEls.filter((EE) => EE.card.id === card.id).length === 0) entryEls.push({ card, entryEl });
  let fText = innerWidth > 500 ? "Front: " : "F: ";
  let bText = innerWidth > 500 ? "Back: " : "B: ";
  let dInText = innerWidth > 500 ? "Due in: " : "D: ";
  let dAtText = innerWidth > 500 ? "Due at: " : "D: ";
  entryEl.innerText =
    fText + card.front + "\n" + bText + card.back + "\n" + dInText + msDueDateToRoundedTime(card.dueMS);
  // "\n" +
  // dAtText +
  // "Parsing dates TBA";
}
/** @type {{card: Card, entryEl: HTMLElement}[]} */
let entryEls = [];
let waitingOn = 0;
entryEls.forEach((ec) => {
  ec.entryEl.onclick = () => {};
});
let soundWhenCardBecomesDue = true;
let soundWhenReminding = true;
setInterval(() => {
  refreshStudyCard();
  if (waitingOn < getDueCards().length) {
    waitingOn++;
    if (soundWhenCardBecomesDue) {
      let a = new Audio("./sounds/E5.mp3");
      a.volume = 0.4;
      a.play();
    }
    new Notification("A new card is due.");
  } else {
    if (getDueCards().length > 0) {
      let goalReminderDate = lastReminderDate + remindMeAfterXSeconds * 1000;
      if (reminderNotifsOn && Date.now() > goalReminderDate) {
        if (soundWhenCardBecomesDue) {
          let a = new Audio("./sounds/Gs3.mp3");
          a.volume = 0.4;
          a.play();
        }
        new Notification(
          getDueCards().length === 1
            ? "Remember: you have 1 due card!"
            : `Remember: you have ${getDueCards().length} due cards!`
        );
        lastReminderDate = Date.now();
      } else {
        console.log(goalReminderDate, Date.now());
      }
    }
  }
  entryEls.forEach((ec) => {
    addLabelToCardEntries(ec.entryEl, ec.card);
  });
}, 1000);

/**
 *
 * @param {number} ms
 * @returns {string} as friendly date
 */
function msDueDateToRoundedTime(ms) {
  let msUntil = ms - Date.now();
  let sUntil = msUntil / 1000;
  let minUntil = sUntil / 60;
  let hoursUntil = minUntil / 60;
  let daysUntil = hoursUntil / 24;
  let yearsUntil = daysUntil / 365.25;
  let willUse = msUntil;
  let unit = "TBD";
  let untils = [msUntil, sUntil, minUntil, hoursUntil, daysUntil, yearsUntil];
  /** @type {number | undefined} */
  let firstOneGreaterThan1;
  let found = false;
  untils.forEach((until, i) => {
    if (!found) {
      if (Math.abs(until) >= 0 && Math.abs(until) < 1) {
        unit = ["ms", "s", "min", "h", "d", "yr"][i - 1];
        firstOneGreaterThan1 = untils[i - 1];
        found = true;
      }
    }
  });
  /** @type {string} */
  let friendlyDate = "";
  if (firstOneGreaterThan1 === undefined) {
    if (Math.abs(yearsUntil) >= 1) {
      friendlyDate = `> ${Math.sign(yearsUntil) * Math.floor(Math.abs(yearsUntil))} year`;
    } else friendlyDate = NaN.toString() + " something went wrong...";
  } else {
    if (unit === "s" || unit === "ms") {
      friendlyDate = Math.floor(firstOneGreaterThan1) + unit;
    } else {
      let GT1 = firstOneGreaterThan1.toString().split(".");
      if (GT1.length > 1 && GT1[1] !== "00") friendlyDate = GT1[0] + "." + GT1[1].slice(0, 1) + unit;
      else friendlyDate = GT1[0] + unit;
    }
  }
  return friendlyDate;
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
  if (["Study", "Create", "Settings"].includes(newScreenName)) {
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
function setupStudyBarClickEvent() {
  window.addEventListener("click", (e) => {
    let arrowHolderElement = document.getElementById("answer-bar-arrow-holder");
    if (e.target === document.getElementById("answer-bar")) {
      let AB = document.getElementById("answer-bar");
      // @ts-ignore
      if (AB && arrowHolderElement) {
        alert("Ok");
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
}

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
    // console.log(c.dueMS <= Date.now());
    return c.dueMS <= Date.now();
  });
  return dues;
}
function setup() {
  setupStudyBarClickEvent();
  function setupCardCreationButton() {
    let cb = document.getElementById("creation-card-button");
    if (cb) {
      cb.onclick = () => {
        let fCardEl = /** @type {HTMLTextAreaElement} */ (document.getElementById("create-card-front"));
        let bCardEl = /** @type {HTMLTextAreaElement} */ (document.getElementById("create-card-back"));
        if (fCardEl && bCardEl) {
          makeCard(fCardEl.value, bCardEl.value);
        }
      };
    }
  }
  let fCardEl = /** @type {HTMLTextAreaElement} */ (document.getElementById("create-card-front"));
  let bCardEl = /** @type {HTMLTextAreaElement} */ (document.getElementById("create-card-back"));
  function setupNavbarScreenChanges() {
    document.querySelectorAll(".navbar-entry").forEach((screen) => {
      screen.addEventListener("click", () => {
        changeScreenTo(screen.innerHTML);
      });
    });
  }
  setupCardCreationButton();
  setupNavbarScreenChanges();

  document.getElementById("flip-button")?.addEventListener("click", () => {
    flip();
  });
}

function refreshStudyCard() {
  let studyCardEl = document.getElementById("study-card");
  if (studyCardEl && getDueCards()[0]) studyCardEl.innerHTML = getDueCards()[0].front;
  else if (studyCardEl && getDueCards().length === 0) {
    studyCardEl.innerHTML = "There are no cards to study.";
  }
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
let lastReminderDate = 0;
let reminderNotifsOn = true;
let becomesDueNotifsOn = true;
let remindMeAfterXSeconds = 25;
Notification.requestPermission();
setup();
let CURRENT_SCREEN = "Study";
changeScreenTo("Create");
