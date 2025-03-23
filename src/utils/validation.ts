/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate a crypto address
 * @param {string} address - Address to validate
 * @param {string} network - Network (solana, ethereum, etc.)
 * @returns {boolean} - Whether address is valid
 */
function isValidCryptoAddress(address: string, network: string): boolean {
    // Basic validation based on network
    if (network === 'solana') {
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    } else if (network === 'ethereum') {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    // Default case
    return /^[a-zA-Z0-9]{30,}$/.test(address);
}

/**
 * Validate amount
 * @param {string} amount - Amount to validate
 * @returns {boolean} - Whether amount is valid
 */
function isValidAmount(amount: string): boolean {
    const parsedAmount = parseFloat(amount);
    return !isNaN(parsedAmount) && parsedAmount > 0;
}

/**
 * Decodes blockchain network IDs to their human-readable names
 * @param {string|number} networkId - The network ID to decode
 * @returns {string} The human-readable network name, or "Unknown Network" if not recognized
 */
function decodeNetworkId(networkId: string | number): string {
    // Convert to string for consistency
    const id = String(networkId);

    // Map of known network IDs to their names (exhaustive mainnet list)
    const networks = {
        // Ethereum and L2s
        "1": "Ethereum Mainnet",
        "10": "Optimism",
        "42161": "Arbitrum One",
        "8453": "Base",
        "324": "zkSync Era",
        "59144": "Linea",
        "534352": "Scroll",
        "7777777": "Zora",
        "7700": "Canto",
        "1101": "Polygon zkEVM",
        "1088": "Metis Andromeda",
        "288": "Boba Network",
        "100": "Gnosis Chain",
        "1116": "Core Blockchain",
        "81457": "Blast",

        // EVM Compatible
        "56": "Binance Smart Chain",
        "137": "Polygon (Matic)",
        "43114": "Avalanche C-Chain",
        "250": "Fantom Opera",
        "1284": "Moonbeam",
        "1285": "Moonriver",
        "42220": "Celo Mainnet",
        "25": "Cronos Mainnet",
        "9001": "Evmos",
        "2222": "Kava EVM",
        "1313161554": "Aurora",
        "592": "Astar",
        "1666600000": "Harmony Shard 0",
        "8217": "Klaytn",
        "128": "Huobi ECO Chain",
        "66": "OKExChain",
        "42262": "Oasis Emerald",
        "5000": "Mantle",
        "2001": "Milkomeda C1",
        "1231": "Ultron",
        "2152": "Findora",
        "30": "RSK Mainnet",
        "1818": "Cube Chain",
        "32659": "Fusion",
        "57": "Syscoin",
        "1111": "WEMIX",
        "108": "ThunderCore",
        "333999": "Polis",
        "71": "Conflux eSpace",
        "4689": "IoTeX",
        "1234": "Step Network",
        "836542336838601": "SKALE Europa",
        "28": "Boba Ethereum",
        "1559": "Tenet",

        // Others
        "122": "Fuse",
        "14": "Flare Mainnet",
        "19": "Songbird Canary Network",
        "106": "Velas EVM",
        "2000": "Dogechain",
        "888": "Wanchain",
        "321": "KCC (KuCoin Chain)",
        "11297108109": "Palm",
        "211": "Bittorent Chain",
        "336": "Shiden Network",
        "9790": "Carbon Chain",
        "2020": "Ronin",
        "8899": "JFIN Chain",
        "73927": "Mixin Virtual Machine",
        "12306": "OP Hypr",
        "126": "OYchain",
        "246": "Energy Web Chain",
        "50": "XDC Network",
        "258": "Setheum",
        "512512": "CMP",
        "13381": "Phoenix",
        "35": "TBWG Chain",
        "4337": "Beam"
    };

    // Return the network name or "Unknown Network"
    return networks[id] || "Unknown Network";
}

export {
    isValidEmail,
    isValidCryptoAddress,
    isValidAmount,
    decodeNetworkId
};