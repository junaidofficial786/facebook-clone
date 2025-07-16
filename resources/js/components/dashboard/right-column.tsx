import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const people = [
  { id: 1, name: 'Ali Raza', image: 'https://randomuser.me/api/portraits/men/21.jpg' },
  { id: 2, name: 'Sara Khan', image: 'https://randomuser.me/api/portraits/women/22.jpg' },
  { id: 3, name: 'John Doe', image: 'https://randomuser.me/api/portraits/men/23.jpg' },
  { id: 4, name: 'Ayesha Noor', image: 'https://randomuser.me/api/portraits/women/24.jpg' },
  { id: 5, name: 'Bilal Ahmed', image: 'https://randomuser.me/api/portraits/men/25.jpg' },
];

export default function RightColumn() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>People You May Know</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {people.map(person => (
          <div key={person.id} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={person.image} alt={person.name} />
              <AvatarFallback>{person.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 font-medium truncate">{person.name}</div>
            <Button size="sm">Add Friend</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
