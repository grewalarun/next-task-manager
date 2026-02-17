export type TaskStatus = "todo" | "in-progress" | "done"
export type Priority = "low" | "medium" | "high" | "urgent"
export type MemberRole = "admin" | "manager" | "member" | "viewer"

export interface User {
  id: string
  name: string
  avatar: string
  initials: string
  email: string
  role: MemberRole
}

export interface Comment {
  id: string
  userId: string
  content: string
  createdAt: string
}

export interface Task {
  _id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  assignedTo: {_id:string, name:string, email:string}
  projectId: string,
  project?:{_id:string, name:string}
  createdAt: string
  dueDate: string
  comments?: { id: string; userId: string; content: string; createdAt: string; }[]
}

export interface Project {
  _id: string
  name: string
  description: string
  createdAt: Date | any
  members: [{  _id: string, name: string, email: string}]
  tasks: string[]
  taskCount: number
}

export interface Comment {
  _id: string,
  task: string,
  text: string,
  createdBy: {_id:string, name: string, email:string},
  createdAt: string,
  updatedAt: string
}


export const users: User[] = [
  { id: "u1", name: "Alex Morgan", avatar: "", initials: "AM", email: "alex@taskflow.io", role: "admin" },
  { id: "u2", name: "Sam Chen", avatar: "", initials: "SC", email: "sam@taskflow.io", role: "manager" },
  { id: "u3", name: "Jordan Lee", avatar: "", initials: "JL", email: "jordan@taskflow.io", role: "member" },
  { id: "u4", name: "Riley Kim", avatar: "", initials: "RK", email: "riley@taskflow.io", role: "member" },
  { id: "u5", name: "Taylor Swift", avatar: "", initials: "TS", email: "taylor@taskflow.io", role: "viewer" },
]

export const tasks: Task[] = [
  {
    _id: "TF-101",
    title: "Design system token updates",
    description: "Update the design system tokens to reflect the new brand guidelines. This includes color palette changes, typography scale adjustments, and spacing refinements across all components.",
    status: "in-progress",
    priority: "high",
    assignedTo: {_id:"sds", name:"u1", email:"a@b.com"},
    projectId: "p1",
    createdAt: "2026-01-15",
    dueDate: "2026-02-20",
    comments: [
      { id: "c1", userId: "u2", content: "I've started on the color tokens. Should we also update the dark mode palette?", createdAt: "2026-01-16T10:30:00" },
          { id: "c2", userId: "u4", content: "I've started on the color tokens. Should we also update the dark mode palette?", createdAt: "2026-01-16T10:30:00" }
      ],
  },
  {
    _id: "TF-102",
    title: "Implement user onboarding flow",
    description: "Create a multi-step onboarding experience for new users including profile setup, team invitation, and workspace configuration.",
    status: "todo",
    priority: "urgent",
    assignedTo: {_id:"sds", name:"u1", email:"a@b.com"},
    projectId: "p1",
    createdAt: "2026-01-18",
    dueDate: "2026-02-25",
    comments: [
      { id: "c4", userId: "u1", content: "Let's make sure this follows the new design patterns.", createdAt: "2026-01-19T14:00:00" },
    ],
  }
]

export const projects: Project[] = [
  {
    _id: "p1",
    name: "TaskFlow Core",
    description: "Core platform features including the task management engine, real-time collaboration, and workspace configuration.",
    createdAt: "2026-01-01",
    members: [{_id: "a", name: "a", email:"ss"}],
    tasks: ["TF-101", "TF-102", "TF-103", "TF-104", "TF-105"],
    taskCount: 0
  },
 
]

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function getTask(id: string): Task | undefined {
  return tasks.find((t) => t._id === id)
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p._id === id)
}

export function getProjectTasks(projectId: string): Task[] {
  return tasks.filter((t) => t.projectId === projectId)
}

export function getTasksByStatus(projectId: string, status: TaskStatus): Task[] {
  return tasks.filter((t) => t.projectId === projectId && t.status === status)
}

export function getProjectMembers(projectId: string): User[] {
  const project = getProject(projectId)
  if (!project) return []
  return project.members.map((id) => getUser(id._id)).filter(Boolean) as User[]
}

// export function getNonProjectMembers(projectId: string): User[] {
//   const project = getProject(projectId)
//   if (!project) return []
//   return users.filter((u) => !project.members.includes(u.id))
// }

export function getAllMembers(): User[] {
  return users
}

export function generateTaskId(projectId: string): string {
  const prefix = projectId === "p1" ? "TF-1" : projectId === "p2" ? "TF-2" : "TF-3"
  const existing = tasks.filter((t) => t.projectId === projectId)
  const nextNum = existing.length + 1
  return `${prefix}0${nextNum}`
}

export const roleLabels: Record<MemberRole, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Member",
  viewer: "Viewer",
}

export const roleDescriptions: Record<MemberRole, string> = {
  admin: "Full access. Can manage members, projects, and all settings.",
  manager: "Can create/edit projects and tasks, and manage team members.",
  member: "Can create and edit tasks within assigned projects.",
  viewer: "Read-only access to projects and tasks.",
}
