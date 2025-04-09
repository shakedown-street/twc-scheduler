import React from 'react';
import { BlockModel } from '~/api';
import { Block } from '~/types/Block';

export type BlocksContextType = {
  blocks: Block[];
};

export const BlocksContext = React.createContext<BlocksContextType | undefined>(undefined);

export type BlocksProviderProps = {
  children: React.ReactNode;
};

export const BlocksProvider = (props: BlocksProviderProps) => {
  const [blocks, setBlocks] = React.useState<Block[]>([]);

  React.useEffect(() => {
    BlockModel.all().then((blocks) => {
      setBlocks(blocks);
    });
  }, []);

  return <BlocksContext.Provider value={{ blocks }}>{props.children}</BlocksContext.Provider>;
};

export const useBlocks = () => {
  const context = React.useContext(BlocksContext);

  if (context === undefined) {
    throw new Error('useBlocks must be used within an BlocksProvider');
  }

  return context;
};
