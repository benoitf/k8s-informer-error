import {
    CoreV1Api,
    KubeConfig,
    makeInformer,
  } from '@kubernetes/client-node';


const kc = new KubeConfig();
kc.loadFromDefault();

// get argument being the context name
const contextName = process.argv[2];

console.log('using context name', contextName);
// if missing, exit
if (!contextName) {
  console.error('context name missing');
  process.exit(1);
}

const context = kc.contexts.find(c => c.name === contextName);
if (!context) {
  console.error(`Context ${contextName} not found`);
  process.exit(1);
}

const cluster = kc.clusters.find(c => c.name === context.cluster);
if (!cluster) {
  console.error(`Cluster ${context.cluster} not found`);
  process.exit(1);
}
const user = kc.users.find(u => u.name === context.user);
if (!user) {
    console.error('did not find user');
    process.exit(1);
  }

kc.loadFromOptions({
  clusters: [cluster],
  users: [user],
  contexts: [context],
  currentContext: context.name,
});

const ns = context.namespace ?? 'default';
console.log('Using namespace', ns);
console.log('using cluster name', cluster.name);
console.log('using user name', user.name);
const path = `/api/v1/namespaces/${ns}/pods`;
const k8sApi = kc.makeApiClient(CoreV1Api);

const informer = makeInformer(kc, path, () => k8sApi.listNamespacedPod(ns));


informer.on('add', (obj) => {
    console.log('Adding a pod with name', obj?.metadata?.name);
});

informer.on('update', (obj) => {
    console.log('Updating a pod with name', obj?.metadata?.name);
});

informer.on('delete', (obj) => {
    console.log('Deleting a pod with name', obj?.metadata?.name);
});

informer.on('error', (err) => {
 console.log('got error', err);
});

informer.on('connect', (obj) => {
    console.log('Being connected !!!', obj);
});

informer.start();

// wait loop for ever every 2 seconds

// wait 2 seconds using async await
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const wait = async () => {
  while (true) {
    await sleep(2000);
  }
};

await wait();