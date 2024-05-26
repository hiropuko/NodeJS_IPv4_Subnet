// npm install ip

const ip = require('ip');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function calculateSubnets(ipWithMask, numSubnets) {
    try {
        const network = ip.cidrSubnet(ipWithMask);
        const subnetMaskLength = network.subnetMaskLength;
        const additionalBits = Math.ceil(Math.log2(numSubnets));

        const newPrefix = subnetMaskLength + additionalBits;

        if (newPrefix > 32) {
            return "Ошибка: Недостаточно адресов для указанного количества подсетей.";
        }

        const subnets = [];

        let currentSubnet = ip.toLong(network.networkAddress);

        for (let i = 0; i < numSubnets; i++) {
            const subnetNetworkAddress = ip.fromLong(currentSubnet);
            const subnetBroadcastAddress = ip.fromLong(currentSubnet + Math.pow(2, 32 - newPrefix) - 1);
            const firstHost = currentSubnet + 1;
            const lastHost = currentSubnet + Math.pow(2, 32 - newPrefix) - 2;

            subnets.push({
                network_address: subnetNetworkAddress,
                broadcast_address: subnetBroadcastAddress,
                netmask: ip.fromPrefixLen(newPrefix),
                num_hosts: Math.pow(2, 32 - newPrefix) - 2,
                host_range: (firstHost < lastHost)
                    ? `${ip.fromLong(firstHost)} - ${ip.fromLong(lastHost)}`
                    : "N/A"
            });

            currentSubnet += Math.pow(2, 32 - newPrefix);
        }

        return subnets;
    } catch (e) {
        return `Ошибка: ${e.message}`;
    }
}

rl.question("Введите IP-адрес с маской подсети (например, 192.168.1.0/24): ", (ipWithMask) => {
    rl.question("Введите количество подсетей: ", (numSubnets) => {
        numSubnets = parseInt(numSubnets, 10);

        const startTime = process.hrtime();  // Записываем начальное время
        const subnets = calculateSubnets(ipWithMask, numSubnets);
        const endTime = process.hrtime(startTime);  // Записываем конечное время

        const executionTime = endTime[0] + endTime[1] / 1e9;  // Вычисляем время выполнения

        if (typeof subnets === 'string') {
            console.log(subnets);
        } else {
            subnets.forEach((subnet, index) => {
                console.log(`Подсеть ${index + 1}:`);
                console.log(`  Сетевой адрес: ${subnet.network_address}`);
                console.log(`  Широковещательный адрес: ${subnet.broadcast_address}`);
                console.log(`  Маска подсети: ${subnet.netmask}`);
                console.log(`  Количество хостов: ${subnet.num_hosts}`);
                console.log(`  Диапазон доступных IP-адресов: ${subnet.host_range}\n`);
            });
        }

        console.log(`Время выполнения: ${executionTime.toFixed(6)} секунд`);
        rl.close();
    });
});
10
