const NAME_LENGTH = 16;  // serviceName 的字节长度
const PRICE_LENGTH = 8;  // servicePrice 的字节长度
const UPDATED_AT_LENGTH = 8;  // updatedAt 的字节长度

class ServiceMap {
    constructor() {
        this.map = new Map();
    }

    // 添加服务
    addService(serviceName, servicePrice, updatedAt) {
        if (serviceName.length !== NAME_LENGTH * 2) { // 16字节的 serviceName 需要32字符的 hexstring 表示
            throw new Error(`Service name must be ${NAME_LENGTH * 2} hex characters`);
        }
        const timestamp = Math.floor(new Date(updatedAt).getTime());
        this.map.set(serviceName, { servicePrice, updatedAt: timestamp });
    }

    // 将 hexstring 转换为 Uint8Array
    static hexStringToBytes(hexString) {
        if (hexString.length % 2 !== 0) {
            throw new Error('Invalid hexstring');
        }
        const bytes = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
            bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
        }
        return bytes;
    }

    // 将数字转换为指定字节数的 Uint8Array
    static numberToBytes(num, byteLength) {
        const bytes = new ArrayBuffer(byteLength);
        const view = new DataView(bytes);
        if (byteLength === PRICE_LENGTH) {
            view.setUint32(0, num, true); // 4字节，无符号整型，小端序
        } else if (byteLength === UPDATED_AT_LENGTH) {
            view.setBigUint64(0, BigInt(num), true); // 8字节，无符号整型，小端序
        }
        return new Uint8Array(bytes);
    }

    // 将 BigInt 转换为指定长度的字节数组
    static bigIntToBytes(bigint, length) {
        const bytes = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            bytes[length - 1 - i] = Number((bigint >> BigInt(8 * i)) & BigInt(0xff)); // 调整字节顺序
        }
        return bytes;
    }

    // 序列化 Map 为字节数组
    serialize() {
        const result = [];
        for (const [serviceName, { servicePrice, updatedAt }] of this.map) {
            result.push(...ServiceMap.hexStringToBytes(serviceName));
            result.push(...ServiceMap.numberToBytes(servicePrice, PRICE_LENGTH));
            result.push(...ServiceMap.numberToBytes(updatedAt, UPDATED_AT_LENGTH));
        }
        return new Uint8Array(result);
    }

    // 反序列化字节数组为 Map
    static deserialize(byteArray) {
        const serviceMap = new ServiceMap();
        const step = NAME_LENGTH + PRICE_LENGTH + UPDATED_AT_LENGTH;
        for (let i = 0; i < byteArray.length; i += step) {
            const serviceNameBytes = byteArray.slice(i, i + NAME_LENGTH);
            const serviceName = Array.from(serviceNameBytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
            const servicePrice = new DataView(byteArray.slice(i + NAME_LENGTH, i + NAME_LENGTH + PRICE_LENGTH).buffer).getUint32(0, true);
            const updatedAt = new DataView(byteArray.slice(i + NAME_LENGTH + PRICE_LENGTH, i + step).buffer).getBigUint64(0, true);
            serviceMap.addService(serviceName, servicePrice, Number(updatedAt));
        }
        return serviceMap;
    }
}

module.exports = { ServiceMap, NAME_LENGTH, PRICE_LENGTH, UPDATED_AT_LENGTH };

const serviceMap = new ServiceMap();
serviceMap.addService(
    '1234567890abcdef1234567890abcdef', // 16字节，32字符的 hexstring
    10,
    '2024-01-02T00:00:00Z'
);

const serialized = serviceMap.serialize();
console.log("serializedServiceMap: ", serialized); 
