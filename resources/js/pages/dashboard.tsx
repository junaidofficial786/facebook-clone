import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LeftColumn from '@/components/dashboard/left-column';
import CenterColumn from '@/components/dashboard/center-column';
import RightColumn from '@/components/dashboard/right-column';

export default function Dashboard() {

    /*
    * a sample echo listener to activate against reverb event (PostCreated event)
    Echo.channel('posts')
        .listen('.create', () => {
            alert('ok')
        });

    * for presenceChannel
    Echo.join('chat-room')
        .here((users) => {
            console.log("Online users: ", users);
        })
        .joining((user) => {
            console.log(user.name + " joined the chat.");
        })
        .leaving((user) => {
            console.log(user.name + " left the chat.");
        });
    */

    
    return (
        <AppHeaderLayout>
            <div className="mx-auto flex w-full max-w-7xl gap-6 px-2 py-6 min-h-[calc(100vh-4rem)]">
                <div className="hidden lg:block w-1/4">
                    <div className="sticky top-24">
                        <LeftColumn />
                    </div>
                </div>
                <div className="flex-1 min-w-0 h-[calc(100vh-4rem)] overflow-y-auto pb-8">
                    <CenterColumn />
                </div>
                <div className="hidden xl:block w-1/4">
                    <div className="sticky top-24">
                        <RightColumn />
                    </div>
                </div>
            </div>
        </AppHeaderLayout>
    );
}
