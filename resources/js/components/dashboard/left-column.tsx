import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const groups = [
  { id: 1, name: 'React Developers', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 2, name: 'UI/UX Designers', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 3, name: 'Laravel Pakistan', image: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { id: 4, name: 'Freelancers', image: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { id: 5, name: 'Remote Jobs', image: 'https://randomuser.me/api/portraits/men/12.jpg' },
];

export default function LeftColumn() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Groups</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {groups.map(group => (
          <div key={group.id} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={group.image} alt={group.name} />
              <AvatarFallback>{group.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 font-medium truncate">{group.name}</div>
            <Button size="sm" variant="outline">Join</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
