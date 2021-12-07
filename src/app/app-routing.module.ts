import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlockExplorerComponent } from './block-explorer/block-explorer.component';
import { ForumComponent } from './forum/forum.component';
import { HelpComponent } from './help/help.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { WalletComponent } from "./wallet/wallet.component";
import {  NotFoundComponent } from "./not-found/not-found.component";
import { NftGalleryComponent } from './nft-gallery/nft-gallery.component';
const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'wallet', component: WalletComponent},
  {path: 'nft-gallery', component: NftGalleryComponent},
  {path: 'block-explorer', component: BlockExplorerComponent},
  {path: 'forum', component: ForumComponent},
  {path: 'help', component: HelpComponent},
  { path: '**', component: NftGalleryComponent },  // Wildcard route for a 404 page, for debugging purposes directing to currently component im working on


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }  