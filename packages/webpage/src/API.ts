/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Room = {
  __typename: "Room",
  roomId: string,
  name: string,
  point: number,
};

export type CreateRoomMutationVariables = {
  roomId: string,
  name: string,
};

export type CreateRoomMutation = {
  createRoom?:  {
    __typename: "Room",
    roomId: string,
    name: string,
    point: number,
  } | null,
};

export type IncPointMutationVariables = {
  roomId: string,
};

export type IncPointMutation = {
  incPoint?:  {
    __typename: "Room",
    roomId: string,
    name: string,
    point: number,
  } | null,
};

export type ResetPointMutationVariables = {
  roomId: string,
};

export type ResetPointMutation = {
  resetPoint?:  {
    __typename: "Room",
    roomId: string,
    name: string,
    point: number,
  } | null,
};

export type RoomQueryVariables = {
  roomId: string,
};

export type RoomQuery = {
  room?:  {
    __typename: "Room",
    roomId: string,
    name: string,
    point: number,
  } | null,
};

export type RoomUpdatedSubscriptionVariables = {
  roomId: string,
};

export type RoomUpdatedSubscription = {
  roomUpdated?:  {
    __typename: "Room",
    roomId: string,
    name: string,
    point: number,
  } | null,
};
