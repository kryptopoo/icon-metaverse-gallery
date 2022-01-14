import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IpfsService } from '../ipfs.service';
import { environment } from '../../environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Wallet from 'icon-sdk-js/build/Wallet';
import { IconServiceHelper } from '../icon-service.helper';
import { FormControl } from '@angular/forms';
import { ImageHelper, sleep } from '../app.helper';

@Component({
    selector: 'app-galleries',
    templateUrl: './galleries.component.html',
    styleUrls: ['./galleries.component.scss']
})
export class GalleriesComponent implements OnInit {
    @ViewChild('vrViewRef') vrViewRef: TemplateRef<any>;
    @ViewChild('createGalleryDialogRef') createGalleryDialogRef: TemplateRef<any>;

    isLoading = false;
    myWallet: Wallet;

    galleries: any[] = new Array();
    rentingRooms: any[] = new Array();
    myArtworks: any[] = new Array();
    galleryViewUri: SafeUrl;
    newGallery: any = { name: '', description: '' };

    dialog: MatDialog;
    imageHelper: ImageHelper;
    artworksSelectControl = new FormControl();

    constructor(
        private _dialog: MatDialog,
        private _imageHelper: ImageHelper,
        private ipfsService: IpfsService,
        private iconServiceHelper: IconServiceHelper,
        private sanitizer: DomSanitizer
    ) {
        this.dialog = _dialog;
        this.imageHelper = _imageHelper;
    }

    async ngOnInit() {
        const walletStr = localStorage.getItem('wallet')?.toString();
        if (walletStr !== undefined) {
            this.myWallet = this.iconServiceHelper.loadWallet(JSON.parse(walletStr).privateKey);
        }

        this.loadGalleries();
        this.loadArtworks();
        this.loadRentingRooms();
        this.resetNewGallery();
    }

    resetNewGallery() {
        this.newGallery = {
            name: '',
            description: '',
            imageFile: { origin: { name: '' } },
            imageFilePath: '/assets/images/no-image.png',
            room: {name: '', price: 0}
        };
    }

    canCreateNewGallery() {
        return this.myWallet != null;
    }

    async loadGalleries() {
        this.isLoading = true;
        this.galleries = [];

        const totalRs = await this.iconServiceHelper.callMethod('', environment.galleryContract, 'totalGalleries', {});
        const total = parseInt(totalRs);
        for (let i = 0; i < total; i++) {
            this.galleries.push({
                isLoading: true
            });

            // get gallery metadata
            const tokenUriResult = await this.iconServiceHelper
                .callMethod('', environment.galleryContract, 'getGalleryByIndex', {
                    _index: this.iconServiceHelper.toHex(i)
                })
                .catch((err) => {
                    console.log(err);
                });

            this.ipfsService.get(this.ipfsService.buildMetadataUri(tokenUriResult)).subscribe((res) => {
                this.galleries[i] = {
                    isLoading: false,
                    id: i,
                    name: res.name,
                    description: res.description,
                    owner: res.owner,
                    room: res.room,
                    metadata: this.ipfsService.buildMetadataUri(tokenUriResult),
                    image: {
                        origin: this.ipfsService.buildUri(tokenUriResult, res.image.origin),
                        normal: this.ipfsService.buildUri(tokenUriResult, res.image.normal),
                        thumbnail: this.ipfsService.buildUri(tokenUriResult, res.image.thumbnail)
                    }
                };
            });
        }
        this.isLoading = false;
        console.log('galleries', `total ${total}`, this.galleries);
    }

