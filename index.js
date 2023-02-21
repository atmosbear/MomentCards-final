//@ts-check

/**
 * @typedef Settings
 * @property {boolean} playSoundWhenCardBecomesDue
 * @property {boolean} playSoundWhenReminding
 * @property {number} defaultDueDistanceMS
 * @property {number} reminderInterval
 * @property {boolean} notifyWhenDue
 * @property {boolean} remindersOn
 * @property {number} volume
 */

/**
 * @typedef GameState
 * @property {{card: Card, entryEl: HTMLElement}[]} cardElements
 * @property {number} trackedNumOfDueCards
 * @property {number} previousReminderDate
 * @property {string} currentScreen
 */

/**
 * @typedef {Object} Card
 * @property {number} dueDistance
 * @property {number} dueMS
 * @property {string} front
 * @property {string} back
 * @property {string} id
 */

/**
 * @param {string} front
 * @param {string} back
 * @returns {Card}
 */
function makeCard(front, back, creationDueDistance = Number(SETTINGS.defaultDueDistanceMS)) {
  const number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const creationMS = Date.now();
  const id = [creationMS, front, back, getRandom(number, 3).join("")].join("_");
  let card = {
    front,
    back,
    id,
    dueDistance: Number(creationDueDistance),
    dueMS: Number(creationDueDistance) + Number(creationMS),
  };
  if (
    // c.front === front && c.back === back
    CARDS.find((c) => {
      return c.id === card.id;
    }) === undefined
  ) {
    CARDS.push(card);
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
    delButton.onclick = () => {
      CARDS.splice(CARDS.indexOf(card), 1);
      let el = gameState.cardElements.find((el) => el.card.id === card.id)?.entryEl;
      if (el && el.parentElement) el.parentElement.remove();
      gameLoop();
      saveCardsToLS();
    };
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
 * @param {HTMLElement} entryElement
 * @param {Card} card
 */
function addLabelToCardEntries(entryElement, card) {
  if (gameState.cardElements.filter((EE) => EE.card.id === card.id).length === 0)
    gameState.cardElements.push({ card, entryEl: entryElement });
  let fText = innerWidth > 500 ? "Front: " : "F: ";
  let bText = innerWidth > 500 ? "Back: " : "B: ";
  let dInText = innerWidth > 500 ? "Due in: " : "D: ";
  let dAtText = innerWidth > 500 ? "Due at: " : "D: ";
  entryElement.innerText =
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
  const screenExists = ["Study", "Create", "Settings"].includes(newScreenName);
  if (screenExists) {
    gameState.currentScreen = newScreenName;
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
    const arrowHolderElement = document.getElementById("answer-bar-arrow-holder");
    if (e.target === document.getElementById("answer-bar")) {
      const AB = document.getElementById("answer-bar");
      // @ts-ignore
      if (AB && arrowHolderElement) {
        alert("Ok");
        arrowHolderElement.style.translate = `${e.clientX - 0.5 * innerWidth}px`;
        const current = e.clientX - 0.5 * innerWidth;
        const minMax = AB.clientWidth;
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
  const previousDueDistance = Number(card.dueDistance);
  const newDueDistance = previousDueDistance + previousDueDistance * rating;
  card.dueDistance = newDueDistance;
  card.dueMS = Date.now() + newDueDistance;
}

/**
 * Returns all cards that are overdue.
 * @returns {Card[]}
 */
function getDueCards() {
  let dues = CARDS.filter((c) => {
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
    if (v) {
      v.value = SETTINGS.volume.toString();
      v.onclick = (e) => {
        if (e && e.target) {
          // @ts-ignore - it does exist
          SETTINGS.volume = /** @type {Number} */ (e.target.value);
          playNote("As2");
          saveSettingsToLS();
        }
      };
    }
    let s = /** @type {HTMLInputElement} */ document.getElementById("default-due-seconds");
    if (s) {
      //@ts-ignore - it does exist
      s.value = SETTINGS.defaultDueDistanceMS / 1000;
      s.onchange = (e) => {
        // @ts-ignore - it does exist
        SETTINGS.defaultDueDistanceMS = Number(s.value) * 1000;
        saveSettingsToLS();
      };
    }
    let dn = /** @type {HTMLSelectElement} */ document.getElementById("due-notifications-setting");
    if (dn) {
      //@ts-ignore - it does exist
      dn.value = SETTINGS.notifyWhenDue;
      dn.onchange = () => {
        // @ts-ignore - it does exist
        SETTINGS.notifyWhenDue = dn.value;
        saveSettingsToLS();
      };
    }
    let rn = /** @type {HTMLSelectElement} */ document.getElementById("reminders-setting");
    if (rn) {
      //@ts-ignore - it does exist
      rn.value = SETTINGS.remindersOn;
      rn.onchange = () => {
        //@ts-ignore - it does exist
        SETTINGS.remindersOn = rn.value;
        saveSettingsToLS();
      };
    }
    let ri = /** @type {HTMLSelectElement} */ document.getElementById("reminder-interval-setting");
    if (ri) {
      //@ts-ignore - it does exist
      ri.value = SETTINGS.reminderInterval;
      ri.onchange = () => {
        //@ts-ignore - it does exist
        SETTINGS.reminderInterval = ri.value;
        saveSettingsToLS();
      };
    }
    let ds = /** @type {HTMLSelectElement} */ document.getElementById("due-sound-setting");
    if (ds) {
      //@ts-ignore - it does exist
      ds.value = SETTINGS.playSoundWhenCardBecomesDue;
      ds.onchange = () => {
        //@ts-ignore - it does exist
        SETTINGS.playSoundWhenCardBecomesDue = ds.value;
        saveSettingsToLS();
      };
    }
    let rs = /** @type {HTMLSelectElement} */ document.getElementById("reminder-sound-setting");
    if (rs) {
      //@ts-ignore - it does exist
      rs.value = SETTINGS.playSoundWhenReminding;
      rs.onchange = () => {
        //@ts-ignore - it does exist
        SETTINGS.playSoundWhenReminding = rs.value;
        saveSettingsToLS();
      };
    }
  }
  function setupCardCreationButton() {
    let cb = document.getElementById("creation-card-button");
    if (cb) {
      cb.onclick = () => {
        if (fCardEl && bCardEl) {
          let c = makeCard(fCardEl.value, bCardEl.value);
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
  setupNavbarScreenChanges();
  setupStudyBarClickEvent();
  setupCardCreationButton();
  setupSettingsScreen();

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

function ensureSettingsAreBooleans() {
  /**@ts-ignore */
  if (SETTINGS.remindersOn === "true") {
    SETTINGS.remindersOn = true;
  /**@ts-ignore */
  } else if (SETTINGS.remindersOn === "false") {
    SETTINGS.remindersOn = false;
  }
  /**@ts-ignore */
  if (SETTINGS.notifyWhenDue === "true") {
    SETTINGS.notifyWhenDue = true;
  /**@ts-ignore */
  } else if (SETTINGS.notifyWhenDue === "false") {
    SETTINGS.notifyWhenDue = false;
  }
  /**@ts-ignore */
  if (SETTINGS.playSoundWhenCardBecomesDue === "true") {
    SETTINGS.playSoundWhenCardBecomesDue = true;
  /**@ts-ignore */
  } else if (SETTINGS.playSoundWhenCardBecomesDue === "false") {
    SETTINGS.playSoundWhenCardBecomesDue = false;
  }
  /**@ts-ignore */
  if (SETTINGS.playSoundWhenReminding === "true") {
    SETTINGS.playSoundWhenReminding = true;
  /**@ts-ignore */
  } else if (SETTINGS.playSoundWhenReminding === "false") {
    SETTINGS.playSoundWhenReminding = false;
  }
}
/**
 * Gets the settings from LS, if the user has been to the app before.
 */
function loadSettingsFromLS() {
  /**@type {string | null} */
  let settingsJSON = localStorage.getItem("settings");
  if (settingsJSON) {
    // /** @type {Settings} */
    let settingsInLocalStorage = JSON.parse(settingsJSON);
    SETTINGS = settingsInLocalStorage;
    ensureSettingsAreBooleans()
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
    let currentIDsInDeck = CARDS.flatMap((c) => c.id);
    let cardsNotInGlobalButInSaved = cardsInLocalStorage.filter((c) => {
      return !currentIDsInDeck.includes(c.id);
    });
    cardsNotInGlobalButInSaved.forEach((card) => {
      let c = makeCard(card.front, card.back);
      c.dueMS = card.dueMS;
      gameLoop();
    });
  }
}

/**
 * Replaces the cards in local storage (or sets it) with the current cards in the global cards array.
 */
function saveCardsToLS() {
  localStorage.setItem("cards", JSON.stringify(CARDS));
  CARDS.forEach((card) => console.log(card));
  ensureSettingsAreBooleans()
}

/**
 * Replaces the settings in local storage (or sets it) with the current settings in the global settings.
 */
function saveSettingsToLS() {
  localStorage.setItem("settings", JSON.stringify(SETTINGS));
  new Notification("Saved.");
  ensureSettingsAreBooleans()
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

/**
 * @returns {boolean} whether or not there are new cards due.
 */
function checkIfNewCardsAreDue() {
  return gameState.trackedNumOfDueCards < getDueCards().length;
}

/**
 * Plays the note within the ./sounds directory.
 * @param {string} fileNameBeforeDot
 */
function playNote(fileNameBeforeDot) {
  let a = new Audio(`./sounds/${fileNameBeforeDot}.mp3`);
  a.volume = SETTINGS.volume;
  a.play();
}

/**
 * Notifies the user that a card is due (if settings allow it).
 */
function handleNewCardIsDue() {
  gameState.trackedNumOfDueCards++;
  if (SETTINGS.notifyWhenDue) {
    new Notification("A new card is due.");
    if (SETTINGS.playSoundWhenCardBecomesDue) {
      playNote("E5");
    }
  }
}

/**
 * Notifies the user when a reminder is due (if the settings allow it).
 */
function handleReminder() {
  gameState.previousReminderDate = Date.now();
  if (SETTINGS.remindersOn) {
    new Notification(
      getDueCards().length === 1
        ? "Remember: you have 1 due card!"
        : `Remember: you have ${getDueCards().length} due cards!`
    );
    if (SETTINGS.playSoundWhenReminding) {
      playNote("Gs3");
    }
  }
}

/**
 * Checks and handles newly due cards and reminders.
 */
function gameLoop() {
  refreshStudyCard();
  checkIfNewCardsAreDue();
  if (checkIfNewCardsAreDue()) {
    handleNewCardIsDue();
  } else {
    if (getDueCards().length > 0) {
      let nextReminderDate = gameState.previousReminderDate + SETTINGS.reminderInterval * 1000;
      if (Date.now() > nextReminderDate) {
        handleReminder();
      }
    }
  }
  gameState.cardElements.forEach((ec) => {
    addLabelToCardEntries(ec.entryEl, ec.card);
  });
}

// function deleteAllCookies() {
//   const cookies = document.cookie.split(";");

//   for (let i = 0; i < cookies.length; i++) {
//       const cookie = cookies[i];
//       const eqPos = cookie.indexOf("=");
//       const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//       document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
//   }
// }

// deleteAllCookies()

/** @type {GameState} */
const gameState = {
  trackedNumOfDueCards: 0,
  previousReminderDate: 0,
  currentScreen: "Study",
  cardElements: [],
};
/** @type {Settings} */

let SETTINGS = {
  playSoundWhenCardBecomesDue: true,
  playSoundWhenReminding: true,
  defaultDueDistanceMS: 5000,
  reminderInterval: 2,
  notifyWhenDue: true,
  remindersOn: true,
  volume: 0.25,
};
/** @type {Card[]} */ const CARDS = [];
loadSettingsFromLS();
loadCardsFromLS();
setInterval(() => {
  gameLoop();
}, 1000);
Notification.requestPermission();
setup();
changeScreenTo("Create");
