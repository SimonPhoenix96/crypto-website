import { Injectable } from "@angular/core";
import { InjectionToken } from "@angular/core";
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
  from
} from "rxjs";
import { switchMap, tap, share, retry, takeUntil } from "rxjs/operators";
import { ObserversModule } from "@angular/cdk/observers";
import { Block } from "./block-explorer/block";
import { throwToolbarMixedModesError } from "@angular/material/toolbar";
// This function detects most providers injected at window.ethereum
//import detectEthereumProvider from '@metamask/detect-provider';
import MetaMaskOnboarding from '@metamask/onboarding';

const BINANCE_RPC_ENDPOINT = "https://bsc-dataseed.binance.org/";

// erc20 abi
// const abi_erc20 = require("src/assets/abi/erc20-abi.json");

declare var window: any;
// declare var provider_metamask: any;

// conste Smart Chain provider url
// test net https://data-seed-prebsc-1-s1.binance.org:8545/


const abi_GENERIC = require("src/assets/abi/abi-erc20.json");
const GENERIC_contract_address = "0xe849198cdbe45c397f9a53ccba9e87f6882b60da";
const provider_bsc = new ethers.providers.JsonRpcProvider(BINANCE_RPC_ENDPOINT);
const GENERIC_contract = new ethers.Contract(GENERIC_contract_address, abi_GENERIC, provider_bsc);

//metamask connection stuff

//onboarding
// const onboarding = new MetaMaskOnboarding();
// onboarding.startOnboarding();



// if (typeof window.ethereum !== 'undefined') {
//   console.log("web3 provider detected")
  
//   // metamask connection stuff
//   // const provider = new ethers.providers.Web3Provider(window.ethereum)
//   // const signer = provider.getSigner()
//   provider_metamask = new ethers.providers.Web3Provider(window.ethereum);


// } else {
//   console.log("Please install metamask")
//   // add a delay here as you want

// }






@Injectable({
  providedIn: "root",
})
export class EthersService {
  // metamask stuff
  private metamask_accounts$: Observable<any[]> = of();
  private metamask_accounts: any = {};
  private provider_metamask$: Observable<any[]> = of();
  private provider_metamask: any;
  private provider_metamask_signer: any;
  // live block explorer stuff
  private recent_blocks$: Observable<any> = of();
  private recent_blocks: Block[] = [];
  // private harmonized_local_recent_block: Block;
  private recent_block;
  private recent_block_number;
  private recent_block_n1;
  private eta_next_block$: Observable<any> = of();

  private currently_running = false;
  // local copy of eta_next_block usage in setting recent_blocks$
  private eta_next_block: number = 0

  private stopPolling = new Subject();

  constructor() {
    // THESE NEED DELAYS IN the called set function or else they run billion times a sec
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
    
    this.provider_metamask$ = timer(1, 5000).pipe(
      switchMap((value) => this.setMetaMaskProvider()),
      retry(),
      share(),
      takeUntil(this.stopPolling)
    );

    // this.metamask_accounts$ = timer(1, 10000).pipe(
    //   switchMap((value) => this.setMetaMaskAccounts()),
    //   retry(),
    //   share(),
    //   takeUntil(this.stopPolling)
    // );
   
  }

  async getTokenBalance_Promise(wallet_address: string) {
    return GENERIC_contract.balanceOf(wallet_address);
  }

  async getBlockTransactions_Promise(blockNumber: string) {
    let block = await provider_bsc.getBlockWithTransactions(blockNumber);
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
    // console.log("EthersService -- delay(this.eta_next_block) = " + this.eta_next_block * 1000)
      let delay = await this.delay(this.eta_next_block * 1000 );

    // give latest block number
    this.recent_block_number = await provider_bsc.getBlockNumber();
    // console.log("recent block number: " + this.recent_block_number)
    // get block adn with that timestamp
    this.recent_block = await provider_bsc.getBlock(this.recent_block_number);
    this.recent_block_n1 = await provider_bsc.getBlock(
      this.recent_block_number - 1
    );

    this.eta_next_block = this.recent_block['timestamp'] - this.recent_block_n1['timestamp']
    return this.eta_next_block;
  }

  getEstimatedBlockCountdown(): Observable<number> {
    return this.eta_next_block$;
  }

