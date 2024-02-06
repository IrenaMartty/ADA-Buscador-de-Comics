/* UTILITIES */

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
import md5 from 'md5';
const publicKey = '0335f001bb01e93161a44ee9147e0f49';
const privateKey = 'd707c0336b0d9058003cf52341db5b263a6b1f39';
const timestamp = new Date().getTime();
const hash = md5(timestamp + privateKey + publicKey);

const url = `http://gateway.marvel.com/v1/public/comics?ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;


fetch(url) 
.then(response => response.json())
.then(data => {
    console.log(data)
})
.catch(error => {
    console.error('Error fetching data:', error)
})