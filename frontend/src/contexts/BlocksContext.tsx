import { BlockModel } from '@/api';
import { Block } from '@/types/Block';
import { Spinner } from '@/ui';
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
    return <Spinner className="mt-8" message="Loading blocks..." />;
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
