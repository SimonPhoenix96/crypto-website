import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { EthersService } from '../ethers.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatChipInputEvent,MatChipsModule,} from '@angular/material/chips';
import { BlockWithTransactions } from '@ethersproject/abstract-provider';
import { BigNumber, Transaction } from 'ethers';
import {  MatTableDataSource } from '@angular/material/table';
import { Observable, timer, Subscription, Subject,interval } from 'rxjs';
import {Block } from './block'

// const ELEMENT_DATA: Block[] = [
//   {hash: '0x4ea35eaf2fc60c6fa22a510578b739c752d6b9637845a6c560b13c997e0d2055', block_number: 0},
//   {hash: '0x72e51794b93616598b7357af81152df0d11b646e6e1ba5efcf3a3e91f3f4f41d', block_number: 0},
// ];




@Component({
  selector: 'app-block-explorer',
  templateUrl: './block-explorer.component.html',
  styleUrls: ['./block-explorer.component.scss']
})


export class BlockExplorerComponent implements OnInit {
  displayedColumns: string[] = ['block_number', 'hash',  'validator', 'number_transactions', 'time'];
  
  
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  
  
  blocks: Block[]  = [
    // {hash: '0x4ea35eaf2fc60c6fa22a510578b739c752d6b9637845a6c560b13c997e0d2055', block_number: 0},
    // {hash: '0x72e51794b93616598b7357af81152df0d11b646e6e1ba5efcf3a3e91f3f4f41d', block_number: 0},
    {block_number: 0, hash: '0xe5e9f8e12d28b06b0e589ae0e6f8ee5c15ca77021e195893be96be1c064fcada',  validator: '', number_transactions: 0, time: 0},
  ];
  dataSource: MatTableDataSource < any > ;
  
  // new_block: Block[]  = [];


  // live block explorer stuff


  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // adding hashes
    if ((value || '').trim()) {
      this.blocks.push({ block_number: 0, hash: value.trim(), validator: '', number_transactions: 0, time: 0});
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


  // blockhash_form = new FormControl('');
  block_transactions: BlockWithTransactions[] = [];
  ffxx_block_transactions: JSON;


  // chip list stuff
  // keywords = new Set(['angular', 'how-to', 'tutorial']);
  // formControl = new FormControl(['angular']);


  // live block explorer stuff
  recent_blocks: Block[] = [];
  eta_next_block: number;

  constructor(private EthersService: EthersService) { }

  ngOnInit(): void {


    //TEMP live block explorer
    this.EthersService.getEstimatedBlockCountdown().subscribe(value => {

     
      this.eta_next_block = this.eta_next_block + value 
        
      })
      
      
      
      this.EthersService.getRecentBlocks().subscribe(value => {
        // console.log("recent blocks: " + this.recent_blocks[0]['block_number'])
        console.log("block-explorer -- getRecentBlocks.subscribe() value = " + value)
        this.recent_blocks = value
  
  
    })


    this.dataSource = new MatTableDataSource(this.recent_blocks)



    // manual block search
    // this.dataSource = new MatTableDataSource(this.blocks)

  }


  // TODO: if error remove hash from list
  getBlockTransactions(){

    
    const local_blocks = this.blocks
    for (let index = 0; index < local_blocks.length; index++) {
      
      
      console.log("using block hash: " + local_blocks[index].hash)
        
      this.EthersService.getBlockTransactions_Promise(local_blocks[index].hash).then(block_transactions => {


        // let found = false;


        //  this.blocks.forEach(block => {
      for (let index = 0; index < local_blocks.length; index++) {  
            let block = local_blocks[index];
            // console.log("looking for block hash, to fill in rest of block info ", block.hash )
            if (block.hash == block_transactions.hash) {
           
              // console.log("block found getting blockr " , block_transactions.number)
              local_blocks[local_blocks.indexOf(block)].block_number  = block_transactions.number 
              local_blocks[local_blocks.indexOf(block)].validator  = block_transactions.miner 
              local_blocks[local_blocks.indexOf(block)].number_transactions  = block_transactions.transactions.length
              local_blocks[local_blocks.indexOf(block)].time  = block_transactions.timestamp 
              // found = true;
              break
                 
            }
  
          }


          this.blocks = local_blocks
          this.dataSource.data = local_blocks
          console.log("local blocks array: ", this.blocks)
          // });

        // this.block_transactions.forEach(transaction => {
      

        //   this.blocks.forEach(block => {
        //     console.log("looking for block hash ", block.hash )
        //     if (block.hash == transaction.hash) {
        //       console.log("block found getting blockr " , transaction.number)
        //       this.blocks[this.blocks.indexOf(block)].block_number  = transaction.number 
              
        //     }
            
        //   });
    
    
        // });


        // this.block_transactions.push(block_transactions)


      })
    }


    

  }



}
