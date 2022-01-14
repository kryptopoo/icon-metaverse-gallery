import { Injectable } from '@angular/core';
import IconService from 'icon-sdk-js';
import Wallet from 'icon-sdk-js/build/Wallet';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class IconServiceHelper {
    iconService: IconService;
    // 1 ICX -> 1000000000000000000 conversion
    private value = IconService.IconAmount.of(1, IconService.IconAmount.Unit.ICX).toLoop();
    // You can use "governance score apis" to get step costs.
    //const stepLimit = await this.getDefaultStepCost();
    private stepLimit = IconService.IconConverter.toBigNumber('2000000');
    // networkId of node 1:mainnet, 2~:etc
    private networkId = IconService.IconConverter.toBigNumber(environment.iconNetworkId);
    private version = IconService.IconConverter.toBigNumber('3');
    // Timestamp is used to prevent the identical transactions. Only current time is required (Standard unit : us)
    // If the timestamp is considerably different from the current time, the transaction will be rejected.
    private timestamp = new Date().getTime() * 1000;

    constructor() {
        //const httpProvider = new IconService.HttpProvider('https://ctz.solidwallet.io/api/v3');
        const httpProvider = new IconService.HttpProvider(environment.iconHttpProvider);
        this.iconService = new IconService(httpProvider);
    }

    createWallet(): Wallet {
        return IconService.IconWallet.create();
    }

    loadWallet(privateKey: string): Wallet {
        return IconService.IconWallet.loadPrivateKey(privateKey);
    }

    loadWalletByKeystore(keystoreFile: string, password: string): Wallet {
        return IconService.IconWallet.loadKeystore(keystoreFile, password, true);
    }

    async getTransaction(hash: string) {
        return await this.iconService.getTransaction(hash).execute();
    }

    async getTransactionResult(hash: string) {
        return await this.iconService.getTransactionResult(hash).execute();
    }

    async getBalance(address: string) {
        const callRs = await this.iconService.getBalance(address).execute();
        const balance = IconService.IconAmount.of(callRs, IconService.IconAmount.Unit.LOOP).convertUnit(IconService.IconAmount.Unit.ICX);
        return balance.value.toNumber();
    }

    async callMethod(from: string, contract: string, method: string, params: any) {
        try {
            let txObj = new IconService.IconBuilder.CallBuilder();
            if (from !== '') txObj.from(from);
            txObj.to(contract).method(method).params(params);
            let call = txObj.build();
            let txRs = this.iconService.call(call).execute();
            return txRs;
        } catch (error) {
            console.log('callMethod error', error);
            return null;
        }
    }

    async callTransaction(wallet: Wallet, contract: string, method: string, params: any, value: any = 0) {
        const txObj = await this.buildCallTransaction(wallet.getAddress(), contract, method, params, value);
        const signedTransaction = new IconService.SignedTransaction(txObj, wallet);
        const txHash = await this.iconService.sendTransaction(signedTransaction).execute();
        console.log(txHash);

        return txHash;
    }

    async transferICX(wallet: Wallet, to: string, amount: number) {
        const transaction = await this.buildICXTransaction(wallet.getAddress(), to, amount);
        const signedTransaction = new IconService.SignedTransaction(transaction, wallet);
        const signedTransactionProperties = JSON.stringify(signedTransaction.getProperties()).split(',').join(', \n');
        let txHash = await this.iconService.sendTransaction(signedTransaction).execute();
        console.log('txHash', txHash);

        return txHash;
    }

    async buildICXTransaction(from: string, to: string, value: number) {
        const { IcxTransactionBuilder } = IconService.IconBuilder;
        const icxTransactionBuilder = new IcxTransactionBuilder();
        return icxTransactionBuilder
            .nid(this.networkId)
            .from(from)
            .to(to)
            .value(IconService.IconAmount.of(value, IconService.IconAmount.Unit.ICX).toLoop())
            .stepLimit(this.stepLimit)
            .timestamp(this.timestamp)
            .version(this.version)
            .build();
    }

    async buildCallTransaction(from: string, to: string, method: string, params: any, value: any) {
        const { CallTransactionBuilder } = IconService.IconBuilder;
        const icxValue = IconService.IconAmount.of(value, IconService.IconAmount.Unit.ICX).toLoop();
        const builder = new CallTransactionBuilder();
        if (value > 0) builder.value(icxValue);
        return (
            builder
                .method(method)
                .params(params)
                .from(from)
                .to(to)
                //.value(icxValue)
                .stepLimit(this.stepLimit)
                .nid(this.networkId)
                //.nonce(IconService.IconConverter.toBigNumber(new Date().getTime().toString()))
                .version(this.version)
                .timestamp(this.timestamp)
                .build()
        );
    }

    async getContractBalance(contract: string) {
        return await this.iconService.getBalance(contract).execute();
    }

    shortAddress(address: string) {
        return `${address.substring(0, 10)}...${address.substring(address.length - 6)}`;
    }

    toIcxLoopBigNumber(value: any) {
        return IconService.IconAmount.of(value, IconService.IconAmount.Unit.ICX).toLoop();
    }

    toIcxNumber(value: any) {
        const iconAmount = IconService.IconAmount.of(value, IconService.IconAmount.Unit.LOOP).convertUnit(IconService.IconAmount.Unit.ICX);
        return iconAmount.value.toNumber();
    }

    toHex(value: any) {
        return IconService.IconConverter.toHex(value);
    }

    toNumber(value: any) {
        return IconService.IconConverter.toNumber(value);
    }
}
