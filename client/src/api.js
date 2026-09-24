// every backend call goes thru this one fn
// it sticks the login token on each request so the server knows who we are
const API_URL = "http://localhost:8000";

export async function request(path, method = "GET", body) {
  // build fetch settings -> method + headers (json + token)
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  };
  // if we got data to send, turn it into json text
  if (body) {
    options.body = JSON.stringify(body);
  }
  // call the server n read the json it sends back
  const res = await fetch(API_URL + path, options);
  const data = await res.json();
  // server said error (400/401/403/500) -> throw it so the component can show the msg
  if (!res.ok) {
    throw new Error(data.message);
  }
  // all good, give back the data
  return data;
}
