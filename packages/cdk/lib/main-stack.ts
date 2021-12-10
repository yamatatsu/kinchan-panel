import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { WebsiteConstruct } from "./constructs/website";

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new WebsiteConstruct(this, "website");
  }
}
