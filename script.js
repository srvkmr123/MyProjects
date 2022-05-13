
let $input= document.getElementById('search-input')
let temp= document.getElementById('temp')
let weatherIcon= document.getElementById('weather-icon')
let weather= document.getElementById('weather-cond')
let $btn= document.getElementById('search-btn')
let humidity= document.getElementById('humidity-perc')
let wind= document.getElementById('wind-speed')
let leftBottom= document.getElementById('left-bottom')
let locBtn= document.getElementById('location-btn')
let lbs1= document.getElementById('left-bottom-s1')
let lbs2= document.getElementById('left-bottom-s2')

$input.value='london'

$input.focus()

const fetchUserLocation= (e)=>{
    e.preventDefault();
    if(window.navigator.geolocation){
        window.navigator.geolocation.getCurrentPosition(async(position,error)=>{
            if(error){
               alert('user has denied Geolocation !!')
            }
            else
              {
                  console.log(position.coords.latitude)
                  let  place= await fetchCityName({lat:position.coords.latitude,lon:position.coords.longitude})
                 
                  $input.value=`${place.city} , ${place.country}`
              }
        })
    }
}

locBtn.addEventListener('click',fetchUserLocation)

$btn.addEventListener('click',async (e)=>{
    e.preventDefault();
   try{
    let city= $input.value
    let {lat,lon}= await fetchLongAndLat(city)
    document.getElementById('current-city').style.backgroundColor='green'
    document.getElementById('current').innerText=city
    
    plotChart(lat,lon)
    
    let data= await fetchData({lat,lon})
    $input.value=""
    lbs1.style.color='white'
    lbs2.style.color='white'
    // console.log(data.temp,data.weather,data.icon)
    let weatherIconUrl=`http://openweathermap.org/img/w/${data.icon}.png`
    data.temp= (data.temp-273.15).toFixed(2)
    temp.innerText=data.temp+' \u00B0c'
    weather.innerText=data.weather
    weatherIcon.src=weatherIconUrl
    humidity.innerText= data.humidity+'%'
    wind.innerText= data.wind+'km/hr'
   }
    catch(err){
      document.getElementById('current').innerText='Cant find this city !!'
      document.getElementById('current-city').style.backgroundColor='#e3103a'
    }

})

const fetchLongAndLat=(city)=>(
   
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=3f5ce8a2ab3c86904ab64de2d31168c7`)
    .then(res=>res.json())  //here the response returned by api is converted into json() and then again passed on as data ..using promise chaining.
    .then(data=>{
       console.log(data)
      return {'lat':data[0].lat,'lon':data[0].lon}  
    })
    .catch(err=>console.log(err))
)

const fetchData=({lat,lon})=>(
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=3f5ce8a2ab3c86904ab64de2d31168c7`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data)
        
        return {
            'temp':data.main.temp,
            'weather': data.weather[0].main,
            'humidity': data.main.humidity,
            'wind': data.wind.speed,
            'icon': data.weather[0].icon
        }
    })
    .catch(err=>console.log(err))
)

const fetchCityName=({lat,lon})=>(

    fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=3f5ce8a2ab3c86904ab64de2d31168c7`)
    .then(res=>res.json())
    .then(data=>{
         console.log(data[0])
         console.log(data[0].name,data[0].country)
        return {
                city: data[0].name,
                country: data[0].country
        }
    })
    .catch(err=>console.log(err))
)

const plotChart=async(lat,lon)=>{
    console.log('plot chart')
   
      
       
    let xyValues = await fetchForecast(lat,lon)
    
      new Chart("myChart", {
        type: "scatter",
        data: {
          datasets: [{
            pointRadius: 4,
            pointBackgroundColor: "rgb(0,255,255)",
            data: xyValues
          }]
        },
        options: {
          legend: {display: false},
          scales: {
            xAxes: [{ticks: {min: 0, max:4}}],
            yAxes: [{ticks: {min:xyValues[0].y-30, max:xyValues[0].y+30}}],
          }
        }
      });
}


const fetchForecast=(lat,lon)=>(
    fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=3f5ce8a2ab3c86904ab64de2d31168c7`)
    .then(res=>res.json())
    .then(data=>{
       //console.log('forecast: ',data.list)
       return [
           {x:0,y:(data.list[0].main.temp-273.15)},
           {x:1,y:(data.list[7].main.temp-273.15)},
           {x:2,y:(data.list[14].main.temp-273.15)},
           {x:3,y:(data.list[21].main.temp-273.15)},
           {x:4,y:(data.list[28].main.temp-273.15)},
       ]
    })
    .catch(err=>console.log(err))
)