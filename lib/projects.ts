import api  from "./api";
import { Project } from "./data";

export const fetchProjects = async (): Promise<Project[]> => {
  const { data } = await api.get("/projects");
  return data;
};

export const fetchProjectDetail = async (
    projectId: string
): Promise<Project> => {
    
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
};

export const createProject = async (projectData: any) => {
  const { data } = await api.post("/projects", projectData);
  return data;
};