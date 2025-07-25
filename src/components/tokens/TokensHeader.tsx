
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

interface TokensHeaderProps {
  onShowAgent: () => void;
}

export function TokensHeader({ onShowAgent }: TokensHeaderProps) {
  return (
    <div className="flex items-center justify-between min-w-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Token Portfolio</h1>
        <p className="text-gray-600">Manage your tokenized property investments</p>
      </div>
      <Button onClick={onShowAgent} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hidden">
        <Brain className="w-4 h-4" />
        AI Assistant
        <Badge className="bg-yellow-400 text-yellow-900 ml-1">Learning</Badge>
      </Button>
    </div>
  );
}
