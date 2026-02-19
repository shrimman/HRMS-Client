import AchievementPostCard from "@/components/AchievementPostCard";
import { Spinner } from "@/components/ui/spinner";
import { getFeed, createPost, updatePost, type AchievementPostDto } from "@/lib/api/achievement";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useUserId } from '@/lib/redux/hooks'

export default function AchievementFeed() {

    const [isLoading, setIsLoading] = useState(true);
    const [feed, setFeed] = useState<AchievementPostDto[]>([]);
    const [showCreate, setShowCreate] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [editingPost, setEditingPost] = useState<AchievementPostDto | null>(null)
    const userId = useUserId()

    const fetchFeed = async () => {
        setIsLoading(true);
        try {
            const response = await getFeed();
            setFeed(response);
        }
        catch (error) {
            console.error("Error fetching achievement feed:", error);
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchFeed();
    }, []);

    if (isLoading) {
        return (
            <div className={cn('flex-1 flex items-center justify-center p-8 bg-background')}>
                <Spinner className={cn('w-10 h-10 text-primary-500')} />
                <p className={cn('text-lg font-medium text-muted-foreground')}>
                    Loading achievements...
                </p>
            </div>
        )
    }

    return (
        <>
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-6xl mx-auto')}>
                    <h1 className={cn('text-4xl font-bold text-foreground mb-2')}>
                        Achievements Feed
                    </h1>
                    <div className={cn('flex items-center justify-between mb-8') }>
                        <p className={cn('text-lg text-muted-foreground')}>
                            Celebrate the accomplishments of your colleagues and stay inspired by their success stories.
                        </p>
                        <div>
                            <Button onClick={() => setShowCreate(true)}>
                                Create New Post
                            </Button>
                        </div>
                    </div>

                    <Dialog open={showCreate} onOpenChange={setShowCreate}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Post</DialogTitle>
                                <DialogDescription>Add a title and description for your achievement.</DialogDescription>
                            </DialogHeader>
                            <div className={cn('mt-4 grid gap-4')}>
                                <div className={cn('flex flex-col gap-2')}>
                                    <Label htmlFor='newTitle'>Title</Label>
                                    <Input id='newTitle' value={title} onChange={(e) => setTitle(e.target.value)} className={cn('w-full')} />
                                </div>
                                <div className={cn('flex flex-col gap-2')}>
                                    <Label htmlFor='newDescription'>Description</Label>
                                    <textarea id='newDescription' rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={cn('w-full rounded-md border px-3 py-2 resize-y min-h-24')} />
                                </div>
                            </div>
                            <DialogFooter className={cn('mt-4')}>
                                <Button onClick={async () => {
                                    try {
                                        const resp = await createPost({ title, description })
                                        setFeed((prev) => [resp, ...prev])
                                        setTitle('')
                                        setDescription('')
                                        setShowCreate(false)
                                        toast.success('Post created')
                                    } catch (err) {
                                        console.error(err)
                                        toast.error('Failed to create post')
                                    }
                                }}>Create</Button>
                                <Button variant='secondary' onClick={() => setShowCreate(false)}>Cancel</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

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
                                        setFeed((prev) => prev.map(p => p.postId === resp.postId ? resp : p))
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
                    {
                        feed.length === 0 ? (
                            <div className={cn('flex flex-col items-center justify-center py-16')}>
                                <p className={cn('text-lg font-medium text-muted-foreground')}>
                                    No achievements to display yet. Check back soon!
                                </p>
                            </div>
                        ) : (
                            <div className={cn('grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
                                {feed.map((post) => (
                                    <AchievementPostCard
                                        key={post.postId}
                                        post={post}
                                        isAuthor={Number(userId) === post.author.employeeId}
                                        showAuthorControls={false}
                                        onEdit={(p) => {
                                            setEditingPost(p)
                                            setTitle(p.title)
                                            setDescription(p.description)
                                            setShowEdit(true)
                                        }}
                                        onDeleted={(postId) => setFeed((prev) => prev.filter(p => p.postId !== postId))}
                                    />
                                ))}
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    )
}
