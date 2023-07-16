const API_KEY = '565816454eb44f05a8074d3e6a545669'
const API_URL = 'https://api.geoapify.com/v1/geocode/autocomplete?text='
const app = () =>{
    const inputSearch = document.querySelector('.search-bar input')
    const searchDiv = document.querySelector('.autocompletion-container')
    const confirmBtn = document.querySelector('.search-bar button')
    const hour = document.querySelector('.hour h1')
    const minute = document.querySelector('.minute h1')
    const second = document.querySelector('.second h1')
    let availableCities = []
    let timeoutId;
    let utf = 0

    setInterval(()=>{
        let hours = new Date().getHours() - 1 + utf
        hours = hours >= 24 ? hours - 24 : hours 
        hour.textContent = hours.toString().length === 2 ? hours : `0${hours}`
        const minutes = new Date().getMinutes()
        minute.textContent = minutes.toString().length === 2 ? minutes : `0${minutes}` 
        const seconds = new Date().getSeconds()
        second.textContent = seconds.toString().length === 2 ? seconds : `0${seconds}` 
    }, 1000)

    const fetchCities = async(searchText) =>{
        try{
            if (searchText.length > 0){
                const response = await fetch(API_URL + `${searchText}&apiKey=${API_KEY}`)
                if(!response.ok){
                    throw new Error(`HTTP Error! Status: ${response.status}`)
                }
                const data = await response.json()

                //Delete Previous Elements
                while(searchDiv.querySelector('.autocomplete-btn')){
                    searchDiv.removeChild(searchDiv.querySelector('.autocomplete-btn'))
                }

                //Fetch New Data
                availableCities = [...new Set(data.features.map((city) =>{
                    return {city: city.properties.city, timezone: city.properties.timezone.offset_STD, code: city.properties.country_code}
                }).filter(city => city !== undefined).slice(0,4))]
                
                const event = new CustomEvent('citiesChanged');
                document.dispatchEvent(event);
            } else {
                availableCities = []
                while(searchDiv.querySelector('.autocomplete-btn')){
                    searchDiv.removeChild(searchDiv.querySelector('.autocomplete-btn'))
                }
            }
        } catch(err) {
            console.log(err)
        }
    }

    //Autocompletion eventListener
    inputSearch.addEventListener('input', function () {
        clearTimeout(timeoutId);

        //Set delay after providing the letters
        timeoutId = setTimeout(async () => {
          const searchText = inputSearch.value.toLowerCase();
          await fetchCities(searchText);

          //Print results on the Screen
          availableCities.forEach(city =>{
            const autocompleteElement = document.createElement('button')
            autocompleteElement.classList.add('autocomplete-btn')
            autocompleteElement.textContent = `${city.city}, ${city.code.toUpperCase()}`
            autocompleteElement.addEventListener('click', ()=>{
                inputSearch.value = city.city
                while(searchDiv.querySelector('.autocomplete-btn')){
                    searchDiv.removeChild(searchDiv.querySelector('.autocomplete-btn'))
                }
            })
            searchDiv.appendChild(autocompleteElement)
        })
        }, 400); // Delay in milliseconds
      });

      confirmBtn.addEventListener('click', async function(){
        const title = document.querySelectorAll('.header-container h1')
        await fetchCities(inputSearch.value)

        if (availableCities.length > 0){
            const cityObj = availableCities.filter(city => city.city.toLowerCase() === inputSearch.value.toLowerCase())
            console.log(cityObj)
            title[1].textContent = cityObj[0].city
            utf = parseInt(cityObj[0].timezone.slice(0,3))
            availableCities = []
            inputSearch.value = ""
        } else {

        }
      })

}

app()