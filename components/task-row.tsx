"use client"

import Link from "next/link"
import { Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { useState } from "react"

import { type Task } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

import { getInitials } from "@/lib/utils"

interface Props {
  task: Task
  project: string
  onDeleted: (taskId: string) => void
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  todo: {
    label: "Todo",
    className: "bg-muted text-muted-foreground",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-accent/15 text-accent",
  },
  done: {
    label: "Done",
    className: "bg-primary/15 text-primary",
  },
}

export function TaskRow({ task, project, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false)

  const status = statusConfig[task.status] ?? {
    label: task.status,
    className: "bg-muted text-muted-foreground",
  }

  const handleDeleteClick = async () => {
    try {
      setDeleting(true)
      await onDeleted(task._id)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="group grid grid-cols-1 items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md md:grid-cols-[1fr_160px_120px_100px] md:px-5">
      
      {/* Task Info */}
      <Link
        href={`/projects/${project}/tasks/${task._id}`}
        className="min-w-0"
      >
        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
          {task.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
          {task.description}
        </p>
      </Link>

      {/* Assigned To */}
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
            {task.assignedTo?.name
              ? getInitials(task.assignedTo.name)
              : "NA"}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-foreground">
          {task.assignedTo&&<Link href={`/user/${task.assignedTo?._id}`}>{task.assignedTo?.name || "Unassigned"}</Link>}
        </span>
      </div>

      {/* Status */}
      <div>
        <Badge
          className={`${status.className} border-0 text-[11px] font-medium`}
        >
          {status.label}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        
        {/* Edit */}
        <Link href={`/projects/${project}/tasks/${task._id}/edit`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </Link>

        {/* Delete with Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={deleting}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete Task?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete{" "}
                <span className="font-medium">{task.title}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleDeleteClick}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Move to project</DropdownMenuItem>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
