import { Injectable  } from '@angular/core';
import { InjectionToken } from '@angular/core';
import { getDefaultProvider } from 'ethers';
import { environment } from 'src/environments/environment';
import { ethers } from "ethers";
import { promise } from 'protractor';


// erc20 abi
// const abi_erc20 = require("src/assets/abi/erc20-abi.json");

// ffxx abi
const abi_ffxx = require("src/assets/abi/abi-final-finance.json");

// Binance Smart Chain provider url
const RPC_ENDPOINT = "https://bsc-dataseed.binance.org/";
var provider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);

//currently my wallet address
// var wallet_address = "0x221831C7CC3A44e1D6Cac3A5BCeee1F5De8Ad675";
var contract_address = "0xe849198cdbe45c397f9a53ccba9e87f6882b60da";
var contract = new ethers.Contract(contract_address, abi_ffxx, provider);

// wallet info

@Injectable({
  providedIn: 'root'
})



export class EthersService {
  

  constructor() { }


  async getTokenBalance_Promise(wallet_address: string){

    return  contract.balanceOf(wallet_address)

  }

  async  getBlockTransactions_Promise(blockNumber: string) {

    let block = await provider.getBlockWithTransactions(blockNumber);

    console.log(block)

    return  block;

    // for (var transactionIndex in block.transactions) {
    //   let transactionHash = block.transactions[transactionIndex]
    //  provider.getTransaction(transactionHash);

      // if (transaction.input.substr(0,10) == "0xa9059cbb") {
      //     // console.log(transaction)
      //   }
    }
  

    


}






