const phrases = new Map([
  ["Consuetudo est altera natura", "Привычка - вторая натура"],
  ["Nota bene", "Заметьте хорошо!"],
  ["Nulla calamitas sola", "Беда не приходит одна"],
  ["Per aspera ad astra", "Через тернии к звёздам"],
]);

const availablePhrases = new Set(phrases.keys());
let counter = 0;

function showPhrase() {
  if (availablePhrases.size === 0) {
    alert("Фразы закончились");
    return;
  }

  const keysArray = [...availablePhrases];
  const randomKey = keysArray[Math.floor(Math.random() * keysArray.length)];

  availablePhrases.delete(randomKey);
  counter++;

  const div = document.createElement("div");
  div.className = "phrase " + (counter % 2 === 0 ? "class1" : "class2");
  div.innerHTML = `<div class="phrase-latin">${randomKey}</div><div class="phrase-russian">${phrases.get(
    randomKey
  )}</div>`;

  document.getElementById("output").appendChild(div);
}

function makeBold() {
  const allPhrases = document.querySelectorAll(".phrase");
  allPhrases.forEach((phrase, index) => {
    if ((index + 1) % 2 === 0) {
      phrase.style.fontWeight = "bold";
    }
  });
}

function createList() {
  const allPhrases = document.querySelectorAll(".phrase");
  const list = document.getElementById("phraseList");
  list.innerHTML = "";

  allPhrases.forEach((phrase) => {
    const latinText = phrase.querySelector(".phrase-latin").textContent;
    const russianText = phrase.querySelector(".phrase-russian").textContent;

    const li = document.createElement("li");
    li.textContent = latinText;

    const ul = document.createElement("ul");
    const subLi = document.createElement("li");
    subLi.textContent = russianText;
    ul.appendChild(subLi);
    li.appendChild(ul);

    list.appendChild(li);
  });
}
