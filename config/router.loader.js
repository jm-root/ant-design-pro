const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

class Loader {
  constructor() {
    this.dir = path.join(__dirname, '../src/pages');
    this.locales = {};
    this.routes = [];
    this.load();
  }

  load() {
    const { dir } = this;
    fs.readdirSync(dir)
      .filter(file => fs.statSync(path.join(dir, file)).isDirectory() && file.indexOf('.') !== 0)
      .forEach(doc => {
        this.loadApp(doc);
      });

    this.mergeLocales();
  }

  // 加载 app, 合并 routes
  loadApp(filePath) {
    const { dir } = this;
    const file = path.join(dir, filePath, '/routes.json');
    if (!fs.existsSync(file)) return;
    this.routes.push(...fse.readJsonSync(file));
    this.loadLocales(filePath);
    this.copyMocks(filePath);
  }

  // 合并 locales
  loadLocales(filePath) {
    const { dir, locales } = this;
    const localePath = path.join(dir, filePath, '/locales');
    if (!fs.existsSync(localePath)) return;
    fs.readdirSync(localePath)
      .filter(
        doc => fs.statSync(path.join(localePath, doc)).isFile() && doc.indexOf('.json') !== -1
      )
      .forEach(doc => {
        const key = path.basename(doc, '.json');
        const value = fse.readJsonSync(path.join(localePath, doc));
        locales[key] = { ...locales[key], ...value };
      });
  }

  // 复制 mock
  copyMocks(filePath) {
    const { dir } = this;
    const mockPath = path.join(dir, filePath, '/mock');
    if (!fs.existsSync(mockPath)) return;
    fse.copySync(mockPath, path.join(__dirname, '../mock'));
  }

  // 合并来自 app 的locales，并更新 src/locales
  mergeLocales() {
    const { locales } = this;
    Object.keys(locales).forEach(key => {
      const value = locales[key];
      const file = path.join(__dirname, `../src/locales/${key}.js`);
      let s = fs.readFileSync(file);
      s = s.toString();
      const s0 = s.substring(0, s.indexOf('{') + 1);
      const s1 = s.substring(s.indexOf('{') + 1, s.indexOf('  ...'));
      const s2 = s.substring(s.indexOf('  ...'));
      let o = eval(`({${s1}})`);
      o = { ...o, ...value };
      s = JSON.stringify(o, null, 2);
      s = s.substring(s.indexOf('{') + 1, s.indexOf('}') - 1);
      s = `${s0}${s},\n${s2}`;
      fse.outputFileSync(file, s);
    });
  }
}

const loader = new Loader();

export default loader.routes;
