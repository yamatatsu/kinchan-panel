import { Construct } from "constructs";
import * as appsync from "@aws-cdk/aws-appsync-alpha";
import {
  aws_dynamodb,
  aws_lambda,
  aws_lambda_nodejs,
  RemovalPolicy,
} from "aws-cdk-lib";

export class AppSyncConstruct extends Construct {
  private readonly api: appsync.GraphqlApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.api = new appsync.GraphqlApi(this, "api", {
      name: "kinchan-panel",
    });

    const { roomDS, judgeDS, roomCreationDS } = this.createDSs();
    const { room, judge } = this.createTypes();

    this.api.addQuery(
      "room",
      new appsync.ResolvableField({
        returnType: room.attribute(),
        dataSource: roomDS,
        args: {
          roomId: appsync.GraphqlType.id({ isRequired: true }),
        },
        requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem(
          "roomId",
          "roomId"
        ),
        responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
      })
    );

    const query = appsync.KeyCondition.eq("roomId", "roomId")
      .renderTemplate()
      .replace("$ctx.args.", "$ctx.source.");
    this.api.createResolver({
      typeName: "Room",
      fieldName: "judges",
      dataSource: judgeDS,
      requestMappingTemplate: appsync.MappingTemplate.fromString(
        `{"version" : "2017-02-28", "operation" : "Query", ${query}}`
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    this.api.addMutation(
      "createRoom",
      new appsync.ResolvableField({
        returnType: room.attribute(),
        dataSource: roomCreationDS,
        requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
        responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
      })
    );
  }

  private createDSs() {
    const roomTable = new aws_dynamodb.Table(this, "roomTable", {
      partitionKey: {
        name: "roomId",
        type: aws_dynamodb.AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const judgeTable = new aws_dynamodb.Table(this, "judgeTable", {
      partitionKey: {
        name: "roomId",
        type: aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "judgeId",
        type: aws_dynamodb.AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const roomCreationHandler = new aws_lambda_nodejs.NodejsFunction(
      this,
      "roomCreationHandler",
      {
        entry: `${__dirname}/../../../functions/src/roomCreationHandler.ts`,
        runtime: aws_lambda.Runtime.NODEJS_14_X,
        environment: {
          ROOM_TABLE_NAME: roomTable.tableName,
          JUDGE_TABLE_NAME: judgeTable.tableName,
        },
        architecture: aws_lambda.Architecture.ARM_64,
      }
    );
    roomTable.grantWriteData(roomCreationHandler);
    judgeTable.grantWriteData(roomCreationHandler);

    const roomDS = this.api.addDynamoDbDataSource("roomDS", roomTable);
    const judgeDS = this.api.addDynamoDbDataSource("judgeDS", judgeTable);
    const roomCreationDS = this.api.addLambdaDataSource(
      "roomCreationDS",
      roomCreationHandler
    );
    return { roomDS, judgeDS, roomCreationDS };
  }

  private createTypes() {
    const node = this.api.addType(
      new appsync.InterfaceType("Node", {
        definition: {
          createdAt: appsync.GraphqlType.awsTimestamp({ isRequired: true }),
          editedAt: appsync.GraphqlType.awsTimestamp({ isRequired: true }),
        },
      })
    );

    const judge = this.api.addType(
      new appsync.ObjectType("Judge", {
        interfaceTypes: [node],
        definition: {
          roomId: appsync.GraphqlType.id({ isRequired: true }),
          judgeId: appsync.GraphqlType.id({ isRequired: true }),
          point: appsync.GraphqlType.int({ isRequired: true }),
        },
      })
    );

    const room = this.api.addType(
      new appsync.ObjectType("Room", {
        interfaceTypes: [node],
        definition: {
          roomId: appsync.GraphqlType.id({ isRequired: true }),
          name: appsync.GraphqlType.string({ isRequired: true }),
          judges: judge.attribute({ isRequiredList: true }),
        },
      })
    );
    return { judge, room };
  }
}
