import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { handler } from "./roomCreationHandler";

const ddbMock = mockClient(DynamoDBDocumentClient);

Date.now = jest.fn(() => 1487076708000);

beforeEach(() => {
  ddbMock.reset();
});

test("happy", async () => {
  const result = await handler();

  expect(result).toEqual({
    roomId: expect.any(String),
    name: expect.any(String),
    judges: expect.any(Array),
    createdAt: 1487076708000,
    editedAt: 1487076708000,
  });
  expect(result.judges.length).toBe(10);
  expect(result.judges[0]).toEqual({
    roomId: result.roomId,
    judgeId: expect.any(String),
    point: 0,
    createdAt: 1487076708000,
    editedAt: 1487076708000,
  });
});