  async setRecentBlocks(): Promise<Block[]> {
    // turn off logging
    // console.log = function() {}

    if(!this.currently_running){
      this.toggle_currently_running()
      // // console.log("EthersService -- entered setRecentBlocks() this.eta_next_block * 1000 = " + this.eta_next_block * 1000)
      // console.log("EthersService -- this.eta_next_block  = " + this.eta_next_block )
      // console.log("EthersService -- delay(this.eta_next_block) = " + this.eta_next_block * 1000)
      let delay = await this.delay(this.eta_next_block * 1000 );
      
  
      let local_recent_block_number = await provider_bsc.getBlockNumber();
      let local_recent_raw_blocks: any[] = []
      
      let last_logged_block = this.recent_blocks[this.recent_blocks.length - 1]
      
      // check for missing blocks      
      if(last_logged_block !== undefined) {
        let difference_between_recent_blocks = local_recent_block_number - last_logged_block.block_number
        if( difference_between_recent_blocks > 1 ){
          // console.log("EthersService -- getting missing blocks!")
          
          let index_a = 1
          while(index_a < difference_between_recent_blocks){
            // console.log("EthersService -- getting block_number = "  + (local_recent_block_number - (difference_between_recent_blocks - index_a)))
            local_recent_raw_blocks.push( await provider_bsc.getBlock(local_recent_block_number - (difference_between_recent_blocks - index_a)));
            index_a++
          }
        }
      }
      
      //get newest block
      local_recent_raw_blocks.push( await provider_bsc.getBlock(local_recent_block_number));

      // harmonize recently gotten blocks
      let harmonized_local_recent_blocks = this.harmonizeBlocks(local_recent_raw_blocks)
      


      let index_a = 0
      while(index_a < harmonized_local_recent_blocks.length){
        this.recent_blocks.push(harmonized_local_recent_blocks[index_a]);
        index_a++
    }
    
    // console.log("EthersService setrecentblocks() this.recent_blocks.length = " + this.recent_blocks.length)
    
    this.toggle_currently_running()
    
    
  }
  
  
  
    return this.recent_blocks;

  }

  harmonizeBlocks(raw_blocks: any[]): Block[] {
    // console.log("EthersService -- entered harmonizeBlock()" )
    let index = 0;
    let harmonized_local_recent_blocks: any[] = [];
    while (index < raw_blocks.length) {
    let local_time = raw_blocks[index]["timestamp"];
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let human_readable_timestamp_unformatted = new Date(local_time * 1000) ;
    let human_readable_timestamp =  human_readable_timestamp_unformatted.getHours() + ":" + human_readable_timestamp_unformatted.getMinutes() + ":" + human_readable_timestamp_unformatted.getSeconds() + " " + days[human_readable_timestamp_unformatted.getDay()]  + "/" + human_readable_timestamp_unformatted.getDate() + "/" + human_readable_timestamp_unformatted.getDay() + "/" + human_readable_timestamp_unformatted.getFullYear()
    
    let harmonized_local_recent_block = {
      block_number: raw_blocks[index]["number"],
      hash: raw_blocks[index]["hash"],
      validator: raw_blocks[index]["miner"],
      number_transactions: raw_blocks[index]["transactions"].length,
      time: human_readable_timestamp,
    };

    harmonized_local_recent_blocks.push(harmonized_local_recent_block)
    index++
    
  }
  // console.log("EthersService -- exited harmonizeBlock()" )
  return harmonized_local_recent_blocks
  }


  getRecentBlocks(): Observable<Block[]> {
    let distinct_recent_blocks = this.recent_blocks.filter((n, i) => this.recent_blocks.indexOf(n) === i);
    this.recent_blocks = distinct_recent_blocks
    return this.recent_blocks$;
  }


  async connectToMetaMask() {

    if (typeof window.ethereum !== 'undefined') {
      console.log("connectToMetaMask() web3 provider detected")
      this.provider_metamask.send("eth_requestAccounts", []);
    } else {
      //onboarding
      console.log("connectToMetaMask() starting metmask onboarding!")
      const onboarding = new MetaMaskOnboarding();
      onboarding.startOnboarding();

    }


  }


  
  async setMetaMaskProvider(): Promise<any[]> {
    // console.log("EthersService -- Entering setMetaMaskProvider()....")
    if (typeof window.ethereum !== 'undefined') {
      // console.log("setMetaMaskProvider() web3 provider detected")
      
      // metamask connection stuff
      const provider_metamask = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider_metamask.getSigner()
      this.provider_metamask = provider_metamask
      this.provider_metamask_signer = signer

      
    } else {
      console.log("setMetaMaskProvider() Please install metamask")
      // add a delay here as you want
      // console.log("EthersService -- setMetaMaskProvider()  let delay = await this.delay(60 * 1000)....")
      // let delay = await this.delay(60 * 1000);
      // console.log("EthersService -- setMetaMaskProvider()  done!")
      
      
    }
    
    
    
    return this.provider_metamask;
  }

  getMetaMaskProvider(): Observable<any[]> {
    return this.provider_metamask$;
  }



  // async setMetaMaskAccounts(): Promise<any[]> {
  //   // console.log("EthersService -- setMetaMaskAccounts()  let delay = await this.delay(3 * 1000)....")
  //   // let delay = await this.delay(3 * 1000);
  //   // console.log("EthersService -- setMetaMaskAccounts()  done!")

  //   let local_metamask_accounts = await this.provider_metamask.listAccounts();
  //   this.metamask_accounts = local_metamask_accounts
  //   // console.log("EthersService -- setMetaMaskAccounts()  this.metamask_accounts =" + this.metamask_accounts)
  //   return this.metamask_accounts;
  // }

  // getMetaMaskAccounts(): Observable<any[]> {
  //   return this.metamask_accounts$;
  // }


  // utility functions

  toggle_currently_running(){

    this.currently_running = !this.currently_running
    // console.log("EthersService -- toggle_currently_running()  currently_running = " + this.currently_running + " was: " + !this.currently_running )


  }


  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
