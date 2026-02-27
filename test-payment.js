import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/payment/initiate', {
      phoneNumber: "0757008434",
      amount: 10,
      type: "LISTING_CREATION"
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("FULL ERROR:", err.message);
    if (err.response) {
      console.error("DATA:", err.response.data);
    }
  }
}

test();
