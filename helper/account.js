const utils = require('./utils');
const eddsa = require('./eddsa');

const NONCE_LENGTH = 4;
const BALANCE_LENGTH = 8;
const USER_ADDRESS_LENGTH = 20;
const PROVIDER_ADDRESS_LENGTH = 20;
const COMMITMENT_LENGTH = 32;

class Account {
    constructor(nonce, balance, userAddress, providerAddress) {
        // 初始化字段
        this.nonce = parseInt(nonce, 10);
        this.balance = BigInt(balance);

        // 确保地址字符串带有 "0x" 前缀并转换为 BigInt
        this.userAddress = BigInt(this._ensureHexString(userAddress));
        this.providerAddress = BigInt(this._ensureHexString(providerAddress));

        // this.calculatePedersenHash();
    }

    // 确保字符串以 "0x" 开头
    _ensureHexString(str) {
        return str.startsWith('0x') ? str : `0x${str}`;
    }

    // 序列化方法，按字段顺序序列化
    _serialize() {
        const buffer = new ArrayBuffer(NONCE_LENGTH + BALANCE_LENGTH + USER_ADDRESS_LENGTH + PROVIDER_ADDRESS_LENGTH);
        const view = new DataView(buffer);
        let offset = 0;

        // 写入 nonce (u32)
        view.setUint32(offset, this.nonce, true);
        offset += NONCE_LENGTH;

        // 写入 balance (u64)
        const balanceBytes = utils.bigintToBytes(this.balance, BALANCE_LENGTH);
        new Uint8Array(buffer, offset, BALANCE_LENGTH).set(balanceBytes);
        offset += BALANCE_LENGTH;

        // 写入 userAddress (u160)
        const userAddressBytes = utils.bigintToBytes(this.userAddress, USER_ADDRESS_LENGTH);
        new Uint8Array(buffer, offset, USER_ADDRESS_LENGTH).set(userAddressBytes);
        offset += USER_ADDRESS_LENGTH;

        // 写入 providerAddress (u160)
        const providerAddressBytes = utils.bigintToBytes(this.providerAddress, PROVIDER_ADDRESS_LENGTH);
        new Uint8Array(buffer, offset, PROVIDER_ADDRESS_LENGTH).set(providerAddressBytes);

        return new Uint8Array(buffer);
    }

    calculatePedersenHash() {
        const serialized = this._serialize(); // 获取序列化后的账户信息
        const pedersenHash = eddsa.hash(serialized); // 使用 CircomlibJS 计算 Pedersen 哈希
        this.commitment = pedersenHash;
        return serialized;
    }

    serialize() {
        const serialized = this.calculatePedersenHash();
        const buffer = new ArrayBuffer(NONCE_LENGTH + BALANCE_LENGTH + USER_ADDRESS_LENGTH + PROVIDER_ADDRESS_LENGTH + COMMITMENT_LENGTH);
        const view = new DataView(buffer);
        let offset = 0;
        new Uint8Array(buffer, offset, NONCE_LENGTH + BALANCE_LENGTH + USER_ADDRESS_LENGTH + PROVIDER_ADDRESS_LENGTH).set(serialized);
        offset += NONCE_LENGTH + BALANCE_LENGTH + USER_ADDRESS_LENGTH + PROVIDER_ADDRESS_LENGTH;
        new Uint8Array(buffer, offset, COMMITMENT_LENGTH).set(this.commitment);

        return new Uint8Array(buffer);
    }
}

module.exports = { Account };
