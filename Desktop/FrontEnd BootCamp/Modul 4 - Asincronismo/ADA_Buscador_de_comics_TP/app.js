// /* UTILITIES */

const getData = (key) => JSON.parse(localStorage.getItem(key));
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const showElement = (selectors) => {
  for (const selector of selectors) {
    $(selector).classList.remove("hidden");
  }
};

const hideElement = (selectors) => {
  for (const selector of selectors) {
    $(selector).classList.add("hidden");
  }
};

const cleanContainer = (element) => {element.innerHTML = "";}

/* FETCH DATA */
const urlBase = `https://gateway.marvel.com/v1/public/`
let ts = `ts=1`
const publicKey = "&apikey=0335f001bb01e93161a44ee9147e0f49"
const hash = "&hash=a5965c3c8fdffc56ab090cf5dfedc332"

const getMComics = async(title) => {
  let showTitle= title?`&titleStartsWith=${title}`:""
    const url = `${urlBase}comics?${ts}${publicKey}${hash}${showTitle}`
    const response = await fetch(url)
    const data = await response.json()
// console.log(data.data.results)
return(data.data.results)
}

const getMCharacters = async(name) => {
  let showName= name?`&nameStartsWith=${name}`:""
  const url = `${urlBase}characters?${ts}${publicKey}${hash}${showName}`
  const response = await fetch(url)
    const data = await response.json()
// console.log(data.data.results)
return(data.data.results)

}

/* PRINT DATA */
const printDataComics = async(title) => {
  try{

    const comics = await getMComics(title)
    console.log(comics);
  
   const showResultsContainer = $("#show-results");
    cleanContainer(showResultsContainer); 
  
    if (comics && comics.length > 0) {
      for (let comic of comics) {
        showResultsContainer.innerHTML += `
          <div>
            <img src="" alt="">
            <p>${comic.title}</p>
          </div>`
      }
    } else {
      showResultsContainer.innerHTML = `<p class="text-2xl text-[#ed1c23]"><i class="fa-solid fa-circle-exclamation mr-1"></i>No comics found</p>`;
    }
  } catch (error)
  {
    console.error("Error:", error);
  }
};
printDataComics()

const printDataCharacters = async(name) => {
  try{

    const characters = await getMCharacters(name)
  
   const showResultsContainer = $("#show-results");
    cleanContainer(showResultsContainer); 
  
    if (characters && characters.length > 0) {
      for (let character of characters) {
        showResultsContainer.innerHTML += `
          <div>
            <img src="" alt="">
            <p>${character.name}</p>
          </div>`
      }
    } else {
      showResultsContainer.innerHTML = `<p class="text-2xl text-[#ed1c23]"><i class="fa-solid fa-circle-exclamation mr-1"></i>No characters found</p>`;
    }
  } catch (error)
  {
    console.error("Error:", error);
  }
};
printDataCharacters()


/* FILTER DATA */
// // elementos de funcionalidad
const $order = $("#order")
const $type = $("#type")
const $search = $("#search-text")
const $searchButton = $("#button-search")

// // viariables de control
let offset = 0
let type = "comics"
let orderBy = "title"
let search = ""

// // Pages
const $first = $("#first-page");
const $prev = $("#previous-page");
const $next = $("#next-page");
const $last = $("#last-page");

// Text search 
// $(".search-text").addEventListener("input", async() => {
//   const searchText = $(".search-text").value;
//   await printDataComics(searchText);
//   await totalResultsNum()
// })

let dataComics = [];

async function getApiData() {
  try {
      let orderByParam;
      if (orderBy === "modified") {
          orderByParam = "-modified";
      } else {
          orderByParam = type === "comics" ? (orderBy || "title") : (orderBy ? orderBy : "name");
      }
      const response = await fetch(
          `https://gateway.marvel.com/v1/public/${type}?${ts}${publicKey}${hash}&offset=${offset}&orderBy=${orderByParam}${search && `&${type == "comics" ? "title" : "name"}StartsWith=${search}`}`
      );
      const data = await response.json();
      dataComics = data.data.results;
      render();
  } catch (error) {
      console.log(error);
  }
}

function render() {
  const showResultsContainer = $("#show-results");
  cleanContainer(showResultsContainer);
  let html = '';
  
  if (type === "comics") {
    dataComics.forEach((comic) => {
      html += `<div onClick="getDetailData(${comic.id})">${comic.title}</div>`;
    });
  } else if (type === "characters") {
    dataComics.forEach((character) => {
      html += `<div onClick="getDetailData(${character.id})">${character.name}</div>`;
    });
  }
  
  showResultsContainer.innerHTML = html;
}

$order.onchange = function(e) {
  if(type === "comics" && e.target.value === "name") {
    orderBy = "title"
  } else if (type == "comics" && e.target.value == "-name") {
    orderBy = "-title";
    return;
  } else {
    orderBy = e.target.value;
  }
  console.log(orderBy);

}

$type.onchange = function(e) {
  type = e.target.value
  if (type == "comics" && orderBy == "name") {
    orderBy = "title";
    return;
  } else if (type == "comics" && orderBy == "-name") {
    orderBy = "-title";
    return;
  } else {
    orderBy = "name";
  }
  console.log(orderBy);
}

$search.onchange = function(e) {
  search = e.target.value
}

$searchButton.onclick = function(e) {
getApiData()
}

window.addEventListener("load", () => {
  getApiData()
})

async function getDetailData(id) {
  try {
    const response = await fetch(
      `https://gateway.marvel.com/v1/public/${type}/${id}`
    );
    console.log(response);
    const data = await response.json();
    console.log(data);
    dataComics = data.data.results;
  } catch (error) {
    console.log(error);
  }
}
/* PAGE NUMBER */

$prev.onclick = function(e) {
  offset -= 20
  
}

$next.onclick = function(e) {
  offset += 20
}

const totalResultsNum = async() => {
  try {
    const comics = await getMComics();
    const totalResults = comics.length; 
    $(".total-number").innerHTML = `${totalResults}`;
  } catch (error) {
    console.error("Error fetching total results:", error);
  }
};
totalResultsNum()

// const pageNumber = async(pageNum) => {
//     const result = await pageNum
//     $("#first-page").addEventListener("click", () => {
//         if(page>2){
//             page=1
//             getData()
//         }
//     })
//     $("#last-page").addEventListener("click", () => {
//         if(page < pageCount){
//             page=112
//             getData()
//         }
//     })


// }


// const numberOfPages = async() => {
//   try{
//     const comics = await getMComics()
//     const totalNumberOfPages = comics.data.total
//     $(".number-of-pages").innerHTML = `${totalNumberOfPages}`;
//   } 
//   catch (error) {
//     console.error("Error fetching total results:", error);
//   }
// }
// numberOfPages()


