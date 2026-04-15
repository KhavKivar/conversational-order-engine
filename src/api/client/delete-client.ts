import { api } from "../../axios/axios-instance.js";
import { isAxiosError } from "axios";

export default async function deleteClient(clientId: number): Promise<boolean> {
  try {
    const response = await api.delete(`/clients/${clientId}`);
    return response.status === 200 || response.status === 204;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      console.error("Cliente no encontrado");
      return false;
    }
    throw error;
  }
}
