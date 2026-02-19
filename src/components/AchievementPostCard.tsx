import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Card, CardTitle, CardContent } from './ui/card'
import { createComment, deletePost as apiDeletePost, getPostComments, likePost, unlikePost, deleteComment as apiDeleteComment, type AchievementCommentDto, type AchievementPostDto } from '@/lib/api/achievement'
import { moderateDeletePost, moderateDeleteComment, type ModerationRequest } from '@/lib/api/achievement'
import { Heart, Trash2, MessageSquare } from 'lucide-react'
import { FcLike } from "react-icons/fc";
import { useEffect, useState } from 'react'
import { useUserRole } from '@/lib/redux/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { toast } from 'sonner'


interface AchievementPostCardProps {
    post: AchievementPostDto
    isAuthor: boolean
    onEdit?: (post: AchievementPostDto) => void
    onDeleted?: (postId: number) => void
    showAuthorControls?: boolean
}

function AchievementPostCard({ post, isAuthor, onEdit, onDeleted, showAuthorControls }: AchievementPostCardProps) {

    const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [comment, setComment] = useState('');
    const [postComments, setPostComments] = useState<AchievementCommentDto[]>([]);
    const [showComments, setShowComments] = useState(false);
    const userRole = useUserRole()
    const isHR = userRole === 'HR'

    const [isPostModalOpen, setIsPostModalOpen] = useState(false)
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)
    const UnlikeButton = async (postId: number) => {
        try {
            await unlikePost(postId);
            setIsLiked(false);
            setLikeCount((prevCount) => prevCount - 1);
        } catch (error) {
            console.log("Error unliking the post:", error);
        }
    }

    const likeButton = async (postId: number) => {
        try {
            await likePost(postId);
            setIsLiked(true);
            setLikeCount((prevCount) => prevCount + 1);
        } catch (error) {
            console.error("Error liking the post:", error);
        }
    }

    const AddComment = async () => {
        try {
            const response = await createComment({
                postId: post.postId,
                text: comment
            });
            setPostComments((prevComments) => [...prevComments, response]);
            toast.success("Comment added successfully!");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
        finally {
            setComment('');
        }

    }

    const handleDeleteComment = async (commentId: number) => {
        try {
            await apiDeleteComment(commentId);
            setPostComments((prevComments) => prevComments.filter(comment => comment.commentId !== commentId));
            toast.success("Comment deleted successfully!");
        }
        catch (error) {
            console.error("Error deleting the comment:", error);
        }
    }


    useEffect(() => {
        const getAllComments = async () => {
            try {
                const response = await getPostComments(post.postId);
                setPostComments(response);
            }
            catch (error) {
                console.error("Error fetching comments:", error);
            }
        }
        getAllComments();
    }, [post.postId])


    const DeletePostClick = async (postId: number) => {
        try {
            await apiDeletePost(postId);
            toast.success("Post deleted successfully!");
            onDeleted?.(postId)
        } catch (error) {
            console.error("Error deleting the post:", error);
        }
    }

    const openHrPostDelete = () => {
        setReason('')
        setIsPostModalOpen(true)
    }

    const confirmHrPostDelete = async () => {
        try {
            const req: ModerationRequest = { moderationTypeId: 1, reason }
            await moderateDeletePost(post.postId, req)
            toast.success('Post deleted by HR')
            setIsPostModalOpen(false)
            onDeleted?.(post.postId)
        } catch (error) {
            console.error('Error moderating delete post', error)
        }
    }

    const openHrCommentDelete = (commentId: number) => {
        setSelectedCommentId(commentId)
        setReason('')
        setIsCommentModalOpen(true)
    }

    const confirmHrCommentDelete = async () => {
        if (selectedCommentId == null) return
        try {
            const req: ModerationRequest = { moderationTypeId: 2, reason }
            await moderateDeleteComment(selectedCommentId, req)
            setPostComments((prev) => prev.filter(c => c.commentId !== selectedCommentId))
            toast.success('Comment deleted by HR')
            setIsCommentModalOpen(false)
            setSelectedCommentId(null)
        } catch (error) {
            console.error('Error moderating delete comment', error)
        }
    }

    return (
        <>
            <Card className={cn('border bg-white/90 shadow-sm hover:shadow-md transition')}>
                <CardContent className={cn('p-4')}>
                    <div className={cn('flex items-start justify-between gap-3')}>
                        <div className={cn('flex items-center gap-3')}>
                            <div className={cn('w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-800')}>
                                {post.author.firstName?.charAt(0) ?? ''}{post.author.lastName?.charAt(0) ?? ''}
                            </div>
                            <div>
                                <div className={cn('text-sm font-semibold text-foreground')}>{post.author.firstName} {post.author.lastName}</div>
                                <div className={cn('text-xs text-muted-foreground')}>{new Date(post.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className={cn('flex items-center gap-2')}>
                            {post.isSystemGenerated && (<span className={cn('text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700 border')}>System</span>)}
                        </div>
                    </div>

                    <div className={cn('mt-3')}>
                        <CardTitle className={cn('text-md font-semibold text-foreground')}>{post.title}</CardTitle>
                        <p className={cn('mt-2 text-sm text-muted-foreground max-h-16 overflow-hidden')}>{post.description || 'No description'}</p>
                    </div>

                    <div className={cn('mt-4 flex items-center justify-between')}>
                        <div className={cn('flex items-center gap-3')}>
                            <Button variant='ghost' size='sm' onClick={() => isLiked ? UnlikeButton(post.postId) : likeButton(post.postId)} aria-label='Like'>
                                {isLiked ? <FcLike size={18} /> : <Heart size={18} color='#ef4444' />}
                            </Button>
                            <span className={cn('text-sm text-muted-foreground')}>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                            <Button variant='ghost' size='sm' onClick={() => setShowComments((s) => !s)} aria-label='Toggle comments'>
                                <div className={cn('flex items-center gap-1')}>
                                    <MessageSquare size={16} className={cn('text-muted-foreground')} />
                                    <span className={cn('text-sm text-muted-foreground')}>{post.commentCount}</span>
                                </div>
                            </Button>
                        </div>
                        <div className={cn('flex items-center gap-2')}>
                            {isAuthor && showAuthorControls && (
                                <>
                                    <Button variant='outline' size='sm' onClick={() => onEdit?.(post)}>Edit</Button>
                                    <Button variant='destructive' size='sm' onClick={() => DeletePostClick(post.postId)}>Delete</Button>
                                </>
                            )}
                            {isHR && (
                                <Button variant='destructive' size='sm' onClick={openHrPostDelete}>Delete (HR)</Button>
                            )}
                        </div>
                    </div>

                    {showComments && (
                        <div className={cn('mt-3 border-t pt-3 space-y-3')}>
                            <div className={cn('space-y-2')}>
                                <Label htmlFor='commentText'>Add a comment</Label>
                                <div className={cn('flex gap-2')}>
                                    <Input id='commentText' value={comment} onChange={(e) => setComment(e.target.value)} />
                                    <Button onClick={AddComment} variant='secondary'>Add</Button>
                                </div>
                            </div>
                            <div className={cn('max-h-40 overflow-auto space-y-2')}>
                                {postComments.length > 0 ? postComments.map((c) => (
                                    <div key={c.commentId} className={cn('flex items-start justify-between gap-3 p-2 bg-gray-50 rounded')}>
                                        <div>
                                            <div className={cn('text-sm font-semibold')}>{c.author.firstName} {c.author.lastName}</div>
                                            <div className={cn('text-xs text-muted-foreground')}>{new Date(c.createdAt).toLocaleDateString()}</div>
                                            <div className={cn('mt-1 text-sm')}>{c.text}</div>
                                        </div>
                                        <div className={cn('flex items-start')}>
                                            {isAuthor && showAuthorControls ? (
                                                <Button variant='ghost' onClick={() => handleDeleteComment(c.commentId)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            ) : null}
                                            {isHR && (
                                                <Button variant='ghost' onClick={() => openHrCommentDelete(c.commentId)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className={cn('text-sm text-muted-foreground')}>No comments yet.</div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>Please provide a reason for deleting this post.</DialogDescription>
                    </DialogHeader>

                    <div className={cn('mt-2')}>
                        <textarea
                            className={cn('w-full min-h-25 border rounded p-2')}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder='Reason for deletion'
                        />
                    </div>

                    <DialogFooter>
                        <Button variant='ghost' onClick={() => setIsPostModalOpen(false)}>Cancel</Button>
                        <Button variant='destructive' onClick={confirmHrPostDelete} disabled={!reason.trim()}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Comment</DialogTitle>
                        <DialogDescription>Please provide a reason for deleting this comment.</DialogDescription>
                    </DialogHeader>

                    <div className={cn('mt-2')}>
                        <textarea
                            className={cn('w-full min-h-25 border rounded p-2')}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder='Reason for deletion'
                        />
                    </div>

                    <DialogFooter>
                        <Button variant='ghost' onClick={() => setIsCommentModalOpen(false)}>Cancel</Button>
                        <Button variant='destructive' onClick={confirmHrCommentDelete} disabled={!reason.trim()}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    )
}

export default AchievementPostCard  
