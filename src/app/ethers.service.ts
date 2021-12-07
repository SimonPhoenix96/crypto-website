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

var window: any;
// declare var provider_metamask: any;

// conste Smart Chain provider url
// test net https://data-seed-prebsc-1-s1.binance.org:8545/


const abi_ffxx = require("src/assets/abi/abi-final-finance.json");
const ffxx_contract_address = "0xe849198cdbe45c397f9a53ccba9e87f6882b60da";
const provider_bsc = new ethers.providers.JsonRpcProvider(BINANCE_RPC_ENDPOINT);
const ffxx_contract = new ethers.Contract(ffxx_contract_address, abi_ffxx, provider_bsc);

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
  private metamask_accounts$: Observable<any[]>;
  private metamask_accounts: any = {};
  private provider_metamask$: Observable<any[]>;
  private provider_metamask: any;
  // live block explorer stuff
  private recent_blocks$: Observable<any>;
  private recent_blocks: Block[] = [];
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
    // THESE NEED LAYS IN the called set function or else they run billion times a sec
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
    
    this.provider_metamask$ = timer(1, 1000).pipe(
      switchMap((value) => this.setMetaMaskProvider()),
      retry(),
      share(),
      takeUntil(this.stopPolling)
    );

    this.metamask_accounts$ = timer(1, 5000).pipe(
      switchMap((value) => this.setMetaMaskAccounts()),
      retry(),
      share(),
      takeUntil(this.stopPolling)
    );
   
  }

  async getTokenBalance_Promise(wallet_address: string) {
    return ffxx_contract.balanceOf(wallet_address);
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
    console.log("EthersService -- setEstimatedBlockCountdown()  let delay = await this.delay(3 * 1000)....")
    let delay = await this.delay(3 * 1000);
    console.log("EthersService -- setMetaMaskAccosetEstimatedBlockCountdownunts()  done!")
    // give latest block number
    this.recent_block_number = await provider_bsc.getBlockNumber();
    // console.log("recent block number: " + this.recent_block_number)
    // get block adn with that timestamp
    this.recent_block = await provider_bsc.getBlock(this.recent_block_number);
    this.recent_block_n1 = await provider_bsc.getBlock(
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
      // console.log("EthersService -- entered setRecentBlocks() this.eta_next_block * 1000 = " + this.eta_next_block * 1000)
      console.log("EthersService -- delay(this.eta_next_block) = " + this.eta_next_block * 1000)
      let delay = await this.delay(this.eta_next_block * 1000);
      
      
      // console.lthis.recent_blocks[counter].hashg("eta in setrecentblocks: " + this.eta_next_block)
      // console.log("DEBUG check if recent blocks has block number: " +  (Object.values(this.recent_block).includes(this.recent_block['hash'])))
      let local_recent_block_number = await provider_bsc.getBlockNumber();
      let local_recent_block = await provider_bsc.getBlock(local_recent_block_number);
      let local_block_number = local_recent_block["number"];
      let local_hash = local_recent_block["hash"];
      let local_validator = local_recent_block["miner"];
      let local_number_transactions = 0;
      let local_time = local_recent_block["timestamp"];

      var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let human_readable_timestamp_unformatted = new Date(local_time) ;
      let human_readable_timestamp =  human_readable_timestamp_unformatted.getHours() + ":" + human_readable_timestamp_unformatted.getMinutes() + ":" + human_readable_timestamp_unformatted.getSeconds() + " " + days[human_readable_timestamp_unformatted.getDay()]  + "/" + human_readable_timestamp_unformatted.getDate() + "/" + human_readable_timestamp_unformatted.getDay() + "/" + human_readable_timestamp_unformatted.getFullYear()

      // harmonized local_recent_block
      let harmonized_local_recent_block = {
        block_number: local_block_number,
        hash: local_hash,
        validator: local_validator,
        number_transactions: local_number_transactions,
        time: human_readable_timestamp,
      };
      console.log("harmonized_local_recent_block: " + JSON.stringify(harmonized_local_recent_block));

      let found = false;
      let counter = 0;
      // console.log("enter while loop: " + !inserted);
      //!inserted





      while (counter < this.recent_blocks.length) {
        console.log("entered while loop COUNTER = " + counter);
        // console.log("HASH: " + harmonized_local_recent_block.hash);


        // console.log("this.recent_blocks[" + counter + "].hash = " + this.recent_blocks[counter].hash)
        // console.log("this.recent_blocks[counter].hash == harmonized_local_recent_block.hash = " + this.recent_blocks[counter].hash == harmonized_local_recent_block.hash)
        if (this.recent_blocks[counter].hash == harmonized_local_recent_block.hash) {
          console.log("hash already in recent_blocks, breaking loop!")
          found = true
          break
        }
        counter++;
        
          // console.log("redo while loop");
      }
      // console.log("exited while loop");

      if(!found){
        console.log("hash not found adding to this.recent_blocks!")
        this.recent_blocks.push(harmonized_local_recent_block);
      }
      // console.log("EthersService setrecentblocks() this.recent_blocks.length = " + this.recent_blocks.length)
      // try a wait function here which waits for eta_next_block
      
      console.log("EthersService -- this.recent_blocks().length = " + this.recent_blocks.length )
      
      
      this.toggle_currently_running()
    }
    
    
    return this.recent_blocks;

  }

  getRecentBlocks(): Observable<Block[]> {
    return this.recent_blocks$;
  }


  async connectToMetaMask() {

    if (typeof window.ethereum !== 'undefined') {
      console.log("connectToMetaMask() web3 provider detected")
      // this.provider_metamask.send("eth_requestAccounts", []);
      // const signer = this.provider_metamask.getSigner();
      // console.log("EthersService-- connectToMetaMask() Account Connected:", signer.getAddress());
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
      // const provider = new ethers.providers.Web3Provider(window.ethereum)
      // const signer = provider.getSigner()
      let local_provider_metamask = new ethers.providers.Web3Provider(window.ethereum);
      this.provider_metamask = local_provider_metamask
      return this.provider_metamask;
      
    } else {
      console.log("setMetaMaskProvider() Please install metamask")
      // add a delay here as you want
      // console.log("EthersService -- setMetaMaskProvider()  let delay = await this.delay(60 * 1000)....")
      // let delay = await this.delay(60 * 1000);
      // console.log("EthersService -- setMetaMaskProvider()  done!")
     
      
    }
    


  }

  getMetaMaskProvider(): Observable<any[]> {
    return this.provider_metamask$;
  }



  async setMetaMaskAccounts(): Promise<any[]> {
    // console.log("EthersService -- setMetaMaskAccounts()  let delay = await this.delay(3 * 1000)....")
    // let delay = await this.delay(3 * 1000);
    // console.log("EthersService -- setMetaMaskAccounts()  done!")

    let local_metamask_accounts = await this.provider_metamask.listAccounts();
    this.metamask_accounts = local_metamask_accounts
    console.log("EthersService -- setMetaMaskAccounts()  this.metamask_accounts =" + this.metamask_accounts)
    return this.metamask_accounts;
  }

  getMetaMaskAccounts(): Observable<any[]> {
    return this.metamask_accounts$;
  }


  // utility functions

  toggle_currently_running(){

    this.currently_running = !this.currently_running
    console.log("EthersService -- toggle_currently_running()  currently_running = " + this.currently_running + " was: " + !this.currently_running )


  }


  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
}
