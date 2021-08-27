const { Workflow, Tasks } = require('task-workflow');

const On = '1';

const isPatchVersion = () => process.env.patch !== On;

new Workflow('to-self', {
  description: '提交到远程',
  steps: [
    { name: '测试', use: Tasks.Shell.run({ cmd: 'npm run test' }) },
    { name: '获取提交信息', use: Tasks.AskFor.commitMessage() },
    { name: '提交', use: Tasks.Git.commit(message => [{ message }]) },
    {
      name: '版本信息',
      skip: async () =>
        !(await Tasks.AskFor.shouldContinue({
          message: '是否更新版本？',
        })()),
      use: () => (process.env.patch = On),
    },
    {
      name: '打版本',
      skip: isPatchVersion,
      use: Tasks.Shell.run({ cmd: 'npm version patch' }),
    },
    { name: '推送', use: Tasks.Git.push() },
    {
      name: '推送tag',
      skip: isPatchVersion,
      use: Tasks.Shell.run({ cmd: 'git push --tags' }),
    },
    {
      name: '发布到npm',
      skip: isPatchVersion,
      use: Tasks.Shell.run({ cmd: 'npm publish' }),
    },
  ],
});
