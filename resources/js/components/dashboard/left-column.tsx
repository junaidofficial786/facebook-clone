import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Bookmark, Users2, Video, List } from 'lucide-react';

const menuItems = [
    { label: 'Friends', icon: Users },
    { label: 'Saved', icon: Bookmark },
    { label: 'Groups', icon: Users2 },
    { label: 'Videos', icon: Video },
    { label: 'Feed', icon: List },
];

export default function LeftColumn() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Menu</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {menuItems.map((item) => (
                    <Button key={item.label} variant="ghost" className="justify-start gap-3 text-base font-normal">
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
}
