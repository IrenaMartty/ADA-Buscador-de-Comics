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
console.log(data.data.results)
return(data.data.results)
}

const getMCharacters = async(name) => {
  let showName= name?`&nameStartsWith=${name}`:""
  const url = `${urlBase}characters?${ts}${publicKey}${hash}${showName}`
  const response = await fetch(url)
    const data = await response.json()
console.log(data.data.results)
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
    console.log(characters);
  
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
// printDataCharacters()




/* FILTER DATA */

// Text search 
$(".search-text").addEventListener("input", async() => {
  const searchText = $(".search-text").value;
  console.log("Search Text:", searchText);
  await printDataComics(searchText);
})
// Type filter

// Order filters


/* PAGE NUMBER */

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