import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import Wallet from 'icon-sdk-js/build/Wallet';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';

import { IconServiceHelper } from '../icon-service.helper';
import { IpfsService } from '../ipfs.service';
import { environment } from '../../environments/environment';
import { sleep, ImageHelper, FileHelper } from '../app.helper';

@Component({
    selector: 'app-rooms',
    templateUrl: './rooms.component.html',
    styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
    @ViewChild('vrViewRef') vrViewRef: TemplateRef<any>;

    myWallet: Wallet;

    isLoading = false;
    rooms: any[] = new Array();
    newRoom: any = {};
    registerRoom: any = { id: 0, name: '', price: 0 };

    imageHelper: ImageHelper;
    fileHelper: FileHelper;
    dialog: MatDialog;
    templatesSelectControl = new FormControl();

    constructor(
        private ipfsService: IpfsService,
        private iconServiceHelper: IconServiceHelper,
        private _dialog: MatDialog,
        private _imageHelper: ImageHelper,
        private _fileHelper: FileHelper
    ) {
        this.imageHelper = _imageHelper;
        this.fileHelper = _fileHelper;
        this.dialog = _dialog;
    }

    async ngOnInit() {
        const walletStr = localStorage.getItem('wallet')?.toString();
        if (walletStr !== undefined) {
            this.myWallet = this.iconServiceHelper.loadWallet(JSON.parse(walletStr).privateKey);
        }

        this.resetNewRoom();
        this.loadRooms();

        // let withdraw = await this.iconServiceHelper.callMethod(this.myWallet.getAddress(), environment.galleryContract, 'withdraw', {});
        // console.log('withdraw', withdraw);

        let balance = await this.iconServiceHelper.getBalance(environment.galleryContract);
        console.log('balance galleryContract', this.iconServiceHelper.toNumber(balance));

        // console.log(this.iconServiceHelper.toNumber(this.iconServiceHelper.toICXLoop(1)));
        // console.log(this.iconServiceHelper.toNumber(this.iconServiceHelper.toICXLoop(0.1)));
        // console.log(this.iconServiceHelper.toHex(this.iconServiceHelper.toICXLoop(0.1)));
    }

    resetNewRoom() {
        this.newRoom = {
            name: '',
            description: '',
            htmlFile: { name: '' },
            imageFile: { origin: { name: '' } },
            imageFilePath: '/assets/images/no-image.png'
        };
    }

    cloneRoom(target: any, source: any) {
        target = Object.assign(target, source);
    }

    canMint() {
        // TODO: must be owner roomNft
        return this.myWallet != null;
    }

    openVRViewDialog() {
        this.dialog.open(this.vrViewRef, {
            panelClass: 'fullscreen-dialog',
            height: '100vh',
            width: '100%'
        });
    }

    async loadRooms() {
        this.isLoading = true;
        this.rooms = [];
        const totalRs = await this.iconServiceHelper.callMethod('', environment.roomNftContract, 'totalSupply', {});
        const total = parseInt(totalRs);
        for (let i = 0; i < total; i++) {
            this.rooms.push({
                isLoading: true
            });

            let roomId = i;
            let roomPrice: any = null;

            let getRoomByIndexResult = await this.iconServiceHelper
                .callMethod('', environment.galleryContract, 'getRoomByIndex', {
                    _index: this.iconServiceHelper.toHex(i)
                })
                .then((rs) => {
                    roomId = parseInt(rs.split(';')[0]);
                    roomPrice = this.iconServiceHelper.toIcxNumber(rs.split(';')[1]);
                })
                .catch((err) => {
                    console.log('getRoomByIndex', err);
                });

            const tokenUriResult = await this.iconServiceHelper.callMethod('', environment.roomNftContract, 'tokenURI', {
                _tokenId: this.iconServiceHelper.toHex(i)
            });
            this.ipfsService.get(this.ipfsService.buildMetadataUri(tokenUriResult)).subscribe((metadata) => {
                this.rooms[i] = {
                    isLoading: false,
                    id: roomId,
                    price: roomPrice,
                    name: metadata.name,
                    description: metadata.description,
                    template: metadata.template,
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
        console.log('rooms', `total ${total}`, this.rooms);
    }

    async mintRoomNft() {
        this.isLoading = true;
        let metadata = {
            name: this.newRoom.name,
            description: this.newRoom.description,
            owner: this.myWallet.getAddress()
        };

        const formData = this.ipfsService.buildFormData(this.newRoom.imageFile, this.newRoom.htmlFile, metadata);
        this.ipfsService.uploadNftStorage(formData).subscribe(async (data) => {
            let ipfsUri = this.ipfsService.buildIpfsUri(data.value.cid);
            console.log('mintRoomNft ipfsUri', ipfsUri);

            const callTransactionRs = await this.iconServiceHelper.callTransaction(
                this.myWallet,
                environment.roomNftContract,
                'mint',
                {
                    _tokenURI: ipfsUri
                },
                0
            );

            await sleep(5000);
            console.log('mintRoomNft txRs', await this.iconServiceHelper.getTransactionResult(callTransactionRs));
            this.resetNewRoom();
            this.loadRooms();
            this.isLoading = false;
        });
    }

    async registerForRent() {
        if (this.registerRoom.price > 0) {
            this.isLoading = true;
            const callTransactionRs = await this.iconServiceHelper.callTransaction(
                this.myWallet,
                environment.galleryContract,
                'roomForRent',
                {
                    _roomContract: environment.roomNftContract,
                    _roomTokenId: this.iconServiceHelper.toHex(this.registerRoom.id),
                    _price: this.iconServiceHelper.toHex(this.iconServiceHelper.toIcxLoopBigNumber(this.registerRoom.price))
                }
            );

            await sleep(5000);
            console.log('roomForRent txRs', await this.iconServiceHelper.getTransactionResult(callTransactionRs));
            this.loadRooms();
            this.isLoading = false;
        }
    }
}
