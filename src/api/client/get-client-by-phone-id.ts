import { api } from "../../axios/axios-instance.js";
import { Client } from "./client.schema.js";
import { isAxiosError } from "axios";

export default async function getClientByPhoneId(phoneId: string): Promise<Client | null> {
  try {
    const response = await api.get(`/clients/phoneId/${phoneId}`);
    return (response.data as { client: Client }).client;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
