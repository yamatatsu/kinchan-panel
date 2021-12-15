/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createRoom = /* GraphQL */ `
  mutation CreateRoom($roomId: ID!, $name: String!) {
    createRoom(roomId: $roomId, name: $name) {
      roomId
      name
      point
    }
  }
`;
export const incPoint = /* GraphQL */ `
  mutation IncPoint($roomId: ID!) {
    incPoint(roomId: $roomId) {
      roomId
      name
      point
    }
  }
`;
export const resetPoint = /* GraphQL */ `
  mutation ResetPoint($roomId: ID!) {
    resetPoint(roomId: $roomId) {
      roomId
      name
      point
    }
  }
`;
