type ImageSouces = Readonly<{
  bg: {
    instance: HTMLImageElement;
    path: string;
  };
  numbers: readonly { instance: HTMLImageElement; path: string }[];
  frameAnim: {
    instance: HTMLImageElement;
    path: string;
  };
}>;

const WIDTH = 160;
const HEIGHT = 720;

export class Panel {
  private readonly frameAnim: {
    context: CanvasRenderingContext2D;
    step: number;
    maxStep: number;
    instance: number | undefined;
  };
  constructor(
    private readonly imageSouces: ImageSouces,
    private readonly context: CanvasRenderingContext2D,
    contextFrameAnim: CanvasRenderingContext2D
  ) {
    this.frameAnim = {
      context: contextFrameAnim,
      step: 0,
      maxStep: 6,
      instance: undefined,
    };

    this.preloadImages();

    this.drawBg();
  }

  public reset() {
    this.clearAllCanvas();
    clearInterval(this.frameAnim.instance);
    this.frameAnim.step = 0;

    this.drawBg();
  }

  public drawCount(count: number) {
    const imageSource = this.imageSouces.numbers[count - 1];
    // TODO: throwしたほうが正しいかも。後で考える
    if (!imageSource) return;
    this.draw(this.imageSouces.numbers[count - 1].instance);
  }

  public playFrameAnim() {
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

  private preloadImages() {
    const drawList = [
      this.imageSouces.bg,
      this.imageSouces.frameAnim,
      ...this.imageSouces.numbers,
    ];
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

  private preloadSuccess() {
    this.drawBg();
  }

  private draw(imgInstance: CanvasImageSource) {
    this.context.drawImage(imgInstance, 0, 0, WIDTH, HEIGHT);
  }

  private drawBg() {
    this.draw(this.imageSouces.bg.instance);
  }

  private drawFrameAnim() {
    this.frameAnim.context.drawImage(
      this.imageSouces.frameAnim.instance,
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

  private clearAllCanvas() {
    this.clearMainCanvas();
    this.clearFrameAnimCanvas();
  }

  private clearMainCanvas() {
    this.context.clearRect(0, 0, WIDTH, HEIGHT);
  }

  private clearFrameAnimCanvas() {
    this.frameAnim.context.clearRect(0, 0, WIDTH, HEIGHT);
  }
}
