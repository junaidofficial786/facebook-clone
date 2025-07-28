import AppHeaderLayout from '@/layouts/app/app-header-layout';
import Feed from '@/components/dashboard/feed';

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
        <div className="flex-1">
            <Feed/>
            {/* <Feed user_id={100} groupId={4} /> */}
        </div>
    );
}

Dashboard.layout = (page: React.ReactNode) => <AppHeaderLayout>{page}</AppHeaderLayout>;
export default Dashboard;
