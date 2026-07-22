import { spawn } from 'child_process';
import os from 'os';

const colors = {
    reset: "\x1b[0m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
    bold: "\x1b[1m"
};

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Ищем IPv4, который не является внутренним (loopback)
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null;
}

const localIP = getLocalIp();

console.log(`${colors.cyan}==================================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}       🍕 EXPRESS PIZZA - ЗАПУСК СЕРВЕРОВ 🍕      ${colors.reset}`);
console.log(`${colors.cyan}==================================================${colors.reset}`);
console.log(`  ${colors.green}${colors.bold}Фронтенд:${colors.reset}`);
console.log(`  ➜ Локально:    ${colors.bold}http://localhost:5173${colors.reset}`);
if (localIP) {
    console.log(`  ➜ В сети (LAN): ${colors.bold}${colors.yellow}http://${localIP}:5173${colors.reset}`);
} else {
    console.log(`  ➜ В сети (LAN): ${colors.red}Сеть недоступна или нет подключения${colors.reset}`);
}
console.log(`\n  ${colors.blue}${colors.bold}Бэкенд API:${colors.reset}`);
console.log(`  ➜ Локально:    ${colors.bold}http://localhost:5000/api${colors.reset}`);
if (localIP) {
    console.log(`  ➜ В сети (LAN): ${colors.bold}${colors.yellow}http://${localIP}:5000/api${colors.reset}`);
}
console.log(`${colors.cyan}==================================================${colors.reset}\n`);

function createProcess(name, command, args, color) {
    const proc = spawn(command, args, { shell: true });

    proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                console.log(`${color}[${name}]${colors.reset} ${line.trim()}`);
            }
        });
    });

    proc.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                console.error(`${colors.red}[${name} ERROR]${colors.reset} ${line.trim()}`);
            }
        });
    });

    proc.on('close', (code) => {
        console.log(`${colors.yellow}[${name}] процесс завершен с кодом ${code}${colors.reset}`);
    });

    return proc;
}

// Запуск бэкенда
console.log(`${colors.blue}[SYSTEM] Запуск Backend...${colors.reset}`);
createProcess('BACKEND', 'npm', ['run', 'server'], colors.blue);

// Запуск фронтенда
console.log(`${colors.green}[SYSTEM] Запуск Frontend...${colors.reset}`);
createProcess('FRONTEND', 'npm', ['run', 'dev'], colors.green);

process.on('SIGINT', () => {
    console.log('\nОстановка всех процессов...');
    process.exit();
});
