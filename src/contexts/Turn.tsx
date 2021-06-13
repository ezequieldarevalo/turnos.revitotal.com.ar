import React, { useCallback, useState, useMemo, createContext } from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { ApolloError } from '@apollo/client';
import { useQuery, useMutation, FetchResult } from '@apollo/react-hooks';

import getDeliveryData from 'lib/queries/getDeliveryData';
import doReschedule from 'lib/queries/doReschedule';
import LoaderOverlay from 'components/common/layout/LoaderOverlay';

const LoadingContainer = styled.div`
  min-height: 290px;
`;

export interface IAvailableShift {
  code: string;
  description: string;
}

export interface IAvailableDate {
  date: string;
  availableShifts: IAvailableShift[];
}

export interface ICalendar {
  id: string;
  availableDates: IAvailableDate[];
}

export interface IProduct {
  id: string;
  description: string;
  quantity: number;
  url?: string;
  image?: string;
}

export interface IDeliveryAddress {
  street: string;
  number: number;
  city: string;
  state: string;
  zipCode: string;
  floor?: string;
  apartment?: string;
  observations?: string;
  geoLat?: number;
  geoLong?: number;
}

interface ISaleChannel {
  name: string;
}

interface ICustomer {
  name: string;
  email: string;
}

export interface IDeliveryReschedule {
  id: string;
  deliveryCommitmentDate: string;
  deliveryCommitmentShift: string;
  saleOrderId: string;
  items: IProduct[];
  calendar: ICalendar;
  deliveryAddress: IDeliveryAddress;
  saleChannel: ISaleChannel;
  reason: string;
  customer: ICustomer;
}

export interface IRescheduleResponse {
  done: boolean;
}

export enum TReason {
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  DELIVERY_DATE_CHANGED = 'DELIVERY_DATE_CHANGED',
  OPTIONAL_DATE_CHANGE = 'OPTIONAL_DATE_CHANGE',
}

export interface ValidateSchedulingResult {
  valid: boolean;
  reason: TReason;
}

interface DeliveryRescheduleProviderProps {
  id: string;
  children: ReactNode;
}

export interface IRescheduleState {
  done: boolean; // posible cambio/remove
  date: string;
  shift: string;
}

export interface ISchedulingError {
  saleChannel?: string;
  reason: string;
  date?: string;
  shift?: string;
  canRetry?: boolean;
}

export const emptySchedulingError: ISchedulingError = {
  reason: 'default',
};

export type DeliveryRescheduleContextValue = [
  ApolloError,
  IDeliveryReschedule,
  IRescheduleState,
  {
    onDateSubmit: (
      id: string,
      date: string,
      shift: string
    ) => Promise<FetchResult<IRescheduleResponse>>;
    changeDate: (date: string, shift: string) => void;
  },
  boolean
];

export const DeliveryRescheduleContext = createContext<
  DeliveryRescheduleContextValue
>([
  null,
  null,
  null,
  {
    onDateSubmit: () => Promise.reject(),
    changeDate: () => null,
  },
  null,
]);

const emptyDateChangeState = {
  done: false,
  date: '',
  shift: '',
};

export default function DeliveryRescheduleProvider({
  id,
  children,
}: DeliveryRescheduleProviderProps): JSX.Element {
  const [dateChangeState, setDateChangeState] = useState<IRescheduleState>(
    emptyDateChangeState
  );

  const { loading: loadingQuery, error: errorQuery, data } = useQuery(
    getDeliveryData,
    {
      variables: { id: id },
    }
  );

  const [
    doResc,
    { error: errorMutation, loading: loadingMutation },
  ] = useMutation<IRescheduleResponse>(doReschedule, {
    onError: () => {
      return;
    },
  });

  const error = errorQuery || errorMutation;

  const onDateSubmit = useCallback(
    (
      id: string,
      date: string,
      shift: string
    ): Promise<FetchResult<IRescheduleResponse>> =>
      doResc({
        variables: {
          id,
          date,
          shift,
        },
      }),
    []
  );

  const changeDate = useCallback((date: string, shift: string) => {
    setDateChangeState({ done: true, date, shift });
  }, []);

  const value: DeliveryRescheduleContextValue = useMemo(
    () => [
      error,
      data?.deliveryReschedule,
      dateChangeState,
      {
        changeDate,
        onDateSubmit,
      },
      loadingMutation,
    ],
    [
      error,
      data?.deliveryReschedule,
      dateChangeState,
      onDateSubmit,
      changeDate,
      loadingMutation,
    ]
  );

  if (loadingQuery) {
    return (
      <LoaderOverlay loading noBackground>
        <LoadingContainer />
      </LoaderOverlay>
    );
  }

  return (
    <DeliveryRescheduleContext.Provider value={value}>
      {children}
    </DeliveryRescheduleContext.Provider>
  );
}
