import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { v4 as uuid } from "uuid";

const ddbClient = new DynamoDBClient({ region: "ap-northeast-1" });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const roomTableName = process.env.ROOM_TABLE_NAME!;
const judgeTableName = process.env.JUDGE_TABLE_NAME!;

export const handler = async () => {
  const now = Date.now();
  const room = createRoom(now);
  const judges = range(10).map(() => createJudge(room.roomId, now));

  await ddbDocClient.send(
    new BatchWriteCommand({
      RequestItems: {
        [roomTableName]: [
          {
            PutRequest: { Item: room },
          },
        ],
        [judgeTableName]: judges.map((judge) => {
          return {
            PutRequest: { Item: judge },
          };
        }),
      },
    })
  );

  return { ...room, judges };
};

function createRoom(now: number) {
  const roomId = uuid();
  return {
    roomId,
    name: roomId,
    createdAt: now,
    editedAt: now,
  };
}

function createJudge(roomId: string, now: number) {
  const judgeId = uuid();
  return {
    roomId,
    judgeId,
    point: 0,
    createdAt: now,
    editedAt: now,
  };
}

function range(n: number) {
  return [...new Array(n)];
}
