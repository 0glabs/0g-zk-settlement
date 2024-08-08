const utils = require('./utils');

const NAME_LENGTH = 16;
const COUNT_LENGTH = 4;
const DATE_LENGTH = 8;
const ADDR_LENGTH = 20;
const NONCE_LENGTH = 4;
const PRICE_LENGTH = 8;  // u64 的长度为 8 字节

class Request {
    constructor(nonce, inputCount, outputCount, inputPrice, outputPrice, serviceName, userAddress, providerAddress) {
        // 初始化其他字段
        this.inputCount = parseInt(inputCount, 10);
        this.outputCount = parseInt(outputCount, 10);
        this.nonce = parseInt(nonce, 10);
        // price 为 u64
        this.inputPrice = BigInt(inputPrice);
        this.outputPrice = BigInt(outputPrice);

        // serviceName 为 u128 以 hexstring 形式输入
        this.serviceName = BigInt(serviceName);

        // userAddress 和 providerAddress 为 u160 以 hexstring 形式输入
        this.userAddress = BigInt(userAddress);
        this.providerAddress = BigInt(providerAddress);
    }

    // 序列化方法，按字段顺序序列化
    serialize() {
        const buffer = new ArrayBuffer(NONCE_LENGTH + COUNT_LENGTH * 2 + NAME_LENGTH + ADDR_LENGTH * 2 + PRICE_LENGTH * 2);
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
        const inputPriceBytes = utils.bigintToBytes(this.inputPrice, PRICE_LENGTH);
        new Uint8Array(buffer, offset, PRICE_LENGTH).set(inputPriceBytes);
        offset += PRICE_LENGTH;
        const outputPriceBytes = utils.bigintToBytes(this.outputPrice, PRICE_LENGTH);
        new Uint8Array(buffer, offset, PRICE_LENGTH).set(outputPriceBytes);
        offset += PRICE_LENGTH;

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
        const expectedLength = NONCE_LENGTH + COUNT_LENGTH * 2 + NAME_LENGTH + ADDR_LENGTH * 2 + PRICE_LENGTH * 2;

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
        const inputPrice = utils.bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + PRICE_LENGTH)));
        offset += PRICE_LENGTH;
        const outputPrice = utils.bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + PRICE_LENGTH)));
        offset += PRICE_LENGTH;

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
            inputPrice.toString(),
            outputPrice.toString(),
            '0x' + serviceName.toString(16),
            '0x' + userAddress.toString(16),
            '0x' + providerAddress.toString(16)
        );
    }
}

module.exports = { Request };
