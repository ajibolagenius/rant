
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Flame, Filter } from 'lucide-react';

type SortOption = 'latest' | 'popular' | 'filter';

interface SortingBarProps {
  activeOption: SortOption;
  onOptionChange: (option: SortOption) => void;
}

const SortingBar: React.FC<SortingBarProps> = ({ activeOption, onOptionChange }) => {
  return (
    <div className="flex items-center justify-between py-4 mb-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">Hottest Rants</h2>
        <Flame className="text-orange-500" size={20} />
      </div>
      
      <div className="flex gap-2">
        <Button
          variant={activeOption === 'latest' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onOptionChange('latest')}
          className={activeOption === 'latest' ? 'bg-accent hover:bg-accent/80' : 'bg-[#1A1A1A] hover:bg-[#252525]'}
        >
          <Clock size={16} className="mr-1" />
          Latest
        </Button>
        
        <Button
          variant={activeOption === 'popular' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onOptionChange('popular')}
          className={activeOption === 'popular' ? 'bg-accent hover:bg-accent/80' : 'bg-[#1A1A1A] hover:bg-[#252525]'}
        >
          <Flame size={16} className="mr-1" />
          Popular
        </Button>
        
        <Button
          variant={activeOption === 'filter' ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onOptionChange('filter')}
          className={activeOption === 'filter' ? 'bg-accent hover:bg-accent/80' : 'bg-[#1A1A1A] hover:bg-[#252525]'}
        >
          <Filter size={16} className="mr-1" />
          Filter
        </Button>
      </div>
    </div>
  );
};

export default SortingBar;
