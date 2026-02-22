import api from "./api";

import { type Task } from "./data";

// 🔹 Get All Tasks
export const fetchTasks = async (): Promise<Task[]> => {
  const { data } = await api.get("/tasks/me");
  return data;
};

// 🔹 Get Tasks By Project
export const fetchTasksByProject = async (
  projectId: string
): Promise<Task[]> => {
  const { data } = await api.get(`/projects/${projectId}/tasks`);
  return data;
};

// 🔹 Get Task Detail By Project id
export const fetchTasksDetail = async (
  projectId: string,
  taskId: string
): Promise<Task> => {
  const { data } = await api.get(`/projects/${projectId}/tasks/${taskId}`);
  return data;
};


// 🔹 Create Task
export const createTask = async (
  taskData: Partial<Task>,
  projectId: string
): Promise<Task> => {
  const { data } = await api.post(`/projects/${projectId}/tasks`, taskData);
  return data;
};

// 🔹 Update Task
export const updateTask = async (
  id: string,
  taskData: Partial<Task>
): Promise<Task> => {
  const { data } = await api.put(`/tasks/${id}`, taskData);
  return data;
};

// 🔹 Delete Task
export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};