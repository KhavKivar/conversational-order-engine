import { isAxiosError } from "axios";
import { api } from "../../axios/axios-instance.js";
import { ClientResponse, CreateClient } from "./client.schema.js";



export default async function createClient(createClientData:CreateClient): Promise<ClientResponse | string> {
    try {
        const new_client = await api.post('/clients', createClientData);
        if(new_client.status === 201){
            return new_client.data as ClientResponse;
        }
        else if(new_client.status === 409){
            return "El cliente ya existe.";
        }
        return "Error al crear el cliente.";
    } catch (error) {
        throw error;
    }
}
