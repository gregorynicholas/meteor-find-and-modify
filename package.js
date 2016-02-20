Package.describe({
  name: 'gregorynicholas:find-and-modify',
  summary: 'meteor findAndModify (server only)',
  version: '0.2.1.1',
  git: 'https://github.com/gregorynicholas/meteor-find-and-modify.git'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('mongo', ['server']);
  api.addFiles('find-and-modify.js', ['server']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('gregorynicholas:find-and-modify');
  api.addFiles('find_and_modify_tests.js');
});
