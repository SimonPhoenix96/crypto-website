import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { WalletComponent } from './wallet/wallet.component';
import { ReactiveFormsModule } from "@angular/forms";
import { BlockExplorerComponent } from './block-explorer/block-explorer.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { ForumComponent } from './forum/forum.component';
import { HelpComponent } from './help/help.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { NftGalleryComponent } from './nft-gallery/nft-gallery.component' 
import {MatGridListModule} from '@angular/material/grid-list';

import { HttpClientModule } from '@angular/common/http';

// import { FormControl} from '@angular/forms';

@NgModule({
  declarations: [AppComponent, WalletComponent, BlockExplorerComponent, HomeComponent, ProfileComponent, ForumComponent, HelpComponent, NotFoundComponent, NftGalleryComponent],
  imports: [
    BrowserModule,
    // import HttpClientModule after BrowserModule.
    HttpClientModule,    
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatTableModule,
    MatGridListModule

  ],
  providers: [],
  bootstrap: [AppComponent],
}) 
export class AppModule {} 