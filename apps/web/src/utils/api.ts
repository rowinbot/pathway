import axios from "axios";

export const createAPI = () =>
  axios.create({
    baseURL: "http://192.168.1.37:3001",
    headers: {
      "Content-Type": "application/json",
    },
    validateStatus: () => true, // never throw, it makes axios error handling more cumbersome due to the inability to only catch a specific kind of error in the catch block.
  });

export const ClientAPI = createAPI();
export function setClientAxiosDefaultHeader(header: string, value: string) {
  ClientAPI.defaults.headers.common[header] = value;
}
