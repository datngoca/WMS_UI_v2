import { paths } from '@/config/paths';
import { Link } from '@/components/ui/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
const NotFoundRoute = () => {
    return (
        <div className='mt-52 flex flex-col items-center font-semibold font-mono'>
            {/* <!-- Large 404 Typography --> */}
            <h1 className='text-9xl font-bold text-primary drop-shadow-sm'>404</h1>

            <h2 className='font-5xl sm:text-2xl text-foreground w-fit'>Sorry, the page you are looking for does not exist.</h2>
            <Button className='mt-2' icon={<Home className="size-4" />}>
                <Link to={paths.home.getHref()} className='text-white' replace>Go to Home</Link>
            </Button>
        </div>
    )
}
export default NotFoundRoute;