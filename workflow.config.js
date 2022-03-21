const { Workflow, Tasks } = require('task-workflow');

new Workflow('to-self', {
  description: '提交到远程',
  steps: [
    {
      name: '构建',
      skip: async () =>
        !(await Tasks.AskFor.shouldContinue({ message: '是否需要构建？' })()),
      use: Tasks.Shell.run({ cmd: 'npm run build' }),
    },
    { name: '测试', use: Tasks.Shell.run({ cmd: 'npm run test' }) },
    { name: '获取提交信息', use: Tasks.AskFor.commitMessage() },
    { name: '提交', use: Tasks.Git.commit(message => [{ message }]) },
    { name: '推送', use: Tasks.Git.push() },
  ],
});

new Workflow('release:major', {
  description: 'major版本',
  steps: [
    {
      name: '构建',
      skip: async () =>
        !(await Tasks.AskFor.shouldContinue({ message: '是否需要构建？' })()),
      use: Tasks.Shell.run({ cmd: 'npm run build' }),
    },
    { name: '测试', use: Tasks.Shell.run({ cmd: 'npm run test' }) },
    { name: '获取提交信息', use: Tasks.AskFor.commitMessage() },
    { name: '提交', use: Tasks.Git.commit(message => [{ message }]) },
    {
      name: '打版本',
      use: Tasks.Shell.run({
        cmd: 'npm run version:major',
      }),
    },
    {
      name: '生成日志',
      use: Tasks.Shell.run({
        cmd: 'npm run changelog',
      }),
    },
    {
      name: '提交',
      use: Tasks.Git.commit({
        message: 'chore(release): update version and changelog',
      }),
    },
    { name: '推送', use: Tasks.Git.push() },
    {
      name: '推送tag',
      use: Tasks.Shell.run({ cmd: 'git push --tags' }),
    },
    {
      name: '发布到npm',
      skip: async () =>
        !(await Tasks.AskFor.shouldContinue({ message: '是否更新至npm？' })()),
      use: Tasks.Shell.run({ cmd: 'npm publish' }),
    },
  ],
});

new Workflow('release:minor', {
  description: 'minor版本',
  steps: [
    {
      name: '构建',
      skip: async () =>
        !(await Tasks.AskFor.shouldContinue({ message: '是否需要构建？' })()),
      use: Tasks.Shell.run({ cmd: 'npm run build' }),
    },
    { name: '测试', use: Tasks.Shell.run({ cmd: 'npm run test' }) },
    { name: '获取提交信息', use: Tasks.AskFor.commitMessage() },
    { name: '提交', use: Tasks.Git.commit(message => [{ message }]) },
    {
      name: '打版本',
      use: Tasks.Shell.run({
        cmd: 'npm run version:minor',
      }),
    },
    {
      name: '生成日志',
      use: Tasks.Shell.run({
        cmd: 'npm run changelog',
      }),
    },
    {
      name: '提交',
      use: Tasks.Git.commit({
        message: 'chore(release): update version and changelog',
      }),
    },
    { name: '推送', use: Tasks.Git.push() },
    {
      name: '推送tag',
      use: Tasks.Shell.run({ cmd: 'git push --tags' }),
    },
    {
      name: '发布到npm',
      skip: async () =>
        !(await Tasks.AskFor.shouldContinue({ message: '是否更新至npm？' })()),
      use: Tasks.Shell.run({ cmd: 'npm publish' }),
    },
  ],
});

new Workflow('release:patch', {
  description: 'patch版本',
  steps: [
    {
      name: '构建',
      skip: async () =>
        !(await Tasks.AskFor.shouldContinue({ message: '是否需要构建？' })()),
      use: Tasks.Shell.run({ cmd: 'npm run build' }),
    },
    { name: '测试', use: Tasks.Shell.run({ cmd: 'npm run test' }) },
    { name: '获取提交信息', use: Tasks.AskFor.commitMessage() },
    { name: '提交', use: Tasks.Git.commit(message => [{ message }]) },
    {
      name: '打版本',
      use: Tasks.Shell.run({
        cmd: 'npm run version:patch',
      }),
    },
    {
      name: '生成日志',
      use: Tasks.Shell.run({
        cmd: 'npm run changelog',
      }),
    },
    {
      name: '提交',
      use: Tasks.Git.commit({
        message: 'chore(release): update version and changelog',
      }),
    },
    { name: '推送', use: Tasks.Git.push() },
    {
      name: '推送tag',
      use: Tasks.Shell.run({ cmd: 'git push --tags' }),
    },
    {
      name: '发布到npm',
      skip: async () =>
        !(await Tasks.AskFor.shouldContinue({ message: '是否更新至npm？' })()),
      use: Tasks.Shell.run({ cmd: 'npm publish' }),
    },
  ],
});
