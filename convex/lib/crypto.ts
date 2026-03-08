export async function encryptSecret(plaintext: string, keyHex: string): Promise<string> {
    const keyBytes = hexToBytes(keyHex);
    const cryptoKey = await crypto.subtle.importKey(
        "raw", keyBytes as any, { name: "AES-GCM" }, false, ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv }, cryptoKey, encoded
    );
    return btoa(String.fromCharCode(...iv)) + ":" + btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
}

export async function decryptSecret(encrypted: string, keyHex: string): Promise<string> {
    const [ivB64, ctB64] = encrypted.split(":");
    const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(ctB64), c => c.charCodeAt(0));
    const keyBytes = hexToBytes(keyHex);
    const cryptoKey = await crypto.subtle.importKey(
        "raw", keyBytes as any, { name: "AES-GCM" }, false, ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv as any }, cryptoKey, ciphertext as any
    );
    return new TextDecoder().decode(decrypted);
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}
