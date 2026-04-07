const axios = require('axios');

async function testApi() {
  try {
    console.log("Hitting /api/events/feed...");
    const response = await axios.get('http://localhost:3000/api/events/feed');
    console.log("Success! Status:", response.status);
    console.log("Response data length:", response.data.length);
  } catch (error) {
    console.error("Failed! Status:", error.response?.status);
    console.error("Message:", error.response?.data);
    if (error.response?.data?.error) {
       console.error("Full Error:", JSON.stringify(error.response.data.error, null, 2));
    }
  }
}

testApi();
