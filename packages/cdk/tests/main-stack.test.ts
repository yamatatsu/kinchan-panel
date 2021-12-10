import { App, assertions } from "aws-cdk-lib";

import { MainStack } from "../lib/main-stack";

jest.mock("../lib/consts", () => ({
  STATIC_RESOURCE_PATH: `${__dirname}/dummy`,
}));

test("snapshot test", () => {
  const app = new App();

  const target = new MainStack(app, "Target");

  expect(assertions.Template.fromStack(target).toJSON()).toMatchSnapshot();
});
