import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import Wallet from 'icon-sdk-js/build/Wallet';

import { IconServiceHelper } from '../icon-service.helper';
import { IpfsService } from '../ipfs.service';
import { environment } from '../../environments/environment';
import { sleep, ImageHelper } from '../app.helper';

@Component({
    selector: 'app-artworks',
    templateUrl: './artworks.component.html',
    styleUrls: ['./artworks.component.scss']
})
export class ArtworksComponent implements OnInit {
    @ViewChild('mintArtworkDialogRef') mintArtworkDialogRef: TemplateRef<any>;

    isLoading = false;

    myWallet: Wallet;
    myArtworks: any[] = new Array();
    newArtwork: any;

    imageHelper: ImageHelper;
    dialog: MatDialog;

    constructor(
        private ipfsService: IpfsService,
        private iconServiceHelper: IconServiceHelper,
        private _dialog: MatDialog,
        private _imageHelper: ImageHelper
    ) {
        this.imageHelper = _imageHelper;
        this.dialog = _dialog;
    }

    async ngOnInit() {
        const walletStr = localStorage.getItem('wallet')?.toString();
        if (walletStr !== undefined) {
            this.myWallet = this.iconServiceHelper.loadWallet(JSON.parse(walletStr).privateKey);
        }

        this.loadMyArtworks();
        this.resetNewArtwork();
    }

    resetNewArtwork() {
        this.newArtwork = {
            name: '',
            description: '',
            imageFile: { origin: { name: '' } },
            imageFilePath: '/assets/images/no-image.png'
        };
    }

    canMint() {
        return this.myWallet != null;
    }

    async mintArtworkNft() {
        this.isLoading = true;
        let metadata = {
            name: this.newArtwork.name,
            description: this.newArtwork.description,
            owner: this.myWallet.getAddress()
        };
        const formData = this.ipfsService.buildFormData(this.newArtwork.imageFile, null, metadata);
        this.ipfsService.uploadNftStorage(formData).subscribe(async (data) => {
            const ipfsUri = this.ipfsService.buildIpfsUri(data.value.cid);
            console.log('mintArtworkNft ipfsUri', ipfsUri);

            const callTransactionRs = await this.iconServiceHelper.callTransaction(
                this.myWallet,
                environment.artworkNftContract,
                'mint',
                { _tokenURI: ipfsUri }
            );

            await sleep(5000);
            console.log('mintArtworkNft txRs', await this.iconServiceHelper.getTransactionResult(callTransactionRs));
            this.resetNewArtwork();
            this.loadMyArtworks();
            this.isLoading = false;
        });
    }

    async loadMyArtworks() {
        this.isLoading = true;
        this.myArtworks = [];

        const totalRs = await this.iconServiceHelper.callMethod('', environment.artworkNftContract, 'totalSupply', {});
        const total = parseInt(totalRs);
        for (let i = 0; i < total; i++) {

            this.myArtworks.push({
                isLoading: true
            });

            let tokenUriResult = await this.iconServiceHelper.callMethod('', environment.artworkNftContract, 'tokenURI', {
                _tokenId: this.iconServiceHelper.toHex(i)
            });

            this.ipfsService.get(this.ipfsService.buildMetadataUri(tokenUriResult)).subscribe((metadata) => {
                // if (metadata.owner === this.myWallet.getAddress()) {
                // }

                this.myArtworks[i] = {
                    isLoading: false,
                    id: i,
                    name: metadata.name,
                    description: metadata.description,
                    owner: this.iconServiceHelper.shortAddress(metadata.owner),
                    image: {
                        origin: this.ipfsService.buildUri(tokenUriResult, metadata.image.origin),
                        normal: this.ipfsService.buildUri(tokenUriResult, metadata.image.normal),
                        thumbnail: this.ipfsService.buildUri(tokenUriResult, metadata.image.thumbnail)
                    }
                };
            });
        }

        this.isLoading = false;
        console.log('artworks', `total ${total}`, this.myArtworks);
    }
}
