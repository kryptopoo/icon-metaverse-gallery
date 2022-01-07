import { Injectable } from '@angular/core';
import { NgxPicaErrorInterface, NgxPicaService, NgxPicaResizeOptionsInterface } from '@bengchet/ngx-pica';
  

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable({
    providedIn: 'root'
})
export class ImageHelper {

    constructor(private ngxPicaService: NgxPicaService) {}

    selectImageFile(event: Event, toObj: any) {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        toObj.imageFile = { origin: file };
    
        this.ngxPicaService
            .resizeImage(file, 480, 480, { aspectRatio: { keepAspectRatio: true }, exifOptions: { forceExifOrientation: true } })
            .subscribe(
                (imageResized: File) => {
                    toObj.imageFile.normal = imageResized;
                },
                (err: NgxPicaErrorInterface) => {
                    throw err.err;
                }
            );
    
        this.ngxPicaService.resizeImage(file, 240, 240).subscribe(
            (imageResized: File) => {
                toObj.imageFile.thumbnail = imageResized;
            },
            (err: NgxPicaErrorInterface) => {
                throw err.err;
            }
        );
    
        // preview image
        const reader = new FileReader();
        reader.onload = () => {
            toObj.imageFilePath = reader.result as string;
        };
        reader.readAsDataURL(file);
    }
}

@Injectable({
    providedIn: 'root'
})
export class FileHelper {

    constructor() {}

    selectHtmlFile(event: Event, toObj: any) {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        toObj.htmlFile = file;
    }
}
