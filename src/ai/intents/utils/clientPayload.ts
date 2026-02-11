type ClientPayload = {
  name: string;
  localName: string;
  address: string;
};

type CreateClientPayload = Partial<ClientPayload>;

export const safeParseClientPayload = (
  value: string
): CreateClientPayload | null => {
  const cleaned = value.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned) as CreateClientPayload;
  } catch {
    return null;
  }
};

export const getMissingClientFields = (payload: CreateClientPayload) => {
  const missing: string[] = [];

  if (!payload.name?.trim()) missing.push("nombre");
  if (!payload.localName?.trim()) missing.push("nombre del local");
  if (!payload.address?.trim()) missing.push("direccion");

  return missing;
};
