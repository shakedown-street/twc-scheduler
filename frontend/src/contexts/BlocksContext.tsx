/* eslint-disable react-refresh/only-export-components */

import { BlockModel } from '@/api';
import { Loader } from 'lucide-react';
import React from 'react';

export type BlocksContextType = {
  blocks: Block[];
};

export const BlocksContext = React.createContext<BlocksContextType | undefined>(undefined);

export type BlocksProviderProps = {
  children: React.ReactNode;
};

export const BlocksProvider = (props: BlocksProviderProps) => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    BlockModel.all()
      .then((blocks) => {
        setBlocks(blocks);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="mt-12 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <BlocksContext.Provider value={{ blocks }}>{props.children}</BlocksContext.Provider>;
};

export const useBlocks = () => {
  const context = React.useContext(BlocksContext);

  if (context === undefined) {
    throw new Error('useBlocks must be used within an BlocksProvider');
  }

  return context;
};
