import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // amplifyがビルドできない問題の対応 https://github.com/aws-amplify/amplify-ui/issues/268#issuecomment-953375909
      "./runtimeConfig": "./runtimeConfig.browser",
    },
  },
});
