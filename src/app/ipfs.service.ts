import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NgxPicaErrorInterface, NgxPicaService, NgxPicaResizeOptionsInterface } from '@bengchet/ngx-pica';

@Injectable({
    providedIn: 'root'
})
export class IpfsService {
    constructor(private http: HttpClient, private ngxPicaService: NgxPicaService) {}

    uploadNftStorage(data: any): Observable<any> {
        const token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDk3QUI4MzkxN2Q5QjIyNWZENzQ2ZDAyMjFCNTVlQTI1NkZDNEMyOUQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyNDc3NzQ0MjkzNywibmFtZSI6ImhhY2thdG9tIn0.6_hyHUzf-A7hD9gSaPaTOt2BAg-PD1IaIuefqMZSY88';

        const headers = new HttpHeaders({
            //'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
        });

        return this.http.post<any>('https://api.nft.storage/upload', data, {
            headers: headers
        });
    }

    buildFormData(imageFile: any, htmlFile: any, metadata: any) {
        let formData = new FormData();

        if (imageFile != null) {
            let imageExt = imageFile.origin.name.split('.').pop();

            metadata.image = {
                origin: `origin-image.${imageExt}`,
                normal: `normal-image.${imageExt}`,
                thumbnail: `thumbnail-image.${imageExt}`
            };

            // ipfs image
            formData.append('file', imageFile.origin, metadata.image.origin);
            formData.append('file', imageFile.normal, metadata.image.normal);
            formData.append('file', imageFile.thumbnail, metadata.image.thumbnail);
        }

        if (htmlFile != null) {
            metadata.template = htmlFile.name;
            formData.append('file', htmlFile, metadata.template);
        }

        metadata.created = new Date().getTime();
        formData.append('file', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata.json');

        return formData;
    }

    get(cid: string): Observable<any> {
        return this.http.get<any>(cid);
    }

    buildMetadataUri(uri: string) {
        return `${uri.replace(/^,+|\/+$/g, '')}/metadata.json`;
    }
    buildUri(uri: string, fileName: string) {
        return `${uri.replace(/^,+|\/+$/g, '')}/${fileName.replace(/^,+|\/+$/g, '')}`;
    }

    buildIpfsUri(cid: string) {
        return `https://${cid}.ipfs.dweb.link/`;
    }
}
