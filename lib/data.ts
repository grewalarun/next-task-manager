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
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  assignee: string
  projectId: string
  createdAt: string
  dueDate: string
  comments: Comment[]
}

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  members: string[]
  tasks: string[]
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
    id: "TF-101",
    title: "Design system token updates",
    description: "Update the design system tokens to reflect the new brand guidelines. This includes color palette changes, typography scale adjustments, and spacing refinements across all components.",
    status: "in-progress",
    priority: "high",
    assignee: "u1",
    projectId: "p1",
    createdAt: "2026-01-15",
    dueDate: "2026-02-20",
    comments: [
      { id: "c1", userId: "u2", content: "I've started on the color tokens. Should we also update the dark mode palette?", createdAt: "2026-01-16T10:30:00" },
      { id: "c2", userId: "u1", content: "Yes, let's do both at the same time to keep them in sync.", createdAt: "2026-01-16T11:15:00" },
      { id: "c3", userId: "u3", content: "I can handle the typography scale if needed.", createdAt: "2026-01-17T09:00:00" },
    ],
  },
  {
    id: "TF-102",
    title: "Implement user onboarding flow",
    description: "Create a multi-step onboarding experience for new users including profile setup, team invitation, and workspace configuration.",
    status: "todo",
    priority: "urgent",
    assignee: "u2",
    projectId: "p1",
    createdAt: "2026-01-18",
    dueDate: "2026-02-25",
    comments: [
      { id: "c4", userId: "u1", content: "Let's make sure this follows the new design patterns.", createdAt: "2026-01-19T14:00:00" },
    ],
  },
  {
    id: "TF-103",
    title: "API rate limiting middleware",
    description: "Implement rate limiting middleware for all public API endpoints to prevent abuse and ensure fair usage across all tenants.",
    status: "done",
    priority: "high",
    assignee: "u3",
    projectId: "p1",
    createdAt: "2026-01-10",
    dueDate: "2026-01-30",
    comments: [],
  },
  {
    id: "TF-104",
    title: "Dashboard analytics widgets",
    description: "Build interactive analytics widgets for the main dashboard showing key metrics like task completion rate, team velocity, and sprint burndown.",
    status: "in-progress",
    priority: "medium",
    assignee: "u4",
    projectId: "p1",
    createdAt: "2026-01-20",
    dueDate: "2026-02-28",
    comments: [
      { id: "c5", userId: "u4", content: "Working on the velocity chart component now.", createdAt: "2026-01-22T16:30:00" },
      { id: "c6", userId: "u1", content: "Looking great! Can we add a date range filter?", createdAt: "2026-01-23T09:00:00" },
    ],
  },
  {
    id: "TF-105",
    title: "Email notification templates",
    description: "Design and implement responsive email templates for task assignments, status changes, and weekly digest notifications.",
    status: "todo",
    priority: "low",
    assignee: "u5",
    projectId: "p1",
    createdAt: "2026-01-25",
    dueDate: "2026-03-05",
    comments: [],
  },
  {
    id: "TF-201",
    title: "Mobile responsive navigation",
    description: "Adapt the main navigation layout for mobile and tablet viewports with a collapsible sidebar and bottom navigation bar.",
    status: "in-progress",
    priority: "high",
    assignee: "u1",
    projectId: "p2",
    createdAt: "2026-01-12",
    dueDate: "2026-02-15",
    comments: [
      { id: "c7", userId: "u3", content: "Should we use a bottom sheet for mobile navigation?", createdAt: "2026-01-14T11:00:00" },
    ],
  },
  {
    id: "TF-202",
    title: "Search and filter system",
    description: "Build a global search system with advanced filtering capabilities for tasks, projects, and team members.",
    status: "todo",
    priority: "medium",
    assignee: "u2",
    projectId: "p2",
    createdAt: "2026-01-22",
    dueDate: "2026-03-01",
    comments: [],
  },
  {
    id: "TF-203",
    title: "Performance audit and optimization",
    description: "Conduct a comprehensive performance audit and implement optimizations for initial load time and runtime performance.",
    status: "done",
    priority: "urgent",
    assignee: "u3",
    projectId: "p2",
    createdAt: "2026-01-05",
    dueDate: "2026-01-25",
    comments: [
      { id: "c8", userId: "u3", content: "Reduced bundle size by 40% and improved LCP by 1.2s.", createdAt: "2026-01-24T17:00:00" },
    ],
  },
  {
    id: "TF-301",
    title: "Billing integration setup",
    description: "Integrate Stripe for subscription billing, including plan management, invoice generation, and payment method handling.",
    status: "todo",
    priority: "high",
    assignee: "u4",
    projectId: "p3",
    createdAt: "2026-02-01",
    dueDate: "2026-03-10",
    comments: [],
  },
  {
    id: "TF-302",
    title: "Team permissions matrix",
    description: "Implement a role-based access control system with customizable permissions for workspace owners, admins, and members.",
    status: "in-progress",
    priority: "urgent",
    assignee: "u5",
    projectId: "p3",
    createdAt: "2026-01-28",
    dueDate: "2026-02-28",
    comments: [
      { id: "c9", userId: "u5", content: "The permission model is designed. Starting implementation today.", createdAt: "2026-01-30T10:00:00" },
      { id: "c10", userId: "u1", content: "Make sure we support custom roles in the future.", createdAt: "2026-01-30T11:30:00" },
    ],
  },
]

export const projects: Project[] = [
  {
    id: "p1",
    name: "TaskFlow Core",
    description: "Core platform features including the task management engine, real-time collaboration, and workspace configuration.",
    createdAt: "2026-01-01",
    members: ["u1", "u2", "u3", "u4", "u5"],
    tasks: ["TF-101", "TF-102", "TF-103", "TF-104", "TF-105"],
  },
  {
    id: "p2",
    name: "Frontend Redesign",
    description: "Complete UI/UX overhaul of the web application with modern design patterns and improved accessibility.",
    createdAt: "2026-01-05",
    members: ["u1", "u2", "u3"],
    tasks: ["TF-201", "TF-202", "TF-203"],
  },
  {
    id: "p3",
    name: "Enterprise Features",
    description: "Building enterprise-grade features including SSO, advanced permissions, audit logs, and billing management.",
    createdAt: "2026-01-20",
    members: ["u4", "u5", "u1"],
    tasks: ["TF-301", "TF-302"],
  },
]

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function getTask(id: string): Task | undefined {
  return tasks.find((t) => t.id === id)
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
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
  return project.members.map((id) => getUser(id)).filter(Boolean) as User[]
}

export function getNonProjectMembers(projectId: string): User[] {
  const project = getProject(projectId)
  if (!project) return []
  return users.filter((u) => !project.members.includes(u.id))
}

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
