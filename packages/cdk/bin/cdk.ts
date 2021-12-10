import { App } from "aws-cdk-lib";

import { MainStack } from "../lib/main-stack";

const NAME_PREFIX = "kinchan-panel";

const app = new App();
new MainStack(app, `${NAME_PREFIX}-main`);
