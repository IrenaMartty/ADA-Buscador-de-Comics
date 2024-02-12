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

const cleanContainer = (selector) => ($(selector).innerHTML = "");


/* FETCH DATA */
const urlBase = `https://gateway.marvel.com/v1/public/`
let ts = `ts=1`
const publicKey = "&apikey=0335f001bb01e93161a44ee9147e0f49"
const hash = "&hash=a5965c3c8fdffc56ab090cf5dfedc332"

const getMarvelComics = async() => {
    const url = `${urlBase}comics?${ts}${publicKey}${hash}`
    const response = await fetch(url)
    const data = await response.json()
console.log(data)
printData(data.data.results)
}
getMarvelComics()

const printData = (arr) => {
  let comicCards = ""
  
  
  arr.forEach((comic) => {
    comicCards = 
    comicCards += `
        <div class="">
        <img src=${comic.images}>
        <h3>${comic.title}</h3>
        </div>
        
        `
    })
    $("#show-results").innerHTML = comicCards
    console.log(comicCards);
}

const pageNumber = async(pageNum) => {
    const result = await pageNum
    $("#first-page").addEventListener("click", () => {
        if(page>2){
            page=1
            getData()
        }
    })
    $("#last-page").addEventListener("click", () => {
        if(page < pageCount){
            page=112
            getData()
        }
    })


}
