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

let resultsNum = 0

const updateResultsCount = (count) => {
  $(".total-number").innerHTML = count
  resultsNum = count
}

// console.log(today)


/* FETCH DATA */
const urlBase = `https://gateway.marvel.com/v1/public/`
let ts = `ts=1`
const publicKey = "&apikey=0335f001bb01e93161a44ee9147e0f49"
const hash = "&hash=a5965c3c8fdffc56ab090cf5dfedc332"


const getMComics = async (title) => {
  
  try {
    const showTitle = title ? `&titleStartsWith=${title}` : "";
    const url = `${urlBase}comics?${ts}${publicKey}${hash}${showTitle}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch comics");
    }
    const data = await response.json();
    return data.data.results;
  } catch (error) {
    console.error("Error fetching comics:", error);
    return []; 
    
  }
}


const getMCharacters = async (name) => {
  try {
    const showName = name ? `&nameStartsWith=${name}` : "";
    const url = `${urlBase}characters?${ts}${publicKey}${hash}${showName}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch characters");
    }
    const data = await response.json();
    return data.data.results;
  } catch (error) {
    console.error("Error", error);
    return []; 
  }
}

console.log(getMComics());

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
let dataComics = []

// // Pages
const $first = $("#first-page");
const $prev = $("#previous-page");
const $next = $("#next-page");
const $last = $("#last-page");



/* FILTER DATA */
const getApiData = async () =>  {
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
// Comic details

const showComicDetails = () => {
  showElement([".page-comic"])
  // hideElement([".page-results"])
}

const updateDetailDataComic = (img, title, releaseDate, writers, description) => {
  const comicImage = $(".comic-image");
  if (comicImage) {
    comicImage.src = img;
  }
  const comicTitle = $(".comic-title");
  if (comicTitle) {
    comicTitle.innerHTML = title;
  }
  const comicDate = $(".comic-date");
  if (comicDate) {
    comicDate.innerHTML = releaseDate;
  }
  const comicWriters = $(".comic-writers");
  if (comicWriters) {
    comicWriters.innerHTML = writers;
  }
  const comicDescription = $(".comic-description");
  if (comicDescription) {
    comicDescription.innerHTML = description;
  }
};

// const getDetailData = async (id) => {
//   try {
//     const response = await fetch(
//       `https://gateway.marvel.com/v1/public/${type}/${id}`
//     );
//     console.log(response);
//     const data = await response.json();
//     console.log(data);
//     dataComics = data.data.results;
//     totalResultsNum = data.data.total; 
//     render()
//     totalResultsNum()
//     showElement([".page-comic"]);

//   } catch (error) {
//     console.log(error);
//   }
// }



const getDetailDataComic = async (comicId) => {
  try {
    console.log('Fetching comic data for ID:', comicId);
    const response = await fetch(`${urlBase}comics/${comicId}?${ts}${publicKey}${hash}`); 
    const { data: { results: [comic] } } = await response.json();
    console.log(data)
    const img = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
    const releaseDate = new Date(comic.dates.find((date) => date.type === 'onsaleDate').date);
    const writers = `${comic.creators.items}`;
    updateDetailDataComic(img, comic.title, releaseDate, writers, comic.description);
    showComicDetails();
    
  } catch (error) {
    console.error("Error:", error);
  }
}
console.log(getDetailDataComic());


const showCharacterDetails = () => {
  showElement([".page-comic"])
  hideElement([".page-results"])
}

// const getDetailDataCharacter = async (characterId) => {
//   const {
//     data: {
//       results: [character],
//     },
//   } = await fetchURL(getApiData('characters', characterId))

//   updateCharacterDetails(
//     `${character.thumbnail.path}.${character.thumbnail.extension}`,
//     character.name,
//     character.description
//   )
//   showCharacterDetails()
// }

// RENDER
const render = async () => {
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
          <div onclick="getDetailDataComic(${comic.id})" class="bg-black text-white border-4 border-white hover:text-[#ed1c23] hover:border-0">
            <img src="${imageUrl}" alt="${comic.title}" >
            <p class="p-1">${comic.title}</p>
          </div>`;
      });
    } else if (type === "characters") {
      sortedData.forEach((character) => {
        const characterURL = `${character.thumbnail.path}.${character.thumbnail.extension}`
        html += `
          <div onClick="getDetailDataCharacter(${character.id})" class=" bg-black text-white border-4 border-white hover:text-[#ed1c23] hover:border-0">
            <img src="${characterURL}" alt="${character.name}">
            <p class="p-1">${character.name}</p>
          </div>`;
      });
    }
  } else {
    html = `<p class="text-2xl text-[#ed1c23]"><i class="fa-solid fa-circle-exclamation mr-1"></i>No results found</p>`;
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
  // console.log(orderBy);
  totalResultsNum(type)

}

$search.onchange = function(e) {
  search = e.target.value
  totalResultsNum(search)
}

$searchButton.onclick = function(e) {
getApiData()
totalResultsNum()
}


// const getDetailData = async (id) => {
//   try {
//     const response = await fetch(
//       `https://gateway.marvel.com/v1/public/${type}/${id}`
//     );
//     console.log(response);
//     const data = await response.json();
//     console.log(data);
//     dataComics = data.data.results;
//     totalResultsNum = data.data.total; 
//     render()
//     totalResultsNum()
//     showElement([".page-comic"]);

//   } catch (error) {
//     console.log(error);
//   }
// }





/* RESULTS AND PAGE COUNTING */

const totalResultsNum = async () => {
  try {
    let apiUrl;
    if (type === "comics") {
      apiUrl = `https://gateway.marvel.com/v1/public/comics?${ts}${publicKey}${hash}`;
    } else if (type === "characters") {
      apiUrl = `https://gateway.marvel.com/v1/public/characters?${ts}${publicKey}${hash}`;
    }
    if (search) {
      apiUrl += `&${type === "comics" ? "title" : "name"}StartsWith=${search}`;
    }
    const response = await fetch(apiUrl);
    const data = await response.json();
    resultsNum = data.data.total;
    $(".total-number").innerHTML = `${resultsNum}`;
  } catch (error) {
    console.error("error:", error);
  }
};


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


  $('#last-page').onclick = () => {
    const pages = Math.ceil(resultsNum / 20);
    offset = (pages - 1) * 20;
    callback();
    updatePagination()
  }
}


const updatePagination = () => {
  console.log('Offset:', offset);
  console.log('Results Count:', resultsNum)

  if (offset === 0) {
    $("#first-page").disabled = true
    $("#previous-page").disabled = true
  } else {
    $("#first-page").disabled = false
    $("#previous-page").disabled = false
  }
  if (offset + 20 >= resultsNum) {
    $('#last-page').disabled = true
    $('#next-page').disabled = true
  } else {
    $('#last-page').disabled = false
    $('#next-page').disabled = false
  }
}


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




window.addEventListener("load", () => {
  updatePaginationCallback(getApiData)
  getApiData()

})