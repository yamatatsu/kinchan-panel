import { useEffect, useReducer, useState } from "react";
import { API } from "aws-amplify";
import { imgs, se } from "./constants";

API.configure({
  aws_project_region: "ap-northeast-1",
  // aws_cognito_identity_pool_id: process.env.REACT_APP_IDENTITY_POOL_ID,
  // aws_cognito_region: process.env.REACT_APP_REGION,
  // aws_user_pools_id: process.env.REACT_APP_USER_POOL_ID,
  // aws_user_pools_web_client_id: process.env.REACT_APP_CLIENT_ID,
  // oauth: {},
  // Auth: {
  //   // REQUIRED - Amazon Cognito Identity Pool ID
  //   identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
  //   // REQUIRED - Amazon Cognito Region
  //   region: process.env.REACT_APP_REGION,
  //   // OPTIONAL - Amazon Cognito User Pool ID
  //   userPoolId: process.env.REACT_APP_USER_POOL_ID,
  //   // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
  //   userPoolWebClientId: process.env.REACT_APP_CLIENT_ID,
  // },
  aws_appsync_graphqlEndpoint:
    "https://xxxxxx.appsync-api.us-east-1.amazonaws.com/graphql",
  aws_appsync_region: "us-east-1",
  aws_appsync_authenticationType: "API_KEY",
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

    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyA":
        case "KeyS":
        case "KeyD":
        case "Space":
          e.preventDefault();
          pm.increment();
          break;
        case "KeyR":
          e.preventDefault();
          pm.reset();
          break;
        case "KeyM":
          e.preventDefault();
          pm.changeVolume(0);
          break;
        default:
          break;
      }
    });
  }, []);

  return (
    <>
      <nav
        className="navbar is-warning"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand is-vertical-center">
          <h1 className="title is-4" style={{ margin: "0 12px 0 12px" }}>
            欽ちゃんの仮装大賞パネル 再現アプリ
          </h1>
          <button id="help" className="button is-primary" onClick={toggleHelp}>
            <i className="far fa-question-circle"></i>
          </button>
          <button
            id="show-helper-buttons"
            className="button"
            style={{ marginLeft: "10px" }}
            onClick={toggleHelper}
          >
            <i className="fas fa-gamepad"></i>
          </button>
        </div>
      </nav>

      <section id="main-section" className="section">
        <div className="container is-center">
          <div className="columns is-mobile">
            <div className="column" style={{ position: "relative" }}>
              <div style={{ bottom: 0, position: "absolute" }}></div>
            </div>
            <div className="canvas-wrapper">
              <canvas id="contentMain" width="160" height="720"></canvas>
              <canvas id="contentFrameAnim" width="160" height="720"></canvas>
            </div>
            <div className="column">
              {showHelper && (
                <div id="helper-buttons">
                  <div style={{ marginBottom: "30px" }}>
                    <button
                      id="reset"
                      className="button"
                      onClick={(e) => {
                        pm?.reset();
                        e.currentTarget.blur();
                      }}
                    >
                      リセット
                    </button>
                  </div>
                  <div style={{ marginBottom: "30px" }}>
                    <button
                      id="increment"
                      className="button is-primary"
                      onClick={(e) => {
                        pm?.increment();
                        e.currentTarget.blur();
                      }}
                    >
                      加点
                    </button>
                  </div>
                  <div>
                    <div>音量</div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value="5"
                      className="slider"
                      id="volumeRange"
                      onChange={(e) => {
                        // @ts-expect-error
                        const volume = e.target.value * 0.1;
                        pm?.changeVolume(volume);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showHelp && (
        <div className="modal is-active" onClick={toggleHelp}>
          <div className="modal-background"></div>
          <div className="modal-content">
            <div className="notification">
              操作方法
              <br />
              加点：A S D Space キー
              <br />
              リセット：R キー
              <br />
              v0.0.7
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const WIDTH = 160;
const HEIGHT = 720;
const DEFAULT_SE_VOLUME = 0.5; // 0.0 ~ 1.0
class PanelManager {
  count: number;
  frameAnim: {
    context: CanvasRenderingContext2D;
    step: number;
    maxStep: number;
    instance: number | undefined;
  };
  failTimer: {
    instance: number | undefined;
    limit: number;
  };
  isLoadedSE;
  constructor(
    private readonly context: CanvasRenderingContext2D,
    contextFrameAnim: CanvasRenderingContext2D
  ) {
    this.count = 0;
    this.frameAnim = {
      context: contextFrameAnim,
      step: 0,
      maxStep: 6,
      instance: undefined,
    };
    this.failTimer = {
      instance: undefined,
      limit: 3000,
    };
    this.isLoadedSE = false; // iPhoneなどリソース読み込みに一部制限があるもの向け

    this.changeVolume(DEFAULT_SE_VOLUME);

    this.preloadSE();
    this.preloadImages();

    this.drawBg();
  }

  preloadImages() {
    const drawList = [imgs.bg, imgs.frameAnim, ...imgs.numbers];
    let loadedCount = 0;

    drawList.map((img) => {
      img.instance.onload = () => {
        loadedCount++;
        if (loadedCount >= drawList.length) {
          this.preloadSuccess();
        }
      };
      img.instance.src = img.path;
    });
  }

  preloadSE() {
    const seList = [se.clear, se.fail, ...se.numbers];
    seList.map((se) => {
      se.load();
    });
  }

  preloadSuccess() {
    this.drawBg();
  }

  clearSE() {
    se.clear.pause();
    se.clear.currentTime = 0;
    se.fail.pause();
    se.fail.currentTime = 0;

    se.numbers.forEach((n) => {
      n.pause();
      n.currentTime = 0;
    });
    clearTimeout(this.failTimer.instance);
  }

  reset() {
    this.clearSE();
    this.clearAllCanvas();
    clearInterval(this.frameAnim.instance);
    this.count = 0;
    this.frameAnim.step = 0;

    this.drawBg();
  }

  getCount() {
    return this.count;
  }

  increment() {
    if (this.count >= 20) {
      return;
    }

    this.count++;

    // サウンド再生
    se.numbers[this.count - 1].play();

    // 画像配置
    this.drawNowCount();

    // 15点以上で合格サウンド
    if (this.count == 15) {
      se.fail.pause();
      se.fail.currentTime = 0;
      se.clear.play();
      this.playFrameAnim();
    }

    // 残念サウンド
    clearTimeout(this.failTimer.instance);
    if (this.count < 15) {
      this.failTimer.instance = window.setTimeout(() => {
        se.fail.play();
      }, this.failTimer.limit);
    }
  }

  draw(imgInstance: CanvasImageSource) {
    this.context.drawImage(imgInstance, 0, 0, WIDTH, HEIGHT);
  }

  drawBg() {
    this.draw(imgs.bg.instance);
  }

  drawNowCount() {
    this.draw(imgs.numbers[this.count - 1].instance);
  }

  drawCount(count: number) {
    this.draw(imgs.numbers[count - 1].instance);
  }

  drawFrameAnim() {
    this.frameAnim.context.drawImage(
      imgs.frameAnim.instance,
      WIDTH * this.frameAnim.step,
      0,
      WIDTH,
      HEIGHT,
      0,
      0,
      WIDTH,
      HEIGHT
    );
  }

  clearAllCanvas() {
    this.clearMainCanvas();
    this.clearFrameAnimCanvas();
  }

  clearMainCanvas() {
    this.context.clearRect(0, 0, WIDTH, HEIGHT);
  }

  clearFrameAnimCanvas() {
    this.frameAnim.context.clearRect(0, 0, WIDTH, HEIGHT);
  }

  playFrameAnim() {
    this.frameAnim.instance = window.setInterval(() => {
      this.clearFrameAnimCanvas();
      this.drawFrameAnim();

      if (this.frameAnim.step >= this.frameAnim.maxStep) {
        this.frameAnim.step = 1;
      } else {
        this.frameAnim.step++;
      }
    }, 50);
  }

  /**
   * @param {number} value - 0.0 ~ 1.0
   */
  changeVolume(value: number) {
    se.numbers.forEach((_, i) => {
      se.numbers[i].volume = value;
    });
    se.clear.volume = value;
    se.fail.volume = value;
  }
}

const useToggle = (initial: boolean = false) =>
  useReducer((b: boolean) => !b, initial);
