import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import {nft_asset} from './nft_asset';
import { Observable, timer, Subscription, Subject,interval } from 'rxjs';

@Component({
  selector: 'app-nft-gallery',
  templateUrl: './nft-gallery.component.html',
  styleUrls: ['./nft-gallery.component.scss']
})
export class NftGalleryComponent implements OnInit, OnDestroy {

  nft_collection_assets: any = [];
  nft_collection_assets$: Subscription;


  constructor(private HttpService: HttpService) {}

  ngOnInit(): void {


    // testing loadign screen
    console.log("nft-gallery -- JSON.stringify(this.nft_collection_assets$) = " + JSON.stringify(this.nft_collection_assets$))

    //nft gallery

    // harmonizing raw opensea data to nft_asset 
    this.nft_collection_assets$ =  this.HttpService.getOpenSeaCollection().subscribe(value => {
      // console.log("nft-gallery -- entering getOpenSeaCollection()")
      
      // console.log("nft-gallery -- JSON.stringify(value) = " + JSON.stringify(value))

      let local_nft_assets = JSON.parse(JSON.stringify(value))['assets'];
      // console.log("nft-gallery -- this.HttpService.getOpenSeaCollection().subscribe - local_nft_assets = " + local_nft_assets)    
      
      // console.log("nft-gallery -- this.HttpService.getOpenSeaCollection().subscribe - local_nft_assets.length = " + local_nft_assets.length)    
      

      for (let index = 0; index < local_nft_assets.length; index++) {  
          let local_nft_asset = local_nft_assets[index];
          // console.log("nft-gallery -- local_nft_assets[index] = " + local_nft_assets[index].id)
        }


        this.nft_collection_assets = local_nft_assets



    })
    


  }

  ngOnDestroy() {

    this.nft_collection_assets$.unsubscribe();


  }

}
