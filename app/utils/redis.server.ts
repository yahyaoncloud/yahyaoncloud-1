import { createClient } from 'redis';

let client: ReturnType<typeof createClient> | null = null;

export async function getRedis() {
    if (!client) {
        client = createClient({
            username: 'default',
            password: 'KLukpff04tweIkEJYDGkjhn4KPlf6332',
            socket: {
                host: 'redis-11024.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
                port: 11024,
            },
        });

        client.on('error', (err) => console.error('Redis Client Error:', err));

        await client.connect();
    }

    return client;
}