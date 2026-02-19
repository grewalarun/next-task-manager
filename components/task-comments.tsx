"use client"

import { useEffect, useState, useCallback } from "react"
import { MessageCirclePlus, Send } from "lucide-react"
import { type Task, type Comment } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { getInitials } from "@/lib/utils"
import { comment } from "postcss"

function formatCommentDate(dateStr?: string) {
  if (!dateStr) return "Just now"
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return "Just now"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
        {getInitials(comment.createdBy?.name || "User")}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {comment.createdBy?.name || "User"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatCommentDate(comment.createdAt)}
          </span>
        </div>

        <div className="mt-1.5 rounded-xl rounded-tl-none bg-muted px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed">
            {comment.text}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TaskComments({
  task,
  projectId,
}: {
  task: Task
  projectId: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isFetching, setIsFetching] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* ---------------- Fetch Comments ---------------- */
  useEffect(() => {
    if (!task?._id || !projectId) return

    const controller = new AbortController()

    const fetchComments = async () => {
      try {
        setIsFetching(true)

        const res = await api.get<Comment[]>(
          `/projects/${projectId}/tasks/${task._id}/comments`,
          { signal: controller.signal }
        )

        setComments(res.data)
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch comments")
        }
      } finally {
        setIsFetching(false)
      }
    }

    fetchComments()

    return () => controller.abort()
  }, [task?._id, projectId])

  /* ---------------- Add Comment ---------------- */
  const addNewComment = useCallback(async () => {
    const trimmed = newComment.trim()
    if (!trimmed || isSubmitting) return

    try {
      setIsSubmitting(true)

      const res = await api.post<Comment>(
        `/projects/${projectId}/tasks/${task._id}/comments`,
        { text: trimmed }
      )

      setComments((prev) => [...prev, res.data])
      setNewComment("")
    } catch (err) {
      console.error("Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }, [newComment, isSubmitting, projectId, task?._id])

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Comments ({comments.length})
      </h2>

      {/* ✅ Standard Loading State */}
      {isFetching ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading comments...
          </p>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No comments yet
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </div>
      )}

      {/* Add Comment */}
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
           <MessageCirclePlus />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="rounded-xl"
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addNewComment()
              }
            }}
          />

          <Button
            size="icon"
            disabled={!newComment.trim() || isSubmitting}
            onClick={addNewComment}
          >
            {isSubmitting ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
