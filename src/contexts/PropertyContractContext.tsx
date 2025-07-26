
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PropertyContracts, PropertyBlockchainData } from '@/lib/contracts';
import { config } from '@/lib/config';
import { useToast } from '@/hooks/use-toast';

interface ContractState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  contracts: PropertyContracts | null;
}

interface PropertyContractContextType extends ContractState {
  registerProperty: (propertyData: PropertyBlockchainData) => Promise<any>;
  verifyProperty: (propertyId: string) => Promise<any>;
  createListing: (propertyId: string, price: number, tokenAmount: number) => Promise<any>;
  purchaseTokens: (listingId: string, amount: number) => Promise<any>;
  distributeRevenue: (propertyId: string, amount: number, source: string) => Promise<any>;
  claimRevenue: (distributionId: string) => Promise<any>;
  reconnect: () => void;
}

const PropertyContractContext = createContext<PropertyContractContextType | undefined>(undefined);

export function PropertyContractProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ContractState>({
    isConnected: false,
    isLoading: true,
    error: null,
    contracts: null,
  });
  const { toast } = useToast();

  const initializeContracts = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!config.hedera.isConfigured()) {
        throw new Error('Hedera contracts not configured. Please check environment variables.');
      }

      const contracts = new PropertyContracts();
      
      setState({
        isConnected: true,
        isLoading: false,
        error: null,
        contracts,
      });

      console.log('Property contracts initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize contracts';
      setState({
        isConnected: false,
        isLoading: false,
        error: errorMessage,
        contracts: null,
      });
      console.error('Contract initialization error:', error);
    }
  };

  useEffect(() => {
    initializeContracts();
    
    return () => {
      if (state.contracts) {
        state.contracts.close();
      }
    };
  }, []);

  const handleContractOperation = async (
    operation: () => Promise<any>,
    successMessage: string,
    errorMessage: string
  ) => {
    if (!state.contracts) {
      throw new Error('Contracts not initialized');
    }

    try {
      const result = await operation();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage;
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const registerProperty = (propertyData: PropertyBlockchainData) =>
    handleContractOperation(
      () => state.contracts!.registerProperty(propertyData),
      'Property registered on blockchain successfully',
      'Failed to register property on blockchain'
    );

  const verifyProperty = (propertyId: string) =>
    handleContractOperation(
      () => state.contracts!.verifyProperty(propertyId),
      'Property verified on blockchain',
      'Failed to verify property on blockchain'
    );

  const createListing = (propertyId: string, price: number, tokenAmount: number) =>
    handleContractOperation(
      () => state.contracts!.createListing(propertyId, price, tokenAmount),
      'Marketplace listing created successfully',
      'Failed to create marketplace listing'
    );

  const purchaseTokens = (listingId: string, amount: number) =>
    handleContractOperation(
      () => state.contracts!.purchaseTokens(listingId, amount),
      'Tokens purchased successfully',
      'Failed to purchase tokens'
    );

  const distributeRevenue = (propertyId: string, amount: number, source: string) =>
    handleContractOperation(
      () => state.contracts!.distributeRevenue(propertyId, amount, source),
      'Revenue distribution initiated',
      'Failed to distribute revenue'
    );

  const claimRevenue = (distributionId: string) =>
    handleContractOperation(
      () => state.contracts!.claimRevenue(distributionId),
      'Revenue claimed successfully',
      'Failed to claim revenue'
    );

  const reconnect = () => {
    initializeContracts();
  };

  const contextValue: PropertyContractContextType = {
    ...state,
    registerProperty,
    verifyProperty,
    createListing,
    purchaseTokens,
    distributeRevenue,
    claimRevenue,
    reconnect,
  };

  return (
    <PropertyContractContext.Provider value={contextValue}>
      {children}
    </PropertyContractContext.Provider>
  );
}

export function usePropertyContracts() {
  const context = useContext(PropertyContractContext);
  if (context === undefined) {
    throw new Error('usePropertyContracts must be used within a PropertyContractProvider');
  }
  return context;
}
