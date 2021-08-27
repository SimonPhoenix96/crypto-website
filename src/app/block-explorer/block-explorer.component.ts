import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { EthersService } from '../ethers.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatChipInputEvent,MatChipsModule,} from '@angular/material/chips';



export interface Block {
  hash: string;
}


@Component({
  selector: 'app-block-explorer',
  templateUrl: './block-explorer.component.html',
  styleUrls: ['./block-explorer.component.scss']
})


export class BlockExplorerComponent implements OnInit {
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  blocks: Block[] = [
    {hash: '0x4ea35eaf2fc60c6fa22a510578b739c752d6b9637845a6c560b13c997e0d2055'},
    {hash: '0x72e51794b93616598b7357af81152df0d11b646e6e1ba5efcf3a3e91f3f4f41d'},
  ];

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.blocks.push({hash: value.trim()});
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(block: Block): void {
    const index = this.blocks.indexOf(block);

    if (index >= 0) {
      this.blocks.splice(index, 1);
    }
  }







  blockhash_form = new FormControl('');
  block_transactions: any;
  ffxx_block_transactions: JSON;
  blocknr: string;


  // chip list stuff
  keywords = new Set(['angular', 'how-to', 'tutorial']);
  formControl = new FormControl(['angular']);




  constructor(private EthersService: EthersService) { }

  ngOnInit(): void {

    this.blockhash_form.valueChanges.subscribe(form_value => {

      this.blocknr = form_value
  
      })  

  }


  getBlockTransactions(){

    
    
    console.log("using block hash: " + this.blocknr)
    this.EthersService.getBlockTransactions_Promise(this.blocknr).then(block_transactions => {


      this.block_transactions = block_transactions



    })

  }


  // addKeywordFromInput(event: MatChipInputEvent) {
  //   if (event.value) {
  //     this.keywords.add(event.value);
  //     // event.chipInput!.clear();
  //   }
  // }

  // removeKeyword(keyword: string) {
  //   this.keywords.delete(keyword);
  // }

}
