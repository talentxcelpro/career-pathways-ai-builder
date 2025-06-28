
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Star, MessageCircle, Clock } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface CandidateNote {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  notePreview: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  rating: number;
  isPrivate: boolean;
}

export const SharedNotesWidget = () => {
  const navigate = useNavigate();
  
  const recentNotes: CandidateNote[] = [
    {
      id: '1',
      candidateName: 'Sarah Johnson',
      jobTitle: 'Senior Frontend Developer',
      notePreview: 'Excellent technical skills, particularly strong in React and TypeScript. Good communication...',
      author: 'John Smith',
      timestamp: '1 hour ago',
      rating: 4,
      isPrivate: false
    },
    {
      id: '2',
      candidateName: 'Mike Chen',
      jobTitle: 'Product Manager',
      notePreview: 'Great product sense and strategic thinking. Previous experience at tech startups is relevant...',
      author: 'Sarah Wilson',
      timestamp: '3 hours ago',
      rating: 5,
      isPrivate: false
    },
    {
      id: '3',
      candidateName: 'Emily Davis',
      jobTitle: 'UX Designer',
      notePreview: 'Portfolio shows strong design thinking. Need to assess collaboration skills in next round...',
      author: 'Mike Davis',
      timestamp: '5 hours ago',
      rating: 3,
      isPrivate: true
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Shared Notes</CardTitle>
              <p className="text-xs text-slate-600 font-medium">
                Recent candidate evaluations
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs font-semibold"
            onClick={() => navigate('/employer/crm/notes')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {recentNotes.map((note) => (
          <div 
            key={note.id}
            className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/employer/crm/${note.id}`)}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={note.candidateAvatar} />
              <AvatarFallback className="text-xs">{note.candidateName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-slate-800">{note.candidateName}</h4>
                <div className="flex items-center gap-1">
                  {note.isPrivate && (
                    <Badge variant="secondary" className="text-xs">
                      Private
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 mb-2">
                {renderStars(note.rating)}
                <Badge variant="outline" className="text-xs ml-2">
                  {note.jobTitle}
                </Badge>
              </div>
              
              <p className="text-xs text-slate-600 mb-2 line-clamp-2">{note.notePreview}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={note.authorAvatar} />
                    <AvatarFallback className="text-xs">{note.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-600">{note.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500">{note.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-slate-100">
          <div 
            className="flex items-center justify-center gap-2 p-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            onClick={() => navigate('/employer/crm/notes')}
          >
            <span className="text-sm font-semibold text-emerald-700">View All Notes</span>
            <MessageCircle className="h-3 w-3 text-emerald-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
