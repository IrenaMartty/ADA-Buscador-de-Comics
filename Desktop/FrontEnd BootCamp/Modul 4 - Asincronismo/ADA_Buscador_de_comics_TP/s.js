const $ = (query) => document.querySelector(query)
const $$ = (query) => document.querySelectorAll(query)

const API_KEY = '89af8964112ea3350775c024cda415b8'
const BASE_URL = 'https://gateway.marvel.com/v1/public'

let offset = 0
let resultsCount = 0

const fetchURL = async (url) => {
  const response = await fetch(url)
  const data = await response.json()
  return data
}

const getSearchParams = (isSearch) => {
  const sortDropdown = $('#search-sort')
  const typeDrowpdown = $('#search-type')
  const searchInput = $('#search-input')

  let searchParams = `?apikey=${API_KEY}&offset=${offset}`

  if (!isSearch) {
    return searchParams
  }

  searchParams += `&orderBy=${sortDropdown.value}`

  if (!searchInput.value.length) {
    return searchParams
  }

  if (typeDrowpdown.value === 'comics') {
    searchParams += `&titleStartsWith=${searchInput.value}`
  }

  if (typeDrowpdown.value === 'characters') {
    searchParams += `&nameStartsWith=${searchInput.value}`
  }

  return searchParams
}

const getApiURL = (resource, resourceId, subResource) => {
  const isSearch = !resourceId && !subResource
  let url = `${BASE_URL}/${resource}`

  if (resourceId) {
    url += `/${resourceId}`
  }

  if (subResource) {
    url += `/${subResource}`
  }

  url += getSearchParams(isSearch)

  return url
}

const clearResults = () => {
  const resultsContainer = $('.results')
  resultsContainer.innerHTML = ''
}

const updateResultsCount = (count) => {
  $('.results-number').innerHTML = count
  resultsCount = count
}

const updateResultsTitle = (title) => {
  $('.results-title').innerHTML = title
}

const resetOffset = () => {
  offset = 0
}

const hideLoader = () => {
  $('.loader-container').classList.add('hidden')
}

const showLoader = () => {
  $('.loader-container').classList.remove('hidden')
}

const hideDetails = () => {
  $('.comic-section').classList.add('hidden')
  $('.character-section').classList.add('hidden')
}

const showComicDetails = () => {
  hideDetails()
  $('.comic-section').classList.remove('hidden')
}

const showCharacterDetails = () => {
  hideDetails()
  $('.character-section').classList.remove('hidden')
}

const fetchComics = async () => {
  const {
    data: { results, total },
  } = await fetchURL(getApiURL('comics'))

  clearResults()
  appendComics(results)
  updateResultsCount(total)
  updatePagination()
  hideLoader()
}

const fetchComic = async (comicId) => {
  const {
    data: {
      results: [comic],
    },
  } = await fetchURL(getApiURL('comics', comicId))

  const coverPath = `${comic.thumbnail.path}.${comic.thumbnail.extension}`
  const releaseDate = new Intl.DateTimeFormat('es-AR').format(
    new Date(comic.dates.find((date) => date.type === 'onsaleDate').date)
  )
  const writers = comic.creators.items
    .filter((creator) => creator.role === 'writer')
    .map((creator) => creator.name)
    .join(', ')

  updateComicDetails(
    coverPath,
    comic.title,
    releaseDate,
    writers,
    comic.description
  )
  showComicDetails()
}

const fetchCharacters = async () => {
  const {
    data: { results, total },
  } = await fetchURL(getApiURL('characters'))

  clearResults()
  appendCharacters(results)
  updateResultsCount(total)
  updatePagination()
  hideLoader()
}

const fetchCharacter = async (characterId) => {
  const {
    data: {
      results: [character],
    },
  } = await fetchURL(getApiURL('characters', characterId))

  updateCharacterDetails(
    `${character.thumbnail.path}.${character.thumbnail.extension}`,
    character.name,
    character.description
  )
  showCharacterDetails()
}

const fethCharacterComics = async (characterId) => {
  showLoader()

  const {
    data: { results, total },
  } = await fetchURL(getApiURL('characters', characterId, 'comics'))

  clearResults()
  updateResultsTitle('Comics')
  appendComics(results)
  updateResultsCount(total)
  updatePagination()
  hideLoader()
}

