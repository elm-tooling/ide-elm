const path = require("path");
const { AutoLanguageClient } = require("atom-languageclient");

class ElmLanguageClient extends AutoLanguageClient {
  getGrammarScopes() {
    return ["source.elm"];
  }

  getLanguageName() {
    return "Elm";
  }

  getServerName() {
    return "elm-language-server";
  }

  startServerProcess() {
    return super.spawnChildNode(
      ["node_modules/@elm-tooling/elm-language-server/out/index.js", "--stdio"],
      { cwd: path.join(__dirname, "..") }
    );
  }

  deactivate() {
    let deactivate = super.deactivate();
    let cancel = new Promise((resolve, _reject) => {
      deactivate.then(_result => {
        resolve();
      });
    });

    return Promise.race([deactivate, this.createTimeoutPromise(2000, cancel)]);
  }

  createTimeoutPromise(milliseconds, cancelPromise) {
    let cancel = false;
    cancelPromise.then(_result => {
      cancel = true;
    });

    return new Promise((resolve, reject) => {
      let timeout = setTimeout(() => {
        clearTimeout(timeout);

        if (cancel !== true) {
          this.logger.error(
            `Server failed to shutdown in ${milliseconds}ms, forcing termination`
          );
          resolve();
        } else {
          reject();
        }
      }, milliseconds);
    });
  }

  /*
   * Enable the LSP debugging found in Settings -> Core -> Debug LSP.
   */
  enableDebug(enabled) {
    atom.config.set("core.debugLSP", enabled);
  }
}

module.exports = new ElmLanguageClient();
