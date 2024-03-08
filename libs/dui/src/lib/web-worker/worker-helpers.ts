export const getJSRunnerWorker = (): Worker => {
  const worker = new Worker(new URL('./js-runner.worker', import.meta.url), {
    name: 'CustomWorker',
    type: 'module',
  });
  return worker;
};
