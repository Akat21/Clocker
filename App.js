const API_KEY = '565816454eb44f05a8074d3e6a545669'
const API_URL = 'https://api.geoapify.com/v1/geocode/autocomplete?text='
const app = () =>{
    const inputSearch = document.querySelector('.search-bar input')
    const searchDiv = document.querySelector('.autocompletion-container')
    let availableCities = []
    let timeoutId;
    
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
                    return city.properties.city
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
            autocompleteElement.textContent = city
            autocompleteElement.addEventListener('click', ()=>{
                inputSearch.value = city
                while(searchDiv.querySelector('.autocomplete-btn')){
                    searchDiv.removeChild(searchDiv.querySelector('.autocomplete-btn'))
                }
            })
            searchDiv.appendChild(autocompleteElement)
        })
        }, 400); // Delay in milliseconds
      });

}

app()