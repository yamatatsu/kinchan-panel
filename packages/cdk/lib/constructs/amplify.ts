import { Construct } from "constructs";
import { Stack, SecretValue } from "aws-cdk-lib";
import * as amplify from "@aws-cdk/aws-amplify-alpha";

export class AmplifyConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const app = new amplify.App(this, "app", {
      appName: Stack.of(this).stackName,
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: "yamatatsu",
        repository: "kinchan-panel",
        oauthToken: SecretValue.secretsManager("kinchan-panel-secrets", {
          jsonField: "github-access-token",
        }),
      }),
    });
    app.addBranch("main");
  }
}
