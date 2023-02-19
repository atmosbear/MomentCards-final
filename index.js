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
  if (
    // c.front === front && c.back === back
    cards.find(
      (c) =>
      { return c.id }
    ) === undefined
  ) {
    cards.push(card);
    // entry
    addNewEntryToCardList(card);
    saveCardsToLS();
  }
  return card;
}

/**
 * Places the card in the list so the user can see it.
 * @param {Card} card
 * @returns {HTMLDivElement}
 */
function addNewEntryToCardList(card) {
  let cardListEl = document.getElementById("card-list");
  let entryHolderEl = document.createElement("div");
  if (cardListEl) {
    // card info
    let entryTextEl = document.createElement("div");
    entryHolderEl.classList.add("entry-holder-el");
    entryTextEl.classList.add("card-list-entry");
    // buttons
    let buttonHolderEl = document.createElement("div");
    let delButton = document.createElement("div");
    let editButton = document.createElement("div");
    buttonHolderEl.classList.add("button-holder");
    delButton.classList.add("delete-edit-button");
    editButton.classList.add("delete-edit-button");
    delButton.innerText = "Delete";
    editButton.innerText = "Edit";
    // add them
    addLabelToCardEntries(entryTextEl, card);
    entryHolderEl.appendChild(entryTextEl);
    buttonHolderEl.appendChild(delButton);
    buttonHolderEl.appendChild(editButton);
    entryHolderEl.appendChild(buttonHolderEl);
    cardListEl.appendChild(entryHolderEl);
  }
  return entryHolderEl;
}

/**
 * Updates the card's label with its current information.
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
}

/**
 * Converts milliseconds to a more human-readable date, such as a rounded number so that there are no decimals unless larger than minutes.
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
 * Displays just the requested screen, and hides every other screen.
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
/**
 * Makes the answer bar within the study screen clickable so that the user can answer cards. Also, makes the
 */
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
 * Schedules the card some time into the future, proportional to the user's rating.
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
/**
 * Sets up the app - mostly click events.
 */
function setup() {
  function setupSettingsScreen() {
    let v = /** @type {HTMLInputElement} */ (document.getElementById("volume"));
    let s = document.getElementById("default-due-seconds");
    if (v) {
      v.value = SETTINGS.volume.toString();
      v.onclick = (e) => {
        if (e && e.target) {
          // @ts-ignore - it does exist
          SETTINGS.volume = /** @type {Number} */ (e.target.value);
          playNote("As2")
        }
      };
    }
    if (s) {
      s.onchange;
    }
  }
  function setupCardCreationButton() {
    let cb = document.getElementById("creation-card-button");
    if (cb) {
      cb.onclick = () => {
        if (fCardEl && bCardEl) {
          makeCard(fCardEl.value, bCardEl.value);
        }
      };
    }
  }
  function setupNavbarScreenChanges() {
    document.querySelectorAll(".navbar-entry").forEach((screen) => {
      screen.addEventListener("click", () => {
        changeScreenTo(screen.innerHTML);
      });
    });
  }
  let fCardEl = /** @type {HTMLTextAreaElement} */ (document.getElementById("create-card-front"));
  let bCardEl = /** @type {HTMLTextAreaElement} */ (document.getElementById("create-card-back"));
  setupSettingsScreen();
  setupStudyBarClickEvent();
  setupCardCreationButton();
  setupNavbarScreenChanges();

  document.getElementById("flip-button")?.addEventListener("click", () => {
    flip();
  });
}

/**
 * Refreshes the study card to ensure it is up to date.
 */
function refreshStudyCard() {
  let studyCardEl = document.getElementById("study-card");
  if (studyCardEl && getDueCards()[0]) studyCardEl.innerHTML = getDueCards()[0].front;
  else if (studyCardEl && getDueCards().length === 0) {
    studyCardEl.innerHTML = "There are no cards to study.";
  }
}
/**
 * Flips the study card so that the other side is showing.
 */
function flip() {
  let studyCardEl = document.getElementById("study-card");
  if (studyCardEl) {
    if (getDueCards()[0])
      if (getDueCards()[0].front === studyCardEl.innerText) studyCardEl.innerText = getDueCards()[0].back;
      else studyCardEl.innerText = getDueCards()[0].front;
  }
}

/**
 * Adds any cards within local storage to the global cards array, if they weren't there already.
 */
function loadCardsFromLS() {
  /**@type {string | null} */
  let cardsJSON = localStorage.getItem("cards");
  if (cardsJSON) {
    /** @type {Card[]} */
    let cardsInLocalStorage = JSON.parse(cardsJSON);
    let currentIDsInDeck = cards.flatMap((c) => c.id);
    let cardsNotInGlobalButInSaved = cardsInLocalStorage.filter((c) => {
      return !currentIDsInDeck.includes(c.id);
    });
    cards.push(...cardsNotInGlobalButInSaved);
    cardsNotInGlobalButInSaved.forEach((card) => {
      addLabelToCardEntries(addNewEntryToCardList(card), card);
      console.log(card);
    });
  }
}
/**
 * Replaces the saved array with the current cards in the global cards array.
 */
function saveCardsToLS() {
  localStorage.setItem("cards", JSON.stringify(cards));
}
/**
 * Testing the bring-to-front functionality; doesn't work yet, will replace it with a working version later.
 */
function bringToFront() {
  // setTimeout(() => {
  //   window.open("meow.com", "meow.com")
  //   window.blur()
  //   window.focus();
  //   console.log("ok")
  // }, 2000);
}





let runningDueCardsList = 0;
let CURRENT_SCREEN = "Study";
/** @type {{card: Card, entryEl: HTMLElement}[]} */
const entryEls = [];
/** @type {Card[]} */
const cards = [];
let lastReminderDate = 0;
const SETTINGS = {
  playSoundWhenCardBecomesDue: true,
  playSoundWhenReminding: true,
  reminderInterval: 25,
  notifyWhenDue: true,
  remindersOn: true,
  volume: 0.25,
}
function checkIfNewCardsAreDue() {
  return runningDueCardsList < getDueCards().length
}
/**
 * Plays the note within the ./sounds directory.
 * @param {string} fileNameBeforeDot 
 */
function playNote(fileNameBeforeDot) {
  let a = new Audio(`./sounds/${fileNameBeforeDot}.mp3`)
  a.volume = SETTINGS.volume
  a.play()
}
setInterval(() => {
  refreshStudyCard();
  checkIfNewCardsAreDue()
  if (checkIfNewCardsAreDue()) {
    runningDueCardsList++;
    if (SETTINGS.playSoundWhenCardBecomesDue) {
      playNote("E5")
    }
    new Notification("A new card is due.");
  } else {
    if (getDueCards().length > 0) {
      let goalReminderDate = lastReminderDate + SETTINGS.reminderInterval * 1000;
      if (SETTINGS.remindersOn && Date.now() > goalReminderDate) {
        new Notification(
          getDueCards().length === 1
            ? "Remember: you have 1 due card!"
            : `Remember: you have ${getDueCards().length} due cards!`
        );
        if (SETTINGS.playSoundWhenCardBecomesDue) {
          playNote("Gs3")
        }
        lastReminderDate = Date.now();
      }
    }
  }
  entryEls.forEach((ec) => {
    addLabelToCardEntries(ec.entryEl, ec.card);
  });
}, 1000);
Notification.requestPermission();
setup();
loadCardsFromLS();
changeScreenTo("Create");