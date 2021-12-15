import { useEffect, useReducer, useState } from "react";
import gql from "graphql-tag";
import { AUTH_TYPE } from "aws-appsync-auth-link";
import * as mutations from "./graphql/mutations";
import * as subscriptions from "./graphql/subscriptions";
import { createClient } from "./apolloClient";
import { imgs, se } from "./constants";
import { Sound } from "./models/sound";
import { Panel } from "./models/panel";
import View from "./View";

const client = createClient({
  url: import.meta.env.VITE_APPSYNC_GRAPHQL_ENDPOINT,
  region: import.meta.env.VITE_APPSYNC_REGION,
  auth: {
    type: AUTH_TYPE.API_KEY,
    apiKey: import.meta.env.VITE_APPSYNC_API_KEY,
  },
});

export default function App() {
  const [pm, serPm] = useState<PanelManager | null>(null);
  const [showHelper, toggleHelper] = useToggle();
  const [showHelp, toggleHelp] = useToggle();

  useEffect(() => {
    const context = (
      document.getElementById("contentMain") as HTMLCanvasElement
    ).getContext("2d");
    const contextFrameAnim = (
      document.getElementById("contentFrameAnim") as HTMLCanvasElement
    ).getContext("2d");
    if (!context || !contextFrameAnim) throw new Error("ぽえええ");
    const pm = new PanelManager(context, contextFrameAnim);
    serPm(pm);
  }, []);

  const increment = () => {
    // TODO: promise捨てるんだっけ？
    client.mutate({
      mutation: gql(mutations.incPoint),
      variables: { roomId: "test-roomId" },
    });
  };

  const reset = () => {
    // TODO: promise捨てるんだっけ？
    client.mutate({
      mutation: gql(mutations.resetPoint),
      variables: { roomId: "test-roomId" },
    });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyA":
        case "KeyS":
        case "KeyD":
        case "Space":
          e.preventDefault();
          increment();
          break;
        case "KeyR":
          e.preventDefault();
          reset();
          break;
        case "KeyM":
          e.preventDefault();
          pm?.changeVolume(0);
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [pm]);

  useEffect(() => {
    const subscription = client
      .subscribe({
        query: gql(subscriptions.roomUpdated),
        variables: { roomId: "test-roomId" },
      })
      .subscribe({
        next: (data) => {
          console.log(data.data.roomUpdated);
          pm?.setCount(data.data.roomUpdated.point);
        },
        error: (error) => {
          console.warn(error);
        },
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [pm]);

  return (
    <View
      {...{
        toggleHelp,
        toggleHelper,
        showHelp,
        showHelper,
        increment,
        reset: () => pm?.reset(),
        changeVolume: (volume: number) => pm?.changeVolume(volume),
      }}
    />
  );
}

const DEFAULT_SE_VOLUME = 0.5; // 0.0 ~ 1.0
// TODO: hooksに吸収できるかも
class PanelManager {
  private readonly sound: Sound;
  private readonly panel: Panel;

  private count: number;
  private failTimerInstance: number | undefined;

  constructor(
    context: CanvasRenderingContext2D,
    contextFrameAnim: CanvasRenderingContext2D
  ) {
    this.count = 0;
    this.sound = new Sound(se, DEFAULT_SE_VOLUME);
    this.panel = new Panel(imgs, context, contextFrameAnim);
  }

  reset() {
    this.sound.reset();
    this.panel.reset();
    this.count = 0;
    clearTimeout(this.failTimerInstance);
  }

  changeVolume(volume: number) {
    this.sound.changeVolume(volume);
  }

  setCount(_count: number) {
    if (_count === 0) {
      this.reset();
      return;
    }
    this.count = _count;

    // サウンド再生
    this.sound.playCountUp(this.count);

    // 画像配置
    this.panel.drawCount(this.count);

    // 15点以上で合格サウンド
    if (this.count == 15) {
      this.sound.playCongrats();
      this.panel.playFrameAnim();
    }

    clearTimeout(this.failTimerInstance);
    if (this.count < 15) {
      this.failTimerInstance = window.setTimeout(() => {
        // 残念サウンド
        this.sound.playFailure();
      }, 3000);
    }
  }
}

const useToggle = (initial: boolean = false) =>
  useReducer((b: boolean) => !b, initial);
