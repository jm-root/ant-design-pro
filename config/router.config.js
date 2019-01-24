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

export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
      { path: '/user/register-result', component: './User/RegisterResult' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['admin', 'user'],
    routes: [
      ...loader.routes,
      // dashboard
      { path: '/', redirect: '/dashboard/analysis' },
      {
        path: '/dashboard',
        name: 'dashboard',
        icon: 'dashboard',
        routes: [
          {
            path: '/dashboard/analysis',
            name: 'analysis',
            component: './Dashboard/Analysis',
          },
          {
            path: '/dashboard/monitor',
            name: 'monitor',
            component: './Dashboard/Monitor',
          },
          {
            path: '/dashboard/workplace',
            name: 'workplace',
            component: './Dashboard/Workplace',
          },
        ],
      },
      // forms
      {
        path: '/form',
        icon: 'form',
        name: 'form',
        routes: [
          {
            path: '/form/basic-form',
            name: 'basicform',
            component: './Forms/BasicForm',
          },
          {
            path: '/form/step-form',
            name: 'stepform',
            component: './Forms/StepForm',
            hideChildrenInMenu: true,
            routes: [
              {
                path: '/form/step-form',
                redirect: '/form/step-form/info',
              },
              {
                path: '/form/step-form/info',
                name: 'info',
                component: './Forms/StepForm/Step1',
              },
              {
                path: '/form/step-form/confirm',
                name: 'confirm',
                component: './Forms/StepForm/Step2',
              },
              {
                path: '/form/step-form/result',
                name: 'result',
                component: './Forms/StepForm/Step3',
              },
            ],
          },
          {
            path: '/form/advanced-form',
            name: 'advancedform',
            authority: ['admin'],
            component: './Forms/AdvancedForm',
          },
        ],
      },
      // list
      {
        path: '/list',
        icon: 'table',
        name: 'list',
        routes: [
          {
            path: '/list/table-list',
            name: 'searchtable',
            component: './List/TableList',
          },
          {
            path: '/list/basic-list',
            name: 'basiclist',
            component: './List/BasicList',
          },
          {
            path: '/list/card-list',
            name: 'cardlist',
            component: './List/CardList',
          },
          {
            path: '/list/search',
            name: 'searchlist',
            component: './List/List',
            routes: [
              {
                path: '/list/search',
                redirect: '/list/search/articles',
              },
              {
                path: '/list/search/articles',
                name: 'articles',
                component: './List/Articles',
              },
              {
                path: '/list/search/projects',
                name: 'projects',
                component: './List/Projects',
              },
              {
                path: '/list/search/applications',
                name: 'applications',
                component: './List/Applications',
              },
            ],
          },
        ],
      },
      {
        path: '/profile',
        name: 'profile',
        icon: 'profile',
        routes: [
          // profile
          {
            path: '/profile/basic',
            name: 'basic',
            component: './Profile/BasicProfile',
          },
          {
            path: '/profile/advanced',
            name: 'advanced',
            authority: ['admin'],
            component: './Profile/AdvancedProfile',
          },
        ],
      },
      {
        name: 'result',
        icon: 'check-circle-o',
        path: '/result',
        routes: [
          // result
          {
            path: '/result/success',
            name: 'success',
            component: './Result/Success',
          },
          { path: '/result/fail', name: 'fail', component: './Result/Error' },
        ],
      },
      {
        name: 'exception',
        icon: 'warning',
        path: '/exception',
        routes: [
          // exception
          {
            path: '/exception/403',
            name: 'not-permission',
            component: './Exception/403',
          },
          {
            path: '/exception/404',
            name: 'not-find',
            component: './Exception/404',
          },
          {
            path: '/exception/500',
            name: 'server-error',
            component: './Exception/500',
          },
          {
            path: '/exception/trigger',
            name: 'trigger',
            hideInMenu: true,
            component: './Exception/TriggerException',
          },
        ],
      },
      {
        name: 'account',
        icon: 'user',
        path: '/account',
        routes: [
          {
            path: '/account/center',
            name: 'center',
            component: './Account/Center/Center',
            routes: [
              {
                path: '/account/center',
                redirect: '/account/center/articles',
              },
              {
                path: '/account/center/articles',
                component: './Account/Center/Articles',
              },
              {
                path: '/account/center/applications',
                component: './Account/Center/Applications',
              },
              {
                path: '/account/center/projects',
                component: './Account/Center/Projects',
              },
            ],
          },
          {
            path: '/account/settings',
            name: 'settings',
            component: './Account/Settings/Info',
            routes: [
              {
                path: '/account/settings',
                redirect: '/account/settings/base',
              },
              {
                path: '/account/settings/base',
                component: './Account/Settings/BaseView',
              },
              {
                path: '/account/settings/security',
                component: './Account/Settings/SecurityView',
              },
              {
                path: '/account/settings/binding',
                component: './Account/Settings/BindingView',
              },
              {
                path: '/account/settings/notification',
                component: './Account/Settings/NotificationView',
              },
            ],
          },
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