const fetchComicCharacters = async (comicId) => {
  showLoader()

  const {
    data: { results, total },
  } = await fetchURL(getApiURL('comics', comicId, 'characters'))

  clearResults()
  updateResultsTitle('Personajes')
  appendCharacters(results)
  updateResultsCount(total)
  updatePagination()
  hideLoader()
}

const updateComicDetails = (img, title, releaseDate, writers, description) => {
  $('.comic-cover').src = img
  $('.comic-title').innerHTML = title
  $('.comic-published').innerHTML = releaseDate
  $('.comic-writers').innerHTML = writers
  $('.comic-description').innerHTML = description
}

const updateCharacterDetails = (img, name, description) => {
  $('.character-portrait').src = img
  $('.character-name').innerHTML = name
  $('.character-description').innerHTML = description
}

const appendComics = (comics) => {
  if (comics.length === 0) {
    $('.results').innerHTML =
      '<h2 class="no-results">No se han encontrado resultados</h2>'
  }

  for (const comic of comics) {
    const comicCard = document.createElement('div')
    comicCard.tabIndex = 0
    comicCard.classList.add('comic')
    comicCard.onclick = () => {
      resetOffset()
      fetchComic(comic.id)
      fetchComicCharacters(comic.id)
      updatePaginationCallback(() => fetchComicCharacters(comic.id))
    }

    comicCard.innerHTML += `
      <div class="comic-img-container">
        <img src="${comic.thumbnail.path}/portrait_uncanny.${comic.thumbnail.extension}" alt="" class="comic-thumbnail" />
      </div>
      <h3 class="comic-title">${comic.title}</h3>`

    $('.results').append(comicCard)
  }
}

const appendCharacters = (characters) => {
  if (characters.length === 0) {
    $('.results').innerHTML =
      '<h2 class="no-results">No se han encontrado resultados</h2>'
  }

  for (const character of characters) {
    const characterCard = document.createElement('div')
    characterCard.tabIndex = 0
    characterCard.classList.add('character')
    characterCard.onclick = () => {
      resetOffset()
      fetchCharacter(character.id)
      fethCharacterComics(character.id)
      updatePaginationCallback(() => fethCharacterComics(character.id))
    }

    characterCard.innerHTML = `
      <div class="character-img-container">
        <img src="${character.thumbnail.path}/portrait_uncanny.${character.thumbnail.extension}" alt="" class="character-thumbnail" />
      </div>
      <div class="character-name-container">
        <h3 class="character-name">${character.name}</h3>
      </div>
    `
    $('.results').append(characterCard)
  }
}

const updatePaginationCallback = (callback) => {
  $('.first-page').onclick = () => {
    offset = 0
    callback()
  }

  $('.previous-page').onclick = () => {
    offset -= 20
    if (offset < 0) {
      offset = 0
    }
    callback()
  }

  $('.next-page').onclick = () => {
    offset += 20
    callback()
  }

  $('.last-page').onclick = () => {
    const isExact = resultsCount % 20 === 0
    const pages = Math.floor(resultsCount / 20)
    offset = (isExact ? pages - 1 : pages) * 20
    callback()
  }
}

const updatePagination = () => {
  if (offset === 0) {
    $('.first-page').disabled = true
    $('.previous-page').disabled = true
  } else {
    $('.first-page').disabled = false
    $('.previous-page').disabled = false
  }

  if (offset + 20 >= resultsCount) {
    $('.last-page').disabled = true
    $('.next-page').disabled = true
  } else {
    $('.last-page').disabled = false
    $('.next-page').disabled = false
  }
}

const search = () => {
  showLoader()
  hideDetails()

  if ($('#search-type').value === 'comics') {
    fetchComics()
  }

  if ($('#search-type').value === 'characters') {
    fetchCharacters()
  }

  updateResultsTitle('Resultados')
}

const updateSortDropdown = () => {
  if ($('#search-type').value === 'comics') {
    $('#search-sort').innerHTML = `                  
      <option value="title">A-Z</option>
      <option value="-title">Z-A</option>
      <option value="-focDate">Más nuevos</option>
      <option value="focDate">Más viejos</option>
    `
  }
  if ($('#search-type').value === 'characters') {
    $('#search-sort').innerHTML = `                  
      <option value="name">A-Z</option>
      <option value="-name">Z-A</option>
    `
  }
}

const initialize = () => {
  $('.search-button').onclick = () => {
    search()
    updatePaginationCallback(search)
  }

  $('#search-type').onchange = updateSortDropdown

  updateSortDropdown()
  updatePaginationCallback(search)
  search()
}

window.onload = initialize
