import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import { WebsiteConstruct } from "./constructs/website";
import { AmplifyConstruct } from "./constructs/amplify";

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new AmplifyConstruct(this, "amplify");

    new WebsiteConstruct(this, "website");
  }
}
