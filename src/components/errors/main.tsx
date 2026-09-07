import { Button } from '../ui/button';

export const MainErrorFallback = () => {
    return (
        <div className="flex h-screen flex-col items-center justify-center text-destructive" role="alert">
            <h2 className='text-lg font-semibold text-muted-foreground'>Opps, something went wrong ...</h2>
            <Button className='mt-4' onClick={() => window.location.assign(window.location.origin)}>Refresh</Button>
        </div>
    )
}