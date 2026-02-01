// Network Topology Generator for Cybersecurity Visualization

export type NodeType = 'gateway' | 'firewall' | 'router' | 'unknown' | 'malicious';

export interface NetworkNode {
    id: string;
    name: string;
    type: NodeType;
    ip: string;
    threatLevel: number; // 0-100
    deviceInfo: string;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
    quarantined?: boolean;
}

export interface NetworkLink {
    source: string | NetworkNode;
    target: string | NetworkNode;
    strength: number;
}

export interface NetworkTopology {
    nodes: NetworkNode[];
    links: NetworkLink[];
}

const DEVICE_INFO = {
    gateway: ['Primary Gateway', 'Core Router', 'Edge Gateway'],
    firewall: ['pfSense Firewall', 'Cisco ASA', 'FortiGate', 'Palo Alto'],
    router: ['Cisco Router', 'MikroTik', 'Ubiquiti EdgeRouter'],
    unknown: ['Unknown Device', 'Unidentified', 'New Connection', 'BYOD Device'],
    malicious: ['Botnet Node', 'C&C Server', 'Crypto Miner', 'Port Scanner', 'DDoS Bot']
};

function generateIP(): string {
    const subnet = Math.random() > 0.3 ? '192.168' : Math.random() > 0.5 ? '10.0' : '172.16';
    return `${subnet}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function generateMaliciousIP(): string {
    const maliciousSubnets = ['185.220', '103.224', '45.142', '194.26', '91.216'];
    const subnet = maliciousSubnets[Math.floor(Math.random() * maliciousSubnets.length)];
    return `${subnet}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateNetworkScan(totalNodes: number = 20): NetworkTopology {
    const nodes: NetworkNode[] = [];
    const links: NetworkLink[] = [];

    // 1. Gateway (1 node)
    const gateway: NetworkNode = {
        id: 'gateway-0',
        name: 'Primary Gateway',
        type: 'gateway',
        ip: '192.168.1.1',
        threatLevel: 5,
        deviceInfo: 'Primary Gateway',
        x: 0,
        y: 0
    };
    nodes.push(gateway);

    // 2. Firewalls (2-3 nodes)
    const firewallCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < firewallCount; i++) {
        const firewall: NetworkNode = {
            id: `firewall-${i}`,
            name: `Firewall ${i + 1}`,
            type: 'firewall',
            ip: generateIP(),
            threatLevel: Math.floor(Math.random() * 15),
            deviceInfo: randomElement(DEVICE_INFO.firewall)
        };
        nodes.push(firewall);
        links.push({ source: gateway.id, target: firewall.id, strength: 2 });
    }

    // 3. Routers (3-5 nodes)
    const routerCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < routerCount; i++) {
        const router: NetworkNode = {
            id: `router-${i}`,
            name: `Router ${i + 1}`,
            type: 'router',
            ip: generateIP(),
            threatLevel: Math.floor(Math.random() * 20),
            deviceInfo: randomElement(DEVICE_INFO.router)
        };
        nodes.push(router);
        // Connect to gateway or a firewall
        const parent = Math.random() > 0.5 ? gateway.id : `firewall-${Math.floor(Math.random() * firewallCount)}`;
        links.push({ source: parent, target: router.id, strength: 1.5 });
    }

    // 4. Fill remaining with mix of unknown and malicious
    const remaining = totalNodes - nodes.length;
    const maliciousCount = Math.floor(remaining * 0.25); // 25% malicious
    const unknownCount = remaining - maliciousCount;

    // Unknown devices
    for (let i = 0; i < unknownCount; i++) {
        const unknown: NetworkNode = {
            id: `unknown-${i}`,
            name: `Device ${nodes.length + 1}`,
            type: 'unknown',
            ip: generateIP(),
            threatLevel: Math.floor(Math.random() * 40) + 20,
            deviceInfo: randomElement(DEVICE_INFO.unknown)
        };
        nodes.push(unknown);
        // Connect to routers or firewalls
        const parentType = Math.random() > 0.5 ? 'router' : 'firewall';
        const parentNodes = nodes.filter(n => n.type === parentType);
        if (parentNodes.length > 0) {
            const parent = randomElement(parentNodes);
            links.push({ source: parent.id, target: unknown.id, strength: 1 });
        }
    }

    // Malicious nodes
    for (let i = 0; i < maliciousCount; i++) {
        const malicious: NetworkNode = {
            id: `malicious-${i}`,
            name: `Threat ${i + 1}`,
            type: 'malicious',
            ip: generateMaliciousIP(),
            threatLevel: Math.floor(Math.random() * 30) + 70,
            deviceInfo: randomElement(DEVICE_INFO.malicious),
            quarantined: false
        };
        nodes.push(malicious);
        // Malicious nodes connect to random nodes (trying to infiltrate)
        const target = randomElement(nodes.filter(n => n.type !== 'malicious'));
        links.push({ source: target.id, target: malicious.id, strength: 0.5 });
    }

    return { nodes, links };
}
