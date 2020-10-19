// Init Variables
var apiKey = "5f3a536ffcbefd25650f04ba24f777f8"
var dateArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var localClock;
var citySearchEl;
var searchStoreEl;
var previousSearch;


// Run on start
$(document).ready(function () {

  // Call function to create searched history list
  createSearchList();

  // If searched history is not empty return last searched item
  if (previousSearch == null) {
  }
  else {
    citySearchEl = previousSearch
    startSearch();
  }

  
  
});

// When search button is clicked ensures first letter is uppercase and begins search
$("#searchButton").click(function () {
  
  cityEntered = $("#citySearchInput").val()
console.log(cityEntered.length);
  if (cityEntered.length != 0){
  citySearchEl = cityEntered.charAt(0).toUpperCase() + cityEntered.slice(1);
  previousSearch = citySearchEl;
  $("#cityValidation").hide()
  if (searchStoreEl.includes(citySearchEl) == false) {
    searchStoreEl.push(citySearchEl);
  }

  saveSearchTerm();
  createSearchList();
  startSearch();
  $("#citySearchInput").val("");
}
else {
  $("#cityValidation").show()
}
});

// When item in the search history is clicked it begins search
document.getElementById("searchHistoryDD").addEventListener("click", function (result) {
  citySearchEl = result.target.innerText;
  previousSearch = citySearchEl;
  startSearch()
});



// Function called to start search for weather results from openweather API
function startSearch() {

  var queryURL1 = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearchEl + "&appid=" + apiKey;

  // Gets searached cities longitude and latitude
  $.ajax({
    url: queryURL1,
    method: "GET"
  }).then(function (output) {

    var cityLat = output.coord.lat;
    var cityLon = output.coord.lon;
    var queryURL2 = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityLat + "&lon=" + cityLon + "&exclude=minutely,hourly&appid=" + apiKey;

    // Uses returned lat and long to find weather results
    $.ajax({
      url: queryURL2,
      method: "GET"
    }).then(function (forecast) {

      // Clears all fields
      clearInterval(localClock);
      $("#cityTimeId").empty()
      $("#cityNameId").empty()
      $("#fiveDayForecast").empty()
      $('#todayWeatherResult').empty();

console.log(forecast);
      // Variables used to create current weather for searched city
      var timezoneEl = forecast.timezone;
      var wCurrentIcon = "<img class=bg-white src=http://openweathermap.org/img/wn/" + forecast.current.weather[0].icon + "@2x.png alt=WeatherLogo/>"
      var tempCurrentKelvin = forecast.current.temp;
      var tempCurrentCelsuis = Math.floor(tempCurrentKelvin - 273) + "&#8451;";
      var wCurrentDes = forecast.current.weather[0].description;
      var humidityCurrent = forecast.current.humidity + "%";
      var windSpeedCurrentMPS = forecast.current.wind_speed;
      var windSpeedCurrentKPH = Math.floor(windSpeedCurrentMPS * 3600 / 1610.3 * 100) / 100 + " km/h";
      var uvCurrent = forecast.current.uvi;
      var todayPush = "<h4>Current</h4>" + wCurrentIcon + "<h5>" + tempCurrentCelsuis + "</h5></br><h6>" + wCurrentDes + "</h6></br><p>Wind: " + windSpeedCurrentKPH + "    |   Humidity: " + humidityCurrent + "</p><p id=todayUVId >UV: " + uvCurrent + "</p>"


      // Loop to create 5 day forecast
      for (var i = 1; i < 6; i++) {

        // Empties the forecast column 
        $("#d" + i + "WeatherResult").empty();

        // Variables used to create 5 day forecast for search ciy
        var formattedDateEl = moment.unix(forecast.daily[i].dt).utc().format("ddd");
        var weathericonEl = "<img class=bg-white src=http://openweathermap.org/img/wn/" + forecast.daily[i].weather[0].icon + "@2x.png alt=WeatherLogo/>"
        var tempTodayKelvin = forecast.daily[i].temp.day;
        var tempTodayCelsuis = Math.floor(tempTodayKelvin - 273) + "&#8451;";
        var wTodayDes = forecast.daily[i].weather[0].description;
        var humidityToday = forecast.daily[i].humidity + "%";
        var windSpeedTodayMPS = forecast.daily[i].wind_speed;
        var windSpeedTodayKPH = Math.floor(windSpeedTodayMPS * 3600 / 1610.3 * 100) / 100 + " km/h";
        var uv = forecast.daily[i].uvi;
        var Push = "<h4>" + formattedDateEl + "</h4>" + weathericonEl + "<h5>" + tempTodayCelsuis + "</h5></br><h6>" + wTodayDes + "</h6></br><p>Wind: " + windSpeedTodayKPH + "</p><p>Humidity: " + humidityToday + "</p><p id=UVId" + i + " >UV: " + uv + "</p>"

        // Pushes results to html for each day
        $("#d" + i + "WeatherResult").append(Push);

        // Class added to UV result to add background color showing favourable, moderate or severe
        if (uv < 4) {
          $("#UVId" + i).addClass("greenUV")
        }
        else if (uv > 3 && uv < 8) {
          $("#UVId" + i).addClass("orangeUV")
        }
        else if (uv > 7) {
          $("#UVId" + i).addClass("redUV")
        }
      }


      $("#cityNameId").append(citySearchEl)
      $("#fiveDayForecast").append("<h2>5 DAY FORECAST</h2>")
      $('#todayWeatherResult').append(todayPush);
      $("#resultsBox").css("display", "block");

      // Class added to UV result to add background color showing favourable, moderate or severe
      if (uvCurrent < 4) {
        $("#todayUVId").addClass("greenUV")
      }
      else if (uvCurrent > 3 && uv < 8) {
        $("#todayUVId").addClass("orangeUV")
      }
      else if (uvCurrent > 7) {
        $("#todayUVId").addClass("redUV")
      }

      // Creates ticking clock and displays the local time of the searched city
      localClock = setInterval(myTimer, 1000);
      function myTimer() {
        var currenttime = moment().tz(timezoneEl).format("LLLL");
        $("#cityTimeId").html(currenttime)
      }

    });

  })
};

// Saves searched city to the local storage
function saveSearchTerm() {
  localStorage.setItem("Cities", JSON.stringify(searchStoreEl));
  localStorage.setItem("Previous_City", JSON.stringify(previousSearch));
}

// Creates array with returned results from local storage
function createSearchList() {
  searchStoreEl = JSON.parse(localStorage.getItem("Cities")) || [];
  sortedSearches = searchStoreEl.sort();
  previousSearch = JSON.parse(localStorage.getItem("Previous_City"));
  $("#searchHistoryDD").empty();

  //Create a new li for each highscore entry
  for (var i = 0; i < searchStoreEl.length; i++) {
    var cityNameEl = sortedSearches[i];
    var li = document.createElement("li");
    li.className = "dropdown-item"
    li.textContent = cityNameEl;
    $("#searchHistoryDD").append(li)
  }

}


