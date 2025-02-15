import { createContext, useContext, useEffect, useRef } from 'react';
import type { StoreApi } from 'zustand';
import type { UseBoundStoreWithEqualityFn } from 'zustand/traditional';
import { useChains } from '../../hooks';
import type { PersistStoreProviderProps } from '../types';
import { createChainOrderStore } from './createChainOrderStore';
import type { ChainOrderState } from './types';
import { useFieldActions } from '../../stores';

export type ChainOrderStore = UseBoundStoreWithEqualityFn<
  StoreApi<ChainOrderState>
>;

export const ChainOrderStoreContext = createContext<ChainOrderStore | null>(
  null,
);

export function ChainOrderStoreProvider({
  children,
  ...props
}: PersistStoreProviderProps) {
  const storeRef = useRef<ChainOrderStore>();
  const { chains: filteredChains } = useChains();
  const { setFieldValue, getFieldValues } = useFieldActions();

  if (!storeRef.current) {
    storeRef.current = createChainOrderStore(props);
  }

  useEffect(() => {
    if (filteredChains) {
      const chainOrder = storeRef.current
        ?.getState()
        .initializeChains(filteredChains.map((chain) => chain.id));
      if (chainOrder) {
        const [fromChainValue, toChainValue] = getFieldValues(
          'fromChain',
          'toChain',
        );
        if (!fromChainValue) {
          setFieldValue('fromChain', chainOrder[0]);
        }
        if (!toChainValue) {
          setFieldValue('toChain', chainOrder[0]);
        }
      }
    }
  }, [filteredChains, getFieldValues, setFieldValue]);

  return (
    <ChainOrderStoreContext.Provider value={storeRef.current}>
      {children}
    </ChainOrderStoreContext.Provider>
  );
}

export function useChainOrderStore<T>(
  selector: (state: ChainOrderState) => T,
  equalityFn?: (left: T, right: T) => boolean,
): T {
  const useStore = useContext(ChainOrderStoreContext);
  if (!useStore) {
    throw new Error(
      `You forgot to wrap your component in <${ChainOrderStoreProvider.name}>.`,
    );
  }
  return useStore(selector, equalityFn);
}

export function useChainOrderStoreContext() {
  const useStore = useContext(ChainOrderStoreContext);
  if (!useStore) {
    throw new Error(
      `You forgot to wrap your component in <${ChainOrderStoreProvider.name}>.`,
    );
  }
  return useStore;
}
