import { Construct } from "constructs";
import {
  aws_cloudfront,
  aws_s3,
  RemovalPolicy,
  aws_s3_deployment,
  Duration,
} from "aws-cdk-lib";
import { STATIC_RESOURCE_PATH } from "../consts";

export class WebsiteConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucket = new aws_s3.Bucket(this, "bucket", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const oai = new aws_cloudfront.OriginAccessIdentity(this, "oai");
    bucket.grantRead(oai);

    const distribution = new aws_cloudfront.CloudFrontWebDistribution(
      this,
      "distribution",
      {
        defaultRootObject: "index.html",
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: oai,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                defaultTtl: Duration.seconds(0),
                maxTtl: Duration.seconds(0),
                minTtl: Duration.seconds(0),
              },
            ],
          },
        ],
        priceClass: aws_cloudfront.PriceClass.PRICE_CLASS_200,
      }
    );

    new aws_s3_deployment.BucketDeployment(this, "deploy", {
      sources: [aws_s3_deployment.Source.asset(STATIC_RESOURCE_PATH)],
      destinationBucket: bucket,
      // TODO: まだドカドカ開発するのでキャッシュを0にして、invalidationはしない
      // distribution: distribution,
    });
  }
}
