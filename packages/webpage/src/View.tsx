type Props = {
  toggleHelp: () => void;
  toggleHelper: () => void;
  showHelp: boolean;
  showHelper: boolean;
  reset: () => void;
  increment: () => void;
  changeVolume: (volume: number) => void;
};

export default function View(props: Props) {
  const {
    toggleHelp,
    toggleHelper,
    showHelp,
    showHelper,
    reset,
    increment,
    changeVolume,
  } = props;

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
                        reset();
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
                        increment();
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
                        changeVolume(volume);
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
              加点: A S D Space キー
              <br />
              リセット: R キー
              <br />
              v0.0.7
            </div>
          </div>
        </div>
      )}
    </>
  );
}
