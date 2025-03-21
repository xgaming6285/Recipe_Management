import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {  // Note: isMaster is deprecated, using isPrimary
    const numCPUs = os.cpus().length;
    
    console.log(`Master process ${process.pid} is running`);
    console.log(`Starting ${numCPUs} worker processes...`);

    // Fork workers based on CPU cores
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Handle worker events
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
        cluster.fork(); // Replace the dead worker
    });

    cluster.on('online', (worker) => {
        console.log(`Worker ${worker.process.pid} is online`);
    });
} else {
    // Worker process
    console.log(`Worker ${process.pid} started`);
    import('./server.js');
} 