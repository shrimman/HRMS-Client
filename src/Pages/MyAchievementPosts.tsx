import AchievementPostCard from "@/components/AchievementPostCard";
import { Spinner } from "@/components/ui/spinner";
import { type AchievementPostDto, getMyPosts, updatePost } from "@/lib/api/achievement";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function MyAchievementPosts() {

    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState<AchievementPostDto[]>([]);
    const [showEdit, setShowEdit] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [editingPost, setEditingPost] = useState<AchievementPostDto | null>(null)

    const fetchMyPosts = async () => {
        setIsLoading(true);
        try {
            const response = await getMyPosts();
            setPosts(response);
        }
        catch (error) {
            console.error("Error fetching my posts:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchMyPosts();
    }, []);


    if (isLoading) {
        return (
            <div className={cn('flex-1 flex items-center justify-center p-8 bg-background')}>
                <Spinner className={cn('w-12 h-12 text-primary animate-spin')} />
                <p className={cn('text-lg font-medium text-muted-foreground')}>
                    Loading your achievements...
                </p>
            </div>
        )
    }

    return (
        <>
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-6xl mx-auto')}>
                    <h1 className={cn('text-4xl font-bold text-foreground mb-2')}>
                        My Achievements
                    </h1>
                    <p className={cn('text-lg text-muted-foreground mb-8')}>
                        Manage all the achievements you've shared with your colleagues.
                    </p>
                    {
                        posts.length === 0 ? (
                            <div className={cn('flex flex-col items-center justify-center py-16')}>
                                <p className={cn('text-lg font-medium text-muted-foreground')}>
                                    No achievements to display yet. Check back soon!
                                </p>
                            </div>
                        ) : (
                            <div className={cn('grid gap-6')}>
                                {posts.map((post) => (
                                    <AchievementPostCard
                                        key={post.postId}
                                        post={post}
                                        isAuthor={true}
                                        showAuthorControls={true}
                                        onEdit={(p) => {
                                            setEditingPost(p)
                                            setTitle(p.title)
                                            setDescription(p.description)
                                            setShowEdit(true)
                                        }}
                                        onDeleted={(postId) => setPosts((prev) => prev.filter(p => p.postId !== postId))}
                                    />
                                ))}
                            </div>
                        )
                    }
                    <Dialog open={showEdit} onOpenChange={setShowEdit}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Post</DialogTitle>
                                <DialogDescription>Update the title or description and save changes.</DialogDescription>
                            </DialogHeader>
                            <div className={cn('mt-4 grid gap-4')}>
                                <div className={cn('flex flex-col gap-2')}>
                                    <Label htmlFor='editTitle'>Title</Label>
                                    <Input id='editTitle' value={title} onChange={(e) => setTitle(e.target.value)} className={cn('w-full')} />
                                </div>
                                <div className={cn('flex flex-col gap-2')}>
                                    <Label htmlFor='editDescription'>Description</Label>
                                    <textarea id='editDescription' rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={cn('w-full rounded-md border px-3 py-2 resize-y min-h-30')} />
                                </div>
                            </div>
                            <DialogFooter className={cn('mt-4')}>
                                <Button onClick={async () => {
                                    if (!editingPost) return
                                    try {
                                        const resp = await updatePost(editingPost.postId, { title, description })
                                        setPosts((prev) => prev.map(p => p.postId === resp.postId ? resp : p))
                                        setEditingPost(null)
                                        setTitle('')
                                        setDescription('')
                                        setShowEdit(false)
                                        toast.success('Post updated')
                                    } catch (err) {
                                        console.error(err)
                                        toast.error('Failed to update post')
                                    }
                                }}>Save</Button>
                                <Button variant='secondary' onClick={() => setShowEdit(false)}>Cancel</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    )
}

export default MyAchievementPosts;