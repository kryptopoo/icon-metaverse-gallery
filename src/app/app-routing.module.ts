import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { RoomsComponent } from './rooms/rooms.component';
import { ArtworksComponent } from './artworks/artworks.component';
import { GalleriesComponent } from './galleries/galleries.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'rooms', component: RoomsComponent },
    { path: 'artworks', component: ArtworksComponent },
    { path: 'galleries', component: GalleriesComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
