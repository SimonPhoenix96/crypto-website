
import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay } from 'rxjs/operators';
import { EthersService } from './ethers.service';
import {
  Observable,
  timer,
  Subscription,
  Subject,
  of,
  BehaviorSubject,
  from
} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'crypto-website';
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(private observer: BreakpointObserver, private EthersService: EthersService) {}

  metamask_accounts: any[];
  metamask_accounts$: Subscription;
  provider_metamask: any;
  provider_metamask$: Subscription; 

  ngOnInit(): void {


    this.provider_metamask$ = this.EthersService.getMetaMaskProvider().subscribe(value => {
      // console.log("app-component -- this.EthersService.getMetaMaskProvider() - value = " + JSON.stringify(value))
      //  let local_metamask_accounts = JSON.parse(JSON.stringify(value));
      this.provider_metamask = value
      this.getMetaMaskAccounts()

    })

          // console.log("app-component -- this.provider_metamask.listAccounts() - value = " + JSON.stringify(this.provider_metamask.listAccounts()))



  }

  ngAfterViewInit() {
    this.observer
      .observe(['(max-width: 800px)'])
      .pipe(delay(1))
      .subscribe((res) => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } 
        // keep menu closed by default, close when screen area low
        // else {
        //   this.sidenav.mode = 'side';
        //   this.sidenav.open();
        // }
      });
  }


   connectToMetaMask(){
    console.log('app-component -- connectToMetaMask() - Connecting To Metamask!');
 
    this.EthersService.connectToMetaMask();
    
  }

  async getMetaMaskAccounts(){
    let local_metamask_accounts = await this.provider_metamask.listAccounts()
    this.metamask_accounts = local_metamask_accounts
  }

  
}

