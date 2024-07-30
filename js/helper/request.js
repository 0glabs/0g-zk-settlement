const utils = require('./utils');

const NAME_LENGTH = 16;
const COUNT_LENGTH = 4;
const DATE_LENGTH = 8;
const ADDR_LENGTH = 20;
const NONCE_LENGTH = 4;
const PRICE_LENGTH = 8;  // u64 的长度为 8 字节

class Request {
    constructor(nonce, inputCount, outputCount, price, updatedAt, createdAt, serviceName, userAddress, providerAddress) {
        // 将 createdAt 和 updatedAt 转换为时间戳（毫秒）
        this.createdAt = Math.floor(new Date(createdAt).getTime());
        this.updatedAt = Math.floor(new Date(updatedAt).getTime());

        // 初始化其他字段
        this.inputCount = parseInt(inputCount, 10);
        this.outputCount = parseInt(outputCount, 10);
        this.nonce = parseInt(nonce, 10);
        // price 为 u64
        this.price = BigInt(price);

        // serviceName 为 u128 以 hexstring 形式输入
        this.serviceName = BigInt(serviceName);

        // userAddress 和 providerAddress 为 u160 以 hexstring 形式输入
        this.userAddress = BigInt(userAddress);
        this.providerAddress = BigInt(providerAddress);
    }

    // 将 createdAt 和 updatedAt 转换为小端序 BigUint64
    getCreatedAtBigUint64() {
        return utils.convertToBiguint64(this.createdAt);
    }

    getUpdatedAtBigUint64() {
        return utils.convertToBiguint64(this.updatedAt);
    }

    // 序列化方法，按字段顺序序列化
    serialize() {
        const buffer = new ArrayBuffer(NONCE_LENGTH + COUNT_LENGTH * 2 + DATE_LENGTH * 2 + NAME_LENGTH + ADDR_LENGTH * 2 + PRICE_LENGTH);
        const view = new DataView(buffer);
        let offset = 0;

        // 写入 nonce (u32)
        view.setUint32(offset, this.nonce, true);
        offset += NONCE_LENGTH;

        // 写入 inputCount (u32)
        view.setUint32(offset, this.inputCount, true);
        offset += COUNT_LENGTH;

        // 写入 outputCount (u32)
        view.setUint32(offset, this.outputCount, true);
        offset += COUNT_LENGTH;

        // 写入 price (u64)
        const priceBytes = utils.bigintToBytes(this.price, PRICE_LENGTH);
        new Uint8Array(buffer, offset, PRICE_LENGTH).set(priceBytes);
        offset += PRICE_LENGTH;

        // 写入 updatedAt (BigUint64 小端序)
        const updatedAtBigUint64 = this.getUpdatedAtBigUint64();
        view.setBigUint64(offset, updatedAtBigUint64, true);
        offset += DATE_LENGTH;

        // 写入 createdAt (BigUint64 小端序)
        const createdAtBigUint64 = this.getCreatedAtBigUint64();
        view.setBigUint64(offset, createdAtBigUint64, true);
        offset += DATE_LENGTH;

        // 写入 serviceName (u128)
        const serviceNameBytes = utils.bigintToBytes(this.serviceName, NAME_LENGTH);
        new Uint8Array(buffer, offset, NAME_LENGTH).set(serviceNameBytes);
        offset += NAME_LENGTH;

        // 写入 userAddress (u160)
        const userAddressBytes = utils.bigintToBytes(this.userAddress, ADDR_LENGTH);
        new Uint8Array(buffer, offset, ADDR_LENGTH).set(userAddressBytes);
        offset += ADDR_LENGTH;

        // 写入 providerAddress (u160)
        const providerAddressBytes = utils.bigintToBytes(this.providerAddress, ADDR_LENGTH);
        new Uint8Array(buffer, offset, ADDR_LENGTH).set(providerAddressBytes);
        offset += ADDR_LENGTH;

        return new Uint8Array(buffer);
    }

    // 反序列化方法
    static deserialize(byteArray) {
        const expectedLength = NONCE_LENGTH + COUNT_LENGTH * 2 + DATE_LENGTH * 2 + NAME_LENGTH + ADDR_LENGTH * 2 + PRICE_LENGTH;

        if (byteArray.length !== expectedLength) {
            throw new Error(`Invalid byte array length for deserialization. Expected: ${expectedLength}, but got: ${byteArray.length}`);
        }

        const view = new DataView(byteArray.buffer);
        let offset = 0;

        // 读取 nonce (u32)
        const nonce = view.getUint32(offset, true);
        offset += NONCE_LENGTH;

        // 读取 inputCount (u32)
        const inputCount = view.getUint32(offset, true);
        offset += COUNT_LENGTH;

        // 读取 outputCount (u32)
        const outputCount = view.getUint32(offset, true);
        offset += COUNT_LENGTH;

        // 读取 price (u64)
        const price = utils.bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + PRICE_LENGTH)));
        offset += PRICE_LENGTH;

        // 读取 updatedAt (BigUint64 小端序)
        const updatedAt = utils.bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + DATE_LENGTH)));
        offset += DATE_LENGTH;

        // 读取 createdAt (BigUint64 小端序)
        const createdAt = utils.bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + DATE_LENGTH)));
        offset += DATE_LENGTH;

        // 读取 serviceName (u128)
        const serviceName = utils.bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + NAME_LENGTH)));
        offset += NAME_LENGTH;

        // 读取 userAddress (u160)
        const userAddress = utils.bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + ADDR_LENGTH)));
        offset += ADDR_LENGTH;

        // 读取 providerAddress (u160)
        const providerAddress = utils.bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + ADDR_LENGTH)));
        offset += ADDR_LENGTH;
        
        return new Request(
            nonce,
            inputCount,
            outputCount,
            price.toString(),
            updatedAt.toString(),
            createdAt.toString(),
            '0x' + serviceName.toString(16),
            '0x' + userAddress.toString(16),
            '0x' + providerAddress.toString(16)
        );
    }
}

module.exports = { Request };
