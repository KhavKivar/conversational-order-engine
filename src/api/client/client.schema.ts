import z from "zod";

export const clientSchema = z.object({
  id: z.number(),
  name: z.string(),
  localName: z.string(),
  address: z.string(),
  phone: z.string(),
  phoneId: z.string(),
});

export type Client = z.infer<typeof clientSchema>;

export const createClientSchema = clientSchema
  .omit({ id: true })
  .partial({phoneId: true});

export type CreateClient = z.infer<typeof createClientSchema>;

export type ClientResponse = { client: Client } 

