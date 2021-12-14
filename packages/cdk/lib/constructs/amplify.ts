import { Construct } from "constructs";
import { Stack, SecretValue, aws_codebuild } from "aws-cdk-lib";
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
      basicAuth: amplify.BasicAuth.fromGeneratedPassword("tatsuyama"),
      buildSpec: aws_codebuild.BuildSpec.fromObject({
        version: "0.2",
        frontend: {
          phases: {
            // install: {
            //   "runtime-versions": { nodejs: "14" },
            // },
            preBuild: {
              commands: [
                "node -v",
                "nvm install 14",
                "nvm use 14",
                "node -v",
                "yarn",
              ],
            },
            build: {
              commands: ["yarn build"],
            },
            postBuild: {},
          },
          reports: {},
          artifacts: {
            baseDirectory: "packages/webpage/dist",
            files: ["**/*"],
          },
        },
      }),
    });
    app.addBranch("main");
  }
}