    async loadArtworks() {
        this.isLoading = true;
        this.myArtworks = [];

        const totalRs = await this.iconServiceHelper.callMethod(this.myWallet.getAddress(), environment.artworkNftContract, 'totalSupply', {});
        const total = parseInt(totalRs);
        for (let i = 0; i < total; i++) {
            let tokenUriResult = await this.iconServiceHelper.callMethod(this.myWallet.getAddress(), environment.artworkNftContract, 'tokenURI', {
                _tokenId: this.iconServiceHelper.toHex(i)
            });

            this.ipfsService.get(this.ipfsService.buildMetadataUri(tokenUriResult)).subscribe((res) => {
                // if (res.owner === this.myWallet.getAddress()) {                   
                // }

                this.myArtworks.push({
                    id: i,
                    name: res.name,
                    description: res.description,
                    owner: this.iconServiceHelper.shortAddress(res.owner),
                    image: {
                        origin: this.ipfsService.buildUri(tokenUriResult, res.image.origin),
                        normal: this.ipfsService.buildUri(tokenUriResult, res.image.normal),
                        thumbnail: this.ipfsService.buildUri(tokenUriResult, res.image.thumbnail)
                    }
                });
            });
        }

        this.isLoading = false;
        console.log('myArtworks', this.myArtworks);
    }

    async loadRentingRooms() {
        this.rentingRooms = [];
        const totalRs = await this.iconServiceHelper.callMethod(this.myWallet.getAddress(), environment.galleryContract, 'totalRooms', {});
        const total = parseInt(totalRs);
        for (let i = 0; i < total; i++) {
            await this.iconServiceHelper
                .callMethod(this.myWallet.getAddress(), environment.galleryContract, 'getRoomByIndex', {
                    _index: this.iconServiceHelper.toHex(i)
                })
                .then(async (rs) => {
                    let roomId = parseInt(rs.split(';')[0]);
                    let roomPrice = this.iconServiceHelper.toIcxNumber(rs.split(';')[1]);

                    let tokenUriResult = await this.iconServiceHelper.callMethod(
                        this.myWallet.getAddress(),
                        environment.roomNftContract,
                        'tokenURI',
                        {
                            _tokenId: this.iconServiceHelper.toHex(roomId)
                        }
                    );

                    this.ipfsService.get(this.ipfsService.buildMetadataUri(tokenUriResult)).subscribe((res) => {
                        this.rentingRooms.push({
                            id: roomId,
                            price: roomPrice,
                            name: res.name,
                            description: res.description,
                            image: this.ipfsService.buildUri(tokenUriResult, res.image.thumbnail),
                            template: this.ipfsService.buildUri(tokenUriResult, res.template)
                        });
                    });
                })
                .catch((err) => {
                    console.log('loadRentingRooms', err);
                });
        }

        console.log('rentingRooms', this.rentingRooms);
    }

    openGalleryViewDialog(gallery: any) {
        console.log('gallery room uri', `${gallery.room.template}`);
        console.log('gallery metadata uri', `${gallery.metadata}`);

        this.galleryViewUri = this.sanitizer.bypassSecurityTrustResourceUrl(
            //`${window.location.origin}/assets/templates/${gallery.room.template.split('/').pop()}?metadata=${gallery.metadata}`
            `${gallery.room.template}?metadata=${gallery.metadata}`
        );
        this.dialog.open(this.vrViewRef, {
            panelClass: 'fullscreen-dialog',
            height: '100vh',
            width: '100%'
        });
    }

    async createGallery() {
        this.isLoading = true;
        let metadata = {
            name: this.newGallery.name,
            description: this.newGallery.description,
            owner: this.myWallet.getAddress(),
            room: this.newGallery.room,
            artworks: this.artworksSelectControl.value
        };
        let formData = this.ipfsService.buildFormData(this.newGallery.imageFile, null, metadata);
        this.ipfsService.uploadNftStorage(formData).subscribe(async (data) => {
            let ipfsUri = this.ipfsService.buildIpfsUri(data.value.cid);
            console.log('newGallery ipfsUri', ipfsUri);

            const callTransactionRs = await this.iconServiceHelper.callTransaction(
                this.myWallet,
                environment.galleryContract,
                'createGallery',
                {
                    _roomContract: environment.roomNftContract,
                    _roomTokenId: this.iconServiceHelper.toHex(this.newGallery.room.id),
                    _metadataURI: ipfsUri
                },
                this.newGallery.room.price
            );

            await sleep(5000);
            console.log('createGallery txRs', await this.iconServiceHelper.getTransactionResult(callTransactionRs));

            this.loadGalleries();
            this.resetNewGallery();
            this.isLoading = false;
        });
    }
}
