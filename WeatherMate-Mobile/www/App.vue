<template>
  <div id="app">
    <WeatherSearchBar @search="handleSearch"/>
    <WeatherDisplay :weatherData="weatherData"/>
    <FavoritesList :favorites="favorites" @select="handleFavoriteSelect"/>
  </div>
</template>

<script>
import WeatherSearchBar from './components/WeatherSearchBar.vue';
import WeatherDisplay from './components/WeatherDisplay.vue';
import FavoritesList from './components/FavoritesList.vue';

export default {
  name: 'App',
  components: {
    WeatherSearchBar,
    WeatherDisplay,
    FavoritesList
  },
  data() {
    return {
      weatherData: null,
      favorites: this.loadFavorites()
    };
  },
  methods: {
    handleSearch(city) {
      let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.VUE_APP_API_KEY}&units=imperial`;
      fetch(url)
        .then(response => response.json())
        .then(data => {
          this.weatherData = data;
        })
        .catch(error => {
          console.log(error);
        });
    },
    handleFavoriteSelect(city) {
      let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.VUE_APP_API_KEY}&units=imperial`;
      fetch(url)
        .then(response => response.json())
        .then(data => {
          this.weatherData = data;
        })
        .catch(error => {
          console.log(error);
        });
    },
    loadFavorites() {
      let favorites = localStorage.getItem('favorites');
      if (favorites) {
        return JSON.parse(favorites);
      }
      else {
        return [];
      }
    }
  }
};
</script>

<style>
</style>
