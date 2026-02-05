const fetch = require("node-fetch");

// ⚠️ YAHAN APNI REAL API KEY PASTE KARO
const API_KEY = "AIzaSyDyGIoQKAkXwyQoaitxuY6eeo6AFjhYfOQ";

const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log("RESPONSE FROM GOOGLE:");
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => console.error("ERROR:", err));
