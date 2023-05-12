const Selected_country = document.getElementById("country");
const Selected_city = document.getElementById("city");
const H_D = document.getElementById("holidays");
const information_queryed = document.getElementById("query-info");
const Country_Queried = document.getElementById("query-country");
const City_Queried = document.getElementById("query-city");
const Holiday_Queried = document.getElementById("query-holiday");

const Area_id = {
  'New York': 2621,
  'Los Angeles': 2011,
  'Busan':602043,
  'Seoul':3124,
  'Daegu':603023,
  'Sapporo':3250,
  'Chicago': 829,
  'Beijing': 597,
  'Wuhan': 3835,
  'Shanghai': 3145,
  'Changsha': 922,
  'Toronto': 4089,
  'Vancouver': 4106,
  'Montreal': 4005,
  'Tokyo':3593,
  'Osaka':2697,
};

const Name_of_city = {
  CN: ["Beijing", "Shanghai", "Changsha","Wuhan"],
  US: [ "Chicago","Los Angeles","New York"],
  JP: ["Tokyo","Osaka","Sapporo"],
  KR:["Busan","Seoul","Daegu"]
};




function query() {
  const ID_of_city = City_Queried.textContent;
  const Day = Holiday_Queried.textContent;
  if (ID_of_city === "") {
    forecast_list.style.display = "none";
    weatherTitle.style.display = "none";
    flag1 =1;
  } else {
    search_info_weather(ID_of_city,Day);
    search_info_Hotel(ID_of_city,Day);
    flag1 =2;
  }
}

Selected_country.addEventListener("change", async function () {
  const country_id = Selected_country.value;
  Selected_city.innerHTML = '<option value="">City</option>';
  Selected_city.disabled = country_id === "";
  if (country_id !== "") {
    Name_of_city[country_id].forEach(city => {
      const selection = document.createElement("option");
      selection.value = city;
      selection.text = city;
      Selected_city.add(selection);
    });
  }
  if (country_id === "") {
    H_D.style.display = "none";
  } else {
    const url = `https://public-holiday.p.rapidapi.com/2023/${country_id}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'cece01afd0mshbeb6459b4e35a9dp1a98dajsn9147361270d3',
        'X-RapidAPI-Host': 'public-holiday.p.rapidapi.com'
      }
    };
    try {
      const response1 = await fetch(url, options);
      const vacation_day = await response1.json();
      let HTML_of_holiday = "";
      vacation_day.forEach(function (Vacation, index) {
        HTML_of_holiday += `<div><input type="radio" name="holiday" id="holiday-${index}" value="${Vacation.date} - ${Vacation.name}"><label for="holiday-${index}">${Vacation.date} - ${Vacation.name}</label></div>`;
      });
      H_D.innerHTML = HTML_of_holiday;

      H_D.style.display = "block";
    } catch (error) {
      console.error(error);
    }
  }
});

H_D.addEventListener("change", function (event) {
  if (event.target.name === "holiday") {
    Country_Queried.textContent = Selected_country.options[Selected_country.selectedIndex].text;
    City_Queried.textContent = Selected_city.value;
    Holiday_Queried.textContent = event.target.value.slice(0, 10);
    information_queryed.style.display = "block";
  }
});



async function search_info_weather(city,date) {
  const selected_day = new Date(date);
  const today = new Date();
  const differenceInDays = Math.floor((selected_day - today) / (1000 * 60 * 60 * 24));

  if (differenceInDays > 15) {
    const forecast_list = document.getElementById("weather");
    forecast_list.innerHTML = "More than 15 days from that day, can not predict the weather on that day";
    forecast_list.style.display = "block";
    return;
  }
  if (differenceInDays < 0) {
    const forecast_list = document.getElementById("weather");
    forecast_list.innerHTML = "You would be better to choose a holiday after today";
    forecast_list.style.display = "block";
    return;
  }


  const url = `https://forecast9.p.rapidapi.com/rapidapi/forecast/${city}/summary/`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'cece01afd0mshbeb6459b4e35a9dp1a98dajsn9147361270d3',
      'X-RapidAPI-Host': 'forecast9.p.rapidapi.com'
    }
  };
  try {
    const response1 = await fetch(url, options);
    const response2 = await response1.json();
    const weatherData = response2.forecast.items[differenceInDays];

   

    const weatherHtml = `<li>${weatherData.date}: ${weatherData.weather.text} - Minimum temperature: ${weatherData.temperature.min}°C - Maximum temperature: ${weatherData.temperature.max}°C</li>`;

    const forecast_list = document.getElementById("weather");
    forecast_list.innerHTML = weatherHtml;
    document.getElementById("weatherTitle").style.display = "block";
    forecast_list.style.display = "block";
  } catch (error) {
    console.error(error);
  }
}

