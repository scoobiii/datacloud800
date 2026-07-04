export interface NvidiaPlatform {
    name: string;
    description: string;
    percentage: number;
    color: string;
}

export const NVIDIA_PLATFORMS: NvidiaPlatform[] = [
    {
        name: 'DGX Platform',
        description: 'Fábrica de IA empresarial para desenvolvimento e implantação de modelos.',
        percentage: 40,
        color: '#34d399', // emerald-400
    },
    {
        name: 'HGX Platform',
        description: 'Um supercomputador construído especificamente para IA e HPC.',
        percentage: 30,
        color: '#60a5fa', // blue-400
    },
    {
        name: 'Grace CPU',
        description: 'Arquitetura para data centers que transformam dados em inteligência.',
        percentage: 15,
        color: '#f472b6', // pink-400
    },
    {
        name: 'MGX Platform',
        description: 'Computação acelerada com servidores modulares.',
        percentage: 10,
        color: '#c084fc', // purple-400
    },
    {
        name: 'IGX Platform',
        description: 'Segurança e proteção funcional avançada para IA na borda.',
        percentage: 5,
        color: '#fb923c', // orange-400
    }
];

// Add percentage to the data for the chart
export const PLATFORM_DISTRIBUTION_DATA = NVIDIA_PLATFORMS.reduce((acc, platform) => {
    acc[platform.name] = platform.percentage;
    return acc;
}, {} as {[key: string]: number});
