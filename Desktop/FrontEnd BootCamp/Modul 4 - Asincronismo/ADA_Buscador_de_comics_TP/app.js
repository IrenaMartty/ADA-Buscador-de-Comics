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

const today = new Date()

// console.log(today)


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
const printDataComics = async (title) => {
  try {
    const comics = await getMComics(title);
    console.log("Comics:", comics);

    const showResultsContainer = $("#show-results");
    cleanContainer(showResultsContainer);

    let html = '';

    if (comics && comics.length > 0) {
      for (let comic of comics) {
        const imageUrl = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
        console.log("Image URL:", imageUrl);

        html += `
          <div class="hover:text-[#ed1c23]">
            <img src="${imageUrl}" alt="${comic.title}">
            <p >${comic.title}</p>
          </div>
        `;
      }
    } else if (search.trim() !== '') {
      html = `<p class="text-2xl text-[#ed1c23]"><i class="fa-solid fa-circle-exclamation mr-1"></i>No comics found</p>`;
    }

    showResultsContainer.innerHTML = html;
  } catch (error) {
    console.error("Error:", error);
  }
};

// printDataComics();

const printDataCharacters = async(name) => {
  try{

    const characters = await getMCharacters(name)
  
   const showResultsContainer = $("#show-results");
    cleanContainer(showResultsContainer); 

    let html = ''
  
    if (characters && characters.length > 0) {
      for (let character of characters) {
        const characterURL = `${character.thumbnail.path}.${character.thumbnail.extension}`
        console.log("character URL:", characterURL);
        
        html += `
          <div>
            <img src="${characterURL}" alt="${character.name}">
            <p>${character.name}</p>
          </div>`
      }
    } else if (search.trim() !== '') {
      html = `<p class="text-2xl text-[#ed1c23]"><i class="fa-solid fa-circle-exclamation mr-1"></i>No comics found</p>`;
    }
  } catch (error)
  {
    console.error("Error:", error);
  }
};
// printDataCharacters()


/* FILTER DATA */

// // Elements
const $order = $("#order")
const $type = $("#type")
const $search = $("#search-text")
const $searchButton = $("#button-search")

// // Control
let offset = 0
let type = "comics"
let orderBy = "title"
let search = ""

// // Pages
const $first = $("#first-page");
const $prev = $("#previous-page");
const $next = $("#next-page");
const $last = $("#last-page");

let dataComics = [];

async function getApiData() {
  try {
    let orderByParam;
    if (type === "comics") {
      if (orderBy === "title") {
        orderByParam = "title";
      } else if (orderBy === "-title") {
        orderByParam = "-title";
      } else {
        orderByParam = orderBy === "modified" ? "-modified" : "title";
      }
    } else if (type === "characters") {
      if (orderBy === "name") {
        orderByParam = "name";
      } else if (orderBy === "-name") {
        orderByParam = "-name";
      } else {
        orderByParam = orderBy === "modified" ? "-modified" : "name";
      }
    }

    const response = await fetch(
      `https://gateway.marvel.com/v1/public/${type}?${ts}${publicKey}${hash}&offset=${offset}&orderBy=${orderByParam}${search && `&${type === "comics" ? "title" : "name"}StartsWith=${search}`}`
    );

    const data = await response.json();
    dataComics = data.data.results;
    render();
    totalResultsNum()
  } catch (error) {
    console.log(error);
  }
}