function displayHotelInfo(hotel) {
  const { name, availability, destinationInfo, price, reviews, star } = hotel;
  const { minRoomsLeft } = availability;
  const { distanceFromDestination } = destinationInfo;
  const { value, unit } = distanceFromDestination;
  const { lead, displayMessages } = price;
  const { formatted } = lead;
  const totalPrice = displayMessages[1].lineItems[0].value;
  const { score, total } = reviews;

  const hotelInfo = `
    <div class="hotel">
      <h2 class="hotel-name">${name}</h2>
      <div class="hotel-image">
        <img src="${hotel.propertyImage.image.url}" alt="${hotel.propertyImage.image.description}" width="200">
      </div>
      <div class="hotel-info">
        <p class="rooms-available">Available rooms: ${minRoomsLeft}</p>
        <p class="destination-distance">Distance from destination: ${value} ${unit}</p>
        <p class="nightly-price">Price per night: ${formatted}</p>
        <p class="total-price">Total price: ${totalPrice}</p>
        <p class="review-score">Review score: ${score} (${total} reviews)</p>
        <p class="star-rating">Star rating: ${star} stars</p>
      </div>
    </div>
    <hr>
  `;
  
  return hotelInfo;
}

async function search_info_Hotel(city,date) {
  const area_id = Area_id[city];
  const selected_day = new Date(date);
  const next_day = new Date(date);
  next_day.setDate(next_day.getDate() + 1);
  const checkinDate = selected_day.toISOString().split('T')[0];;
  const checkoutDate = next_day.toISOString().split('T')[0];

  const currentDate =  new Date();
  if(selected_day.getTime() <= currentDate.getTime()){
    const hotelsList = document.getElementById('hotels-list');
    hotelsList.innerHTML = "You need to choose a date after today";
    hotelsList.style.display = "block";
    return;
  }
  const url = `https://hotels-com-provider.p.rapidapi.com/v2/hotels/search?checkin_date=${checkinDate}&adults_number=1&region_id=${area_id}&checkout_date=${checkoutDate}&locale=en_GB&sort_order=REVIEW&domain=AE&star_rating_ids=3%2C4%2C5&payment_type=PAY_LATER%2CFREE_CANCELLATION&lodging_type=HOTEL%2CHOSTEL%2CAPART_HOTEL&price_max=500&amenities=WIFI%2CPARKING&children_ages=4%2C0%2C15&page_number=1&price_min=10&guest_rating_min=8&meal_plan=FREE_BREAKFAST&available_filter=SHOW_AVAILABLE_ONLY`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'cece01afd0mshbeb6459b4e35a9dp1a98dajsn9147361270d3',
      'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
    }
  };
  try {
    const response1 = await fetch(url, options);
    const response2 = await response1.json();
    const hotelsData = response2.properties.slice(0, 10); // 
    const hotelsList = document.getElementById('hotels-list');
    hotelsList.innerHTML = hotelsData.map(displayHotelInfo).join('');
    hotelsList.style.display = "block";
  } catch (error) {
    console.error(error);
  }
}
