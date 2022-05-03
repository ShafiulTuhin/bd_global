function headers(token) {
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
}
export default headers;