function render() {
  const showResultsContainer = $("#show-results");
  cleanContainer(showResultsContainer);
  let html = '';
  
  if (dataComics && dataComics.length > 0) {
    let sortedData = dataComics;
    if (orderBy === "modified") {
      sortedData = sortedData.sort((a, b) => new Date(a.modified) - new Date(b.modified));
    } else if (orderBy === "-modified") {
      sortedData = sortedData.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    } else if (orderBy === "name") {
      sortedData = sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (orderBy === "-name") {
      sortedData = sortedData.sort((a, b) => b.name.localeCompare(a.name));
    }
  
    if (type === "comics") {
      sortedData.forEach((comic) => {
        const imageUrl = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
        html += `
          <div onClick="getDetailData(${comic.id})" class="bg-black text-white hover:text-[#ed1c23] hover:border-2">
            <img src="${imageUrl}" alt="${comic.title}" >
            <p class="p-1">${comic.title}</p>
          </div>`;
      });
    } else if (type === "characters") {
      sortedData.forEach((character) => {
        const characterURL = `${character.thumbnail.path}.${character.thumbnail.extension}`
        html += `
          <div onClick="getDetailData(${character.id})" class=" bg-black text-white hover:text-[#ed1c23] hover:shadow-2xl">
            <img src="${characterURL}" alt="${character.name}">
            <p class="p-1">${character.name}</p>
          </div>`;
      });
    }
  } else {
    html = `<p class="text-2xl text-[#ed1c23]"><i class="fa-solid fa-circle-exclamation mr-1"></i>No comics found</p>`;
  }
  
  showResultsContainer.innerHTML = html;
}


$order.onchange = function(e) {
  if (type === "comics" && e.target.value === "name") {
    orderBy = "title";
  } else if (type === "comics" && e.target.value === "-name") {
    orderBy = "-title";
  } else if (type === "characters" && e.target.value === "name") {
    orderBy = "name";
  } else if (type === "characters" && e.target.value === "-name") {
    orderBy = "-name";
  } else if (type === "comics" && e.target.value === "modified") {
    orderBy = "modified";
  } else if (type === "comics" && e.target.value === "-modified") {
    orderBy = "-modified";
  } else {
    orderBy = e.target.value;
  }
  console.log(orderBy);
};

$type.onchange = function(e) {
  type = e.target.value
  if(type === "comics") {
    $('.newer[value="modified"]').classList.remove('hidden');
    $('.older[value="-modified"]').classList.remove('hidden');
  } else if (type === "characters") {
    $('.newer[value="modified"]').classList.add('hidden');
    $('.older[value="-modified"]').classList.add('hidden');
  } else {
    orderBy = "name";
    return;
  }
  console.log(orderBy);
}

$search.onchange = function(e) {
  search = e.target.value
  totalResultsNum()
}

$searchButton.onclick = function(e) {
getApiData()
totalResultsNum()
}


async function getDetailData(id) {
  try {
    const response = await fetch(
      `https://gateway.marvel.com/v1/public/${type}/${id}`
    );
    console.log(response);
    const data = await response.json();
    console.log(data);
    dataComics = data.data.results;
    totalResultsNum = data.data.total; 
    render()
    totalResultsNum()
    showElement([".page-comic"]);

  } catch (error) {
    console.log(error);
  }
}



/* PAGE NUMBER */

const totalResultsNum = async () => {
  try {
    const response = await fetch(`https://gateway.marvel.com/v1/public/comics?${ts}${publicKey}${hash}`);
    const data = await response.json();
    const totalResults = data.data.total;
    $(".total-number").innerHTML = `${totalResults}`;
  } catch (error) {
    console.error("error:", error);
  }
};

totalResultsNum()

const updatePaginationCallback = (callback) => {
  $('#first-page').onclick = () => {
    offset = 0
    callback()
    updatePagination() 
  }

  $('#previous-page').onclick = () => {
    offset -= 20
    if (offset < 0) {
      offset = 0
    }
    callback()
    updatePagination() 
  }

  $('#next-page').onclick = () => {
    offset += 20
    callback()
    updatePagination() 
  }

//   $('#last-page').onclick = async () => {
//     try {
//         const totalResults = await totalResultsNum(); 
//         const pages = Math.ceil(totalResults / 20); 
//         offset = (pages - 1) * 20; 
//         callback();
//         updatePagination();
//     } catch (error) {
//         console.error("error:", error);
//     }
// }
}

const updatePagination = () => {
  if (offset === 0) {
    $("#first-page").disabled = true
    $("#previous-page").disabled = true
  } else {
    $("#first-page").disabled = false
    $("#previous-page").disabled = false
  }
}

const numberOfPages = async() => {
  try{
    const comics = await getMComics()
    const totalNumberOfPages = comics.data.total
    $(".number-of-pages").innerHTML = `${totalNumberOfPages}`;
  } 
  catch (error) {
    console.error("Error fetching total results:", error);
  }
}
numberOfPages()




window.addEventListener("load", () => {
  updatePaginationCallback(getApiData)
  getApiData()
})