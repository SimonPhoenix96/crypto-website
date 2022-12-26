import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { HttpService } from '../http.service';
import {nft_asset} from './nft_asset';
import { Observable, timer, Subscription, Subject,interval } from 'rxjs';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-nft-gallery',
  templateUrl: './nft-gallery.component.html',
  styleUrls: ['./nft-gallery.component.scss']
})
export class NftGalleryComponent implements OnInit, OnDestroy {

  nft_collection_assets: any = [];
  nft_collection_assets$: Subscription;


  constructor(private HttpService: HttpService, public dialog: MatDialog) {}

  ngOnInit(): void {


    // testing loadign screen
    console.log("nft-gallery -- JSON.stringify(this.nft_collection_assets$) = " + JSON.stringify(this.nft_collection_assets$))

    //nft gallery

    // harmonizing raw opensea data to nft_asset 
    this.nft_collection_assets$ =  this.HttpService.getOpenSeaCollection().subscribe(value => {
      // console.log("nft-gallery -- entering getOpenSeaCollection()")
      
	//	console.log("nft-gallery -- JSON.stringify(value) = " + JSON.stringify(value))

	let local_nft_assets = JSON.parse(JSON.stringify(value))['collection'];
	console.log("nft-gallery -- this.HttpService.getOpenSeaCollection().subscribe - local_nft_assets = " + JSON.stringify(local_nft_assets) )    
	
	// console.log("nft-gallery -- this.HttpService.getOpenSeaCollection().subscribe - local_nft_assets.length = " + local_nft_assets.length)    
	
	// harmonizing requested opensea data to local nft_asset interface
	console.log("nft-gallery -- local_nft_assets.length = " + local_nft_assets.length)
	for (let index = 0; index < local_nft_assets.length; index++) {  
	    console.log("nft-gallery -- local_nft_assets[" + index + "].name = " + local_nft_assets[index].name)
	    let local_nft_asset: nft_asset = 
		{token_id: local_nft_assets[index].id, color: '',  image_url: local_nft_assets[index].image_url, name: local_nft_assets[index].name, description: local_nft_assets[index].description, opensea_url: local_nft_assets[index].permalink, asset_contract_address: "",asset_contract_collection_name:  local_nft_assets[index].collection.name};
	    
	    this.nft_collection_assets.push(local_nft_asset);
	}





    })
    


  }

  ngOnDestroy() {

    this.nft_collection_assets$.unsubscribe();


  }


openNftAssetTileDialog(nft_asset_description: string,nft_asset_image_url: string,nft_asset_name: string,) {
  this.dialog.open(DialogNftAssetTile, {
    // maxHeight: '50%',
    // maxWidth: '50%',
    disableClose: false,
    hasBackdrop: true,
    panelClass: 'dialog-nft-asset-tile-content',
    backdropClass: 'dialog-nft-asset-tile-backdrop',
    data: { 
      nft_asset_description: nft_asset_description,
      nft_asset_image_url: nft_asset_image_url,
      nft_asset_name: nft_asset_name,
     }
  });
}



}

@Component({
selector: 'dialog-nft-asset-tile',
templateUrl: './dialog-nft-asset-tile.html',
styleUrls: ['./dialog-nft-asset-tile.component.scss']
})
export class DialogNftAssetTile {


  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any) {}

  closeNftAssetTileDialog() {
    this.dialog.closeAll();
  }
}
