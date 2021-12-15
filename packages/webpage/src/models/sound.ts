type SoundSources = Readonly<{
  numbers: readonly HTMLAudioElement[];
  clear: HTMLAudioElement;
  fail: HTMLAudioElement;
}>;

export class Sound {
  private failTimer: {
    instance: number | undefined;
    limit: number;
  };

  constructor(
    private readonly soundSources: SoundSources,
    defaultVolume: number
  ) {
    this.failTimer = {
      instance: undefined,
      limit: 3000,
    };
    this.changeVolume(defaultVolume);
    this.preloadSE();
  }

  public reset() {
    this.soundSources.clear.pause();
    this.soundSources.clear.currentTime = 0;
    this.soundSources.fail.pause();
    this.soundSources.fail.currentTime = 0;

    this.soundSources.numbers.forEach((n) => {
      n.pause();
      n.currentTime = 0;
    });
  }

  public playCountUp(count: number) {
    const sound = this.soundSources.numbers[count - 1];
    // TODO: throwしたほうが正しいかも。後で考える
    if (!sound) return;
    sound.play();
  }

  public playCongrats() {
    this.soundSources.fail.pause();
    this.soundSources.fail.currentTime = 0;
    this.soundSources.clear.play();
  }

  public playFailure() {
    this.soundSources.fail.play();
  }

  /**
   * @param {number} value - 0.0 ~ 1.0
   */
  public changeVolume(value: number) {
    this.soundSources.numbers.forEach((_, i) => {
      this.soundSources.numbers[i].volume = value;
    });
    this.soundSources.clear.volume = value;
    this.soundSources.fail.volume = value;
  }

  private preloadSE() {
    const seList = [
      this.soundSources.clear,
      this.soundSources.fail,
      ...this.soundSources.numbers,
    ];
    seList.map((se) => {
      se.load();
    });
  }
}
