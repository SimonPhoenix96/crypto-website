import { Injectable } from "@angular/core";
import { InjectionToken } from "@angular/core";
import { getDefaultProvider } from "ethers";
import { environment } from "src/environments/environment";
import { ethers } from "ethers";
import { promise } from "protractor";
import {
  Observable,
  timer,
  Subscription,
  Subject,
  of,
  BehaviorSubject,
} from "rxjs";
import { switchMap, tap, share, retry, takeUntil } from "rxjs/operators";
import { ObserversModule } from "@angular/cdk/observers";
import { Block } from "./block-explorer/block";
import { throwToolbarMixedModesError } from "@angular/material/toolbar";



// erc20 abi
// const abi_erc20 = require("src/assets/abi/erc20-abi.json");

// ffxx abi
const abi_ffxx = require("src/assets/abi/abi-final-finance.json");

// Binance Smart Chain provider url
const RPC_ENDPOINT = "https://data-seed-prebsc-1-s1.binance.org:8545/";
var provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);

//currently my wallet address
// var wallet_address = "0x221831C7CC3A44e1D6Cac3A5BCeee1F5De8Ad675";
var contract_address = "0xe849198cdbe45c397f9a53ccba9e87f6882b60da";
var contract = new ethers.Contract(contract_address, abi_ffxx, provider);

// wallet info

// live block explorer stuff

// const eta_next_block$: Observable<string> = new Observable((observer) => {
//   // observable execution
//   observer.next();
//   observer.complete();
// });

@Injectable({
  providedIn: "root",
})
export class EthersService {
  // live block explorer stuff
  private recent_blocks$: Observable<any>;
  private recent_blocks: Block[] = [{ block_number: 0, hash: '', validator: '', number_transactions: 0, time: 0}];
  // private harmonized_local_recent_block: Block;
  private recent_block;
  private recent_block_number;
  private recent_block_n1;
  private eta_next_block$: Observable<any>;

  private currently_running = false;
  // local copy of eta_next_block usage in setting recent_blocks$
  private eta_next_block: number = 0

  private stopPolling = new Subject();

  constructor() {
    this.eta_next_block$ = timer(1, 30000).pipe(
      switchMap(value => this.setEstimatedBlockCountdown()),
      retry(),
      share(),
      takeUntil(this.stopPolling)
    );

    this.recent_blocks$ = timer(1, 1000).pipe(
      switchMap((value) => this.setRecentBlocks()),
      retry(),
      share(),
      takeUntil(this.stopPolling)
    );
  }

  async getTokenBalance_Promise(wallet_address: string) {
    return contract.balanceOf(wallet_address);
  }

  async getBlockTransactions_Promise(blockNumber: string) {
    let block = await provider.getBlockWithTransactions(blockNumber);
    // block_number

    return block;

    // for (var transactionIndex in block.transactions) {
    //   let transactionHash = block.transactions[transactionIndex]
    //  provider.getTransaction(transactionHash);

    // if (transaction.input.substr(0,10) == "0xa9059cbb") {
    //     // console.log(transaction)
    //   }
  }

  async setEstimatedBlockCountdown(): Promise<Number> {
    // give latest block number
    this.recent_block_number = await provider.getBlockNumber();
    // console.log("recent block number: " + this.recent_block_number)
    // get block adn with that timestamp
    this.recent_block = await provider.getBlock(this.recent_block_number);
    this.recent_block_n1 = await provider.getBlock(
      this.recent_block_number - 1
    );

    // time difference between latest block number and latest block number -1
    // console.log(this.recent_block['timestamp'] - this.recent_block_n1['timestamp'] )

    // if (this.recent_block_number % 2 != 0){
    // this.eta_next_block = this.recent_block['timestamp'] - this.recent_block_n1['timestamp']
    // } else this.eta_next_block = 10000
    // console.log("recent block timestamp: " + this.recent_block['timestamp'])
    // console.log("eta next block: " + (this.recent_block['timestamp'] - this.recent_block_n1['timestamp']) )

    this.eta_next_block = this.recent_block['timestamp'] - this.recent_block_n1['timestamp']
    return this.recent_block["timestamp"] - this.recent_block_n1["timestamp"];
  }

  getEstimatedBlockCountdown(): Observable<number> {
    return this.eta_next_block$;
  }

  async setRecentBlocks(): Promise<Block[]> {
    // turn off logging
    //console.log = function() {}

    if(!this.currently_running){
      this.toggle_currently_running()
      // console.log("ethers.service -- entered setRecentBlocks() this.eta_next_block * 1000 = " + this.eta_next_block * 1000)
      // console.log("ethers.service -- delay() = " + this.eta_next_block * 1000)
      let delay = await this.delay(this.eta_next_block * 1000);
      
      
      // console.lthis.recent_blocks[counter].hashg("eta in setrecentblocks: " + this.eta_next_block)
      // console.log("DEBUG check if recent blocks has block number: " +  (Object.values(this.recent_block).includes(this.recent_block['hash'])))
      let local_recent_block_number = await provider.getBlockNumber();
      let local_recent_block = await provider.getBlock(local_recent_block_number);
      let local_block_number = local_recent_block["number"];
      let local_hash = local_recent_block["hash"];
      let local_validator = local_recent_block["miner"];
      let local_number_transactions = 0;
      let local_time = local_recent_block["timestamp"];

      // harmonized local_recent_block
      let harmonized_local_recent_block = {
        block_number: local_block_number,
        hash: local_hash,
        validator: local_validator,
        number_transactions: local_number_transactions,
        time: local_time,
      };
      // console.log(harmonized_local_recent_block)
      // console.log("harmonized_local_recent_block: " + harmonized_local_recent_block.hash);

      let inserted = false;
      let counter = 0;
      // console.log("enter while loop: " + !inserted);
      //!inserted





      while (counter < this.recent_blocks.length) {
        // console.log("entered while loop COUNTER = " + counter);
        // console.log("HASH: " + harmonized_local_recent_block.hash);


        // console.log("this.recent_blocks[" + counter + "].hash = " + this.recent_blocks[counter].hash)
        // console.log("this.recent_blocks[counter].hash == harmonized_local_recent_block.hash = " + this.recent_blocks[counter].hash == harmonized_local_recent_block.hash)
        if (this.recent_blocks[counter].hash == harmonized_local_recent_block.hash) {
          // console.log("hash already in recent_blocks, breaking loop!")
          break
        }
        counter++;
        
        // console.log("redo while loop");
      }
      // console.log("exited while loop");
      
      this.recent_blocks.push(harmonized_local_recent_block);
      
      // console.log("ethers.service setrecentblocks() this.recent_blocks.length = " + this.recent_blocks.length)
      // try a wait function here which waits for eta_next_block
      
      this.toggle_currently_running()
      console.log("ethers.service -- this.recent_blocks() = " + this.recent_blocks[this.recent_blocks.length -1].block_number)
      return this.recent_blocks;
    }

    

  }













  getRecentBlocks(): Observable<any> {
    return this.recent_blocks$;
  }






  // utility functions


  


  toggle_currently_running(){

    this.currently_running = !this.currently_running
    // console.log("ethers.service -- toggle_currently_running()  currently_running = " + this.currently_running + " was: " + !this.currently_running )


  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
