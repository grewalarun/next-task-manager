"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { type Task, getUser } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

function formatCommentDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function TaskComments({ task }: { task: Task }) {
  const [newComment, setNewComment] = useState("")

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Comments ({task.comments.length})
      </h2>

      {/* Comment List */}
      {task.comments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No comments yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Be the first to leave a comment.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {task.comments.map((comment) => {
            const commenter = getUser(comment.userId)
            return (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                    {commenter?.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {commenter?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCommentDate(comment.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1.5 rounded-xl rounded-tl-none bg-muted px-4 py-3">
                    <p className="text-sm text-foreground leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Comment */}
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
            AM
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="rounded-xl"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newComment.trim()) {
                setNewComment("")
              }
            }}
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!newComment.trim()}
            onClick={() => setNewComment("")}
            aria-label="Send comment"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
