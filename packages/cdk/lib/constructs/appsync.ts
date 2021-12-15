import { Construct } from "constructs";
import * as appsync from "@aws-cdk/aws-appsync-alpha";
import { aws_dynamodb, RemovalPolicy } from "aws-cdk-lib";

export class AppSyncConstruct extends Construct {
  private readonly api: appsync.GraphqlApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.api = new appsync.GraphqlApi(this, "api", {
      name: "kinchan-panel",
    });

    const { roomDS } = this.createDSs();
    const { room } = this.createTypes();

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

    this.api.addMutation(
      "createRoom",
      new appsync.ResolvableField({
        returnType: room.attribute(),
        dataSource: roomDS,
        args: {
          roomId: appsync.GraphqlType.id({ isRequired: true }),
          name: appsync.GraphqlType.string({ isRequired: true }),
        },
        requestMappingTemplate: appsync.MappingTemplate.fromString(
          f(`
            {
              "version" : "2018-05-29",
              "operation" : "PutItem",
              "key": {
                "roomId": $util.dynamodb.toDynamoDBJson($ctx.args.roomId)
              },
              "attributeValues" : {
                "name" : $util.dynamodb.toDynamoDBJson($ctx.args.name),
                "point" : {"N":"0"}
              },
            }
          `)
        ),
        responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
      })
    );

    this.api.addMutation(
      "incPoint",
      new appsync.ResolvableField({
        returnType: room.attribute(),
        dataSource: roomDS,
        args: {
          roomId: appsync.GraphqlType.id({ isRequired: true }),
        },
        requestMappingTemplate: appsync.MappingTemplate.fromString(
          f(`
            { "version": "2017-02-28",
              "operation": "UpdateItem",
              "key": {
                "roomId": $util.dynamodb.toDynamoDBJson($ctx.args.roomId),
              },
              "update" : {
                "expression" : "ADD point :step",
                "expressionValues" : {
                  ":step" : {"N": "1"}
                }
              }
            }
          `)
        ),
        responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
      })
    );

    this.api.addMutation(
      "resetPoint",
      new appsync.ResolvableField({
        returnType: room.attribute(),
        dataSource: roomDS,
        args: {
          roomId: appsync.GraphqlType.id({ isRequired: true }),
        },
        requestMappingTemplate: appsync.MappingTemplate.fromString(
          f(`
            { "version": "2017-02-28",
              "operation": "UpdateItem",
              "key": {
                "roomId": $util.dynamodb.toDynamoDBJson($ctx.args.roomId),
              },
              "update" : {
                "expression" : "SET point = :init",
                "expressionValues" : {
                  ":init" : {"N": "0"}
                }
              }
            }
          `)
        ),
        responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
      })
    );

    this.api.addSubscription(
      "roomUpdated",
      new appsync.ResolvableField({
        returnType: room.attribute(),
        dataSource: roomDS,
        args: {
          roomId: appsync.GraphqlType.id({ isRequired: true }),
        },
        directives: [appsync.Directive.subscribe("incPoint", "resetPoint")],
        requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem(
          "roomId",
          "roomId"
        ),
        responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
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

    const roomDS = this.api.addDynamoDbDataSource("roomDS", roomTable);
    const judgeDS = this.api.addDynamoDbDataSource("judgeDS", judgeTable);

    return { roomDS, judgeDS };
  }

  private createTypes() {
    const judge = this.api.addType(
      new appsync.ObjectType("Judge", {
        definition: {
          roomId: appsync.GraphqlType.id({ isRequired: true }),
          judgeId: appsync.GraphqlType.id({ isRequired: true }),
        },
      })
    );

    const room = this.api.addType(
      new appsync.ObjectType("Room", {
        definition: {
          roomId: appsync.GraphqlType.id({ isRequired: true }),
          name: appsync.GraphqlType.string({ isRequired: true }),
          point: appsync.GraphqlType.int({ isRequired: true }),
        },
      })
    );

    return { judge, room };
  }
}
function f(str: string): string {
  return str.replace(/\n/g, "");
}
