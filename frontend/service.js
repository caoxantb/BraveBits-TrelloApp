const baseBoardURL = "http://localhost:3001/api/boards";
const baseListURL = "http://localhost:3001/api/lists";
const baseTaskURL = "http://localhost:3001/api/tasks";

const getBoard = async () => {
  const response = await axios.get(`${baseBoardURL}/todoboard`);
  return response.data;
};

const updateBoard = async (updatedBoard) => {
  console.log(updatedBoard);
  await axios.put(`${baseBoardURL}/todoboard`, updatedBoard);
  console.log("uyes");
};

const getListById = async (id) => {
  const response = await axios.get(`${baseListURL}/todoboard/${id}`);
  return response.data;
};

const postList = async (newList) => {
  const response = await axios.post(`${baseListURL}/todoboard`, newList);
  return response.data;
};

const updateListById = async (updatedList) => {
  console.log(">>>", updatedList);
  await axios.put(`${baseListURL}/todoboard/${updatedList.id}`, updatedList);
};

const deleteListById = async (listToDeleteId) => {
  await axios.delete(`${baseListURL}/todoboard/${listToDeleteId}`);
};

const getTaskById = async (listId, taskId) => {
  const response = await axios.get(`${baseTaskURL}/${listId}/${taskId}`);
  return response.data;
};

const postTaskToOneList = async (listId, newTask) => {
  const response = await axios.post(`${baseTaskURL}/${listId}`, newTask);
  return response.data;
};

const updateCheckedStatus = async (listId, updatedTask) => {
  console.log(updatedTask);
  await axios.put(`${baseTaskURL}/${listId}/${updatedTask.id}`, updatedTask);
};

const deleteTaskFromOneList = async (listId, taskToDeleteId) => {
  await axios.delete(`${baseTaskURL}/${listId}/${taskToDeleteId}`);
};
