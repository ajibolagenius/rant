
import React from 'react';
import { Button } from '@/components/ui/button';

interface IntroSectionProps {
  onStartRanting: () => void;
  onExploreRants: () => void;
}

const IntroSection: React.FC<IntroSectionProps> = ({ onStartRanting, onExploreRants }) => {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-[#1A1A1A] text-primary border border-primary/30 px-3 py-1 rounded-full text-sm flex items-center">
          Let it all out <span className="inline-block w-2 h-2 ml-2 bg-primary rounded-full"></span>
        </div>
      </div>
      
      <h1 className="text-7xl font-bold bg-gradient-to-r from-primary to-pink-500 text-transparent bg-clip-text mb-6">
        RANT ABOUT ANYTHING!
      </h1>
      
      <p className="text-xl text-gray-400 mb-8 max-w-xl">
        This is a safe place where your unfiltered thoughts meet the void. No judgment, just pure catharsis.
      </p>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          onClick={onStartRanting} 
          className="bg-gradient-to-r from-[#00C2FF] to-[#904FFF] hover:opacity-90 transition-opacity rounded-full px-8 py-6"
        >
          Start Ranting
        </Button>
        
        <Button 
          onClick={onExploreRants} 
          variant="outline"
          className="border-[#333] bg-[#121212] hover:bg-[#1A1A1A] text-white rounded-full px-8 py-6"
        >
          Explore Rants
        </Button>
      </div>
      
      <div className="flex items-center text-sm text-gray-500 gap-2">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
        126 people have ranted so far!
      </div>
    </div>
  );
};

export default IntroSection;
