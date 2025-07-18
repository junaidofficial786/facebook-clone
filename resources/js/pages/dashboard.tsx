import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LeftColumn from '@/components/dashboard/left-column';
import Feed from '@/components/dashboard/feed';
import RightColumn from '@/components/dashboard/right-column';

function Dashboard() {

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
        <div className="flex w-full max-w-7xl gap-6 px-2 min-h-0 h-screen overflow-hidden mx-auto">
            <div className="hidden lg:block w-1/4">
                <div className="sticky top-24">
                    <LeftColumn />
                </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col h-full min-h-0">
                <div className="flex-1 min-h-0 h-full">
                    <Feed />
                </div>
            </div>
            <div className="hidden xl:block w-1/4">
                <div className="sticky top-24">
                    <RightColumn />
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AppHeaderLayout>{page}</AppHeaderLayout>;
export default Dashboard;
