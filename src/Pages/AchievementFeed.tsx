import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AchievementFeed() {
    return (
        <>
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-6xl mx-auto')}>
                    <h1 className={cn('text-4xl font-bold text-foreground mb-2')}>
                        Achievements Feed
                    </h1>
                    <Card className={cn('mb-8 border-primary-200')}>
                        <CardHeader>
                            <CardTitle className={cn('text-primary-600')}>JOB TITLE</CardTitle>
                            <CardDescription>
                                POST AUTHOR NAME
                            </CardDescription>
                            <CardDescription>
                                POST DATE
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6')}>
                                <div>
                                    <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                                        POST DESCRIPTION
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>
                                    like COUNT with Icon
                                </p>
                                <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                                    Comment OUt with Icon                                </p>
                            </div>

                            <Button variant="default" className={cn('mt-4')}  >
                                LIKE POST
                            </Button>
                            <Button variant="secondary" className={cn('mt-4 ml-2')}>
                                COMMENT
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </>
    )
}
