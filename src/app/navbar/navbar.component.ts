import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import Wallet from 'icon-sdk-js/build/Wallet';
import { IconServiceHelper } from '../icon-service.helper';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    @ViewChild('connectWalletDialogRef') connectWalletDialogRef: TemplateRef<any>;
    @ViewChild('disconnectWalletDialogRef') disconnectWalletDialogRef: TemplateRef<any>;

    //privateKey: string = '573b555367d6734ea0fecd0653ba02659fa19f7dc6ee5b93ec781350bda27376';
    privateKey: string = '';
    myWallet: Wallet;
    myBalance: number = 0;
    myAddress: string;


    constructor(private dialog: MatDialog, private iconServiceHelper: IconServiceHelper, private router: Router) {}

    async ngOnInit() {
        await this.loadWalletInfo();
    }



    async loadWalletInfo() {
        const walletStr = localStorage.getItem('wallet')?.toString();
        if (walletStr !== undefined) {
            this.myWallet = this.iconServiceHelper.loadWallet(JSON.parse(walletStr).privateKey);
            this.myBalance = await this.iconServiceHelper.getBalance(this.myWallet.getAddress());
            this.myAddress = await this.iconServiceHelper.shortAddress(this.myWallet.getAddress());

            //this.iconServiceHelper.transferICX(this.myWallet, 'hxceb0482590735c3215ed972f48c21da957656dbb', 50);
        }
    }

    createNewWallet() {
        const newWallet = this.iconServiceHelper.createWallet();
        this.privateKey = newWallet.getPrivateKey();
    }

    openConnectWalletDialog() {
        const dialog = this.dialog.open(this.connectWalletDialogRef, {
            width: '60%'
        });
        dialog.afterClosed().subscribe((result) => {
            if (result === 'connect') {
                const wallet = this.iconServiceHelper.loadWallet(this.privateKey);
                localStorage.setItem(
                    'wallet',
                    JSON.stringify({
                        address: wallet.getAddress(),
                        privateKey: this.privateKey
                    })
                );

                //window.location.reload();
                //this.router.navigate(['']);
                this.router.navigate(['']).then(() => {
                    window.location.reload();
                });
            }
        });
    }

    openDisconnectWalletDialog() {
        this.loadWalletInfo();
        const dialog = this.dialog.open(this.disconnectWalletDialogRef);
        dialog.afterClosed().subscribe((result) => {
            if (result === 'disconnect') {
                localStorage.removeItem('wallet');
                //window.location.reload();
                this.router.navigate(['']).then(() => {
                    window.location.reload();
                });
            }
        });
    }

    connectWallet() {}
}
