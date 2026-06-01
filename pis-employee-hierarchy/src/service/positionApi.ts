import api from "../lib/axios";

const BASE_URL = "http://localhost:5000/positions";

interface PositionData {
  name: string;
  description?: string;
  parentId?: string | null;
}

export const getPositions = async () => {
  try {
    const response = await api.get(BASE_URL)
    return response.data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
}
}

export const getPositionById = async (id: string) => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`)
    return response.data;
  } catch (error) {
    console.error('Error fetching position by id:', error);
    throw error;
 }
}
export const getChildren = async (id: string) => {
    try {
    const response = await api.get(`${BASE_URL}/${id}/children`)
    return response.data;
  } catch (error) {
    console.error('Error fetching children:', error);
    throw error;
  }
}

export const createPosition = async (positionData: PositionData) => {
  const { name, description, parentId } = positionData;

  try {
    const response = await api.post(`${BASE_URL}/create`, {
      name,
      description,
      parentId: parentId ?? undefined,
    });
    return response.data;
    } catch (error) {
    console.error('Error creating position');
    throw error;
  }
}

export const updatePosition = async (id: string, positionData: PositionData,) => {
  const { id: _, ...payload } = positionData as any

  try {
  const response = await api.patch(
    `${BASE_URL}/${id}`,
    payload,
  );
  return response.data;
  }catch (error: any) {
  throw new Error(
    error.response?.data?.message ||
    "Failed to update position"
  );
}
};
export const deletePosition = async (id: string) => {
  try {
    const response = await api.delete(`${BASE_URL}/${id}`); 
    return response.data;
  } catch (error) {
    console.error('Error deleting position');
    throw error;
  }
}