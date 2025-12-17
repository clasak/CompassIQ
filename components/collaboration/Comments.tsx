'use client'

import { useState } from 'react'
import { MessageSquare, Send, MoreHorizontal, Edit2, Trash2, Reply, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
  createdAt: Date
  updatedAt?: Date
  parentId?: string
  replies?: Comment[]
  mentions?: string[]
  resolved?: boolean
}

interface CommentsProps {
  /** Array of comments */
  comments: Comment[]
  /** Current user info */
  currentUser: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
  /** Entity being commented on (e.g., 'kpi', 'chart', 'dashboard') */
  entityType?: string
  /** Entity ID */
  entityId?: string
  /** Handler for adding a comment */
  onAddComment?: (content: string, parentId?: string) => void
  /** Handler for editing a comment */
  onEditComment?: (id: string, content: string) => void
  /** Handler for deleting a comment */
  onDeleteComment?: (id: string) => void
  /** Handler for resolving a comment thread */
  onResolve?: (id: string) => void
  /** Available users for mentions */
  mentionableUsers?: Array<{ id: string; name: string; email: string }>
  /** Custom class name */
  className?: string
}

export function Comments({
  comments,
  currentUser,
  entityType,
  entityId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onResolve,
  mentionableUsers = [],
  className,
}: CommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleSubmit = (parentId?: string) => {
    const content = parentId ? newComment : newComment
    if (!content.trim()) return

    onAddComment?.(content.trim(), parentId)
    setNewComment('')
    setReplyingTo(null)
  }

  const handleEdit = (id: string) => {
    if (!editContent.trim()) return
    onEditComment?.(id, editContent.trim())
    setEditingId(null)
    setEditContent('')
  }

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isOwn = comment.author.id === currentUser.id
    const isEditing = editingId === comment.id

    return (
      <div className={cn('group', isReply && 'ml-10')}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.avatarUrl} />
            <AvatarFallback className="text-xs">
              {getInitials(comment.author.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.updatedAt && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
              {comment.resolved && (
                <Badge variant="secondary" className="text-xs">Resolved</Badge>
              )}
            </div>

            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="min-h-[60px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(comment.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null)
                      setEditContent('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
            )}

            {!isEditing && (
              <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}

                {isOwn && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => startEdit(comment)}>
                        <Edit2 className="h-3 w-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteComment?.(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {!isReply && !comment.resolved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => onResolve?.(comment.id)}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            )}

            {/* Reply input */}
            {replyingTo === comment.id && (
              <div className="mt-3 flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-[60px] flex-1"
                  autoFocus
                />
                <div className="flex flex-col gap-1">
                  <Button size="sm" onClick={() => handleSubmit(comment.id)}>
                    <Send className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyingTo(null)
                      setNewComment('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map(reply => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Comment input */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentUser.avatarUrl} />
          <AvatarFallback className="text-xs">
            {getInitials(currentUser.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={() => handleSubmit()}
              disabled={!newComment.trim()}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-4 pt-4 border-t">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No comments yet</p>
          <p className="text-sm">Be the first to add a comment</p>
        </div>
      )}
    </div>
  )
}

/**
 * Comment button with popover
 */
interface CommentButtonProps {
  /** Number of comments */
  count?: number
  /** Comments content */
  children: React.ReactNode
  /** Custom class name */
  className?: string
}

export function CommentButton({ count = 0, children, className }: CommentButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('gap-1', className)}>
          <MessageSquare className="h-4 w-4" />
          {count > 0 && <span>{count}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="end">
        {children}
      </PopoverContent>
    </Popover>
  )
}
