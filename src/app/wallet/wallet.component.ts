import { Component, OnInit } from '@angular/core';
import { EthersService } from '../ethers.service';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

const ethers = new EthersService();
@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  wallet_form = new FormControl('');
  wallet_address: string;
  token_balance: string;
  constructor(private EthersService: EthersService) {}
  

  ngOnInit(): void {
  this.wallet_form.valueChanges.subscribe(form_value => {

    this.wallet_address = form_value

    })  
  }


  getTokenBalance(){

    
    
    console.log("using address: " + this.wallet_address)
    this.EthersService.getTokenBalance_Promise(this.wallet_address).then(token_balance => {


      this.token_balance = token_balance



    })

  }
 
} 
