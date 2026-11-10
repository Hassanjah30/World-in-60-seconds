let categories = [
  { name: "World", search: "(world OR international OR global)" },
  { name: "Politics", search: "(election OR government OR president)" },
  { name: "Business", search: "(economy OR markets OR business)" },
  { name: "Tech", search: "(technology OR internet OR software)" },
  { name: "Sports", search: "(football OR cricket OR basketball)" },
  { name: "Health", search: "(health OR hospital OR medicine)" },
  { name: "Climate", search: "(climate OR environment OR weather)" }
];

let currentCategory = categories[0];
let secondsLeft = 60;

for (let i = 0; i < categories.length; i++) {
  let button = document.createElement("button");
  button.textContent = categories[i].name;
  button.addEventListener("click", function () {
    currentCategory = categories[i];
    showSelected(button);
    getNews();
  });
  document.querySelector("#category-buttons").appendChild(button);
}

function showSelected(clickedButton) {
  let buttons = document.querySelectorAll("#category-buttons button");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].className = "";
  }
  clickedButton.className = "selected";
}

document.querySelector("#category-buttons button").className = "selected";

async function getNews() {
  let apiURL = "https://api.gdeltproject.org/api/v2/doc/doc?query=" +
    currentCategory.search + " sourcelang:english" +
    "&mode=artlist&format=json&maxrecords=30&timespan=24h&sort=datedesc";

  document.querySelector("#status").textContent = "Loading " + currentCategory.name + " news...";
  secondsLeft = 60;

  try {
    const response = await fetch(apiURL);
    if (!response.ok) {
      throw new Error("Request failed");
    }
    const data = await response.json();
    console.log(data);

    if (data.articles == undefined) {
      document.querySelector("#status").textContent = "No stories found right now. Try another category.";
      return;
    }

    showFeed(data.articles);
    showCountries(data.articles);

    let time = new Date().toLocaleTimeString();
    document.querySelector("#status").textContent =
      data.articles.length + " " + currentCategory.name + " stories, last updated at " + time;
  } catch (error) {
    console.error("Error:", error);
    document.querySelector("#status").textContent =
      "Could not load the news. Wait a few seconds and try again. (" + error.message + ")";
  }
}

function showFeed(articles) {
  let feed = document.querySelector("#feed");
  feed.innerHTML = "";
  document.querySelector("#feed-title").textContent = currentCategory.name + " news feed";

  for (let i = 0; i < articles.length; i++) {
    let article = articles[i];

    let card = document.createElement("div");
    card.className = "card";

    if (article.socialimage != "" && article.socialimage != undefined) {
      let image = document.createElement("img");
      image.src = article.socialimage;
      image.alt = "";
      card.appendChild(image);
    }

    let text = document.createElement("div");
    text.className = "card-text";

    let title = document.createElement("h3");
    let link = document.createElement("a");
    link.href = article.url;
    link.target = "_blank";
    link.textContent = article.title;
    title.appendChild(link);
    text.appendChild(title);

    let country = document.createElement("p");
    country.textContent = article.sourcecountry;
    text.appendChild(country);

    let source = document.createElement("p");
    source.textContent = article.domain + " at " + formatTime(article.seendate);
    text.appendChild(source);

    card.appendChild(text);
    feed.appendChild(card);
  }
}

function formatTime(seendate) {
  let hours = seendate.slice(9, 11);
  let minutes = seendate.slice(11, 13);
  return hours + ":" + minutes + " UTC";
}

function showCountries(articles) {
  let countryNames = [];
  let countryCounts = [];

  for (let i = 0; i < articles.length; i++) {
    let name = articles[i].sourcecountry;
    if (name == "") {
      name = "Unknown";
    }

    let found = false;
    for (let j = 0; j < countryNames.length; j++) {
      if (countryNames[j] == name) {
        countryCounts[j] = countryCounts[j] + 1;
        found = true;
      }
    }

    if (found == false) {
      countryNames.push(name);
      countryCounts.push(1);
    }
  }

  let countries = document.querySelector("#countries");
  countries.innerHTML = "";

  for (let i = 0; i < countryNames.length; i++) {
    let row = document.createElement("div");
    row.className = "country-row";

    let name = document.createElement("span");
    name.className = "country-name";
    name.textContent = countryNames[i];

    let bar = document.createElement("div");
    bar.className = "country-bar";
    let width = countryCounts[i] * 8;
    if (width > 110) {
      width = 110;
    }
    bar.style.width = width + "px";

    let count = document.createElement("span");
    count.textContent = countryCounts[i];

    row.appendChild(name);
    row.appendChild(bar);
    row.appendChild(count);
    countries.appendChild(row);
  }
}

setInterval(function () {
  secondsLeft = secondsLeft - 1;
  document.querySelector("#countdown").textContent = "Next update in " + secondsLeft + " seconds";
  if (secondsLeft <= 0) {
    getNews();
  }
}, 1000);

getNews();
