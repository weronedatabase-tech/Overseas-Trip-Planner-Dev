const { JSDOM, VirtualConsole } = require('jsdom');
const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console);

JSDOM.fromURL("http://localhost:3000/roster.html", {
  runScripts: "dangerously",
  resources: "usable",
  virtualConsole
}).then(dom => {
  setTimeout(() => {
    console.log("Done");
    process.exit(0);
  }, 3000);
}).catch(console.error);
